---
description: Show an Astra DB database overview widget — keyspaces, collections (vector config, counts), and tables
---

Render an overview of the connected Astra DB database using the astra-widgets MCP server.

## Fetch

1. Call the `database_overview` tool (astra-widgets server). If it reports missing credentials, tell the user to run `/astra-setup` or export `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT`, then stop.
2. Keep the tool's `structuredContent` — it is the data every rendering path below uses.

## Render

Follow the rendering ladder in the astra-widgets skill (`.bob/skills/astra-widgets/SKILL.md`): inline widget if the harness offers a widget-rendering tool (use `templates/overview.html` as the blueprint); otherwise call the tool again with `emit: "html_file"` and open the returned path; always finish with a two-line markdown summary (totals, then the most notable collections).

## Follow-ups

Offer the obvious next steps by name: `/astra-collection <name>` for details, `/astra-explore <name>` to browse documents, `/astra-similar "<query>" --collection <name>` for vector search.
