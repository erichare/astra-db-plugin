---
description: Review this project's Astra DB data model against Collections/Tables best practices and anti-patterns
---

Review the current project's Astra DB data model and Data API usage. Use the astra-data-modeler agent for the design assessment and, if data-access code exists, the astra-reviewer agent for usage review — run them in parallel when both apply.

## Reference material

Ground every finding in the skill content bundled with this plugin:

- [data-modeling/README-collections.md](../skills/astra-toolkit/data-modeling/README-collections.md) — Collections modeling tips and anti-patterns
- [data-modeling/README-tables.md](../skills/astra-toolkit/data-modeling/README-tables.md) — Tables modeling tips and anti-patterns
- [architecture/README.md](../skills/astra-toolkit/architecture/README.md) — application architecture patterns
- `clients/<language>/README.md` in the same skill — language-specific idioms and limitations

When installed as a plugin, these files live under `${CLAUDE_PLUGIN_ROOT}/skills/astra-toolkit/`.

## Steps

1. Locate the data layer: search the project for DataAPIClient usage, collection/table definitions, schema files, and Astra endpoints.
2. Determine for each store whether Collections or Tables is used and whether that choice matches the access patterns (read-then-write needs, typed rows vs. schemaless documents, vector/hybrid search, no JOINs/transactions/aggregations).
3. Check for the documented anti-patterns: hot partitions, unbounded document growth, filtering on unindexed fields, client-side joins, misuse of vectorize, missing pagination.
4. Verify credentials come from environment variables — flag any hardcoded `AstraCS:` token as CRITICAL.

## Output

Report findings grouped by severity (CRITICAL / HIGH / MEDIUM / LOW) with file:line references and the specific skill file that backs each recommendation. If the model is sound, say so plainly.

This is an assessment — do not change code unless the user asks for fixes afterwards.
