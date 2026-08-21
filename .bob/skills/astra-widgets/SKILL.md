---
name: astra-widgets
description: Render elegant Astra DB widgets — database overview, collection card, similarity results (ranked bars and constellation), and collection explorer — from the astra-widgets MCP tools. Use when showing, inspecting, or exploring Astra DB collections, running vector or similarity searches, or summarizing a database, and proactively right after any Astra DB vector search or collection inspection you perform for the user.
---

Turn Astra DB data into a widget instead of a wall of text. The `astra-widgets` MCP server (bundled with this plugin) supplies the data; this skill tells you how to show it.

## Tools

| Tool | Use it for | Widget |
| --- | --- | --- |
| `database_overview` | keyspaces, collections (vector config, vectorize model, lexical/rerank, estimated counts), tables | overview |
| `collection_card {collection, keyspace?}` | one collection's full metadata + a sample document | collection-card |
| `similarity_search {collection, query? \| documentId?, limit?, filter?, hybrid?}` | vector search by text ($vectorize) or by an existing document; ranked hits with `$similarity` | similarity |
| `explore_collection {collection, filter?, pageState?, fields?}` | a page of documents, field inventory, next-page state | explorer |

Every tool returns a text summary and `structuredContent` (the widget data). Pass `emit: "html_file"` to also get a standalone HTML page (`htmlPath`).

## Rendering ladder

1. **Inline widget available** (a tool that renders HTML widgets in the conversation, such as the desktop `show_widget` tool): build the widget from the matching blueprint in [templates/](templates/) — [overview.html](templates/overview.html), [collection-card.html](templates/collection-card.html), [similarity.html](templates/similarity.html), [explorer.html](templates/explorer.html) — filling it from `structuredContent`, and follow [DESIGN.md](DESIGN.md) exactly (flat surfaces, host CSS variables, purple accent, sentence case, `sendPrompt()` drill-downs, no prose inside the widget).
2. **No inline widget**: call the same tool again with `emit: "html_file"` and open the returned `htmlPath` (`open <path>` on macOS, `xdg-open <path>` on Linux; otherwise print the path). The page is self-contained and renders the same design.
3. **Always** finish with a one-to-three line markdown summary drawn from the tool's text (totals, top hits with scores, or the collection's key settings) so the result stays useful without the visual.

## Drill-downs

Use `sendPrompt()` (inline widgets) or plain suggestions (elsewhere) with these phrasings so they route back to this skill:

- `Find documents similar to <id> in <collection>` → `similarity_search` with `documentId`
- `Explore <collection> filtered by <field> = <value>` → `explore_collection` with `filter`
- `Show the next page of <collection>` → `explore_collection` with the last `nextPageState`
- `Show the collection card for <collection>` → `collection_card`

## Rules

- Render only what the tool returned — never invent documents, counts, or scores; show "—" for unknown values.
- Never print tokens or endpoints beyond the host name; if credentials are missing, say how to set them (`/astra-db:setup` or the two environment variables) and stop.
- Keep explanations in your reply, not inside the widget; the widget is the visual only.
- Round every displayed number (`toFixed(3)` for scores, `toLocaleString()` for counts).
