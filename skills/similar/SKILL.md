---
name: similar
description: Run a vector (or hybrid) similarity search on an Astra DB collection or table and show ranked results with scores. Use when the user wants semantically similar documents.
disable-model-invocation: true
argument-hint: "\"<query>\" <collection> [--doc <id>] [--hybrid] [--limit <n>]"
metadata:
  kind: workflow
---

## Arguments

Parse the user's arguments:

- The quoted text is `query`. The next word is the collection or table `name`. If there's no name, use the only vector collection from `database_overview`, or ask.
- `--doc <id>` becomes `documentId` ("more like this"). Use it for collections without vectorize.
- `--hybrid` sets `hybrid: true` (needs lexical and rerank). `--limit <n>` sets the limit (default 10). `--keyspace <k>` sets the keyspace.

## Steps

1. Call `vector_search`. On `unsupported_query`, relay the hint (for example "no vectorize service: pass --doc <id> or a vector") and stop.
2. Render it following the [astra-widgets skill](../astra-widgets/SKILL.md), then summarize: the top three hits with scores, and one sentence on how far apart the scores are (`stats`).
3. Offer next steps: search again from a returned id (`--doc <id>`), widen with `--limit`, or try `--hybrid` when rerank is enabled.
