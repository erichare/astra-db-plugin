/** Read queries: find (paged), vector_search, count, distinct_values, vectorize providers. */
import type {
  CountResultT, DistinctResultT, ExplorerResultT, ProvidersResultT, SimilarityResultT,
} from "../../server/schemas.js";
import type { AstraConnections, Target } from "../connection.js";
import { AstraMcpError } from "../errors.js";
import { displayDocument, pickDisplayFields, round, snippet, summarizeFields } from "../fields.js";
import type { Doc, RerankedLike } from "../gateway.js";
import { type IdType, alternativeIds, coerceId, idToString } from "../ids.js";
import { fromJson, toJsonSafe } from "../serialize.js";
import { tableShape } from "./inspect.js";

const safeDoc = (doc: Doc) => displayDocument(toJsonSafe(doc) as Doc);
const nonEmpty = (value: Doc | undefined) => (value && Object.keys(value).length > 0 ? value : null);

// ------------------------------------------------------------------ find

export interface FindArgs {
  name: string;
  kind?: "collection" | "table";
  filter?: Doc;
  sort?: Doc;
  projection?: Doc;
  limit: number;
  pageState?: string;
}

export async function find(connections: AstraConnections, target: Target, args: FindArgs): Promise<ExplorerResultT> {
  const resolved = await connections.resolveKind(target, args.name, args.kind);
  const filter = (fromJson(args.filter ?? {}) as Doc);
  const vectorColumns = resolved.kind === "table" ? tableShape(resolved.descriptor).vectorColumns.map((c) => c.name) : ["$vector"];
  const projection = args.projection && Object.keys(args.projection).length
    ? args.projection
    : Object.fromEntries(vectorColumns.map((c) => [c, 0]));
  const source = resolved.kind === "collection"
    ? target.db.collection(args.name, { keyspace: target.keyspace })
    : target.db.table(args.name, { keyspace: target.keyspace });
  const options: Doc = { projection, ...(args.sort && Object.keys(args.sort).length ? { sort: args.sort } : {}) };

  const documents: Doc[] = [];
  let pageState: string | null | undefined = args.pageState;
  do {
    let cursor = source.find(filter, options);
    if (pageState) cursor = cursor.initialPageState(pageState);
    const page = await cursor.fetchNextPage();
    documents.push(...page.result.map(safeDoc));
    pageState = page.nextPageState ?? null;
  } while (pageState && documents.length < args.limit);

  const displayFields = pickDisplayFields(documents[0] ?? {}, 4);
  return {
    view: "explorer",
    keyspace: target.keyspace,
    name: args.name,
    kind: resolved.kind,
    filter: nonEmpty(args.filter),
    sort: nonEmpty(args.sort),
    documents,
    displayFields,
    fields: summarizeFields(documents),
    nextPageState: pageState ?? null,
  };
}

// ------------------------------------------------------------------ vector_search

export interface VectorSearchArgs {
  name: string;
  kind?: "collection" | "table";
  query?: string;
  vector?: number[];
  documentId?: string | Doc;
  idType: IdType;
  vectorColumn?: string;
  hybrid: boolean;
  filter?: Doc;
  projection?: Doc;
  limit: number;
}

function primaryKeyId(row: Doc, keys: string[]): { id: string; idValue: unknown } {
  if (keys.length === 0) return { id: "", idValue: null };
  const idValue = Object.fromEntries(keys.map((k) => [k, toJsonSafe(row[k])]));
  const id = keys.map((k) => idToString(row[k])).join(" · ");
  return { id, idValue };
}

