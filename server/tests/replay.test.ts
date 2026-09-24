/** Refresh-token replay protection (optional replay store) and its Redis REST client. */
import { describe, expect, it } from "vitest";
import { type Secrets, seal } from "../src/http/crypto.js";
import { replayStoreFromEnv } from "../src/http/oauth/replay.js";
import { handleOAuthRequest } from "../src/http/oauth/router.js";
import type { Grant, OAuthDeps, RefreshToken, ReplayStore } from "../src/http/oauth/types.js";
import { ENDPOINT, TOKEN } from "./helpers.js";

const ORIGIN = "https://astra-mcp.test";
const SECRETS: Secrets = { current: "test-secret-current" };
const GRANT: Grant = { creds: { token: TOKEN, endpoint: ENDPOINT }, scope: ["astra:read"], client_id: "c1", aud: `${ORIGIN}/mcp` };

function memoryStore(): ReplayStore & { keys: Set<string> } {
  const keys = new Set<string>();
  return {
    keys,
    claim: async (key) => {
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    },
    has: async (key) => keys.has(key),
  };
}

async function refresh(deps: OAuthDeps, refreshToken: string) {
  const res = await handleOAuthRequest(new Request(`${ORIGIN}/token`, {
    method: "POST",
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: "c1" }),
  }), deps);
  return { status: res.status, body: await res.json() as { refresh_token?: string; error?: string; error_description?: string } };
}

async function firstRefreshToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const token: RefreshToken = { t: "refresh", grant: GRANT, exp: now + 3600, max: now + 7200, fam: "family-1" };
  return seal(token, SECRETS);
}

describe("refresh token replay", () => {
  it("with a store: each refresh token works once, and a replay revokes the whole chain", async () => {
    const replay = memoryStore();
    const deps: OAuthDeps = { secrets: SECRETS, verify: async () => null, replay };
    const r1 = await firstRefreshToken();

    const first = await refresh(deps, r1);
    expect(first.status).toBe(200);
    const r2 = first.body.refresh_token!;

    const replayed = await refresh(deps, r1);
    expect(replayed).toMatchObject({ status: 400, body: { error: "invalid_grant" } });
    expect(replayed.body.error_description).toMatch(/already used/);
    expect(replay.keys.has("fam:family-1")).toBe(true);

    // The legitimate holder's newer token is revoked too: they reconnect.
    const next = await refresh(deps, r2);
    expect(next).toMatchObject({ status: 400, body: { error: "invalid_grant" } });
    expect(next.body.error_description).toMatch(/revoked/);
  });

  it("without a store the server stays stateless (documented trade-off)", async () => {
    const deps: OAuthDeps = { secrets: SECRETS, verify: async () => null };
    const r1 = await firstRefreshToken();
    expect((await refresh(deps, r1)).status).toBe(200);
    expect((await refresh(deps, r1)).status).toBe(200);
  });

  it("fails closed (503) when the store is unreachable, without consuming the token", async () => {
    const broken: ReplayStore = { claim: async () => { throw new Error("down"); }, has: async () => false };
    const res = await refresh({ secrets: SECRETS, verify: async () => null, replay: broken }, await firstRefreshToken());
    expect(res).toMatchObject({ status: 503, body: { error: "temporarily_unavailable" } });
  });
});

describe("Redis REST replay store", () => {
  it("is off unless both the URL and token are set", () => {
    expect(replayStoreFromEnv({})).toBeUndefined();
    expect(replayStoreFromEnv({ KV_REST_API_URL: "https://kv.example" })).toBeUndefined();
  });

  it("claims with SET NX EX and checks with EXISTS", async () => {
    const sent: { url: string; auth: string | null; body: string[] }[] = [];
    const results: unknown[] = ["OK", null, 1];
    const fakeFetch = (async (url: string, init: RequestInit) => {
      sent.push({ url, auth: new Headers(init.headers).get("authorization"), body: JSON.parse(init.body as string) });
      return new Response(JSON.stringify({ result: results.shift() }));
    }) as unknown as typeof fetch;
    const store = replayStoreFromEnv({ UPSTASH_REDIS_REST_URL: "https://redis.example", UPSTASH_REDIS_REST_TOKEN: "t0k" }, fakeFetch)!;
    expect(await store.claim("rt:abc", 59.2)).toBe(true);
    expect(await store.claim("rt:abc", 59.2)).toBe(false);
    expect(await store.has("fam:f")).toBe(true);
    expect(sent[0]).toEqual({ url: "https://redis.example", auth: "Bearer t0k", body: ["SET", "astra-mcp:rt:abc", "1", "NX", "EX", "60"] });
    expect(sent[2].body).toEqual(["EXISTS", "astra-mcp:fam:f"]);
  });

  it("surfaces store errors", async () => {
    const failing = (async () => new Response(JSON.stringify({ error: "WRONGPASS" }))) as unknown as typeof fetch;
    const store = replayStoreFromEnv({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "x" }, failing)!;
    await expect(store.has("k")).rejects.toThrow(/WRONGPASS/);
    const down = (async () => new Response("nope", { status: 502 })) as unknown as typeof fetch;
    await expect(replayStoreFromEnv({ KV_REST_API_URL: "https://kv.example", KV_REST_API_TOKEN: "x" }, down)!.claim("k", 1)).rejects.toThrow(/502/);
  });
});
