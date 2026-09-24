---
name: overview
description: Show an Astra DB database overview — keyspaces, collections with vector settings and counts, and tables — as an interactive view. Use when the user asks what is in their Astra database.
disable-model-invocation: true
argument-hint: "[database]"
metadata:
  kind: workflow
---

1. Call `database_overview` (pass `database` if the user named one). On `not_configured`, follow the [setup skill](../setup/SKILL.md) and stop.
2. Render it following the [astra-widgets skill](../astra-widgets/SKILL.md). In MCP Apps hosts the view appears on its own; elsewhere, summarize.
3. Summarize in two lines: the totals, then the most notable collections (vector dimension and vectorize model, hybrid readiness).
4. Offer next steps by name: `/astra-db:collection <name>`, `/astra-db:explore <name>`, `/astra-db:similar "<query>" <name>`.
