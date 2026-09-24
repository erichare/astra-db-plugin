# Tools reference

The `astra-db` MCP server (`npx -y @erichare/astra-mcp`) exposes 18 tools, 2 resources, and 4 prompts. The same server runs locally over stdio and hosted over streamable HTTP (see [hosted.md](hosted.md)).

## Conventions

- **Targeting.** Every data tool accepts `database` (a name, a database id, or a Data API endpoint URL) and `keyspace`. Leave both out to use the configured default. The token decides which databases are reachable; `list_databases` shows them.
- **Collections and tables.** `find`, `vector_search`, `distinct_values`, `insert`, `update`, and `delete` work on both and detect which one `name` refers to. Pass `kind` only when a collection and a table share a name.
- **Results.** Each tool returns a one-paragraph summary, the data as compact JSON (capped at about 12,000 characters), and the same data as `structuredContent` against a published `outputSchema`. Values round-trip: dates come back as `{"$date": …}`, UUIDs as `{"$uuid": …}`, and ObjectIds as `{"$objectId": …}`, so you can paste them straight into a filter. Vectors are summarized, not returned in full.
- **Errors.** Failures return `isError: true` with `structuredContent.error = {code, message, hint, retryable}`. The codes are listed at the end of this page.
- **Views.** `database_overview`, `describe_collection`, `describe_table`, `find`, and `vector_search` also carry an MCP Apps view (`ui://astra-db/app.html`). Over stdio they accept `emit: "html_file"`, which writes a self-contained HTML page (mode 0600, pruned after 24 hours) and returns a link to it.

## Connect

### `connection_status`

Reports whether credentials are configured, where each value came from (environment, `.env`, host settings, user profile, Astra CLI), the targeted database and keyspace, read-only mode, and hints. The token is shown masked.

| Argument | Default | |
| --- | --- | --- |
| `check` | `true` | Make a live Data API request |

### `list_databases`

Databases the token can see through the DevOps API: name, id, status, regions with their Data API endpoints, and keyspaces. Needs an organization-level token; a token scoped to one database gets `forbidden` here but works everywhere else.

| Argument | Default | |
| --- | --- | --- |
| `include` | `active` | `active` or `all` (non-terminated) |

## Explore

### `database_overview`

Keyspaces, then the collections in each (vector dimension and metric, vectorize model, lexical and rerank, estimated count) and the tables (column and vector-column counts). A keyspace that fails to list reports its own error instead of failing the whole overview, and `truncated` says when a keyspace has more than `maxPerKeyspace`.

| Argument | Default | |
| --- | --- | --- |
| `database` | configured | |
| `keyspaces` | all | Only these |
| `maxPerKeyspace` | `50` | 1–200 |
| `includeCounts` | `true` | One estimated-count request per collection |

### `describe_collection`

Vector settings, vectorize and rerank services, lexical, indexing allow/deny, default id type, estimated count, and a sample document with field types.

| Argument | Default | |
| --- | --- | --- |
| `collection` | required | |
| `includeSample` | `true` | One document, vectors omitted |

### `describe_table`

Columns and types, the primary key (partition and clustering columns), indexes, vector columns, and sample rows.

| Argument | Default | |
| --- | --- | --- |
| `table` | required | |
| `includeSample` | `true` | Up to 3 rows, vectors omitted |

### `list_vectorize_providers`

Embedding and reranking providers and models available to the database, with dimensions and authentication options. Use it before `create_collection` with a vectorize service.

| Argument | Default | |
| --- | --- | --- |
| `kind` | `both` | `embedding`, `reranking`, or `both` |

## Query

### `find`

Documents or rows matching a Data API filter, in pages of 20. Pass `nextPageState` back as `pageState` for the next page.

| Argument | Default | |
| --- | --- | --- |
| `name` | required | Collection or table |
| `filter` | none | e.g. `{"status": "active", "year": {"$gte": 2020}}` |
| `sort` | none | Non-vector sort, e.g. `{"createdAt": -1}` |
| `projection` | all fields | e.g. `{"title": 1, "author": 1}` |
| `limit` | `20` | 1–100, rounded up to whole pages |
| `pageState` | none | From a previous result |

