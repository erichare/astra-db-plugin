#!/usr/bin/env bash
# One-command installer for the Astra DB plugin across agent harnesses.
#
#   curl -fsSL https://raw.githubusercontent.com/erichare/astra-db-plugin/main/install.sh | bash -s -- <target>
#
# Works both from a cloned checkout and via curl | bash (it fetches the repo
# itself when run standalone).
set -euo pipefail

REPO_SLUG="erichare/astra-db-plugin"
REPO_URL="https://github.com/erichare/astra-db-plugin.git"
MARKETPLACE="astra-db-marketplace"
PLUGIN="astra-db"
SKILL="astra-toolkit"

usage() {
  cat <<'USAGE'
Astra DB plugin installer.

Usage: install.sh <target> [options]

Targets:
  claude              Register the marketplace and install the plugin via the claude CLI
  codex-plugin        Register the marketplace and install the native plugin via the codex CLI
  codex               Copy the skill only into ~/.codex/skills/astra-toolkit (set CODEX_HOME to override)
  bob [--global]      Install the full Bob bundle (skill, slash commands, custom modes, MCP
                      config, rules) into ./.bob/ of the current project, merging with
                      existing files; --global targets ~/.bob/ instead
  skills-dir <path>   Copy the skill into <path>/astra-toolkit (any Agent Skills harness)
USAGE
}

log() { printf '[astra-db] %s\n' "$1"; }
fail() { printf '[astra-db] ERROR: %s\n' "$1" >&2; exit 1; }

CLEANUP_DIR=""
cleanup() { if [ -n "$CLEANUP_DIR" ]; then rm -rf "$CLEANUP_DIR"; fi; }
trap cleanup EXIT

# Echo a directory that contains skills/astra-toolkit: the surrounding
# checkout when run from one, otherwise a fresh shallow clone.
resolve_source() {
  local script_path="${BASH_SOURCE[0]:-}"
  if [ -n "$script_path" ] && [ -f "$script_path" ]; then
    local script_dir
    script_dir="$(cd "$(dirname "$script_path")" && pwd)"
    if [ -d "$script_dir/skills/$SKILL" ]; then
      printf '%s' "$script_dir"
      return
    fi
  fi
  command -v git >/dev/null 2>&1 || fail "git is required to fetch the plugin"
  CLEANUP_DIR="$(mktemp -d)"
  log "fetching $REPO_SLUG ..." >&2
  git clone --quiet --depth 1 "$REPO_URL" "$CLEANUP_DIR/repo" \
    || fail "could not clone $REPO_URL"
  printf '%s' "$CLEANUP_DIR/repo"
}

copy_skill_into() {
  local dest_parent="$1"
  local source
  source="$(resolve_source)"
  mkdir -p "$dest_parent"
  rm -rf "${dest_parent:?}/$SKILL"
  cp -R "$source/skills/$SKILL" "$dest_parent/$SKILL"
  log "installed skill to $dest_parent/$SKILL"
}

install_claude() {
  command -v claude >/dev/null 2>&1 \
    || fail "claude CLI not found — install Claude Code first: https://claude.com/claude-code"
  if claude plugin marketplace add "$REPO_SLUG"; then
    log "marketplace registered"
  else
    log "marketplace add did not succeed (already registered?) — continuing"
  fi
  claude plugin install "$PLUGIN@$MARKETPLACE"
  log "done — restart Claude Code sessions to pick up the plugin"
}

install_codex_plugin() {
  command -v codex >/dev/null 2>&1 \
    || fail "codex CLI not found — install Codex first, or use 'codex' for a skill-only install"
  if codex plugin marketplace add "$REPO_SLUG"; then
    log "marketplace registered"
  else
    log "marketplace add did not succeed (already registered?) — continuing"
  fi
  codex plugin add "$PLUGIN@$MARKETPLACE"
  log "done — Codex loads the astra-db plugin (astra-* skills, hooks, MCP) on its next session"
}

install_codex() {
  copy_skill_into "${CODEX_HOME:-$HOME/.codex}/skills"
  log "done — Codex discovers the skill on its next session"
}

install_bob() {
  local scope="${1:-}"
  command -v python3 >/dev/null 2>&1 || fail "python3 is required for the Bob installer"
  local source
  source="$(resolve_source)"
  if [ "$scope" = "--global" ]; then
    python3 "$source/scripts/bob_install.py" --source "$source" --target "$HOME/.bob" --global
    log "done — Bob loads the global bundle from ~/.bob on its next session"
  elif [ -z "$scope" ]; then
    python3 "$source/scripts/bob_install.py" --source "$source" --target "$PWD/.bob"
    log "done — Bob loads .bob/ in this project (skill, /astra-* commands, Astra modes, MCP server, rule)"
  else
    fail "unknown option for bob: '$scope' (expected --global)"
  fi
}

main() {
  case "${1:-}" in
    claude) install_claude ;;
    codex-plugin) install_codex_plugin ;;
    codex) install_codex ;;
    bob) install_bob "${2:-}" ;;
    skills-dir)
      [ -n "${2:-}" ] || { usage >&2; fail "skills-dir requires a path"; }
      copy_skill_into "$2"
      ;;
    -h|--help) usage ;;
    *)
      usage >&2
      fail "unknown target: '${1:-}'"
      ;;
  esac
}

main "$@"
