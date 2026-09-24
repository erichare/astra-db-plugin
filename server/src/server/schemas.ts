/**
 * Tool input and output schemas. Every output is a single z.object with a
 * `view` discriminator the app shell renders from.
 */
import { z } from "zod";

// ---------------------------------------------------------------- shared inputs

export const Target = {
  database: z.string().min(1).optional().describe(
    "Database to use: name, id, or Data API endpoint URL. Omit for the configured default.",
  ),
  keyspace: z.string().min(1).optional().describe("Keyspace. Omit for the configured/default keyspace."),
};

export const Kind = z.enum(["collection", "table"]).optional().describe(
  "Only needed when a collection and a table share the name; otherwise detected.",
);

export const Filter = z.record(z.string(), z.unknown()).describe(
  'Data API filter, e.g. {"status": "active", "year": {"$gte": 2020}}. Typed ids as {"$uuid": "…"} / {"$objectId": "…"}.',
);

export const Emit = z.enum(["structured", "html_file"]).default("structured").describe(
  "html_file also writes a self-contained HTML page and returns a link to it — only for terminal-only hosts, when the user asks for a visual.",
);

// ---------------------------------------------------------------- tool inputs

export const ConnectionStatusInput = z.object({
  check: z.boolean().default(true).describe("Make a live request to verify the connection (default true)."),
});

export const ListDatabasesInput = z.object({
  include: z.enum(["active", "all"]).default("active").describe("active (default) or all non-terminated databases."),
});

export const OverviewInput = z.object({
  database: Target.database,
  keyspaces: z.array(z.string().min(1)).max(50).optional().describe("Only these keyspaces (default: all)."),
  maxPerKeyspace: z.number().int().min(1).max(200).default(50).describe("Max collections/tables listed per keyspace."),
  includeCounts: z.boolean().default(true).describe("Estimated document counts per collection (one request each)."),
});

export const DescribeCollectionInput = z.object({
  ...Target,
  collection: z.string().min(1).describe("Collection name."),
  includeSample: z.boolean().default(true).describe("Include one sample document (vectors omitted)."),
});

export const DescribeTableInput = z.object({
  ...Target,
  table: z.string().min(1).describe("Table name."),
  includeSample: z.boolean().default(true).describe("Include up to 3 sample rows (vectors omitted)."),
});

export const FindInput = z.object({
  ...Target,
  name: z.string().min(1).describe("Collection or table name."),
  kind: Kind,
  filter: Filter.optional(),
  sort: z.record(z.string(), z.union([z.literal(1), z.literal(-1)])).optional().describe(
    'Non-vector sort, e.g. {"createdAt": -1}. For similarity use vector_search.',
  ),
  projection: z.record(z.string(), z.union([z.literal(0), z.literal(1), z.boolean()])).optional().describe(
    'Fields to include (1) or exclude (0), e.g. {"title": 1, "author": 1}.',
  ),
  limit: z.number().int().min(1).max(100).default(20).describe("Documents to return (rounded up to whole pages of 20)."),
  pageState: z.string().optional().describe("nextPageState from a previous call, to continue paging."),
});

export const VectorSearchInput = z.object({
  ...Target,
  name: z.string().min(1).describe("Collection or table name."),
  kind: Kind,
  query: z.string().min(1).optional().describe("Natural-language text; embedded server-side (vectorize)."),
  vector: z.array(z.number()).min(2).optional().describe("A query embedding (must match the dimension)."),
  documentId: z.union([z.string().min(1), z.record(z.string(), z.unknown())]).optional().describe(
    "Find items similar to this existing document (collections).",
  ),
  idType: z.enum(["auto", "string", "uuid", "objectId"]).default("auto").describe("How to interpret documentId (auto follows the collection's defaultId)."),
  vectorColumn: z.string().optional().describe("Tables only: which vector column to search (default: the only one)."),
  hybrid: z.boolean().default(false).describe("Collections with lexical + rerank: combined vector + BM25 search, reranked."),
  filter: Filter.optional(),
  projection: FindInput.shape.projection,
  limit: z.number().int().min(1).max(100).default(10).describe("How many hits."),
});

export const CountInput = z.object({
  ...Target,
  name: z.string().min(1).describe("Collection name."),
  filter: Filter.optional(),
  upperBound: z.number().int().min(1).max(1000).default(1000).describe("Stop counting at this many (Data API maximum 1000)."),
});

