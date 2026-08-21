#!/usr/bin/env bash
# PreToolUse guard: block Write/Edit calls that would hardcode an Astra DB
# application token (AstraCS:...) into a file. Short placeholder strings like
# "AstraCS:your-token" are allowed; only token-length values are flagged.
set -uo pipefail

payload=$(cat)

if printf '%s' "$payload" | grep -qE 'AstraCS:[A-Za-z0-9]{20,}'; then
  cat >&2 <<'MSG'
Blocked: this change would hardcode an Astra DB application token (AstraCS:...).
Store the token in an environment variable instead (e.g. ASTRA_DB_APPLICATION_TOKEN
in a git-ignored .env file) and read it from the environment. Run /astra-db:setup
to generate a proper .env, and rotate this token if it was ever committed.
MSG
  exit 2
fi

exit 0
