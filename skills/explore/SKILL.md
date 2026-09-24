---
name: explore
description: Browse an Astra DB collection or table page by page — documents, field inventory, filters, sorting — as an interactive explorer. Use when the user wants to look at the data itself.
disable-model-invocation: true
argument-hint: "<collection or table> [--filter '<json>'] [--sort '<json>']"
metadata:
  kind: workflow
---

1. If no name was given, call `database_overview` and ask which collection or table to explore.
2. Call `find` with `name` and any parsed options: `filter` and `sort` as JSON objects, `projection` to show only some fields, `keyspace`. To continue paging, pass the previous `nextPageState` as `pageState`.
3. Render it following the [astra-widgets skill](../astra-widgets/SKILL.md), then summarize: how many rows loaded, the field inventory, and whether more pages exist.
4. Offer next steps: filter on a field value, load the next page, or `/astra-db:similar --doc <id> <name>` for a document the user points at.