### `vector_search`

Ranked similarity search with scores. Give exactly one of:

- `query`: natural-language text, embedded server-side (the collection or column needs a vectorize service)
- `vector`: your own embedding, matching the dimension
- `documentId`: "more like this" for an existing document (collections)

| Argument | Default | |
| --- | --- | --- |
| `name` | required | Collection or table |
| `idType` | `auto` | How to read `documentId`: `auto` follows the collection's default id type; or `string`, `uuid`, `objectId` |
| `vectorColumn` | the only one | Tables with several vector columns |
| `hybrid` | `false` | Vector plus BM25, reranked. Needs lexical and rerank on the collection; otherwise the tool returns `unsupported_query` rather than quietly falling back |
| `filter`, `projection` | none | Narrow the candidates, choose fields |
| `limit` | `10` | 1–100 |

### `count`

Exact count of matching documents in a collection, up to `upperBound` (the Data API caps exact counts at 1,000). Unfiltered counts also report the estimated total.

| Argument | Default | |
| --- | --- | --- |
| `name` | required | Collection |
| `filter` | none | |
| `upperBound` | `1000` | 1–1000 |

### `distinct_values`

Distinct values of a field (dot paths allowed) across a capped scan; `complete` says whether the scan covered everything.

| Argument | Default | |
| --- | --- | --- |
| `name`, `field` | required | e.g. `genre`, `author.country` |
| `filter` | none | |
| `scanLimit` | `1000` | Up to 10,000 documents or rows |
| `maxValues` | `100` | Up to 1,000 |

## Build

### `code_examples`

