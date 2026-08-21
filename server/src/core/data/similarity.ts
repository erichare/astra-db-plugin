import type { AstraDb, Doc, RerankedLike } from "../client.js";
import { AstraWidgetsError } from "../errors.js";
import { displayDocument, pickDisplayFields, round, snippet } from "../fields.js";
import type { SimilarityResultT } from "../schemas.js";
import { findDescriptor } from "./card.js";

export interface SimilarityInput {
  collection: string;
  keyspace?: string;
  query?: string;
  documentId?: string;
  limit?: number;
  filter?: Doc;
  hybrid?: boolean;
}

function idToString(id: unknown): string {
  if (typeof id === "string") return id;
  if (id && typeof id === "object" && "toString" in id) return String(id);
  return JSON.stringify(id);
}

function toHit(doc: Doc, rank: number, similarity: number | null, scores?: Record<string, number>) {
  const keys = pickDisplayFields(doc, 3);
  const fields: Record<string, string> = {};
  for (const key of keys) fields[key] = snippet(doc[key]);
  const title = keys.length > 0 ? snippet(doc[keys[0]], 80) : idToString(doc._id);
  return {
    rank,
    id: idToString(doc._id),
    similarity: similarity === null ? null : round(similarity, 4),
    ...(scores ? { scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, round(v, 4)])) } : {}),
    title,
    fields,
    document: displayDocument(doc),
  };
}

function stats(values: number[]) {
  if (values.length === 0) return { max: null, min: null, mean: null };
  const sum = values.reduce((a, b) => a + b, 0);
  return { max: round(Math.max(...values), 4), min: round(Math.min(...values), 4), mean: round(sum / values.length, 4) };
}

export async function similaritySearch(db: AstraDb, input: SimilarityInput): Promise<SimilarityResultT> {
  const keyspace = input.keyspace ?? db.keyspace;
  const limit = input.limit ?? 10;
  const filter = input.filter ?? {};
  if (!input.query && !input.documentId) {
    throw new AstraWidgetsError("unsupported_query", "Provide `query` (text) or `documentId`.");
  }
  const descriptor = await findDescriptor(db, input.collection, keyspace);
  const coll = db.collection(input.collection, { keyspace });
  const hasVectorize = Boolean(descriptor.definition.vector?.service);
  const hasRerank = Boolean(descriptor.definition.rerank?.enabled);

  if (input.documentId) {
    const source = await coll.findOne({ _id: input.documentId }, { projection: { $vector: 1 } });
    if (!source) {
      throw new AstraWidgetsError("document_not_found", `Document '${input.documentId}' not found in '${input.collection}'.`);
    }
    const vector = source.$vector;
    if (!Array.isArray(vector) && !(vector && typeof vector === "object")) {
      throw new AstraWidgetsError("unsupported_query", `Document '${input.documentId}' has no $vector to search with.`);
    }
    const docs = await coll
      .find({ ...filter, _id: { $ne: input.documentId } }, { sort: { $vector: vector }, limit, includeSimilarity: true, projection: { $vector: 0 } })
      .toArray();
    const hits = docs.map((d, i) => toHit(d, i + 1, typeof d.$similarity === "number" ? d.$similarity : null));
    return {
      widget: "similarity",
      keyspace,
      collection: input.collection,
      mode: "document",
      query: null,
      documentId: input.documentId,
      limit,
      hits,
      stats: stats(hits.map((h) => h.similarity).filter((s): s is number => s !== null)),
    };
  }

  const query = input.query as string;
  if (input.hybrid && hasRerank) {
    const results: RerankedLike[] = await coll
      .findAndRerank(filter, { sort: { $hybrid: query }, limit, includeScores: true, projection: { $vector: 0 } })
      .toArray();
    const hits = results.map((r, i) => {
      const sim = typeof r.scores?.$vector === "number" ? r.scores.$vector : null;
      return toHit(r.document, i + 1, sim, r.scores);
    });
    return {
      widget: "similarity",
      keyspace,
      collection: input.collection,
      mode: "hybrid",
      query,
      documentId: null,
      limit,
      hits,
      stats: stats(hits.map((h) => h.similarity).filter((s): s is number => s !== null)),
    };
  }

  if (!hasVectorize) {
    throw new AstraWidgetsError(
      "unsupported_query",
      `Collection '${input.collection}' has no vectorize service; pass documentId to search by an existing document's vector.`,
    );
  }
  const docs = await coll
    .find(filter, { sort: { $vectorize: query }, limit, includeSimilarity: true, projection: { $vector: 0 } })
    .toArray();
  const hits = docs.map((d, i) => toHit(d, i + 1, typeof d.$similarity === "number" ? d.$similarity : null));
  return {
    widget: "similarity",
    keyspace,
    collection: input.collection,
    mode: "vectorize",
    query,
    documentId: null,
    limit,
    hits,
    stats: stats(hits.map((h) => h.similarity).filter((s): s is number => s !== null)),
  };
}
