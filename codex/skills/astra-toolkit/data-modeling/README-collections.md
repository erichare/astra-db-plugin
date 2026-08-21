# Data modeling for Collections

Collections store Documents (arbitrary-shape JSON) with some limits and extra perks (native timestamps, blobs, embedding vectors).

## Operations
- create/drop/list collections
- insert/delete/update one or many documents; replace one document
- findOneAndReplace / findOneAndUpdate / findOneAndDelete (arbitrary filter)
- count documents
- filtering (equality, inequality, lexical, LT/LTE/GT/GTE), sorting (field, vector similarity), projection

## Vector & Search Features

**Vector search:** ANN similarity search on a query vector; documents returned most-similar-first. Use for RAG and semantic retrieval.

**Vectorize:** server-side embedding computation — supply text for inserts and queries; Data API handles embeddings.
- Free on Astra DB: provider=`"nvidia"`, modelName=`"nvidia/nv-embedqa-e5-v5"`
- Use `findEmbeddingProviders` to list all available providers/models.

**findAndRerank:** combines vector + lexical sub-searches with server-side merge/rerank. Documents need a vector/vectorize field, a `$lexical` field, or both.

## Indexing

Default: all fields indexed. Configure an allow-list or deny-list at creation (hierarchical: allowing `X` indexes all `X.*` subfields).

Key patterns:
- **Deny** long text fields you won't equality-search (indexed strings > 8 KB error).
- Group metadata: allow fields you'll filter on; deny fields that grow unboundedly.

## Collection Configuration (immutable after creation)

- Vector: dimension, similarity metric (cosine/euclidean), vectorize provider/model
- Indexing allow/deny policy
- Default ID type (UUID, ObjectID, string)
- Lexical and rerank settings

## Documents

**Types:** strings, numbers, booleans, null, arrays, nested objects, timestamps, binary blobs, UUIDs, ObjectIDs

**ID:** each document has an `_id` (number, string, UUID, or ObjectID).

**Limits:**
- Max 5–10 collections per database
- Field names: cannot start with `$`, cannot be `*`
- Field path: ≤ 1000 chars
- Indexed strings: ≤ 8 000 chars
- Arrays: ≤ 1 000 items
- Vector dimension: ≤ 4 096
- Indexed properties: ≤ 1 000
- Total nodes+leaves: ≤ 5 000
- Nesting depth: ≤ 16
- Document JSON size: ≤ 4 MB
- Vector search result cap: 1 000 documents

## Patterns & Antipatterns

**Projection:** always project to return only needed fields. For vector searches, pass the "include similarity" flag instead of projecting `$similarity`.

**Filtering:** avoid negative `$nin` clauses; design schema to avoid them.

**Vector search:** rarely need more than ~50 top results.

**Insertions:**
- No ID → API assigns one; repeated inserts create duplicates.
- Explicit ID → error (`DOCUMENT_ALREADY_EXISTS`) if already exists; use `findOneAndReplace` for upsert.
- Bulk writes: prefer **unordered** inserts with concurrency (optimal at ~20–50 threads).

**Finds:**
- Most efficient: fetch by document `_id`.
- `findOne` / `find` (paginated, cursor-based lazy iterators — avoid `.toList()` upfront).
- Regular search with field-sorting triggers expensive in-memory sort; result capped at ~100.

**Overcoming limits:**
- Merge multiple logical collections into one using a `"kind"` discriminator field.
- For in-memory-sort or collection-count limits, promote to a Table (see `README-tables.md`).
- Don't store large blobs (>1 MB) in DB — use object storage (S3, etc.) and keep only metadata.
- Replace excessively large documents undergoing frequent updates with multiple linked docs, if latencies allow.
