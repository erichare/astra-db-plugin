#!/usr/bin/env python3
"""Generate derived harness layouts from the canonical sources.

Canonical sources: skills/* (synced astra-toolkit + plugin-owned skills), commands/,
agents/, hooks/, server/dist/index.js.
Generated (committed, parity-checked in CI):
  .bob/          IBM Bob bundle: skills/ copies, commands/, rules/, server/,
                 custom_modes.yaml, mcp.json
  codex/         Codex plugin root: skills/ (astra-toolkit copy + ported
                 command/agent skills), hooks/ copy, .mcp.json; the
                 hand-maintained codex/.codex-plugin/plugin.json is kept

Each generated tree is removed and rebuilt wholesale so stale files vanish.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

import convert

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILL_NAME = "astra-toolkit"


def _write_tree(root: Path, files: dict[str, str]) -> None:
    for rel_path, content in files.items():
        target = root / rel_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content)


def build_all(repo_root: Path) -> list[Path]:
    """Rebuild every generated tree under repo_root; return the rebuilt roots."""
    canonical = repo_root / "skills" / SKILL_NAME
    commands_dir = repo_root / "commands"
    agents_dir = repo_root / "agents"
    if not canonical.is_dir():
        raise FileNotFoundError(f"canonical tree missing: {canonical}")

    bob_root = repo_root / ".bob"
    codex_root = repo_root / "codex"
    # .bob/ is fully generated; codex/ keeps its hand-maintained .codex-plugin manifest.
    generated = [bob_root, codex_root / "skills", codex_root / "hooks", codex_root / ".mcp.json", codex_root / "server"]
    for path in generated:
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()
    bob_root.mkdir(parents=True)
    (codex_root / "skills").mkdir(parents=True)

    # Every plugin skill (the synced astra-toolkit plus plugin-owned ones such as astra-widgets)
    # ships to both harnesses unchanged.
    for skill_dir in sorted(p for p in (repo_root / "skills").iterdir() if p.is_dir()):
        shutil.copytree(skill_dir, bob_root / "skills" / skill_dir.name)
        shutil.copytree(skill_dir, codex_root / "skills" / skill_dir.name)
    _write_tree(bob_root, convert.render_bob_bundle(commands_dir, agents_dir))

    shutil.copytree(repo_root / "hooks", codex_root / "hooks")
    _write_tree(codex_root, convert.render_codex_skills(commands_dir, agents_dir))

    # The astra-widgets MCP server bundle (built by `npm run build` in server/).
    server_bundle = repo_root / "server" / "dist" / "index.js"
    if server_bundle.is_file():
        for dest in (bob_root / "server" / "index.js", codex_root / "server" / "index.js"):
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(server_bundle, dest)
    return [bob_root, codex_root]


def main() -> int:
    try:
        built = build_all(REPO_ROOT)
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    for root in built:
        print(f"built {root.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
