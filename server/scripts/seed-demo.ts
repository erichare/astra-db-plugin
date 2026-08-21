#!/usr/bin/env tsx
// Seed the astra_plugin_demo collection (vectorize + lexical + rerank) with ~50 articles so the
// widgets have realistic data. Idempotent: re-running replaces the documents by _id.
//   ASTRA_DB_APPLICATION_TOKEN=... ASTRA_DB_API_ENDPOINT=... npm run seed
import { DataAPIClient } from "@datastax/astra-db-ts";

const COLLECTION = process.env.ASTRA_DEMO_COLLECTION ?? "astra_plugin_demo";
const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
const endpoint = process.env.ASTRA_DB_API_ENDPOINT;
if (!token || !endpoint) {
  console.error("Set ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_API_ENDPOINT first.");
  process.exit(1);
}

const TOPICS: Array<[string, string, string[]]> = [
  ["guide", "Vector search fundamentals", ["vectors", "search"]],
  ["guide", "Choosing a similarity metric", ["cosine", "dot product", "euclidean"]],
  ["guide", "Hybrid search with reranking", ["lexical", "rerank", "hybrid"]],
  ["guide", "Designing collections for RAG", ["rag", "chunking", "embeddings"]],
  ["guide", "Server-side embeddings with vectorize", ["vectorize", "embeddings"]],
  ["reference", "Data API filters and operators", ["filters", "$in", "$gt"]],
  ["reference", "Projections and field selection", ["projection", "fields"]],
  ["reference", "Pagination with page states", ["paging", "cursor"]],
  ["reference", "Collections versus tables", ["modeling", "tables"]],
  ["reference", "Default id types explained", ["uuid", "objectid"]],
  ["howto", "Load a CSV into a collection", ["import", "csv"]],
  ["howto", "Bulk insert with insertMany", ["insertMany", "bulk"]],
  ["howto", "Deduplicate documents before indexing", ["dedup", "quality"]],
  ["howto", "Rotate an application token safely", ["security", "tokens"]],
  ["howto", "Estimate document counts cheaply", ["count", "estimate"]],
  ["story", "How a retailer built semantic product search", ["retail", "search"]],
  ["story", "Support knowledge base with hybrid retrieval", ["support", "hybrid"]],
  ["story", "Legal document discovery at scale", ["legal", "discovery"]],
  ["story", "Personalized recommendations for a streaming app", ["recommendations", "media"]],
  ["story", "Fraud pattern detection with vector neighbors", ["fraud", "neighbors"]],
  ["ops", "Monitoring Data API latency", ["latency", "observability"]],
  ["ops", "Capacity planning for vector workloads", ["capacity", "planning"]],
  ["ops", "Backups and point-in-time restore", ["backup", "restore"]],
  ["ops", "Multi-region deployments", ["regions", "availability"]],
  ["ops", "Cost controls for serverless databases", ["cost", "serverless"]],
];

function article(i: number): Record<string, unknown> {
  const [category, title, tags] = TOPICS[i % TOPICS.length];
  const variant = Math.floor(i / TOPICS.length);
  const suffix = variant === 0 ? "" : variant === 1 ? " — part two" : ` — edition ${variant + 1}`;
  const body = `${title}${suffix}. ${tags.join(", ")}: a practical walkthrough for teams building on Astra DB with the Data API, covering setup, pitfalls, and the checks that keep results reliable.`;
  return {
    _id: `art-${String(i + 1).padStart(3, "0")}`,
    title: `${title}${suffix}`,
    category,
    tags,
    author: ["Mira", "Tomas", "Ada", "Kenji", "Priya"][i % 5],
    minutes: 3 + (i % 9),
    published: `2026-0${1 + (i % 8)}-${String(1 + (i % 27)).padStart(2, "0")}`,
    body,
    $vectorize: `${title}. ${body}`,
    $lexical: `${title} ${tags.join(" ")} ${body}`,
  };
}

async function main(): Promise<void> {
  const db = new DataAPIClient(token as string).db(endpoint as string);
  const existing = await db.listCollections({ nameOnly: true });
  if (!existing.includes(COLLECTION)) {
    await db.createCollection(COLLECTION, {
      vector: { dimension: 1024, metric: "cosine", service: { provider: "nvidia", modelName: "nvidia/nv-embedqa-e5-v5" } },
      lexical: {
        enabled: true,
        analyzer: {
          tokenizer: { name: "standard", args: {} },
          filters: [{ name: "lowercase" }, { name: "stop" }, { name: "porterstem" }, { name: "asciifolding" }],
          charFilters: [],
        },
      },
      rerank: { enabled: true, service: { provider: "nvidia", modelName: "nvidia/llama-3.2-nv-rerankqa-1b-v2" } },
      indexing: { deny: ["body"] },
    });
    console.log(`created collection ${COLLECTION}`);
  }
  const coll = db.collection(COLLECTION);
  const docs = Array.from({ length: 50 }, (_, i) => article(i));
  await coll.deleteMany({ _id: { $in: docs.map((d) => d._id as string) } });
  const result = await coll.insertMany(docs, { ordered: false });
  console.log(`inserted ${result.insertedCount} documents into ${COLLECTION}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