export const DistinctInput = z.object({
  ...Target,
  name: z.string().min(1).describe("Collection or table name."),
  kind: Kind,
  field: z.string().min(1).describe("Field path, e.g. \"genre\" or \"author.country\"."),
  filter: Filter.optional(),
  scanLimit: z.number().int().min(1).max(10000).default(1000).describe("Max documents scanned."),
  maxValues: z.number().int().min(1).max(1000).default(100).describe("Max distinct values returned."),
});

export const ProvidersInput = z.object({
  database: Target.database,
  kind: z.enum(["embedding", "reranking", "both"]).default("both"),
});

export const CodeExamplesInput = z.object({
  language: z.enum(["python", "typescript", "java", "csharp", "go"]).describe("Client language."),
  query: z.string().min(1).describe('What the code should do, e.g. "create a vector collection with vectorize", "find with filter and sort".'),
  limit: z.number().int().min(1).max(10).default(3),
  mode: z.enum(["content", "list"]).default("content").describe("content: include source; list: file names only."),
});

const Confirm = z.string().optional().describe(
  "Set ONLY after the user explicitly approved this destructive operation in the conversation: the exact target name. Never guess or self-approve.",
);

export const InsertInput = z.object({
  ...Target,
  name: z.string().min(1).describe("Collection or table name."),
  kind: Kind,
  documents: z.array(z.record(z.string(), z.unknown())).min(1).max(1000).describe(
    'Documents (collections) or rows (tables). Use "$vectorize": "text" for server-side embeddings on vectorize collections.',
  ),
  ordered: z.boolean().default(false).describe("Stop at the first error (default: insert what can be inserted)."),
});

export const UpdateInput = z.object({
  ...Target,
  name: z.string().min(1).describe("Collection or table name."),
  kind: Kind,
  filter: Filter,
  update: z.record(z.string(), z.unknown()).describe('Update operators, e.g. {"$set": {"status": "done"}, "$inc": {"views": 1}}.'),
  many: z.boolean().default(false).describe("Update every match (collections only). Requires confirmation."),
  upsert: z.boolean().default(false).describe("Insert when nothing matches (collections)."),
  confirm: Confirm,
});

export const DeleteInput = z.object({
  ...Target,
  name: z.string().min(1).describe("Collection or table name."),
  kind: Kind,
  filter: Filter,
  many: z.boolean().default(false).describe("Delete every match. Requires confirmation."),
  confirm: Confirm,
});

export const CreateCollectionInput = z.object({
  ...Target,
  name: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,47}$/).describe("New collection name (letters, digits, underscore)."),
  vector: z.object({
    dimension: z.number().int().min(2).max(8192).optional().describe("Required unless a vectorize service sets it."),
    metric: z.enum(["cosine", "dot_product", "euclidean"]).default("cosine"),
    service: z.object({
      provider: z.string().describe('Vectorize provider, e.g. "nvidia", "openai" (see list_vectorize_providers).'),
      modelName: z.string(),
      authentication: z.record(z.string(), z.string()).optional().describe('e.g. {"providerKey": "<key name in Astra>"}'),
      parameters: z.record(z.string(), z.unknown()).optional(),
    }).optional(),
  }).optional().describe("Omit for a non-vector collection."),
  lexical: z.boolean().optional().describe("Enable BM25 lexical search (needed for hybrid)."),
  rerank: z.object({ provider: z.string(), modelName: z.string() }).optional().describe("Reranking service (needed for hybrid)."),
  indexing: z.object({ allow: z.array(z.string()).optional(), deny: z.array(z.string()).optional() }).optional().describe(
    "Index only (allow) or all but (deny) these fields. Deny large text fields you never filter on.",
  ),
  defaultId: z.enum(["objectId", "uuid", "uuidv6", "uuidv7"]).optional().describe("Auto-generated _id type."),
});

export const CreateTableInput = z.object({
  ...Target,
  name: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,47}$/).describe("New table name."),
  columns: z.record(z.string(), z.union([z.string(), z.record(z.string(), z.unknown())])).describe(
    'Column types, e.g. {"id": "uuid", "title": "text", "tags": {"type": "set", "valueType": "text"}, "embedding": {"type": "vector", "dimension": 1024}}.',
  ),
  primaryKey: z.union([
    z.string(),
    z.object({ partitionBy: z.array(z.string()).min(1), partitionSort: z.record(z.string(), z.union([z.literal(1), z.literal(-1)])).optional() }),
  ]).describe('A column name, or {"partitionBy": ["user_id"], "partitionSort": {"created_at": -1}}.'),
  ifNotExists: z.boolean().default(true),
});

