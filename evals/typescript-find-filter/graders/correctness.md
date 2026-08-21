---
type: llm
---

Score 1 only if query.ts satisfies ALL of the following; otherwise score 0:

- Imports and uses @datastax/astra-db-ts (`DataAPIClient`), not raw fetch/HTTP calls.
- Reads the token and endpoint from the `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` environment variables; no hardcoded credentials.
- Uses a `find` call whose filter combines `category` equals "electronics" with `price` less than 100 (an `$lt`-style comparison).
- Applies a projection restricted to the `name`, `price`, and `category` fields.
- Sorts by `price` ascending and limits to 20.
- The code is plausible, complete, compilable TypeScript (imports present, no placeholders like TODO or ellipses).
