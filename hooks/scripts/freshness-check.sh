#!/usr/bin/env bash
# SessionStart notice: report (at most once per 24h, best-effort, silent on any
# failure) when the bundled skill content is behind the upstream
# sl-at-ibm/astra-toolkit-skill repo.
set -uo pipefail

ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
MANIFEST="$ROOT/sync-manifest.json"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/astra-db-plugin"
CACHE="$CACHE_DIR/freshness"
TTL_MINUTES=1440

mkdir -p "$CACHE_DIR" 2>/dev/null || exit 0

if [ -f "$CACHE" ] && [ -n "$(find "$CACHE" -mmin "-$TTL_MINUTES" 2>/dev/null)" ]; then
  cat "$CACHE" 2>/dev/null
  exit 0
fi

read_manifest_field() {
  python3 -c "import json,sys; print(json.load(open(sys.argv[1]))[sys.argv[2]])" \
    "$MANIFEST" "$1" 2>/dev/null
}

local_sha=$(read_manifest_field upstream_sha) || exit 0
repo=$(read_manifest_field upstream_repo) || exit 0
[ -z "$local_sha" ] || [ -z "$repo" ] && exit 0

if command -v timeout >/dev/null 2>&1; then
  remote_sha=$(timeout 3 git ls-remote "$repo" HEAD 2>/dev/null | awk '{print $1}')
else
  remote_sha=$(git ls-remote "$repo" HEAD 2>/dev/null | awk '{print $1}')
fi
[ -z "${remote_sha:-}" ] && exit 0

msg=""
if [ "$remote_sha" != "$local_sha" ]; then
  msg="[astra-db plugin] Bundled skill content is behind upstream astra-toolkit-skill (local ${local_sha:0:8}, upstream ${remote_sha:0:8}). Plugin maintainers can refresh it with scripts/sync_upstream.py or /astra-db:sync-check."
fi

printf '%s' "$msg" >"$CACHE" 2>/dev/null
printf '%s' "$msg"
exit 0
