import { existsSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { APP_URI } from "../src/server/meta.js";
import { call, setup } from "./helpers.js";

describe("tool catalog", () => {
  it("lists 18 titled, annotated, iconed tools with output schemas; app tools link the shell", async () => {
    const { client } = await setup();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual([
      "connection_status", "list_databases", "database_overview", "describe_collection", "describe_table", "find",
      "vector_search", "count", "distinct_values", "list_vectorize_providers", "code_examples",
      "insert", "update", "delete", "create_collection", "create_table", "create_index", "drop",
    ]);
    for (const tool of tools) {
      expect(tool.title, tool.name).toBeTruthy();
      expect(tool.description!.length, tool.name).toBeLessThan(600);
      expect(tool.annotations?.readOnlyHint !== undefined, tool.name).toBe(true);
      expect(tool.icons?.length, tool.name).toBeGreaterThan(0);
      expect(tool.outputSchema, tool.name).toBeTruthy();
    }
    const app = tools.filter((t) => (t._meta as { ui?: { resourceUri?: string } } | undefined)?.ui?.resourceUri === APP_URI).map((t) => t.name);
    expect(app).toEqual(["database_overview", "describe_collection", "describe_table", "find", "vector_search"]);
    const drop = tools.find((t) => t.name === "drop")!;
    expect(drop.annotations).toMatchObject({ destructiveHint: true, readOnlyHint: false });
    expect(drop._meta).toMatchObject({ "anthropic/requiresUserInteraction": true });
    expect(JSON.stringify(tools.find((t) => t.name === "find")!.inputSchema)).toContain("emit");
  });

  it("hides write tools when writes are not allowed", async () => {
    const { client } = await setup({ allowWrites: false });
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(11);
    expect(tools.every((t) => t.annotations?.readOnlyHint)).toBe(true);
  });

  it("serves instructions, prompts, and resources", async () => {
    const { client } = await setup();
    expect(client.getInstructions()).toContain("code_examples");
    const { prompts } = await client.listPrompts();
    expect(prompts.map((p) => p.name)).toEqual(["overview", "explore", "similar", "setup"]);
    const prompt = await client.getPrompt({ name: "similar", arguments: { name: "articles", query: "space travel" } });
    expect(JSON.stringify(prompt.messages)).toContain("space travel");
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toEqual([APP_URI, "astra://databases"]);
    const app = await client.readResource({ uri: APP_URI });
    expect(app.contents[0].mimeType).toBe("text/html;profile=mcp-app");
    expect((app.contents[0] as { text: string }).text).toContain("<main id=\"app\"");
    const schema = await client.readResource({ uri: "astra://default/default/articles/schema" });
    expect(JSON.parse((schema.contents[0] as { text: string }).text)).toMatchObject({ view: "collection", name: "articles" });
    const { resourceTemplates } = await client.listResourceTemplates();
    expect(resourceTemplates[0].uriTemplate).toBe("astra://{database}/{keyspace}/{name}/schema");
    const completion = await client.complete({ ref: { type: "ref/resource", uri: "astra://{database}/{keyspace}/{name}/schema" }, argument: { name: "name", value: "ar" } });
    expect(completion.completion.values).toEqual(["articles"]);
    const promptCompletion = await client.complete({ ref: { type: "ref/prompt", name: "explore" }, argument: { name: "name", value: "re" } });
    expect(promptCompletion.completion.values).toEqual(["reviews"]);
  });
});

describe("read tools", () => {
  it("connection_status reports sources and a live check", async () => {
    const { client } = await setup();
    const r = await call(client, "connection_status");
    expect(r.isError).toBe(false);
    expect(r.data).toMatchObject({
      view: "status", configured: true,
      token: { source: "env", masked: "AstraCS:…cdef" },
      endpoint: { source: "dotenv", host: expect.stringContaining("apps.astra.datastax.com") },
      checks: { dataApi: { ok: true, collections: 2, tables: 1 } },
    });
    expect(r.text).not.toContain("testtesttest");
  });

  it("connection_status explains how to configure when no token exists", async () => {
    const { client } = await setup({ creds: { token: undefined, endpoint: undefined } });
    const r = await call(client, "connection_status");
    expect(r.data).toMatchObject({ configured: false, token: null });
    expect(JSON.stringify(r.data)).toContain("npx -y @erichare/astra-mcp login");
    const failing = await call(client, "database_overview");
    expect(failing.isError).toBe(true);
    expect(failing.data).toMatchObject({ error: { code: "not_configured" } });
  });

  it("list_databases marks the current database", async () => {
    const { client } = await setup();
    const r = await call(client, "list_databases");
    expect(r.data).toMatchObject({ view: "databases", databases: [{ name: "prod-db", current: true, regions: [{ name: "us-east-2" }] }] });
  });

  it("database_overview covers every keyspace, tables included", async () => {
    const { client } = await setup();
    const r = await call(client, "database_overview");
    expect(r.data).toMatchObject({
      view: "overview",
      totals: { keyspaces: 2, collections: 2, tables: 1, documents: 46 },
      truncated: { keyspaces: false, items: false },
    });
    const ks = (r.data.keyspaces as { name: string; tables: unknown[] }[]).find((k) => k.name === "default_keyspace")!;
    expect(ks.tables).toEqual([{ name: "reviews", columns: 5, vectorColumns: 1 }]);
    expect(r.text).toContain("default_keyspace.articles: 1024d cosine via nv-embedqa-e5-v5");
  });

  it("database_overview isolates a failing keyspace", async () => {
    const { client, state } = await setup();
    state.failures.set("listCollections", Object.assign(new Error("boom"), { name: "DataAPIHttpError", status: 500 }));
    const r = await call(client, "database_overview");
    expect(r.isError).toBe(false);
    expect((r.data.keyspaces as { error?: string }[]).every((k) => k.error)).toBe(true);
  });

  it("describe_collection returns configuration, sample, and field types", async () => {
    const { client } = await setup();
    const r = await call(client, "describe_collection", { collection: "articles" });
    expect(r.data).toMatchObject({
      view: "collection", name: "articles", estimatedCount: 45, defaultIdType: "uuid",
      vector: { dimension: 1024, metric: "cosine", provider: "nvidia" },
      lexical: { enabled: true }, rerank: { enabled: true, provider: "nvidia" },
      indexing: { deny: ["body"], allow: null },
    });
    expect((r.data.sampleDocument as Record<string, unknown>).$vector).toBeUndefined();
    const missing = await call(client, "describe_collection", { collection: "nope" });
    expect(missing.data).toMatchObject({ error: { code: "not_found", hint: expect.stringContaining("articles") } });
    const unknownDefault = await call(client, "describe_collection", { collection: "plain" });
    expect(unknownDefault.data.defaultIdType).toBeNull();
  });

  it("describe_table returns columns, keys, indexes, vector columns", async () => {
    const { client } = await setup();
    const r = await call(client, "describe_table", { table: "reviews" });
    expect(r.data).toMatchObject({
      view: "table", name: "reviews",
      primaryKey: { partitionBy: ["product"], partitionSort: { id: 1 } },
      indexes: [{ name: "stars_idx", column: "stars", type: "regular" }],
      vectorColumns: [{ name: "embedding", dimension: 3, provider: "nvidia" }],
    });
    expect((r.data.columns as { name: string; primaryKey: string | null }[]).find((c) => c.name === "id")?.primaryKey).toBe("clustering");
    expect((r.data.sampleRows as Record<string, unknown>[])[0].embedding).toBeUndefined();
    expect(r.text).toContain("PRIMARY KEY ((product), id ASC)");
  });

  it("find pages through a collection and a table", async () => {
    const { client } = await setup();
    const first = await call(client, "find", { name: "articles" });
    expect(first.data).toMatchObject({ view: "explorer", kind: "collection", nextPageState: "20" });
    expect((first.data.documents as unknown[]).length).toBe(20);
    const more = await call(client, "find", { name: "articles", limit: 45 });
    expect((more.data.documents as unknown[]).length).toBe(45);
    expect(more.data.nextPageState).toBeNull();
    const next = await call(client, "find", { name: "articles", pageState: "40" });
    expect((next.data.documents as unknown[]).length).toBe(5);
    const filtered = await call(client, "find", { name: "articles", filter: { genre: "science" }, limit: 100 });
    expect((filtered.data.documents as unknown[]).length).toBe(15);
    expect(filtered.data.filter).toEqual({ genre: "science" });
    const rows = await call(client, "find", { name: "reviews" });
    expect(rows.data).toMatchObject({ kind: "table", documents: [{ product: "lamp" }, { product: "lamp" }] });
  });

  it("vector_search by text, vector, document (typed id fallback), hybrid, and on tables", async () => {
    const { client, state } = await setup();
    const text = await call(client, "vector_search", { name: "articles", query: "space", limit: 3 });
    expect(text.data).toMatchObject({ view: "similarity", mode: "vectorize" });
    expect((text.data.hits as Record<string, unknown>[])[0]).toMatchObject({ rank: 1, title: "Article 0", similarity: 1 });
    expect(((text.data.hits as { document: Record<string, unknown> }[])[0].document).$similarity).toBeUndefined();
    expect(state.calls.some((c) => c.method === "find.toArray" && JSON.stringify(c.args).includes("$vectorize"))).toBe(true);

    const byDoc = await call(client, "vector_search", { name: "articles", documentId: "doc-3", limit: 2 });
    expect(byDoc.data).toMatchObject({ mode: "document", documentId: "doc-3" });
    expect((byDoc.data.hits as { id: string }[]).map((h) => h.id)).not.toContain("doc-3");

    const hybrid = await call(client, "vector_search", { name: "articles", query: "space", hybrid: true, limit: 2 });
    expect(hybrid.data).toMatchObject({ mode: "hybrid", hits: [{ scores: { $rerank: 0.9 } }, {}] });

    const table = await call(client, "vector_search", { name: "reviews", query: "bright" });
    expect(table.data).toMatchObject({ kind: "table", mode: "vectorize", hits: [{ id: "lamp · r1", similarity: 0.91 }, { id: "lamp · r2" }] });

    const vector = await call(client, "vector_search", { name: "articles", vector: [0.1, 0.2, 0.3], limit: 1 });
    expect(vector.data.mode).toBe("vector");
  });

  it("vector_search explains unsupported requests", async () => {
    const { client } = await setup();
    const none = await call(client, "vector_search", { name: "articles" });
    expect(none.data).toMatchObject({ error: { code: "invalid_argument" } });
    const plain = await call(client, "vector_search", { name: "plain", query: "x" });
    expect(plain.data).toMatchObject({ error: { code: "unsupported_query" } });
    const missingDoc = await call(client, "vector_search", { name: "articles", documentId: "nope" });
    expect(missingDoc.data).toMatchObject({ error: { code: "not_found" } });
    const tableDoc = await call(client, "vector_search", { name: "reviews", documentId: "r1" });
    expect(tableDoc.data).toMatchObject({ error: { code: "unsupported_query" } });
  });

  it("count and distinct_values", async () => {
    const { client } = await setup();
    const all = await call(client, "count", { name: "articles" });
    expect(all.data).toMatchObject({ view: "count", count: 45, exceedsUpperBound: false, estimatedTotal: 45 });
    const bounded = await call(client, "count", { name: "articles", upperBound: 10 });
    expect(bounded.data).toMatchObject({ count: 10, exceedsUpperBound: true });
    expect(bounded.text).toContain("more than 10");
    const table = await call(client, "count", { name: "reviews" });
    expect(table.data).toMatchObject({ error: { code: "unsupported_operation" } });
    const distinct = await call(client, "distinct_values", { name: "articles", field: "genre" });
    expect(distinct.data).toMatchObject({ view: "distinct", complete: true });
    expect((distinct.data.values as string[]).sort()).toEqual(["fiction", "history", "science"]);
    const nested = await call(client, "distinct_values", { name: "articles", field: "tags", maxValues: 2 });
    expect((nested.data.values as string[]).length).toBe(2);
    expect(nested.data.complete).toBe(false);
  });

  it("list_vectorize_providers and code_examples", async () => {
    const { client } = await setup();
    const providers = await call(client, "list_vectorize_providers");
    expect(providers.data).toMatchObject({
      embedding: [{ provider: "nvidia", models: [{ name: "nv-embedqa-e5-v5", dimension: 1024 }], authentication: ["NONE"] }],
      reranking: [{ provider: "nvidia", models: [{ isDefault: true }] }],
    });
    const examples = await call(client, "code_examples", { language: "typescript", query: "create a vector collection", limit: 2 });
    expect(examples.isError).toBe(false);
    const results = examples.data.results as { file: string; content: string }[];
    expect(results[0].file).toMatch(/typescript\/examples\/collections-create-collection-vector\.ts$/);
    expect(results[0].content).toContain("process.env.ASTRA_DB_APPLICATION_TOKEN");
    expect(examples.text).toContain("```typescript");
  });

  it("targets another database by name and keyspace", async () => {
    const { client } = await setup({ creds: { endpoint: undefined } });
    const r = await call(client, "describe_collection", { collection: "articles", database: "prod-db" });
    expect(r.isError).toBe(false);
    const missing = await call(client, "database_overview", { database: "nope" });
    expect(missing.data).toMatchObject({ error: { code: "not_found", hint: expect.stringContaining("prod-db") } });
  });

  it("emit html_file writes a private standalone page and returns a resource_link", async () => {
    const { client, htmlDir } = await setup();
    const r = await call(client, "describe_collection", { collection: "articles", emit: "html_file" });
    const link = r.content.find((c) => c.type === "resource_link");
    expect(link?.uri).toMatch(/^file:\/\//);
    const path = fileURLToPath(link!.uri!);
    expect(path.startsWith(htmlDir)).toBe(true);
    expect(existsSync(path)).toBe(true);
    if (process.platform !== "win32") expect(statSync(path).mode & 0o777).toBe(0o600);
    const html = readFileSync(path, "utf8");
    expect(html).toContain("window.__ASTRA_DATA__");
    expect(html).not.toMatch(/<\/script>\s*<\/script>/);
  });
});

describe("writes and confirmation", () => {
  it("inserts, updates one, and deletes one without confirmation", async () => {
    const { client, state } = await setup();
    const ins = await call(client, "insert", { name: "articles", documents: [{ _id: "new-1", title: "New" }, { title: "Auto id" }] });
    expect(ins.data).toMatchObject({ view: "mutation", operation: "insert", insertedCount: 2, insertedIds: ["new-1", "gen-46"] });
    const upd = await call(client, "update", { name: "articles", filter: { _id: "new-1" }, update: { $set: { title: "Renamed" } } });
    expect(upd.data).toMatchObject({ operation: "updateOne", matchedCount: 1, modifiedCount: 1 });
    const del = await call(client, "delete", { name: "articles", filter: { _id: "new-1" } });
    expect(del.data).toMatchObject({ operation: "deleteOne", deletedCount: 1 });
    expect(state.keyspaces.get("default_keyspace")!.collections.get("articles")!.docs.length).toBe(46);
    const rowIns = await call(client, "insert", { name: "reviews", documents: [{ id: "r3", product: "desk", stars: 4 }] });
    expect(rowIns.data).toMatchObject({ kind: "table", insertedCount: 1 });
  });

  it("requires confirmation for bulk deletes when the client cannot elicit", async () => {
    const { client, state } = await setup();
    const docs = () => state.keyspaces.get("default_keyspace")!.collections.get("articles")!.docs;
    const asked = await call(client, "delete", { name: "articles", filter: { genre: "science" }, many: true });
    expect(asked.data).toMatchObject({ error: { code: "confirmation_required", details: { expected: "articles" } } });
    expect(asked.text).toContain("15 matching document(s)");
    expect(docs().length).toBe(45);
    const wrong = await call(client, "delete", { name: "articles", filter: { genre: "science" }, many: true, confirm: "yes" });
    expect(wrong.data).toMatchObject({ error: { code: "confirmation_mismatch" } });
    const ok = await call(client, "delete", { name: "articles", filter: { genre: "science" }, many: true, confirm: "articles" });
    expect(ok.data).toMatchObject({ operation: "deleteMany", deletedCount: 15 });
    const emptyFilter = await call(client, "update", { name: "articles", filter: {}, update: { $set: { x: 1 } } });
    expect(emptyFilter.data).toMatchObject({ error: { code: "confirmation_required" } });
  });

  it("asks the user through elicitation when the client supports it", async () => {
    const accepted = await setup({ elicit: (params) => {
      expect(String(params.message)).toContain("Drops collection default_keyspace.plain (~1 documents)");
      return { action: "accept", content: { confirm: "plain" } };
    } });
    const dropped = await call(accepted.client, "drop", { kind: "collection", name: "plain" });
    expect(dropped.data).toMatchObject({ operation: "dropCollection", status: "ok" });
    expect(accepted.state.keyspaces.get("default_keyspace")!.collections.has("plain")).toBe(false);

    const declined = await setup({ elicit: () => ({ action: "decline" }) });
    const kept = await call(declined.client, "drop", { kind: "collection", name: "plain" });
    expect(kept.data).toMatchObject({ view: "mutation", status: "cancelled" });
    expect(declined.state.keyspaces.get("default_keyspace")!.collections.has("plain")).toBe(true);

    const typo = await setup({ elicit: () => ({ action: "accept", content: { confirm: "plian" } }) });
    const mismatch = await call(typo.client, "drop", { kind: "table", name: "reviews" });
    expect(mismatch.data).toMatchObject({ error: { code: "confirmation_mismatch" } });
  });

  it("creates collections, tables, and indexes", async () => {
    const { client, state } = await setup();
    const coll = await call(client, "create_collection", {
      name: "docs", vector: { metric: "dot_product", service: { provider: "nvidia", modelName: "nv-embedqa-e5-v5" } }, lexical: true,
      rerank: { provider: "nvidia", modelName: "llama-3.2-nv-rerankqa-1b-v2" }, defaultId: "uuidv7",
    });
    expect(coll.data).toMatchObject({ operation: "createCollection", status: "ok" });
    expect(state.calls.find((c) => c.method === "createCollection")!.args[1]).toMatchObject({
      keyspace: "default_keyspace", lexical: { enabled: true }, rerank: { enabled: true }, defaultId: { type: "uuidv7" },
    });
    const bad = await call(client, "create_collection", { name: "v", vector: { metric: "cosine" } });
    expect(bad.data).toMatchObject({ error: { code: "invalid_argument" } });
    const table = await call(client, "create_table", {
      name: "events", columns: { user_id: "uuid", ts: "timestamp", payload: "text", embedding: { type: "vector", dimension: 8 } },
      primaryKey: { partitionBy: ["user_id"], partitionSort: { ts: -1 } },
    });
    expect(table.data).toMatchObject({ operation: "createTable" });
    const badPk = await call(client, "create_table", { name: "x", columns: { a: "text" }, primaryKey: "b" });
    expect(badPk.data).toMatchObject({ error: { code: "invalid_argument" } });
    const index = await call(client, "create_index", { table: "events", name: "events_vec", column: "embedding", type: "vector", options: { metric: "cosine" } });
    expect(index.data).toMatchObject({ operation: "createIndex" });
    expect(state.calls.find((c) => c.method === "createVectorIndex")!.args).toEqual(["events_vec", "embedding", { ifNotExists: true, options: { metric: "cosine" } }]);
    const onCollection = await call(client, "create_index", { table: "articles", name: "i", column: "title" });
    expect(onCollection.data).toMatchObject({ error: { code: "unsupported_operation" } });
  });

  it("refuses writes at runtime in read-only mode even if registered", async () => {
    const { client } = await setup({ creds: { readOnly: true }, allowWrites: true });
    const r = await call(client, "insert", { name: "articles", documents: [{ a: 1 }] });
    expect(r.data).toMatchObject({ error: { code: "read_only" } });
  });

  it("validates input with a readable error", async () => {
    const { client } = await setup();
    const r = await client.callTool({ name: "find", arguments: { name: "articles", limit: 1000 } });
    expect(r.isError).toBe(true);
  });
});