export const CreateIndexInput = z.object({
  ...Target,
  table: z.string().min(1).describe("Table name (collections index automatically; use indexing on create_collection)."),
  name: z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,47}$/).describe("Index name."),
  column: z.string().min(1).describe("Column to index."),
  type: z.enum(["regular", "vector", "text"]).default("regular").describe("regular (filtering), vector (similarity), text (BM25)."),
  options: z.record(z.string(), z.unknown()).optional().describe('e.g. {"metric": "dot_product"} for vector, {"caseSensitive": false} for regular.'),
  ifNotExists: z.boolean().default(true),
});

export const DropInput = z.object({
  ...Target,
  kind: z.enum(["collection", "table", "index"]).describe("What to drop."),
  name: z.string().min(1).describe("Name of the collection, table, or table index."),
  confirm: Confirm,
});

// ---------------------------------------------------------------- tool outputs

const Nullable = <T extends z.ZodType>(schema: T) => schema.nullable();
const Document = z.record(z.string(), z.unknown());
const FieldSummary = z.object({ name: z.string(), type: z.string(), present: z.number() });
const Sourced = z.object({ source: z.string(), detail: z.string() });
const DatabaseRef = z.object({ id: z.string().optional(), name: z.string().optional(), region: z.string().optional() });

export const VectorInfo = z.object({
  dimension: z.number().nullable(),
  metric: z.string().nullable(),
  provider: z.string().nullable(),
  model: z.string().nullable(),
});

export const StatusResult = z.object({
  view: z.literal("status"),
  configured: z.boolean(),
  readOnly: z.boolean(),
  environment: z.string(),
  token: Nullable(Sourced.extend({ masked: z.string() })),
  endpoint: Nullable(Sourced.extend({ host: z.string() })),
  keyspace: Nullable(Sourced.extend({ value: z.string() })),
  database: Nullable(DatabaseRef),
  checks: z.object({
    dataApi: z.object({ ok: z.boolean(), message: z.string().optional(), collections: z.number().optional(), tables: z.number().optional() }).optional(),
  }),
  hints: z.array(z.string()),
  consulted: z.array(z.string()),
});

export const DatabasesResult = z.object({
  view: z.literal("databases"),
  databases: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    cloudProvider: z.string().nullable(),
    regions: z.array(z.object({ name: z.string(), apiEndpoint: z.string() })),
    keyspaces: z.array(z.string()),
    current: z.boolean(),
  })),
});

export const OverviewResult = z.object({
  view: z.literal("overview"),
  endpointHost: z.string(),
  database: DatabaseRef,
  keyspaces: z.array(z.object({
    name: z.string(),
    isDefault: z.boolean(),
    error: z.string().optional(),
    collections: z.array(z.object({
      name: z.string(),
      vector: VectorInfo.nullable(),
      lexical: z.boolean(),
      rerank: z.boolean(),
      estimatedCount: z.number().nullable(),
    })),
    tables: z.array(z.object({ name: z.string(), columns: z.number(), vectorColumns: z.number() })),
  })),
  totals: z.object({ keyspaces: z.number(), collections: z.number(), tables: z.number(), documents: z.number().nullable() }),
  truncated: z.object({ keyspaces: z.boolean(), items: z.boolean() }),
});

export const CollectionResult = z.object({
  view: z.literal("collection"),
  keyspace: z.string(),
  name: z.string(),
  estimatedCount: z.number().nullable(),
  vector: VectorInfo.nullable(),
  lexical: z.object({ enabled: z.boolean(), analyzer: z.unknown().optional() }),
  rerank: z.object({ enabled: z.boolean(), provider: z.string().nullable(), model: z.string().nullable() }),
  indexing: z.object({ allow: z.array(z.string()).nullable(), deny: z.array(z.string()).nullable() }),
  defaultIdType: z.string().nullable(),
  sampleDocument: Document.nullable(),
  fields: z.array(FieldSummary),
});

export const TableResult = z.object({
  view: z.literal("table"),
  keyspace: z.string(),
  name: z.string(),
  columns: z.array(z.object({
    name: z.string(),
    type: z.string(),
    detail: z.string().nullable(),
    primaryKey: z.enum(["partition", "clustering"]).nullable(),
  })),
  primaryKey: z.object({ partitionBy: z.array(z.string()), partitionSort: z.record(z.string(), z.number()) }),
  indexes: z.array(z.object({ name: z.string(), column: z.string(), type: z.string(), options: Document.nullable() })),
  vectorColumns: z.array(z.object({ name: z.string(), dimension: z.number().nullable(), provider: z.string().nullable(), model: z.string().nullable() })),
  sampleRows: z.array(Document),
});

