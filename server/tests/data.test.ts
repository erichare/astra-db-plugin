import { describe, expect, it } from "vitest";
import { databaseOverview } from "../src/core/data/overview.js";
import { collectionCard } from "../src/core/data/card.js";
import { similaritySearch } from "../src/core/data/similarity.js";
import { exploreCollection } from "../src/core/data/explore.js";
import { AstraWidgetsError } from "../src/core/errors.js";
import { CollectionCardResult, ExploreResult, OverviewResult, SimilarityResult } from "../src/core/schemas.js";
import { mockDb } from "./mockdb.js";

const ENDPOINT = "https://abc-123-us-east1.apps.astra.datastax.com";

describe("databaseOverview", () => {
  it("lists keyspaces, collections with vector info, tables, and totals", async () => {
    const { db } = mockDb();
    const result = await databaseOverview(db, ENDPOINT);
    expect(OverviewResult.parse(result)).toEqual(result);
    expect(result.endpointHost).toBe("abc-123-us-east1.apps.astra.datastax.com");
    expect(result.keyspaces.map((k) => k.name)).toEqual(["default_keyspace", "analytics"]);
    expect(result.keyspaces[0].isDefault).toBe(true);
    const articles = result.keyspaces[0].collections.find((c) => c.name === "articles");
    expect(articles?.vector).toEqual({ dimension: 1024, metric: "cosine", provider: "nvidia", model: "nvidia/nv-embedqa-e5-v5" });
    expect(articles?.rerank).toBe(true);
    expect(result.keyspaces[0].collections.find((c) => c.name === "plain")?.vector).toBeNull();
    expect(result.totals).toEqual({ keyspaces: 2, collections: 4, tables: 2, documents: 12 });
  });

  it("falls back to the default keyspace when admin access is denied", async () => {
    const { db } = mockDb({ keyspaces: new Error("forbidden") });
    const result = await databaseOverview(db, ENDPOINT);
    expect(result.keyspaces.map((k) => k.name)).toEqual(["default_keyspace"]);
  });

  it("truncates at maxCollections and reports it", async () => {
    const { db } = mockDb();
    const result = await databaseOverview(db, ENDPOINT, { maxCollections: 1 });
    expect(result.totals.collections).toBe(1);
    expect(result.truncated).toBe(true);
  });

  it("tolerates count failures", async () => {
    const { db } = mockDb({ counts: { "*": new Error("timeout") } });
    const result = await databaseOverview(db, ENDPOINT);
    expect(result.keyspaces[0].collections[0].estimatedCount).toBeNull();
    expect(result.totals.documents).toBeNull();
  });
});

describe("collectionCard", () => {
  it("returns full metadata plus a display-safe sample", async () => {
    const { db } = mockDb();
    const card = await collectionCard(db, { collection: "articles" });
    expect(CollectionCardResult.parse(card)).toEqual(card);
    expect(card.estimatedCount).toBe(3);
    expect(card.vector?.model).toBe("nvidia/nv-embedqa-e5-v5");
    expect(card.rerank).toEqual({ enabled: true, provider: "nvidia", model: "nvidia/llama-3.2-nv-rerankqa-1b-v2" });
    expect(card.indexing).toEqual({ allow: null, deny: ["body"] });
    expect(card.defaultIdType).toBe("uuid");
    expect(card.sampleDocument).not.toHaveProperty("$vector");
    expect(card.fields.map((f) => f.name)).toContain("title");
  });

  it("raises collection_not_found with the available names", async () => {
    const { db } = mockDb();
    await expect(collectionCard(db, { collection: "nope" })).rejects.toMatchObject({
      code: "collection_not_found",
      message: expect.stringContaining("articles"),
    });
  });

  it("skips the sample when asked", async () => {
    const { db, calls } = mockDb();
    const card = await collectionCard(db, { collection: "articles", includeSample: false });
    expect(card.sampleDocument).toBeNull();
    expect(calls.findOne).toHaveLength(0);
  });
});

