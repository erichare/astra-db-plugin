#!/usr/bin/env python3
"""Sync the canonical skill tree from the upstream astra-toolkit-skill repo.

Clones (or reuses) the upstream repo, wholesale-replaces skills/astra-toolkit/
with upstream's .bob/skills/astra-toolkit/, and records the synced commit in
sync-manifest.json. Content is copied verbatim -- never edit synced files here.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

UPSTREAM_URL = "https://github.com/sl-at-ibm/astra-toolkit-skill.git"
UPSTREAM_SKILL_SUBDIR = Path(".bob/skills/astra-toolkit")
REPO_ROOT = Path(__file__).resolve().parent.parent
CANONICAL_DIR = REPO_ROOT / "skills" / "astra-toolkit"
MANIFEST_PATH = REPO_ROOT / "sync-manifest.json"

# Deterministic frontmatter patches applied after every sync. The only
# intentional divergence from upstream: routing-oriented descriptions
# (skillsaw content-description-routing). Proposed upstream -- delete an entry
# once upstream adopts the phrasing.
DESCRIPTION_OVERRIDES: dict[str, str] = {
    "SKILL.md": (
        "Manage Astra DB, design applications powered by it (data model, "
        "patterns) and write them with the right idioms in several languages. "
        "Use when building, reviewing, or migrating applications that use "
        "Astra DB or HCD via the Data API, the Astra CLI, or vector search."
    ),
}


def run_git(args: list[str], cwd: Path) -> str:
    result = subprocess.run(
        ["git", *args], cwd=cwd, capture_output=True, text=True, check=True
    )
    return result.stdout.strip()


def clone_upstream(url: str, ref: str, dest: Path) -> str:
    subprocess.run(
        ["git", "clone", "--depth", "1", "--branch", ref, url, str(dest)],
        capture_output=True,
        text=True,
        check=True,
    )
    return run_git(["rev-parse", "HEAD"], cwd=dest)


def replace_tree(source: Path, target: Path) -> None:
    if not source.is_dir():
        raise FileNotFoundError(f"upstream skill tree not found: {source}")
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(source, target)


def apply_description_overrides(root: Path) -> None:
    for rel_path, new_description in DESCRIPTION_OVERRIDES.items():
        target = root / rel_path
        if not target.is_file():
            raise FileNotFoundError(f"override target missing after sync: {target}")
        text = target.read_text()
        patched, count = re.subn(
            r"^description: .*$",
            f"description: {new_description}",
            text,
            count=1,
            flags=re.MULTILINE,
        )
        if count != 1:
            raise ValueError(f"no frontmatter description found in {target}")
        target.write_text(patched)


def read_synced_sha() -> str | None:
    if not MANIFEST_PATH.is_file():
        return None
    try:
        return json.loads(MANIFEST_PATH.read_text()).get("upstream_sha")
    except (json.JSONDecodeError, OSError):
        return None


def write_manifest(sha: str, url: str) -> None:
    manifest = {
        "upstream_repo": url,
        "upstream_sha": sha,
        "upstream_skill_path": str(UPSTREAM_SKILL_SUBDIR),
        "synced_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default=UPSTREAM_URL, help="upstream repo URL")
    parser.add_argument("--ref", default="main", help="branch or tag to sync")
    parser.add_argument(
        "--local-checkout",
        type=Path,
        default=None,
        help="reuse an existing upstream checkout instead of cloning",
    )
    args = parser.parse_args()

    try:
        if args.local_checkout:
            checkout = args.local_checkout.resolve()
            sha = run_git(["rev-parse", "HEAD"], cwd=checkout)
            replace_tree(checkout / UPSTREAM_SKILL_SUBDIR, CANONICAL_DIR)
        else:
            with tempfile.TemporaryDirectory(prefix="astra-sync-") as tmp:
                checkout = Path(tmp) / "upstream"
                sha = clone_upstream(args.url, args.ref, checkout)
                replace_tree(checkout / UPSTREAM_SKILL_SUBDIR, CANONICAL_DIR)
        apply_description_overrides(CANONICAL_DIR)
        if read_synced_sha() != sha:
            write_manifest(sha, args.url)
    except subprocess.CalledProcessError as exc:
        print(f"git command failed: {exc.stderr}", file=sys.stderr)
        return 1
    except (FileNotFoundError, OSError) as exc:
        print(f"sync failed: {exc}", file=sys.stderr)
        return 1

    file_count = sum(1 for p in CANONICAL_DIR.rglob("*") if p.is_file())
    print(f"synced {file_count} files from {args.url}@{sha[:12]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
