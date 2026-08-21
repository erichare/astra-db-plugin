#!/usr/bin/env bash
# Verify the committed generated layouts (.bob/, codex/) and the committed
# server bundle (server/dist) match what the build scripts produce.
# Run `npm run build` in server/ first when the server changed.
set -euo pipefail

cd "$(dirname "$0")/.."

python3 scripts/build_layouts.py >/dev/null

if ! git diff --exit-code --stat -- .bob codex server/dist; then
  echo "ERROR: generated layouts are out of sync with skills/, commands/, agents/." >&2
  echo "Run: python3 scripts/build_layouts.py && git add .bob codex" >&2
  exit 1
fi

if [ -n "$(git ls-files --others --exclude-standard -- .bob codex server/dist)" ]; then
  echo "ERROR: build produced untracked files under .bob/ or codex/; git add them." >&2
  git ls-files --others --exclude-standard -- .bob codex server/dist >&2
  exit 1
fi

echo "layout parity OK"
