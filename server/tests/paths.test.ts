/** Less-travelled tool paths: tables, indexes, partial failures, validation, status hints, resources, prompts. */
import { describe, expect, it } from "vitest";
import { call, setup } from "./helpers.js";

const code = (r: { data: Record<string, unknown> }) => (r.data.error as { code?: string } | undefined)?.code;
const body = (r: { contents: unknown[] }) => (r.contents[0] as { text?: string }).text ?? "";

describe("writes on tables and indexes", () => {
  it("updates and deletes rows, and refuses multi-row updates", async () => {
    const { client, state } = await setup();
    const rows = () => state.keyspaces.get("default_keyspace")!.tables.get("reviews")!.rows;

    const updated = await call(client, "update", { name: "reviews", filter: { product: "lamp", id: "r1" }, update: { $set: { stars: 4 } } });
    expect(updated.isError, updated.text).toBe(false);
    expect(rows().find((r) => r.id === "r1")?.stars).toBe(4);

    const many = await call(client, "update", { name: "reviews", filter: { product: "lamp" }, update: { $set: { stars: 1 } }, many: true, confirm: "reviews" });
    expect(code(many)).toBe("unsupported_operation");

    const one = await call(client, "delete", { name: "reviews", filter: { product: "lamp", id: "r2" } });
    expect(one.isError, one.text).toBe(false);
    const all = await call(client, "delete", { name: "reviews", filter: { product: "lamp" }, many: true, confirm: "reviews" });
    expect(all.isError, all.text).toBe(false);
    expect(all.data.operation).toBe("deleteMany");
  });

  it("creates regular, vector, and text indexes, and explains collections index themselves", async () => {
    const { client, state } = await setup();
    for (const [name, column, type] of [["body_text", "body", "text"], ["emb_idx", "embedding", "vector"], ["product_idx", "product", "regular"]]) {
      const r = await call(client, "create_index", { table: "reviews", name, column, type });
      expect(r.isError, r.text).toBe(false);
    }
    expect(state.keyspaces.get("default_keyspace")!.tables.get("reviews")!.indexes.map((i) => i.name)).toEqual(
      expect.arrayContaining(["body_text", "emb_idx", "product_idx"]),
    );
    const onCollection = await call(client, "create_index", { table: "articles", name: "genre_idx", column: "genre" });
    expect(code(onCollection)).toBe("unsupported_operation");
  });

  it("drops tables and indexes after confirmation", async () => {
    const { client, state } = await setup();
    expect((await call(client, "drop", { kind: "index", name: "stars_idx", confirm: "stars_idx" })).isError).toBe(false);
    expect(state.keyspaces.get("default_keyspace")!.tables.get("reviews")!.indexes).toEqual([]);
    expect((await call(client, "drop", { kind: "table", name: "reviews", confirm: "reviews" })).isError).toBe(false);
    expect(state.keyspaces.get("default_keyspace")!.tables.has("reviews")).toBe(false);
  });

  it("validates collection definitions", async () => {
    const { client } = await setup();
    expect(code(await call(client, "create_collection", { name: "v", vector: { metric: "cosine" } }))).toBe("invalid_argument");
    expect(code(await call(client, "create_collection", { name: "i", indexing: { allow: ["a"], deny: ["b"] } }))).toBe("invalid_argument");
  });
});

describe("insert failures", () => {
  it("reports partial inserts and fails when nothing was inserted", async () => {
    const { client, state } = await setup();
    state.failures.set("insertMany", Object.assign(new Error("partial"), {
      insertedIds: () => ["n1"],
      errors: () => [new Error("Document already exists with the given _id")],
    }));
    const partial = await call(client, "insert", { name: "articles", documents: [{ _id: "n1" }, { _id: "doc-1" }] });
    expect(partial.isError, partial.text).toBe(false);
    expect(partial.data.insertedCount).toBe(1);

    state.failures.set("insertMany", new Error("Document already exists with the given _id"));
    const none = await call(client, "insert", { name: "articles", documents: [{ _id: "doc-1" }] });
    expect(code(none)).toBe("invalid_argument");
  });
});

