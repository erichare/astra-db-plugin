import { z } from "zod";

export const EmitSchema = z
  .enum(["structured", "html_file"])
  .default("structured")
  .describe("structured: return data for the host UI; html_file: also write a standalone HTML page and return its path");

const CollectionTarget = {
  collection: z.string().min(1).describe("Collection name"),
  keyspace: z.string().min(1).optional().describe("Keyspace (defaults to the database's default keyspace)"),
};

export const OverviewInput = z.object({
  emit: EmitSchema,
  maxCollections: z.number().int().min(1).max(100).default(25),
});

export const CollectionCardInput = z.object({
  ...CollectionTarget,
  emit: EmitSchema,
  includeSample: z.boolean().default(true),
});

export const SimilaritySearchInput = z.object({
  ...CollectionTarget,
  emit: EmitSchema,
  query: z.string().min(1).optional().describe("Natural-language query, embedded server-side via $vectorize"),
  documentId: z.string().min(1).optional().describe("Find documents similar to this document's vector"),
  limit: z.number().int().min(1).max(50).default(10),
  filter: z.record(z.string(), z.unknown()).optional().describe("Data API filter to narrow candidates"),
  hybrid: z.boolean().default(false).describe("Use findAndRerank ($hybrid) when the collection has reranking enabled"),
});

export const ExploreCollectionInput = z.object({
  ...CollectionTarget,
  emit: EmitSchema,
  filter: z.record(z.string(), z.unknown()).optional(),
  pageState: z.string().optional().describe("Opaque page state from a previous call"),
  fields: z.array(z.string()).optional().describe("Only return these top-level fields (plus _id)"),
});

export type OverviewInputT = z.infer<typeof OverviewInput>;
export type CollectionCardInputT = z.infer<typeof CollectionCardInput>;
export type SimilaritySearchInputT = z.infer<typeof SimilaritySearchInput>;
export type ExploreCollectionInputT = z.infer<typeof ExploreCollectionInput>;

// ---- structuredContent contracts (what the widgets render) ----

export const VectorInfo = z.object({
  dimension: z.number().nullable(),
  metric: z.string().nullable(),
  provider: z.string().nullable(),
  model: z.string().nullable(),
});

export const CollectionSummary = z.object({
  name: z.string(),
  vector: VectorInfo.nullable(),
  lexical: z.boolean(),
  rerank: z.boolean(),
  estimatedCount: z.number().nullable(),
});

export const OverviewResult = z.object({
  widget: z.literal("overview"),
  endpointHost: z.string(),
  keyspaces: z.array(
    z.object({
      name: z.string(),
      isDefault: z.boolean(),
      collections: z.array(CollectionSummary),
      tables: z.array(z.string()),
    }),
  ),
  totals: z.object({ keyspaces: z.number(), collections: z.number(), tables: z.number(), documents: z.number().nullable() }),
  truncated: z.boolean(),
  htmlPath: z.string().optional(),
});

export const CollectionCardResult = z.object({
  widget: z.literal("collection-card"),
  keyspace: z.string(),
  name: z.string(),
  estimatedCount: z.number().nullable(),
  vector: VectorInfo.nullable(),
  lexical: z.object({ enabled: z.boolean(), analyzer: z.unknown().optional() }),
  rerank: z.object({ enabled: z.boolean(), provider: z.string().nullable(), model: z.string().nullable() }),
  indexing: z.object({ allow: z.array(z.string()).nullable(), deny: z.array(z.string()).nullable() }),
  defaultIdType: z.string().nullable(),
  sampleDocument: z.record(z.string(), z.unknown()).nullable(),
  fields: z.array(z.object({ name: z.string(), type: z.string(), present: z.number() })),
  htmlPath: z.string().optional(),
});

export const SimilarityHit = z.object({
  rank: z.number(),
  id: z.string(),
  similarity: z.number().nullable(),
  scores: z.record(z.string(), z.number()).optional(),
  title: z.string(),
  fields: z.record(z.string(), z.string()),
  document: z.record(z.string(), z.unknown()),
});

export const SimilarityResult = z.object({
  widget: z.literal("similarity"),
  keyspace: z.string(),
  collection: z.string(),
  mode: z.enum(["vectorize", "document", "hybrid"]),
  query: z.string().nullable(),
  documentId: z.string().nullable(),
  limit: z.number(),
  hits: z.array(SimilarityHit),
  stats: z.object({ max: z.number().nullable(), min: z.number().nullable(), mean: z.number().nullable() }),
  htmlPath: z.string().optional(),
});

export const ExploreResult = z.object({
  widget: z.literal("explorer"),
  keyspace: z.string(),
  collection: z.string(),
  filter: z.record(z.string(), z.unknown()).nullable(),
  documents: z.array(z.record(z.string(), z.unknown())),
  displayFields: z.array(z.string()),
  fields: z.array(z.object({ name: z.string(), type: z.string(), present: z.number() })),
  nextPageState: z.string().nullable(),
  htmlPath: z.string().optional(),
});

export type OverviewResultT = z.infer<typeof OverviewResult>;
export type CollectionCardResultT = z.infer<typeof CollectionCardResult>;
export type SimilarityResultT = z.infer<typeof SimilarityResult>;
export type ExploreResultT = z.infer<typeof ExploreResult>;
export type WidgetResult = OverviewResultT | CollectionCardResultT | SimilarityResultT | ExploreResultT;
export type WidgetName = WidgetResult["widget"];
