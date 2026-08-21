---
description: Show an Astra DB collection card widget — vector config, vectorize model, indexing, count, and a sample document
---

Render a collection card for `$ARGUMENTS` (collection name; optional `--keyspace <name>`).

## Fetch

1. If no collection name was given, call `database_overview` first and ask the user which collection to show.
2. Call the `collection_card` tool (astra-widgets server) with `collection` (and `keyspace` when provided). On missing credentials, point the user to `/astra-setup` and stop; on `collection_not_found`, list the available names from the error and stop.

## Render

Follow the astra-widgets skill ladder (`.bob/skills/astra-widgets/SKILL.md`) with `templates/collection-card.html` as the blueprint: inline widget when available, otherwise `emit: "html_file"` and open the path; then a two-line markdown summary (count + vector config, then notable settings such as vectorize model, rerank, indexing).

## Follow-ups

Offer `/astra-explore <name>` and `/astra-similar "<query>" --collection <name>` (or `--doc <id>` for collections without vectorize).
