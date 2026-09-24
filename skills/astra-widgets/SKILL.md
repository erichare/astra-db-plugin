---
name: astra-widgets
description: Show Astra DB results as interactive views — database overview, collection or table schema, document explorer, and vector-search results — from the astra-db MCP tools. Use when the user wants to see, inspect, browse, or search an Astra DB database visually, and after running an Astra DB vector search or schema inspection for them.
---

Turn Astra DB data into a view instead of a wall of text. The `astra-db` MCP server supplies both the data (`structuredContent`) and an interactive app for it.

## Tools with a view

| Tool | View | Use it for |
| --- | --- | --- |
| `database_overview` | overview | keyspaces → collections (vector config, vectorize, lexical/rerank, counts) and tables |
| `describe_collection {collection}` | collection | one collection's configuration, field types, and a sample document |
| `describe_table {table}` | table | columns, primary key, indexes, vector columns, sample rows |
| `find {name, filter?, sort?, pageState?}` | explorer | a page of documents/rows, field inventory, paging |
| `vector_search {name, query \| vector \| documentId, hybrid?}` | similarity | ranked hits with scores, plus a similarity map |

## Rendering ladder

1. **The host renders MCP Apps** (claude.ai, Claude Desktop, ChatGPT, VS Code, Goose, …): the view appears inline by itself, and the user can drill down inside it. Reply with a one-to-three line summary. Don't repeat the data or build HTML by hand.
2. **A widget tool but no MCP Apps** (for example Claude Code desktop's `show_widget`): build the widget from the matching blueprint in [templates/](templates/) ([overview](templates/overview.html), [collection](templates/collection-card.html), [similarity](templates/similarity.html), [explorer](templates/explorer.html)), fill it from `structuredContent`, and follow [DESIGN.md](DESIGN.md): host CSS variables, flat surfaces, `sendPrompt()` drill-downs, no prose inside the widget.
3. **Terminal only**: summarize in markdown ([templates/markdown.md](templates/markdown.md)). If the user asks for a visual, call the same tool with `emit: "html_file"` and open the returned file (`open` on macOS, `xdg-open` on Linux, `start` on Windows).

## Drill-downs

Phrase follow-ups so they route back to these tools:

- `Describe the collection <name>` → `describe_collection`
- `Explore <name> where <field> = <value>` → `find` with `filter`
- `Show the next page of <name>` → `find` with the last `nextPageState`
- `Find documents similar to <id> in <name>` → `vector_search` with `documentId`

## Rules

- Show only what the tool returned. Never invent documents, counts, or scores; show "—" for unknown values.
- Never print tokens, and don't show endpoints beyond the host name. If a tool returns `not_configured`, say how to connect (`npx -y @erichare/astra-mcp login` in the user's own terminal) and stop.
- Keep explanations in your reply, not inside the widget.
- Round scores to three decimals and format counts with thousands separators.