describe("connection_status hints", () => {
  it("explains a missing token, DevOps database picking, and read-only mode", async () => {
    const missing = await call((await setup({ creds: { token: undefined } })).client, "connection_status");
    expect(missing.data.configured).toBe(false);
    expect(JSON.stringify(missing.data.hints)).toContain("login");

    const picked = await call((await setup({ creds: { endpoint: undefined, readOnly: true } })).client, "connection_status");
    expect(picked.data.endpoint).toMatchObject({ source: "devops" });
    expect(JSON.stringify(picked.data.hints)).toMatch(/DevOps/);
    expect(JSON.stringify(picked.data.hints)).toMatch(/Read-only/);

    const unchecked = await call((await setup()).client, "connection_status", { check: false });
    expect(unchecked.data.checks).toEqual({});
  });
});

describe("resources and prompts", () => {
  it("reads the database list and table schemas, and reports errors as content", async () => {
    const { client } = await setup();
    const dbs = await client.readResource({ uri: "astra://databases" });
    expect(body(dbs)).toContain("prod-db");
    const table = await client.readResource({ uri: "astra://default/default_keyspace/reviews/schema" });
    expect(body(table)).toContain("partition");
    const missing = await client.readResource({ uri: "astra://default/default/nope/schema" });
    expect(body(missing)).toContain("not_found");
  });

  it("completes database and keyspace names", async () => {
    const { client } = await setup();
    const ref = { type: "ref/resource" as const, uri: "astra://{database}/{keyspace}/{name}/schema" };
    const dbs = await client.complete({ ref, argument: { name: "database", value: "pr" } });
    expect(dbs.completion.values).toEqual(["prod-db"]);
    const keyspaces = await client.complete({ ref, argument: { name: "keyspace", value: "" } });
    expect(keyspaces.completion.values).toEqual(expect.arrayContaining(["default", "default_keyspace", "analytics"]));
    const names = await client.complete({ ref, argument: { name: "name", value: "" }, context: { arguments: { keyspace: "analytics" } } });
    expect(names.completion.values).toEqual([]);
  });

  it("renders every prompt", async () => {
    const { client } = await setup();
    for (const [name, args] of [["overview", {}], ["explore", { name: "articles" }], ["setup", {}]] as const) {
      const prompt = await client.getPrompt({ name, arguments: args });
      expect(JSON.stringify(prompt.messages), name).toMatch(/database_overview|describe_collection|connection_status/);
    }
  });
});

describe("database URL arguments", () => {
  const OTHER = "https://22222222-2222-2222-2222-222222222222-eu-west-1.apps.astra.datastax.com";

  it("accepts Astra endpoints and the configured endpoint, and refuses any other host", async () => {
    const { client } = await setup({ creds: { endpoint: { value: "https://hcd.internal.example:8181", source: "dotenv", detail: "/repo/.env" } } });
    expect((await call(client, "find", { name: "articles", database: OTHER })).isError).toBe(false);
    expect((await call(client, "find", { name: "articles", database: "https://hcd.internal.example:8181/" })).isError).toBe(false);
    for (const database of [
      "https://evil.example",
      "http://22222222-2222-2222-2222-222222222222-eu-west-1.apps.astra.datastax.com",
      "https://22222222-2222-2222-2222-222222222222-eu-west-1.apps.astra.datastax.com.evil.example",
      "https://user:pass@22222222-2222-2222-2222-222222222222-eu-west-1.apps.astra.datastax.com",
      "https://hcd.internal.example:9999",
    ]) {
      const r = await call(client, "find", { name: "articles", database });
      expect(code(r), database).toBe("invalid_argument");
    }
  });
});

describe("view results name their database", () => {
  it("carries the resolved endpoint, which drill-downs pass back as `database`", async () => {
    const { client } = await setup();
    const card = await call(client, "describe_collection", { collection: "articles" });
    const endpoint = card.data.endpoint as string;
    expect(endpoint).toMatch(/^https:\/\/11111111-.*\.apps\.astra\.datastax\.com$/);
    for (const name of ["database_overview", "find", "vector_search"] as const) {
      const args = name === "database_overview" ? { database: endpoint } : { name: "articles", database: endpoint, ...(name === "vector_search" ? { query: "x" } : {}) };
      const r = await call(client, name, args);
      expect(r.isError, `${name}: ${r.text}`).toBe(false);
      expect(r.data.endpoint).toBe(endpoint);
    }
  });
});
