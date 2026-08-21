---
description: Diagnose Astra DB setup — CLI, authentication, environment variables, credential hygiene, and MCP wiring
---

Run a diagnostic pass over the current project's Astra DB setup. Execute every check, never print secret values, and finish with a PASS/FAIL table plus the exact fix for each failure.

## Checks

1. **Astra CLI installed** — run `astra --version`. Fix: run `/astra-setup` to install it.
2. **CLI authenticated** — run `astra config list` and confirm at least one configuration exists. Fix: create a Database Administrator token at https://astra.datastax.com → Tokens, then run `astra setup` (the user runs this themselves; never ask for the token in chat).
3. **Environment variables present** — test that `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` are set using shell parameter checks such as `[ -n "$ASTRA_DB_APPLICATION_TOKEN" ]`; report only set/unset, never the values. Fix: run `astra db create-dotenv <db-name>` and load the resulting `.env`.
4. **`.env` is git-ignored** — if a `.env` file exists, confirm `git check-ignore .env` succeeds. Fix: append `.env` to `.gitignore`.
5. **No committed tokens** — run `git grep -lE "AstraCS:[A-Za-z0-9]{20,}" -- .` (excluding `.env`) and expect no matches. Fix: remove the token from the file, load it from the environment instead, and rotate it in the Astra console because it must be treated as leaked.
6. **Database reachable** — if the CLI is authenticated, run `astra db list` and report the databases and their statuses. Fix for an empty list: create one via `/astra-setup`.
7. **MCP server wiring** — if both environment variables are set, report that the bundled Astra DB MCP server is active for this session; if either is missing, report which one blocks it.

## Report

Output a table with columns Check / Result / Fix, then one sentence stating overall health. If every check passes, suggest a next step: ask for a collection or table to be created, or run `/astra-data-model-review` on the existing data layer.