Searches the bundled library of about 1,660 documentation-derived snippets (the `astra-toolkit` skill's examples), offline. Every snippet reads `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` from the environment.

| Argument | Default | |
| --- | --- | --- |
| `language` | required | `python`, `typescript`, `java`, `csharp`, `go` |
| `query` | required | e.g. "create a vector collection with vectorize" |
| `limit` | `3` | 1–10 |
| `mode` | `content` | `content` (with source) or `list` (file names only) |

## Change

Write tools are hidden in read-only mode, and on hosted connections without write access.

### `insert`

Inserts 1–1,000 documents or rows in chunks, reporting inserted ids and per-document errors. On a vectorize collection, use `"$vectorize": "text"` to embed server-side; otherwise `"$vector": [...]`.

| Argument | Default | |
| --- | --- | --- |
| `name`, `documents` | required | |
| `ordered` | `false` | Stop at the first error |

### `update`

Applies update operators (`$set`, `$unset`, `$inc`, `$push`, …) to the matching document or row.

| Argument | Default | |
| --- | --- | --- |
| `name`, `filter`, `update` | required | |
| `many` | `false` | Every match (collections only). **Needs confirmation** |
| `upsert` | `false` | Insert when nothing matches (collections) |
| `confirm` | none | See [Confirmation](#confirmation) |

An empty filter also needs confirmation.

### `delete`

Deletes the matching document or row.

| Argument | Default | |
| --- | --- | --- |
| `name`, `filter` | required | |
| `many` | `false` | Every match. **Needs confirmation** |
| `confirm` | none | See [Confirmation](#confirmation) |

An empty filter also needs confirmation.

### `create_collection`

Creates a plain, vector, or vectorize collection. It is idempotent when the settings match an existing collection.

| Argument | |
| --- | --- |
| `name` | Letters, digits, underscore; 48 characters at most |
| `vector` | `{dimension, metric, service}`. `metric` is `cosine` (default), `dot_product`, or `euclidean`; `service` is `{provider, modelName, authentication?, parameters?}` for vectorize |
| `lexical` | Enable BM25 (needed for hybrid) |
| `rerank` | `{provider, modelName}` (needed for hybrid) |
| `indexing` | `{allow}` or `{deny}`: deny large text fields you never filter on |
| `defaultId` | `objectId`, `uuid`, `uuidv6`, or `uuidv7` |

### `create_table`

| Argument | Default | |
| --- | --- | --- |
| `name`, `columns`, `primaryKey` | required | `columns` like `{"id": "uuid", "tags": {"type": "set", "valueType": "text"}, "embedding": {"type": "vector", "dimension": 1024}}`; `primaryKey` is a column name or `{"partitionBy": [...], "partitionSort": {...}}` |
| `ifNotExists` | `true` | |

### `create_index`

Indexes a table column. Collections index their fields automatically; control that with `indexing` on `create_collection`.

| Argument | Default | |
| --- | --- | --- |
| `table`, `name`, `column` | required | |
| `type` | `regular` | `regular` (filter and sort), `vector` (similarity), or `text` (BM25) |
| `options` | none | e.g. `{"metric": "dot_product"}` or `{"caseSensitive": false}` |
| `ifNotExists` | `true` | |

### `drop`

Permanently drops a collection, a table, or a table index. **Always needs confirmation.**

| Argument | |
| --- | --- |
| `kind` | `collection`, `table`, or `index` |
| `name` | What to drop |
| `confirm` | See [Confirmation](#confirmation) |

### Confirmation

`drop`, plus `update` or `delete` with `many` or an empty filter, run only after the user confirms:

1. If the call already carries `confirm`, it must equal the target's name exactly; otherwise the result is `confirmation_mismatch` and nothing changes.
2. If the client supports form elicitation, the server asks the user directly, showing the impact (for example, *Drops collection `default_keyspace.articles` (~12,400 documents)*). On the 2026-07-28 protocol this is a multi-round-trip `input_required` result; older clients get `elicitation/create`. Declining returns a cancelled result.
3. Otherwise the tool fails with `confirmation_required`. The agent must tell the user what will be lost, wait for their approval in a later message, and call again with `confirm: "<name>"`. The request that started the operation is not approval.

Claude Code also receives `_meta["anthropic/requiresUserInteraction"]` on `drop`, so it asks for permission even when tools are auto-approved.

## Resources

| URI | |
| --- | --- |
| `astra://databases` | The databases the token can see (JSON) |
| `astra://{database}/{keyspace}/{name}/schema` | A collection's or table's schema, with completions for each segment |

## Prompts

| Prompt | Arguments | |
| --- | --- | --- |
| `overview` | none | Summarize the database: keyspaces, notable collections and tables, search configuration |
| `explore` | `name` (completed) | Describe a collection or table, then browse a page of its data |
| `similar` | `name` (completed), `query` | Vector search, then explain why the top hits match |
| `setup` | none | Check the connection and walk through fixing it; you run `login` in your own terminal |

## Error codes

| Code | Meaning | Retryable |
| --- | --- | :-: |
| `not_configured` | No token (or no endpoint that can be derived). Run `npx -y @erichare/astra-mcp login` in a terminal | |
| `invalid_credentials` | The token was rejected (401) | |
| `forbidden` | The token lacks permission (403). Database-scoped tokens can't list databases | |
| `not_found` | Unknown database, keyspace, collection, table, or index | |
| `ambiguous_database` | Several databases match; pass `database` or pin one with `login` | |
| `invalid_argument` | The Data API rejected the request's shape | |
| `unsupported_operation` | Not available for this kind (e.g. `count` on a table, `update` with `many` on a table) | |
| `unsupported_query` | Not possible with this collection's configuration (e.g. hybrid without rerank) | |
| `confirmation_required` | Ask the user, then retry with `confirm` | |
| `confirmation_mismatch` | `confirm` didn't equal the target's name | |
| `read_only` | The connection is read-only | |
| `timeout` | Request timed out; a hibernated database wakes on the first call | ✓ |
| `rate_limited` | 429 from Astra | ✓ |
| `data_api_error`, `devops_api_error` | Anything else, with the upstream error code in `details` | |