describe("similaritySearch", () => {
  it("runs a $vectorize query with similarity scores and ranked hits", async () => {
    const { db, calls } = mockDb();
    const result = await similaritySearch(db, { collection: "articles", query: "how does vector search work", limit: 2 });
    expect(SimilarityResult.parse(result)).toEqual(result);
    expect(result.mode).toBe("vectorize");
    expect(calls.find[0].options).toMatchObject({ sort: { $vectorize: "how does vector search work" }, includeSimilarity: true, limit: 2 });
    expect(result.hits.map((h) => h.rank)).toEqual([1, 2]);
    expect(result.hits[0]).toMatchObject({ id: "a1", similarity: 0.93, title: "Vector search basics" });
    expect(result.hits[0].fields).toHaveProperty("title");
    expect(result.hits[0].document).not.toHaveProperty("$vector");
    expect(result.stats).toEqual({ max: 0.93, min: 0.81, mean: 0.87 });
  });

  it("searches by an existing document's vector and excludes that document", async () => {
    const { db, calls } = mockDb();
    const result = await similaritySearch(db, { collection: "articles", documentId: "a1" });
    expect(result.mode).toBe("document");
    expect(calls.findOne[0]).toMatchObject({ filter: { _id: "a1" }, options: { projection: { $vector: 1 } } });
    expect(calls.find[0].filter).toEqual({ _id: { $ne: "a1" } });
    expect(calls.find[0].options).toMatchObject({ sort: { $vector: [0.1, 0.2] } });
  });

  it("uses findAndRerank for hybrid queries when rerank is enabled", async () => {
    const { db, calls } = mockDb();
    const result = await similaritySearch(db, { collection: "articles", query: "hybrid", hybrid: true });
    expect(result.mode).toBe("hybrid");
    expect(calls.findAndRerank[0].options).toMatchObject({ sort: { $hybrid: "hybrid" }, includeScores: true });
    expect(result.hits[0].scores).toEqual({ $rerank: 0.5, $vector: 0.9 });
    expect(result.hits[0].similarity).toBe(0.9);
  });

  it("rejects text queries on collections without vectorize", async () => {
    const { db } = mockDb();
    await expect(similaritySearch(db, { collection: "plain", query: "x" })).rejects.toBeInstanceOf(AstraWidgetsError);
  });

  it("requires a query or a documentId", async () => {
    const { db } = mockDb();
    await expect(similaritySearch(db, { collection: "articles" })).rejects.toMatchObject({ code: "unsupported_query" });
  });

  it("reports a missing source document", async () => {
    const { db } = mockDb({ findOne: () => null });
    await expect(similaritySearch(db, { collection: "articles", documentId: "zzz" })).rejects.toMatchObject({ code: "document_not_found" });
  });
});

describe("exploreCollection", () => {
  it("returns a page of display-safe documents with field summary and page state", async () => {
    const { db, calls } = mockDb({ nextPageState: "PAGE2" });
    const result = await exploreCollection(db, { collection: "articles", filter: { category: "guide" } });
    expect(ExploreResult.parse(result)).toEqual(result);
    expect(calls.find[0].filter).toEqual({ category: "guide" });
    expect(calls.find[0].options).toEqual({ projection: { $vector: 0 } });
    expect(result.documents).toHaveLength(3);
    expect(result.documents[0]).not.toHaveProperty("$vector");
    expect(result.displayFields[0]).toBe("title");
    expect(result.fields.find((f) => f.name === "category")).toMatchObject({ type: "string", present: 3 });
    expect(result.nextPageState).toBe("PAGE2");
  });

  it("resumes from a page state and honors a field projection", async () => {
    const { db, calls } = mockDb();
    await exploreCollection(db, { collection: "articles", pageState: "P1", fields: ["title"] });
    expect(calls.find[0].pageState).toBe("P1");
    expect(calls.find[0].options).toEqual({ projection: { title: 1, _id: 1 } });
  });
});
