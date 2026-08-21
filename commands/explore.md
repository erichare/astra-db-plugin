---
description: Browse an Astra DB collection in the explorer widget — documents table, field inventory, filters, paging
---

Open the explorer for `$ARGUMENTS` (collection name; optional `--keyspace <name>`, `--filter '<json>'`, `--fields a,b,c`).

## Fetch

1. If no collection name was given, call `database_overview` and ask which collection to explore.
2. Call the `explore_collection` tool (astra-widgets server) with `collection` and any parsed options (`filter` as a JSON object, `fields` as an array, `keyspace`). Pass `pageState` from a previous result when the user asks for the next page. On missing credentials, point to `/astra-db:setup` and stop.

## Render

Follow the astra-widgets skill ladder (`${CLAUDE_PLUGIN_ROOT}/skills/astra-widgets/SKILL.md`) with `templates/explorer.html` as the blueprint; otherwise `emit: "html_file"` and open the path. Finish with a markdown summary: how many documents loaded, the field inventory, and whether another page exists.

## Follow-ups

Offer to filter on a field value (`--filter '{"field": "value"}'`), load the next page, or run `/astra-db:similar --doc <id>` on a document the user points at.
