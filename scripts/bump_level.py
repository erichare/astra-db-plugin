#!/usr/bin/env python3
"""Derive a semver bump level from a conventional commit message.

  feat!: / BREAKING CHANGE -> major
  feat:                    -> minor
  anything else            -> patch

Usage: bump_level.py "<commit message>"   (or set COMMIT_MESSAGE)
"""

from __future__ import annotations

import os
import re
import sys

_CONVENTIONAL = re.compile(r"^(?P<type>[a-zA-Z]+)(\([^)]*\))?(?P<bang>!)?:")


def level_for(message: str) -> str:
    subject = message.strip().splitlines()[0] if message.strip() else ""
    match = _CONVENTIONAL.match(subject)
    if "BREAKING CHANGE" in message or (match and match.group("bang")):
        return "major"
    if match and match.group("type").lower() == "feat":
        return "minor"
    return "patch"


def main() -> int:
    message = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("COMMIT_MESSAGE", "")
    print(level_for(message))
    return 0


if __name__ == "__main__":
    sys.exit(main())
