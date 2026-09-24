import { describe, expect, it } from "vitest";
import { assertPublicHost, defaultFetchClientMetadata, isMetadataClientId, resolveMetadataClient } from "../../src/http/oauth/cimd.js";
import { createGateway } from "../../src/astra/gateway.js";

describe("client ID metadata documents", () => {
  it("recognizes metadata client ids", () => {
    expect(isMetadataClientId("https://app.example/client.json")).toBe(true);
    expect(isMetadataClientId("dcr-client-123")).toBe(false);
  });

  it.each([
    "localhost", "api.localhost", "printer.local", "db.internal",
    "127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "224.0.0.1",
    "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1",
  ])("refuses the private host %s", async (host) => {
    await expect(assertPublicHost(host)).rejects.toThrow();
  });

  it("accepts a public address literal", async () => {
    await expect(assertPublicHost("93.184.216.34")).resolves.toBeUndefined();
  });

  it("only fetches https URLs", async () => {
    await expect(defaultFetchClientMetadata("http://app.example/client.json")).rejects.toThrow(/https/);
    await expect(defaultFetchClientMetadata("https://127.0.0.1/client.json")).rejects.toThrow(/private/);
  });

  it("validates the document and caches it", async () => {
    const id = "https://cimd-test.example/client.json";
    let fetches = 0;
    const fetchDoc = async () => {
      fetches++;
      return { client_id: id, client_name: "x".repeat(300), redirect_uris: ["https://cimd-test.example/cb", 7] };
    };
    const client = await resolveMetadataClient(id, fetchDoc, 1_000);
    expect(client).toMatchObject({ client_id: id, redirect_uris: ["https://cimd-test.example/cb"], origin: "metadata-document" });
    expect(client.client_name).toHaveLength(120);
    await resolveMetadataClient(id, fetchDoc, 2_000);
    expect(fetches).toBe(1);

    await expect(resolveMetadataClient("https://other.example/a.json", async () => ({ client_id: "https://evil.example/a.json", redirect_uris: ["https://x/cb"] })))
      .rejects.toThrow(/does not match/);
    await expect(resolveMetadataClient("https://other.example/b.json", async () => ({ client_id: "https://other.example/b.json" })))
      .rejects.toThrow(/redirect_uris/);
    const unnamed = await resolveMetadataClient("https://named.example/c.json", async () => ({ client_id: "https://named.example/c.json", redirect_uris: ["https://named.example/cb"] }));
    expect(unnamed.client_name).toBe("named.example");
  });
});

describe("gateway", () => {
  it("builds Data API and DevOps clients without network calls", () => {
    const gateway = createGateway("test", { devopsUrl: "https://devops.example/v2" });
    const db = gateway.db("AstraCS:fake", "https://11111111-1111-1111-1111-111111111111-us-east-2.apps.astra.datastax.com", "ks", "astra");
    expect(db.keyspace).toBe("ks");
    expect(gateway.devops("AstraCS:fake", "prod")).toBeTruthy();
    expect(createGateway().db("t", "https://h.apps.astra.datastax.com", undefined, "astra")).toBeTruthy();
  });
});
