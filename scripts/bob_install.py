#!/usr/bin/env python3
"""Install the IBM Bob bundle (skill, commands, rules, MCP config, custom
modes) into a project's .bob/ directory or the global ~/.bob/, merging with
whatever the target already contains. Never clobbers a team's own config.

Usage: bob_install.py --source <repo-root> --target <dir> [--global]
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

SKILL_NAME = "astra-toolkit"
MCP_SERVER_KEY = "astra-db"
MCP_SERVER_PREFIX = "astra"
WIDGETS_SERVER_KEY = "astra-widgets"
BEGIN_MARKER = "# astra-db:begin"
END_MARKER = "# astra-db:end"
_MODES_KEY = re.compile(r"^customModes:[ \t]*(\[[ \t]*\])?[ \t]*$", re.MULTILINE)
_FIRST_ITEM = re.compile(r"^([ \t]*)- ", re.MULTILINE)


def install_skill(source_bob: Path, target: Path) -> Path:
    dest = target / "skills" / SKILL_NAME
    if dest.exists():
        shutil.rmtree(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source_bob / "skills" / SKILL_NAME, dest)
    return dest


def install_files(source_bob: Path, target: Path, subdir: str) -> list[Path]:
    """Copy our astra-* files in <subdir>; leave everything else untouched."""
    written: list[Path] = []
    dest_dir = target / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    for path in sorted((source_bob / subdir).glob("astra-*")):
        dest = dest_dir / path.name
        dest.write_text(path.read_text())
        written.append(dest)
    return written


def merge_mcp(source_bob: Path, dest: Path, server_path: str | None = None) -> Path:
    """Add/replace every astra-* server from the bundle; keep the project's other servers."""
    ours = json.loads((source_bob / "mcp.json").read_text())["mcpServers"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    data: dict = {}
    if dest.is_file():
        data = json.loads(dest.read_text())  # invalid JSON -> raise, never overwrite
    servers = data.setdefault("mcpServers", {})
    for name, config in ours.items():
        if not name.startswith(MCP_SERVER_PREFIX):
            continue
        config = dict(config)
        if name == WIDGETS_SERVER_KEY and server_path:
            config["args"] = [server_path]
        servers[name] = config
    dest.write_text(json.dumps(data, indent=2) + "\n")
    return dest


def install_server(source_bob: Path, target: Path) -> Path | None:
    bundle = source_bob / "server" / "index.js"
    if not bundle.is_file():
        return None
    dest = target / "server" / "index.js"
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(bundle, dest)
    return dest


def _our_mode_block(source_yaml: str, indent: str = "  ") -> str:
    """Our mode list items (re-indented), wrapped in markers."""
    items = source_yaml.split("customModes:\n", 1)[1].rstrip("\n")
    reindented = []
    for line in items.splitlines():
        reindented.append(f"{indent}{line[2:]}" if line.startswith("  ") else line)
    return "\n".join([f"{indent}{BEGIN_MARKER}", *reindented, f"{indent}{END_MARKER}"])


def merge_custom_modes(source_bob: Path, dest: Path) -> Path:
    source_yaml = (source_bob / "custom_modes.yaml").read_text()
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.is_file():
        dest.write_text("customModes:\n" + _our_mode_block(source_yaml) + "\n")
        return dest

    text = dest.read_text()
    if BEGIN_MARKER in text and END_MARKER in text:
        head, _, rest = text.partition(BEGIN_MARKER)
        _, _, tail = rest.partition(END_MARKER)
        line_start = head.rfind("\n") + 1
        indent = head[line_start:]  # whitespace before the begin marker
        if indent.strip():
            indent = "  "
        merged = head[:line_start] + _our_mode_block(source_yaml, indent or "  ") + tail
        dest.write_text(merged if merged.endswith("\n") else merged + "\n")
        return dest

    key = _MODES_KEY.search(text)
    if key is None:
        text = text.rstrip("\n") + "\ncustomModes:\n" + _our_mode_block(source_yaml) + "\n"
        dest.write_text(text)
        return dest

    after_key = text[key.end():]
    item = _FIRST_ITEM.search(after_key)
    indent = item.group(1) if item and key.group(1) is None else "  "
    block = _our_mode_block(source_yaml, indent)
    text = text[: key.start()] + "customModes:\n" + block + "\n" + after_key.lstrip("\n")
    dest.write_text(text)
    return dest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="plugin repo root")
    parser.add_argument("--target", type=Path, required=True, help=".bob directory to install into")
    parser.add_argument("--global", dest="is_global", action="store_true")
    args = parser.parse_args()

    source_bob = args.source.resolve() / ".bob"
    target = args.target.expanduser().resolve()
    if not (source_bob / "custom_modes.yaml").is_file():
        print(f"source has no generated Bob bundle: {source_bob}", file=sys.stderr)
        return 1
    # Bob keeps project config at .bob/<file>; global config lives under ~/.bob/settings/.
    config_dir = target / "settings" if args.is_global else target
    modes_dest = config_dir / "custom_modes.yaml"
    mcp_dest = config_dir / "mcp.json"

    try:
        target.mkdir(parents=True, exist_ok=True)
        written = [install_skill(source_bob, target)]
        written += install_files(source_bob, target, "commands")
        written += install_files(source_bob, target, "rules")
        server_dest = install_server(source_bob, target)
        if server_dest:
            written.append(server_dest)
        # Global installs need an absolute path to the bundle; project installs stay relative to the workspace.
        server_path = str(server_dest) if (server_dest and args.is_global) else None
        written.append(merge_mcp(source_bob, mcp_dest, server_path))
        written.append(merge_custom_modes(source_bob, modes_dest))
    except (OSError, json.JSONDecodeError, KeyError) as exc:
        print(f"bob install failed: {exc}", file=sys.stderr)
        return 1

    for path in written:
        print(f"installed {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
