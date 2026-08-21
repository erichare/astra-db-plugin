import { describe, expect, it, vi } from "vitest";
import { registerAstraWidgetTools, registerWidgetResources } from "../src/core/tools.js";
import { mockDb } from "./mockdb.js";

type Handler = (args: unknown) => Promise<{ content: Array<{ type: string; text: string }>; structuredContent?: Record<string, unknown>; isError?: boolean }>;

function fakeServer() {
  const tools = new Map<string, { config: Record<string, unknown>; handler: Handler }>();
  const resources = new Map<string, { uri: string; config: Record<string, unknown>; read: () => Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> }>();
  const server = {
    registerTool: (name: string, config: Record<string, unknown>, handler: Handler) => {
      tools.set(name, { config, handler });
      return {} as never;
    },
    registerResource: (name: string, uri: string, config: Record<string, unknown>, read: never) => {
      resources.set(name, { uri, config, read });
      return {} as never;
    },
  };
  return { server: server as never, tools, resources };
}

const CREDS = { token: "AstraCS:test", endpoint: "https://db-1.apps.astra.datastax.com" };

function setup(options = {}) {
  const { server, tools, resources } = fakeServer();
  const { db, calls } = mockDb(options);
  const writeHtmlFile = vi.fn(() => "/tmp/astra-widgets/x.html");
  registerAstraWidgetTools(server, { resolveCredentials: () => CREDS, createDb: () => db, writeHtmlFile });
  registerWidgetResources(server);
  return { tools, resources, calls, writeHtmlFile };
}

describe("tool registration", () => {
  it("registers the four widget tools with MCP Apps UI metadata", () => {
    const { tools } = setup();
    expect([...tools.keys()].sort()).toEqual(["collection_card", "database_overview", "explore_collection", "similarity_search"]);
    for (const [name, { config }] of tools) {
      const meta = config._meta as Record<string, unknown>;
      expect((meta.ui as { resourceUri: string }).resourceUri).toMatch(/^ui:\/\/astra-widgets\/.+\.html$/);
      expect(meta["openai/outputTemplate"]).toBe((meta.ui as { resourceUri: string }).resourceUri);
      expect((config.annotations as { readOnlyHint: boolean }).readOnlyHint).toBe(true);
      expect(name).toBeTruthy();
    }
  });

  it("registers one UI resource per widget with the MCP Apps mime type", async () => {
    const { resources } = setup();
    expect([...resources.keys()].sort()).toEqual([
      "astra-widgets-collection-card", "astra-widgets-explorer", "astra-widgets-overview", "astra-widgets-similarity",
    ]);
    const overview = resources.get("astra-widgets-overview")!;
    expect(overview.config.mimeType).toBe("text/html;profile=mcp-app");
    const read = await overview.read();
    expect(read.contents[0].uri).toBe("ui://astra-widgets/overview.html");
    expect(read.contents[0].text).toContain("AstraBridge.mount");
    expect(read.contents[0].text).not.toContain("/*@bridge*/");
  });
});

describe("tool handlers", () => {
  it("database_overview returns a summary and structuredContent", async () => {
    const { tools } = setup();
    const res = await tools.get("database_overview")!.handler({});
    expect(res.isError).toBeUndefined();
    expect(res.content[0].text).toContain("2 keyspace(s)");
    expect(res.structuredContent?.widget).toBe("overview");
  });

  it("collection_card applies defaults and summarizes", async () => {
    const { tools } = setup();
    const res = await tools.get("collection_card")!.handler({ collection: "articles" });
    expect(res.content[0].text).toContain("vectorize nvidia/nvidia/nv-embedqa-e5-v5");
    expect(res.structuredContent?.name).toBe("articles");
  });

  it("similarity_search lists ranked hits", async () => {
    const { tools } = setup();
    const res = await tools.get("similarity_search")!.handler({ collection: "articles", query: "vectors", limit: 2 });
    expect(res.content[0].text).toMatch(/1\. Vector search basics — 0\.930/);
    expect((res.structuredContent?.hits as unknown[]).length).toBe(2);
  });

  it("explore_collection pages and summarizes fields", async () => {
    const { tools } = setup({ nextPageState: "NEXT" });
    const res = await tools.get("explore_collection")!.handler({ collection: "articles" });
    expect(res.content[0].text).toContain("more pages available");
    expect(res.structuredContent?.nextPageState).toBe("NEXT");
  });

  it("emit=html_file writes a standalone page and reports its path", async () => {
    const { tools, writeHtmlFile } = setup();
    const res = await tools.get("collection_card")!.handler({ collection: "articles", emit: "html_file" });
    expect(writeHtmlFile).toHaveBeenCalledWith("collection-card", expect.objectContaining({ widget: "collection-card" }));
    expect(res.content[0].text).toContain("/tmp/astra-widgets/x.html");
    expect(res.structuredContent?.htmlPath).toBe("/tmp/astra-widgets/x.html");
  });

  it("returns isError with a clean message for known errors", async () => {
    const { tools } = setup();
    const res = await tools.get("collection_card")!.handler({ collection: "missing" });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain("Collection 'missing' not found");
  });

  it("sanitizes unexpected errors", async () => {
    const { server, tools } = fakeServer();
    const { db } = mockDb();
    db.listCollections = async () => { throw new Error("boom AstraCS:secret at https://db-1.apps.astra.datastax.com/api/json"); };
    registerAstraWidgetTools(server, { resolveCredentials: () => CREDS, createDb: () => db });
    const res = await tools.get("collection_card")!.handler({ collection: "articles" });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toBe("Astra DB request failed: boom AstraCS:*** at db-1.apps.astra.datastax.com");
  });

  it("reports missing credentials clearly", async () => {
    const { server, tools } = fakeServer();
    registerAstraWidgetTools(server, {
      resolveCredentials: () => { throw new (class extends Error { code = "missing_credentials"; })("Set ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_API_ENDPOINT"); },
    });
    const res = await tools.get("database_overview")!.handler({});
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain("ASTRA_DB_APPLICATION_TOKEN");
  });

  it("rejects invalid input", async () => {
    const { tools } = setup();
    const res = await tools.get("similarity_search")!.handler({ collection: "articles", limit: 0 });
    expect(res.isError).toBe(true);
  });
});
