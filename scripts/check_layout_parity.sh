#!/usr/bin/env bash
# Verify the committed derived layouts match what build_layouts.py generates.
# Fails if .bob/ has drifted from the canonical skills/ tree.
set -euo pipefail

cd "$(dirname "$0")/.."

python3 scripts/build_layouts.py >/dev/null

if ! git diff --exit-code --stat -- .bob; then
  echo "ERROR: derived layouts are out of sync with skills/astra-toolkit." >&2
  echo "Run: python3 scripts/build_layouts.py && git add .bob" >&2
  exit 1
fi

echo "layout parity OK"
