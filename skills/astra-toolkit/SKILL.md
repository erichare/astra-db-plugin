---
name: astra-toolkit
description: Build, review, and migrate applications on Astra DB or HCD (DataStax / IBM) through the Data API — data modeling for Collections vs Tables, vector search, vectorize, hybrid search and reranking, the Astra CLI, and idiomatic client code in Python (astrapy), TypeScript (@datastax/astra-db-ts), Java, C#, and Go. Use when code imports an Astra DB client or DataAPIClient, reads ASTRA_DB_* environment variables, or when the user asks to design, query, or debug an Astra DB / HCD database.
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
- Read `clients/<language>/README.md`, then pick snippets from `clients/<language>/INDEX.md` (a compact map of `examples/`) instead of listing the directory.
- All examples assume Astra DB; see per-language README for HCD connection code.
- Adapt example comments to the app being built; don't copy them verbatim.

## Credentials

Application code reads `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` (plus optional `ASTRA_DB_KEYSPACE`) from the environment — typically a git-ignored `.env` — exactly as every example does. Never hardcode an `AstraCS:` token, and never ask the user to paste one into the chat: they run `npx -y @erichare/astra-mcp login` in their own terminal, which picks a database and writes `.env`.

## Live database tools

When the `astra-db` MCP server is connected (bundled with this plugin), inspect the real database before writing code against it — schema guesses are the most common source of bugs.

| Need | Tool |
| --- | --- |
| Is it configured? which database? | `connection_status`, `list_databases` |
| What exists | `database_overview`, `describe_collection`, `describe_table` |
| Read data | `find`, `vector_search` (text via vectorize, vector, similar-to-document, hybrid), `count`, `distinct_values` |
| Change data or schema | `insert`, `update`, `delete`, `create_collection`, `create_table`, `create_index`, `drop` |
| Vectorize / rerank options | `list_vectorize_providers` |
| Canonical client code | `code_examples` (same snippets as `clients/*/examples/`) |

Destructive calls (drops, bulk deletes/updates) require the user's explicit confirmation — never supply `confirm` on your own.
