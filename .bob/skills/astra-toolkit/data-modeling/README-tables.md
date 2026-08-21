# Data modeling for Tables

Tables have typed columns and store Rows. Higher performance than Collections (esp. writes); less flexible.

**Key fact:** writing a Row with a given Primary Key always succeeds — it overwrites any existing row with the same PK. "Update" operations are more limited than in collections (e.g. no column increment).

## Operations
- create/drop/list tables; create/list/drop UDTs; create/list/drop indexes
- insert/delete one or many rows
- update a row (creates row if no match)
- filtering (equality, inequality, lexical match, LT/LTE/GT/GTE), sorting (field, vector similarity), projection

## Primary Keys

`Primary Key = Partition Key + (optional clustering columns)`

- Partition key columns determine data distribution across nodes.
- Clustering columns define physical row ordering within a partition — align with read patterns.
- Most performant reads specify the full partition key.

Examples (partition key in parentheses):
- `(item_id)` — fetch single items by ID
- `(country, region), user_id` — fetch all users for a country+region
- `(city), year, month` — range query "city X AND year >= y"

## Data Types

Primitives: `int`, `bigint`, `smallint`, `tinyint`, `varint`, `decimal`, `float`, `double`, `text`, `ascii`, `date`, `time`, `timestamp`, `duration`, `vector`, `blob`, `UUID`, `boolean`, `inet`

Collections: `list`, `set`, `map`

**UDTs:** create named struct-like types and use them as column types.

## Indexes

- `regular` — equality/inequality on primitives, maps/sets/lists
- `vector` — similarity search. **Must be created manually on a vector column** (unlike Collections)
- `lexical` — keyword sort/filter on `text`/`ascii` columns

## Vectors

- Declare dimension at table-creation time.
- Create a vector index manually to enable similarity search.
- **Vectorize:** send text instead of embeddings; Data API computes embeddings server-side.
  - Free on Astra DB: provider=`"nvidia"`, modelName=`"nvidia/nv-embedqa-e5-v5"`
  - Use `findEmbeddingProviders` to list all available providers/models.

## Read/Write Patterns

### Insertions
- Writing a row overwrites any existing row with the same PK.
- Partial write (some columns only) updates those columns (or creates sparse row).
- Bulk writes: prefer **unordered** inserts with concurrency (optimal at ~20–50 threads).

### Finds
- Most efficient: fetch by full primary key.
- `findOne` / `find` (paginated, cursor-based).
- `find` supports both vector and regular search.
- Sort by clustering columns to avoid expensive in-memory sorting.
- Clients return lazy cursors — avoid `.toList()` upfront.
