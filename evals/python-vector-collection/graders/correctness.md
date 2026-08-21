---
type: llm
---

Score 1 only if main.py satisfies ALL of the following; otherwise score 0:

- Imports and uses the astrapy client (`DataAPIClient` or equivalent current astrapy API), not raw HTTP requests.
- Reads the token and endpoint from the `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` environment variables; no hardcoded credentials anywhere.
- Creates the `articles` collection with a vector configuration of dimension 1024 and cosine metric.
- Inserts at least one document containing a `title` field and a vector value using the client's documented vector insert form.
- Performs a vector similarity search with a limit of 5 using the client's documented sort-by-vector form.
- The code is plausible, complete, runnable Python (imports present, no placeholders like TODO or ellipses).