export const ExplorerResult = z.object({
  view: z.literal("explorer"),
  keyspace: z.string(),
  name: z.string(),
  kind: z.enum(["collection", "table"]),
  filter: Document.nullable(),
  sort: Document.nullable(),
  documents: z.array(Document),
  displayFields: z.array(z.string()),
  fields: z.array(FieldSummary),
  nextPageState: z.string().nullable(),
});

export const SimilarityHit = z.object({
  rank: z.number(),
  id: z.string(),
  idValue: z.unknown(),
  similarity: z.number().nullable(),
  scores: z.record(z.string(), z.number()).optional(),
  title: z.string(),
  fields: z.record(z.string(), z.string()),
  document: Document,
});

export const SimilarityResult = z.object({
  view: z.literal("similarity"),
  keyspace: z.string(),
  name: z.string(),
  kind: z.enum(["collection", "table"]),
  mode: z.enum(["vectorize", "vector", "document", "hybrid"]),
  query: z.string().nullable(),
  documentId: z.string().nullable(),
  limit: z.number(),
  hits: z.array(SimilarityHit),
  stats: z.object({ max: z.number().nullable(), min: z.number().nullable(), mean: z.number().nullable() }),
  warnings: z.array(z.string()),
});

export const CountResult = z.object({
  view: z.literal("count"),
  keyspace: z.string(),
  name: z.string(),
  filter: Document.nullable(),
  count: z.number(),
  exceedsUpperBound: z.boolean(),
  upperBound: z.number(),
  estimatedTotal: z.number().nullable(),
});

export const DistinctResult = z.object({
  view: z.literal("distinct"),
  keyspace: z.string(),
  name: z.string(),
  field: z.string(),
  values: z.array(z.unknown()),
  scanned: z.number(),
  complete: z.boolean(),
});

export const ProvidersResult = z.object({
  view: z.literal("providers"),
  embedding: z.array(z.object({
    provider: z.string(),
    displayName: z.string().nullable(),
    authentication: z.array(z.string()),
    models: z.array(z.object({ name: z.string(), dimension: z.number().nullable() })),
  })),
  reranking: z.array(z.object({
    provider: z.string(),
    displayName: z.string().nullable(),
    models: z.array(z.object({ name: z.string(), isDefault: z.boolean() })),
  })),
});

export const ExamplesResult = z.object({
  view: z.literal("examples"),
  language: z.string(),
  query: z.string(),
  results: z.array(z.object({
    file: z.string(),
    operation: z.string(),
    score: z.number(),
    content: z.string().optional(),
  })),
  indexFile: z.string(),
});

export const MutationResult = z.object({
  view: z.literal("mutation"),
  operation: z.string(),
  status: z.enum(["ok", "cancelled"]),
  keyspace: z.string(),
  name: z.string(),
  kind: z.string(),
  message: z.string(),
  insertedCount: z.number().optional(),
  insertedIds: z.array(z.unknown()).optional(),
  matchedCount: z.number().optional(),
  modifiedCount: z.number().optional(),
  upsertedId: z.unknown().optional(),
  deletedCount: z.number().optional(),
  failures: z.array(z.object({ index: z.number().optional(), message: z.string() })).optional(),
});

export type StatusResultT = z.infer<typeof StatusResult>;
export type DatabasesResultT = z.infer<typeof DatabasesResult>;
export type OverviewResultT = z.infer<typeof OverviewResult>;
export type CollectionResultT = z.infer<typeof CollectionResult>;
export type TableResultT = z.infer<typeof TableResult>;
export type ExplorerResultT = z.infer<typeof ExplorerResult>;
export type SimilarityResultT = z.infer<typeof SimilarityResult>;
export type CountResultT = z.infer<typeof CountResult>;
export type DistinctResultT = z.infer<typeof DistinctResult>;
export type ProvidersResultT = z.infer<typeof ProvidersResult>;
export type ExamplesResultT = z.infer<typeof ExamplesResult>;
export type MutationResultT = z.infer<typeof MutationResult>;

/** The views the app shell renders. */
export type AppView = OverviewResultT | CollectionResultT | TableResultT | ExplorerResultT | SimilarityResultT;
export type AppViewName = AppView["view"];