function toHit(doc: Doc, rank: number, similarity: number | null, idKeys: string[] | null, scores?: Record<string, number>) {
  const { $similarity: _score, ...rest } = doc;
  const safe = safeDoc(rest);
  const keys = pickDisplayFields(safe, 3);
  const fields: Record<string, string> = {};
  for (const key of keys) fields[key] = snippet(safe[key]);
  const { id, idValue } = idKeys ? primaryKeyId(doc, idKeys) : { id: idToString(doc._id), idValue: toJsonSafe(doc._id) };
  return {
    rank,
    id,
    idValue,
    similarity: similarity === null ? null : round(similarity, 4),
    ...(scores ? { scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, round(v, 4)])) } : {}),
    title: keys.length > 0 ? snippet(safe[keys[0]], 80) : id,
    fields,
    document: safe,
  };
}

function stats(values: number[]) {
  if (values.length === 0) return { max: null, min: null, mean: null };
  const sum = values.reduce((a, b) => a + b, 0);
  return { max: round(Math.max(...values), 4), min: round(Math.min(...values), 4), mean: round(sum / values.length, 4) };
}

export async function vectorSearch(connections: AstraConnections, target: Target, args: VectorSearchArgs): Promise<SimilarityResultT> {
  const modes = [args.query !== undefined, args.vector !== undefined, args.documentId !== undefined].filter(Boolean).length;
  if (modes !== 1) {
    throw new AstraMcpError("invalid_argument", "Provide exactly one of `query` (text), `vector`, or `documentId`.");
  }
  const resolved = await connections.resolveKind(target, args.name, args.kind);
  const filter = fromJson(args.filter ?? {}) as Doc;
  const warnings: string[] = [];
  const base = {
    view: "similarity" as const,
    keyspace: target.keyspace,
    name: args.name,
    kind: resolved.kind,
    query: args.query ?? null,
    documentId: args.documentId === undefined ? null : idToString(args.documentId),
    limit: args.limit,
    warnings,
  };

  if (resolved.kind === "table") {
    const shape = tableShape(resolved.descriptor);
    if (args.documentId !== undefined || args.hybrid) {
      throw new AstraMcpError("unsupported_query", "Tables support vector_search by `query` (vectorize column) or `vector` only.");
    }
    const column = args.vectorColumn
      ? shape.vectorColumns.find((c) => c.name === args.vectorColumn)
      : shape.vectorColumns.length === 1 ? shape.vectorColumns[0] : undefined;
    if (!column) {
      throw new AstraMcpError("invalid_argument", shape.vectorColumns.length
        ? `Pick a vector column with \`vectorColumn\`: ${shape.vectorColumns.map((c) => c.name).join(", ")}.`
        : `Table '${args.name}' has no vector column.`);
    }
    if (args.query !== undefined && !column.provider) {
      throw new AstraMcpError("unsupported_query", `Column '${column.name}' has no vectorize service; pass \`vector\` instead of \`query\`.`);
    }
    const projection = args.projection ?? Object.fromEntries(shape.vectorColumns.map((c) => [c.name, 0]));
    const rows = await target.db.table(args.name, { keyspace: target.keyspace })
      .find(filter, { sort: { [column.name]: args.query ?? args.vector }, limit: args.limit, includeSimilarity: true, projection })
      .toArray();
    const hits = rows.map((r, i) => toHit(r, i + 1, typeof r.$similarity === "number" ? r.$similarity : null, shape.primaryKey.partitionBy.concat(Object.keys(shape.primaryKey.partitionSort))));
    return { ...base, mode: args.query !== undefined ? "vectorize" : "vector", hits, stats: stats(hits.flatMap((h) => h.similarity ?? [])) };
  }

  const def = resolved.descriptor.definition;
  const coll = target.db.collection(args.name, { keyspace: target.keyspace });
  const projection = args.projection ?? { $vector: 0 };
  if (!def.vector) throw new AstraMcpError("unsupported_query", `Collection '${args.name}' is not a vector collection.`);

  if (args.documentId !== undefined) {
    const primary = coerceId(args.documentId, args.idType, def.defaultId?.type);
    let source = await coll.findOne({ _id: primary }, { projection: { $vector: 1 } });
    for (const alt of source ? [] : alternativeIds(args.documentId)) {
      source = await coll.findOne({ _id: alt }, { projection: { $vector: 1 } });
      if (source) break;
    }
    if (!source) throw new AstraMcpError("not_found", `Document ${idToString(args.documentId)} not found in '${args.name}'.`, {
      hint: "Pass the _id exactly as find returns it (typed ids as {\"$uuid\": \"…\"} or {\"$objectId\": \"…\"}).",
    });
    const vector = source.$vector;
    if (!vector) throw new AstraMcpError("unsupported_query", `Document ${idToString(args.documentId)} has no $vector.`);
    const docs = await coll
      .find({ ...filter, _id: { $ne: source._id } }, { sort: { $vector: vector }, limit: args.limit, includeSimilarity: true, projection })
      .toArray();
    const hits = docs.map((d, i) => toHit(d, i + 1, typeof d.$similarity === "number" ? d.$similarity : null, null));
    return { ...base, mode: "document", hits, stats: stats(hits.flatMap((h) => h.similarity ?? [])) };
  }

  if (args.hybrid) {
    if (!def.rerank?.enabled || !def.lexical?.enabled) {
      throw new AstraMcpError("unsupported_query", `Collection '${args.name}' has no ${def.rerank?.enabled ? "lexical index" : "reranker"}, so hybrid search is unavailable.`, {
        hint: "Retry without `hybrid`, or create a collection with lexical and rerank enabled (hybrid search is in public preview).",
      });
    }
    if (args.query === undefined) throw new AstraMcpError("invalid_argument", "Hybrid search needs `query` text.");
    const sort = def.vector.service ? { $hybrid: args.query } : { $hybrid: { $lexical: args.query } };
    if (!def.vector.service) warnings.push("No vectorize service: hybrid used the lexical leg only.");
    const results: RerankedLike[] = await coll.findAndRerank(filter, { sort, limit: args.limit, includeScores: true, projection }).toArray();
    const hits = results.map((r, i) => {
      const sim = typeof r.scores?.$vector === "number" ? r.scores.$vector : null;
      return toHit(r.document, i + 1, sim, null, r.scores);
    });
    return { ...base, mode: "hybrid", hits, stats: stats(hits.flatMap((h) => h.similarity ?? [])) };
  }

  if (args.query !== undefined && !def.vector.service) {
    throw new AstraMcpError("unsupported_query", `Collection '${args.name}' has no vectorize service, so text queries can't be embedded server-side.`, {
      hint: "Pass `vector` (an embedding of the right dimension) or `documentId` to search by an existing document.",
    });
  }
  const sort = args.query !== undefined ? { $vectorize: args.query } : { $vector: args.vector };
  const docs = await coll.find(filter, { sort, limit: args.limit, includeSimilarity: true, projection }).toArray();
  const hits = docs.map((d, i) => toHit(d, i + 1, typeof d.$similarity === "number" ? d.$similarity : null, null));
  return { ...base, mode: args.query !== undefined ? "vectorize" : "vector", hits, stats: stats(hits.flatMap((h) => h.similarity ?? [])) };
}

