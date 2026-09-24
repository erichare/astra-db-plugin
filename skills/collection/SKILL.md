---
name: collection
description: Show one Astra DB collection or table in detail — vector and vectorize settings, lexical/rerank, indexing, id type, field types, sample data — as an interactive view. Use when the user asks about a specific collection or table.
disable-model-invocation: true
argument-hint: "<collection or table> [--keyspace <name>]"
metadata:
  kind: workflow
---

Describe the collection or table the user named.

1. If no name was given, call `database_overview` and ask which one.
2. Call `describe_collection` (or `describe_table` for a table; a `not_found` error lists what exists). Pass `keyspace` if one was given.
3. Render it following the [astra-widgets skill](../astra-widgets/SKILL.md), then summarize in two lines: size and vector configuration, then notable settings (vectorize model, hybrid readiness, indexing deny-list, id type).
4. Offer next steps: `/astra-db:explore <name>`, and `/astra-db:similar "<query>" <name>` if it's a vector collection.
