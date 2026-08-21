# Astra DB

- Never hardcode Astra DB application tokens (`AstraCS:...`) in source or config files. Read `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` from environment variables or a git-ignored `.env`, and treat any committed token as leaked: rotate it in the Astra console.
- For any code that talks to Astra DB or HCD through the Data API, the Astra CLI, or vector search, follow the `astra-toolkit` skill in `.bob/skills/astra-toolkit/` (start at `SKILL.md`, then the per-language `clients/<language>/README.md` and `examples/`) rather than relying on memory.
