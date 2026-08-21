# Markdown fallback shapes

Use these when neither an inline widget nor opening an HTML file is possible.

**Overview** — a table: Collection | Vector | Capabilities | ~Documents, one section per keyspace, tables listed beneath.

**Collection card** — a two-column table of the definition (documents, dimension, metric, vectorize, rerank, lexical, indexing, default id), then the sample document in a fenced `json` block.

**Similarity** — a table: # | Title | Score | ▰▰▰▰▱▱▱▱▱▱ (ten blocks, filled = `round(similarity × 10)`), followed by `best / mean / lowest`.

**Explorer** — a table with `_id` and up to four display fields for the first 10 documents, then the field inventory as `name:type` pairs and "more available" when `nextPageState` is present.
