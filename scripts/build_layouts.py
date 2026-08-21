#!/usr/bin/env python3
"""Generate derived harness layouts from the canonical skill tree.

Canonical source: skills/astra-toolkit/ (Claude plugin + agentskills.io layout).
Derived output:   .bob/skills/astra-toolkit/ (IBM Bob layout, byte-identical copy).

Run after every sync; CI verifies the derived copies match via
check_layout_parity.sh.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CANONICAL_DIR = REPO_ROOT / "skills" / "astra-toolkit"
DERIVED_DIRS = [
    REPO_ROOT / ".bob" / "skills" / "astra-toolkit",
]


def main() -> int:
    if not CANONICAL_DIR.is_dir():
        print(f"canonical tree missing: {CANONICAL_DIR}", file=sys.stderr)
        return 1

    for target in DERIVED_DIRS:
        if target.exists():
            shutil.rmtree(target)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(CANONICAL_DIR, target)
        print(f"built {target.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
