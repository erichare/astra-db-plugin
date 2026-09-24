import type { CollectionResultT, ExplorerResultT, OverviewResultT, SimilarityResultT, TableResultT } from "../../src/server/schemas.js";

export const overview: OverviewResultT = {
  view: "overview",
  endpointHost: "1111-us-east-2.apps.astra.datastax.com",
  database: { id: "1111", name: "prod-db", region: "us-east-2" },
  keyspaces: [
    {
      name: "default_keyspace", isDefault: true,
      collections: [
        { name: "articles", vector: { dimension: 1024, metric: "cosine", provider: "nvidia", model: "nv-embedqa-e5-v5" }, lexical: true, rerank: true, estimatedCount: 12400 },
        { name: "users", vector: null, lexical: false, rerank: false, estimatedCount: 830 },
      ],
      tables: [{ name: "reviews", columns: 5, vectorColumns: 1 }],
    },
    { name: "analytics", isDefault: false, error: "Keyspace unavailable (503)", collections: [], tables: [] },
  ],
  totals: { keyspaces: 2, collections: 2, tables: 1, documents: 13230 },
  truncated: { keyspaces: false, items: false },
};

export const collection: CollectionResultT = {
  view: "collection", keyspace: "default_keyspace", name: "articles", estimatedCount: 12400,
  vector: { dimension: 1024, metric: "cosine", provider: "nvidia", model: "nv-embedqa-e5-v5" },
  lexical: { enabled: true, analyzer: "standard" },
  rerank: { enabled: true, provider: "nvidia", model: "llama-3.2-nv-rerankqa-1b-v2" },
  indexing: { allow: null, deny: ["body"] }, defaultIdType: "uuid",
  sampleDocument: { _id: { $uuid: "0190b3a2-7c1e-7d5a-9f1a-2b3c4d5e6f70" }, title: "The quiet physics of black holes", author: "R. Moreno", year: 2024, tags: ["space", "physics"] },
  fields: [{ name: "title", type: "string", present: 1 }, { name: "author", type: "string", present: 1 }, { name: "year", type: "number", present: 1 }, { name: "tags", type: "array", present: 1 }],
};

export const table: TableResultT = {
  view: "table", keyspace: "default_keyspace", name: "reviews",
  columns: [
    { name: "product", type: "text", detail: null, primaryKey: "partition" },
    { name: "id", type: "uuid", detail: null, primaryKey: "clustering" },
    { name: "stars", type: "int", detail: null, primaryKey: null },
    { name: "body", type: "text", detail: null, primaryKey: null },
    { name: "embedding", type: "vector", detail: "1024 dims, vectorize nvidia/nv-embedqa-e5-v5", primaryKey: null },
  ],
  primaryKey: { partitionBy: ["product"], partitionSort: { id: 1 } },
  indexes: [{ name: "stars_idx", column: "stars", type: "regular", options: null }, { name: "embedding_idx", column: "embedding", type: "vector", options: { metric: "cosine" } }],
  vectorColumns: [{ name: "embedding", dimension: 1024, provider: "nvidia", model: "nv-embedqa-e5-v5" }],
  sampleRows: [{ product: "lamp", id: { $uuid: "0190b3a2-0000-7000-8000-000000000001" }, stars: 5, body: "Bright and warm." }],
};

export const explorer: ExplorerResultT = {
  view: "explorer", keyspace: "default_keyspace", name: "articles", kind: "collection", filter: { year: { $gte: 2020 } }, sort: null,
  documents: Array.from({ length: 6 }, (_, i) => ({ _id: `doc-${i}`, title: ["Black holes, explained", "A history of the transistor", "Rust in production", "Coral reefs at night", "The Byzantine calendar", "Gradient descent, visually"][i], author: ["R. Moreno", "K. Adeyemi", "L. Chen", "M. Silva", "P. Novak", "A. Sato"][i], year: 2020 + i, genre: i % 2 ? "history" : "science" })),
  displayFields: ["title", "author", "year"],
  fields: [{ name: "title", type: "string", present: 6 }, { name: "author", type: "string", present: 6 }, { name: "year", type: "number", present: 6 }, { name: "genre", type: "string", present: 6 }],
  nextPageState: "20",
};

export const similarity: SimilarityResultT = {
  view: "similarity", keyspace: "default_keyspace", name: "articles", kind: "collection", mode: "vectorize",
  query: "how do black holes evaporate", documentId: null, limit: 8,
  hits: Array.from({ length: 8 }, (_, i) => {
    const title = ["Hawking radiation, gently", "The quiet physics of black holes", "Event horizons and information", "Neutron stars at the limit", "Dark energy, measured", "Quantum fields for the curious", "Gravitational waves: a primer", "How stars die"][i];
    const similarity = [0.9121, 0.8874, 0.8612, 0.8103, 0.7788, 0.7549, 0.7311, 0.7002][i];
    return { rank: i + 1, id: `doc-${i}`, idValue: `doc-${i}`, similarity, title, fields: { title, author: "R. Moreno", year: String(2018 + i) }, document: { _id: `doc-${i}`, title, author: "R. Moreno", year: 2018 + i } };
  }),
  stats: { max: 0.9121, min: 0.7002, mean: 0.8045 }, warnings: [],
};

export const VIEWS = { overview, collection, table, explorer, similarity };
