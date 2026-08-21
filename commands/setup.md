---
description: Set up Astra DB for this project — Astra CLI, application token, and .env connection settings
---

Set up Astra DB access for the current project. Work through the sections in order and tell the user what you found at each step.

## Detect and install the Astra CLI

1. Run `astra --version`. If the CLI is installed, note the version and skip to Authenticate.
2. Ask the user before installing anything. On macOS prefer `brew install datastax/astra-cli-homebrew/astra-cli`; otherwise follow the official installer at https://docs.datastax.com/en/astra-cli/installation.html. Verify with `astra --version` afterwards.

## Authenticate

3. Run `astra config list`. If no configuration exists, direct the user to create a Database Administrator token in the Astra console (https://astra.datastax.com → Tokens) and run `astra setup` themselves. NEVER ask the user to paste the token into this chat, and never write a token value into any file yourself.

## Database and connection settings

4. Run `astra db list`. If the user needs a new database, ask for name and region preferences, then create it with `astra db create <name> --if-not-exist`.
5. Run `astra db create-dotenv <db-name>` to write a `.env` with `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT`. Confirm `.env` is listed in `.gitignore`; add it if missing.
6. Tell the user the plugin's bundled Astra DB MCP server activates when `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` are exported in their shell environment (for example via `source .env` or direnv).

## Report

7. Summarize: CLI version, database name and endpoint, where credentials live, and what to try next (for example: "ask me to create a collection with vector search — the astra-toolkit skill has idiomatic snippets for Python, TypeScript, Java, C#, and Go").

For any Data API code the user wants next, follow the astra-toolkit skill bundled with this plugin rather than memory.
