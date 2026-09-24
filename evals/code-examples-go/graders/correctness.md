---
type: llm
focus:
  source: file
  path: main.go
---

Score 1 only if main.go satisfies ALL of the following; otherwise score 0:

- Uses the official Go client `github.com/datastax/astra-db-go/v2` (`astra.NewClient()`, `client.Database(endpoint, options.API().SetToken(token))`), not raw HTTP calls.
- Reads the token and endpoint with `os.Getenv("ASTRA_DB_APPLICATION_TOKEN")` / `os.Getenv("ASTRA_DB_API_ENDPOINT")`; no hardcoded credentials.
- Inserts two documents into `articles` whose `$vectorize` field carries the text to embed (for example `InsertMany` with `"$vectorize"` keys).
- Finds with a vectorize sort for "black holes" (`sort.Vectorize("black holes")`) and a limit of 5 (`SetLimit(5)`), then iterates the cursor (`cursor.Next` / `cursor.Decode`) and prints titles.
- Complete, plausible Go: `package main`, imports present, errors checked, no placeholders such as `**COLLECTION_NAME**`, TODO, or ellipses.