// ------------------------------------------------------------------ count

export async function count(
  connections: AstraConnections,
  target: Target,
  args: { name: string; filter?: Doc; upperBound: number },
): Promise<CountResultT> {
  const resolved = await connections.resolveKind(target, args.name);
  if (resolved.kind === "table") {
    throw new AstraMcpError("unsupported_operation", "Tables have no count operation in the Data API.", {
      hint: "Use find with a projection and page through, or keep a counter.",
    });
  }
  const coll = target.db.collection(args.name, { keyspace: target.keyspace });
  const filter = fromJson(args.filter ?? {}) as Doc;
  let value: number;
  let exceeds = false;
  try {
    value = await coll.countDocuments(filter, args.upperBound);
  } catch (err) {
    if ((err as { name?: string }).name !== "TooManyDocumentsToCountError") throw err;
    value = args.upperBound;
    exceeds = true;
  }
  const estimatedTotal = Object.keys(filter).length === 0 ? await coll.estimatedDocumentCount().catch(() => null) : null;
  return {
    view: "count",
    keyspace: target.keyspace,
    name: args.name,
    filter: nonEmpty(args.filter),
    count: value,
    exceedsUpperBound: exceeds,
    upperBound: args.upperBound,
    estimatedTotal: typeof estimatedTotal === "number" ? estimatedTotal : null,
  };
}

