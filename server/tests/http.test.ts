import { describe, expect, it } from "vitest";
import { credentialsFromRequest, handleMcpRequest } from "../src/http.js";

const URL_ = "https://widgets.example.test/api/mcp";
const AUTH = { authorization: "Bearer AstraCS:unit-test-token", "x-astra-endpoint": "https://db-1.apps.astra.datastax.com" };

function rpc(body: unknown, headers: Record<string, string> = AUTH, url = URL_): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers },
    body: JSON.stringify(body),
  });
}

const INIT = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } };

describe("credentialsFromRequest", () => {
  it("reads bearer + header", () => {
    expect(credentialsFromRequest(rpc({}))).toEqual({ token: "AstraCS:unit-test-token", endpoint: "https://db-1.apps.astra.datastax.com", keyspace: undefined });
  });
  it("falls back to ?endpoint= and ?keyspace=", () => {
    const req = rpc({}, { authorization: "Bearer t" }, `${URL_}?endpoint=https%3A%2F%2Fdb-2.apps.astra.datastax.com&keyspace=ks`);
    expect(credentialsFromRequest(req)).toEqual({ token: "t", endpoint: "https://db-2.apps.astra.datastax.com", keyspace: "ks" });
  });
  it("rejects missing pieces", () => {
    expect(credentialsFromRequest(rpc({}, {}))).toBeNull();
    expect(credentialsFromRequest(rpc({}, { authorization: "Bearer t" }))).toBeNull();
  });
});

describe("handleMcpRequest", () => {
  it("returns 401 without credentials", async () => {
    const res = await handleMcpRequest(rpc(INIT, {}));
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBe("Bearer");
    expect((await res.json()).message).toContain("X-Astra-Endpoint");
  });

  it("answers CORS preflight", async () => {
    const res = await handleMcpRequest(new Request(URL_, { method: "OPTIONS" }));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-headers")).toContain("x-astra-endpoint");
  });

  it("serves initialize and tools/list over streamable HTTP (stateless JSON mode)", async () => {
    const init = await handleMcpRequest(rpc(INIT));
    expect(init.status).toBe(200);
    const initBody = await init.json();
    expect(initBody.result.serverInfo.name).toBe("astra-widgets");

    const list = await handleMcpRequest(rpc({ jsonrpc: "2.0", id: 2, method: "tools/list" }));
    expect(list.status).toBe(200);
    const names = (await list.json()).result.tools.map((t: { name: string }) => t.name).sort();
    expect(names).toEqual(["collection_card", "database_overview", "explore_collection", "similarity_search"]);
    expect(list.headers.get("access-control-allow-origin")).toBe("*");
  });
});
