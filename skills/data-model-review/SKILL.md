---
name: data-model-review
description: Review this project's Astra DB data model and Data API usage against Collections/Tables best practices, anti-patterns, and the live schema. Use when the user asks for a data-model or schema review.
disable-model-invocation: true
metadata:
  kind: workflow
---

Assess the project's Astra DB data layer. Use the [data-modeler](../data-modeler/SKILL.md) approach for the design, and the [reviewer](../reviewer/SKILL.md) checklist for data-access code if any exists.

## Ground truth

- Guidance: [README-collections.md](../astra-toolkit/data-modeling/README-collections.md), [README-tables.md](../astra-toolkit/data-modeling/README-tables.md), [architecture/README.md](../astra-toolkit/architecture/README.md), and `clients/<language>/README.md` in the astra-toolkit skill.
- **The live schema**: when the astra-db tools are connected, call `database_overview`, then `describe_collection` or `describe_table` for every store the code uses. Compare the real configuration (vector dimension and metric, vectorize model, indexing deny-list, primary keys, indexes) with what the code assumes.

## Steps

1. Locate the data layer: `DataAPIClient` usage, collection and table names, schema files, index creation.
2. For each store, check whether Collections or Tables fits the access patterns (read-then-write needs, typed rows versus schemaless documents, vector or hybrid search; no JOINs, transactions, or aggregations).
3. Check the documented anti-patterns: hot partitions, unbounded document growth, filtering on unindexed fields, client-side joins, misuse of vectorize, missing pagination, mismatches between code and live schema.
4. Credentials must come from `ASTRA_DB_*` environment variables. Flag any hardcoded `AstraCS:` token as CRITICAL.

## Output

Group findings by severity (CRITICAL, HIGH, MEDIUM, LOW), with file:line references and the skill file or live-schema fact behind each one. If the model is sound, say so plainly. This is an assessment: change code only if the user asks afterwards.