// ------------------------------------------------------------------ distinct_values

function valuesAt(doc: unknown, path: string[]): unknown[] {
  if (path.length === 0) return Array.isArray(doc) ? doc : [doc];
  if (Array.isArray(doc)) return doc.flatMap((item) => valuesAt(item, path));
  if (doc && typeof doc === "object") return valuesAt((doc as Doc)[path[0]], path.slice(1));
  return [];
}

export async function distinctValues(
  connections: AstraConnections,
  target: Target,
  args: { name: string; kind?: "collection" | "table"; field: string; filter?: Doc; scanLimit: number; maxValues: number },
): Promise<DistinctResultT> {
  const resolved = await connections.resolveKind(target, args.name, args.kind);
  const source = resolved.kind === "collection"
    ? target.db.collection(args.name, { keyspace: target.keyspace })
    : target.db.table(args.name, { keyspace: target.keyspace });
  const root = args.field.split(".")[0];
  const cursor = source.find(fromJson(args.filter ?? {}) as Doc, { projection: { [root]: 1 }, limit: args.scanLimit });
  const docs = await cursor.toArray();
  const seen = new Map<string, unknown>();
  for (const doc of docs) {
    for (const value of valuesAt(toJsonSafe(doc), args.field.split("."))) {
      if (value === undefined) continue;
      const key = JSON.stringify(value);
      if (!seen.has(key)) seen.set(key, value);
      if (seen.size >= args.maxValues) break;
    }
    if (seen.size >= args.maxValues) break;
  }
  return {
    view: "distinct",
    keyspace: target.keyspace,
    name: args.name,
    field: args.field,
    values: [...seen.values()],
    scanned: docs.length,
    complete: docs.length < args.scanLimit && seen.size < args.maxValues,
  };
}

// ------------------------------------------------------------------ list_vectorize_providers

export async function vectorizeProviders(target: Target, kind: "embedding" | "reranking" | "both"): Promise<ProvidersResultT> {
  const admin = target.db.admin();
  const [embedding, reranking] = await Promise.all([
    kind === "reranking" ? Promise.resolve({ embeddingProviders: {} }) : admin.findEmbeddingProviders(),
    kind === "embedding" ? Promise.resolve({ rerankingProviders: {} }) : admin.findRerankingProviders().catch(() => ({ rerankingProviders: {} })),
  ]);
  return {
    view: "providers",
    embedding: Object.entries(embedding.embeddingProviders ?? {}).map(([provider, info]) => {
      const p = info as { displayName?: string; supportedAuthentication?: Record<string, { enabled?: boolean }>; models?: { name: string; vectorDimension?: number | null }[] };
      return {
        provider,
        displayName: p.displayName ?? null,
        authentication: Object.entries(p.supportedAuthentication ?? {}).filter(([, a]) => a?.enabled !== false).map(([name]) => name),
        models: (p.models ?? []).map((m) => ({ name: m.name, dimension: typeof m.vectorDimension === "number" ? m.vectorDimension : null })),
      };
    }),
    reranking: Object.entries(reranking.rerankingProviders ?? {}).map(([provider, info]) => {
      const p = info as { displayName?: string; models?: { name: string; isDefault?: boolean }[] };
      return {
        provider,
        displayName: p.displayName ?? null,
        models: (p.models ?? []).map((m) => ({ name: m.name, isDefault: Boolean(m.isDefault) })),
      };
    }),
  };
}
