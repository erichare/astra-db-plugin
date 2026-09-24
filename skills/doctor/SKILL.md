---
name: doctor
description: Diagnose an Astra DB setup — where credentials come from, whether the database is reachable, .env hygiene, tracked tokens, and agent configuration — and give the exact fix for each problem. Use when Astra DB tools fail, return auth or not-found errors, or the user asks why Astra DB isn't working.
metadata:
  kind: workflow
---

Run the checks, never print secret values, and finish with a table plus the exact fix for each failure.

## Checks

1. **Live connection.** Call `connection_status`. It reports the token source (masked), the endpoint host, the keyspace, read-only mode, and a live Data API check with hints. This is the authoritative view of what the MCP server sees.
2. **Full diagnosis.** Run `npx -y @erichare/astra-mcp doctor` in the project directory (it only reads). It adds Node.js version, `.env` git-ignore status, a scan of git-tracked files for committed `AstraCS:` tokens, and which agents are configured. Use `--json` if you want to parse the output.
3. **Credential hygiene.** If a token turns up in tracked files, treat it as leaked. Move it to `.env`, read it from `ASTRA_DB_APPLICATION_TOKEN`, and tell the user to rotate it in the Astra console.

## Common fixes

| Symptom | Fix |
| --- | --- |
| `not_configured` | The user runs `npx -y @erichare/astra-mcp login` in their terminal |
| `invalid_credentials` (401) | The token is revoked or mistyped: run `login` again with a fresh token |
| `forbidden` (403) listing databases | The token is scoped to one database: set `ASTRA_DB_API_ENDPOINT` (`login` asks for it) |
| `ambiguous_database` | Pass `database` to the tool, or pin one with `login` |
| `not_found` on a collection | Check the name and keyspace with `database_overview` |
| Hibernated database, `timeout` | Retry after a minute; the first call wakes it |

## Report

Output a table (Check · Result · Fix), then one sentence on overall health. If everything passes, suggest a next step such as `/astra-db:overview` or `/astra-db:data-model-review`.
