#!/usr/bin/env python3
"""Bump the plugin version and update the marketplace manifest and changelog.

Usage: bump_version.py [major|minor|patch] ["release note"]
Prints the new version on success.
"""

from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PLUGIN_MANIFEST = REPO_ROOT / ".claude-plugin" / "plugin.json"
CODEX_MANIFEST = REPO_ROOT / "codex" / ".codex-plugin" / "plugin.json"
MARKETPLACE_MANIFEST = REPO_ROOT / ".claude-plugin" / "marketplace.json"
CHANGELOG = REPO_ROOT / "CHANGELOG.md"
CHANGELOG_HEADER = "# Changelog\n"
DEFAULT_NOTE = "Content sync / maintenance release."


def bump(version: str, level: str) -> str:
    major, minor, patch = (int(part) for part in version.split("."))
    if level == "major":
        return f"{major + 1}.0.0"
    if level == "minor":
        return f"{major}.{minor + 1}.0"
    if level == "patch":
        return f"{major}.{minor}.{patch + 1}"
    raise ValueError(f"unknown bump level: {level}")


def update_json(path: Path, mutate) -> None:
    data = json.loads(path.read_text())
    mutate(data)
    path.write_text(json.dumps(data, indent=2) + "\n")


UNRELEASED_HEADING = "## Unreleased"


def prepend_changelog(version: str, note: str) -> None:
    today = datetime.date.today().isoformat()
    existing = CHANGELOG.read_text() if CHANGELOG.is_file() else CHANGELOG_HEADER
    if not existing.startswith(CHANGELOG_HEADER):
        raise ValueError(f"{CHANGELOG} does not start with '{CHANGELOG_HEADER.strip()}'")
    heading = f"## {version} — {today}"
    if UNRELEASED_HEADING in existing:
        # A hand-written entry is waiting: promote it instead of adding a generic line.
        CHANGELOG.write_text(existing.replace(UNRELEASED_HEADING, heading, 1))
        return
    entry = f"{heading}\n\n- {note}\n"
    body = existing[len(CHANGELOG_HEADER):].lstrip("\n")
    CHANGELOG.write_text(f"{CHANGELOG_HEADER}\n{entry}\n{body}")


def main() -> int:
    level = sys.argv[1] if len(sys.argv) > 1 else "patch"
    note = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_NOTE

    try:
        current = json.loads(PLUGIN_MANIFEST.read_text())["version"]
        new_version = bump(current, level)
        update_json(PLUGIN_MANIFEST, lambda d: d.update(version=new_version))
        update_json(CODEX_MANIFEST, lambda d: d.update(version=new_version))
        update_json(
            MARKETPLACE_MANIFEST,
            lambda d: d.setdefault("metadata", {}).update(version=new_version),
        )
        prepend_changelog(new_version, note)
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print(f"version bump failed: {exc}", file=sys.stderr)
        return 1

    print(new_version)
    return 0


if __name__ == "__main__":
    sys.exit(main())
