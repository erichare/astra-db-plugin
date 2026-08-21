---
name: astra-toolkit
description: Manage Astra DB, design applications powered by it (data model, patterns) and write them with the right idioms in several languages. Use when building, reviewing, or migrating applications that use Astra DB or HCD via the Data API, the Astra CLI, or vector search.
---

Toolkit for Astra DB and its Data API.

**Astra CLI**: Astra DB only. All other features apply to both Astra DB and HCD (both expose a Data API).

## Astra CLI

Create/list databases, inspect status, prepare a dotenv for app connections.
Requires installation + Database Administrator token.
If missing, direct user to: https://docs.datastax.com/en/astra-cli/install.html

→ Details: [astra-cli/README.md](astra-cli/README.md)

## Data API

DDL + DML for Collections and Tables via the HTTP Data API. **Always use Clients — never raw HTTP calls.**
API surface is identical for Astra DB and HCD; only connection setup differs.

## Data modeling

Model data up front, not as an afterthought.

Hierarchy: **Database → Keyspaces → Collections / Tables / UDTs**

- **Collections**: schemaless JSON documents; support find-one-and-update and similar read-then-write primitives.
- **Tables**: typed rows; faster, but no read-then-insert primitives. Different (more) available data types from collections.
- **NoSQL**: no JOINs, no strict transactions, no aggregation pipelines, no group-by, no document-wide full-text search.

Choose collections (flexibility) vs. tables (performance) based on access patterns and the constraints above.

Collections and Tables support vectors and vector/similarity search, including "vectorize" (server-side embedding computations).

→ Details: [data-modeling/README-collections.md](data-modeling/README-collections.md), [data-modeling/README-tables.md](data-modeling/README-tables.md)

## Application architecture

Use the common patterns in [architecture/README.md](architecture/README.md) regardless of language.

## Clients

Use the client object hierarchy (DataAPIClient → Database → Collection/Table → documents/rows) for all DDL and DML.

- API is mostly uniform across languages; mind language-specific idioms and limitations.
- Browse `clients/<language>/README.md` + `examples/` for the target language.
- All examples assume Astra DB; see per-language README for HCD connection code.
- Adapt example comments to the app being built; don't copy them verbatim.
