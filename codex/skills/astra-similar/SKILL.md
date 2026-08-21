---
name: astra-similar
description: Run a vector similarity search and show the results widget — ranked scores and a constellation map. Use when the user wants a vector or similarity search in an Astra DB collection and wants to see the results.
---

Run a similarity search from `$ARGUMENTS` and render the results.

## Parse arguments

- The quoted text (or all remaining words) is the natural-language `query`.
- `--collection <name>` selects the collection; if absent, use the only vector collection in the database (`database_overview`) or ask.
- `--doc <id>` searches by that document's vector instead of a text query (required for collections without a vectorize service).
- `--hybrid` uses hybrid search with reranking when the collection supports it; `--limit <n>` sets the number of hits (default 10); `--keyspace <name>` targets a keyspace.

## Fetch

Call the `similarity_search` tool (astra-widgets server) with the parsed arguments. On `unsupported_query` for a collection without vectorize, explain that a `--doc <id>` search works there and stop; on missing credentials, point to `$astra-setup` and stop.

## Render

Follow the astra-widgets skill ladder (`${PLUGIN_ROOT}/skills/astra-widgets/SKILL.md`) with `templates/similarity.html` as the blueprint (ranked bars by default, constellation available); otherwise `emit: "html_file"` and open the path. Finish with a markdown summary: the top three hits with scores and one sentence on how separated the scores are (`stats`).

## Follow-ups

Offer to search by one of the returned ids (`--doc <id>`), to widen with `--limit`, or to try `--hybrid` when rerank is enabled.
