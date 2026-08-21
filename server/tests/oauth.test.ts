import { describe, expect, it } from "vitest";
import { isSealedToken, open, pkceMatches, seal } from "../src/oauth/crypto.js";
import { handleOAuthRequest } from "../src/oauth/router.js";
import { credentialsFromAccessToken } from "../src/oauth/authorize.js";
import { handleMcpRequest } from "../src/http.js";

const SECRET = "unit-test-secret";
const ORIGIN = "https://widgets.example.test";
const REDIRECT = "https://chatgpt.com/connector_platform_oauth_redirect";
const GOOD = { token: "AstraCS:unit:test", endpoint: "https://db-1.apps.astra.datastax.com" };

function deps(overrides: Partial<{ secret?: string; ok: boolean; now: number }> = {}) {
  return {
    secret: "secret" in overrides ? overrides.secret : SECRET,
    verifyCredentials: async (c: { token: string }) => (overrides.ok ?? true) && c.token.startsWith("AstraCS:"),
    now: overrides.now ? () => overrides.now as number : undefined,
  };
}

async function pkcePair() {
  const verifier = "v".repeat(43);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  return { verifier, challenge: Buffer.from(digest).toString("base64url") };
}

async function registerClient(d = deps()): Promise<string> {
  const res = await handleOAuthRequest(
    new Request(`${ORIGIN}/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ client_name: "ChatGPT", redirect_uris: [REDIRECT] }) }),
    d,
  );
  expect(res.status).toBe(201);
  return (await res.json()).client_id as string;
}

async function authorize(clientId: string, challenge: string, creds = GOOD, d = deps(), extra: Record<string, string> = {}) {
  const body = new URLSearchParams({ client_id: clientId, redirect_uri: REDIRECT, state: "xyz", code_challenge: challenge, code_challenge_method: "S256", response_type: "code", token: creds.token, endpoint: creds.endpoint, ...extra });
  return handleOAuthRequest(new Request(`${ORIGIN}/authorize`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body }), d);
}

async function exchange(code: string, verifier: string, clientId: string, d = deps()) {
  const body = new URLSearchParams({ grant_type: "authorization_code", code, code_verifier: verifier, client_id: clientId, redirect_uri: REDIRECT });
  return handleOAuthRequest(new Request(`${ORIGIN}/token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body }), d);
}

describe("sealed tokens", () => {
  it("round-trips and rejects tampering or a different secret", async () => {
    const t = await seal({ a: 1 }, SECRET);
    expect(isSealedToken(t)).toBe(true);
    expect(await open(t, SECRET)).toEqual({ a: 1 });
    expect(await open(t.slice(0, -2) + "zz", SECRET)).toBeNull();
    expect(await open(t, "other")).toBeNull();
    expect(await open("garbage", SECRET)).toBeNull();
  });
  it("verifies PKCE S256", async () => {
    const { verifier, challenge } = await pkcePair();
    expect(await pkceMatches(verifier, challenge)).toBe(true);
    expect(await pkceMatches("wrong", challenge)).toBe(false);
  });
});

describe("discovery", () => {
  it("serves protected-resource and authorization-server metadata (path or ?route=)", async () => {
    const prm = await (await handleOAuthRequest(new Request(`${ORIGIN}/.well-known/oauth-protected-resource/mcp`), deps())).json();
    expect(prm.resource).toBe(`${ORIGIN}/mcp`);
    expect(prm.authorization_servers).toEqual([ORIGIN]);
    const as = await (await handleOAuthRequest(new Request(`${ORIGIN}/api/oauth?route=as`), deps())).json();
    expect(as.issuer).toBe(ORIGIN);
    expect(as.token_endpoint).toBe(`${ORIGIN}/token`);
    expect(as.registration_endpoint).toBe(`${ORIGIN}/register`);
    expect(as.code_challenge_methods_supported).toEqual(["S256"]);
    expect(as.token_endpoint_auth_methods_supported).toEqual(["none"]);
  });
  it("returns 503 for register/token when no secret is configured", async () => {
    const res = await handleOAuthRequest(new Request(`${ORIGIN}/register`, { method: "POST", body: "{}" }), deps({ secret: undefined }));
    expect(res.status).toBe(503);
  });
});

describe("registration", () => {
  it("issues a sealed client_id carrying the redirect URIs", async () => {
    const clientId = await registerClient();
    const client = await open<{ t: string; redirect_uris: string[] }>(clientId, SECRET);
    expect(client?.t).toBe("client");
    expect(client?.redirect_uris).toEqual([REDIRECT]);
  });
  it("rejects non-https redirect URIs", async () => {
    const res = await handleOAuthRequest(new Request(`${ORIGIN}/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ redirect_uris: ["http://evil.example/cb"] }) }), deps());
    expect(res.status).toBe(400);
  });
});

describe("authorize", () => {
  it("GET renders the consent page with hidden OAuth params", async () => {
    const clientId = await registerClient();
    const { challenge } = await pkcePair();
    const url = `${ORIGIN}/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(REDIRECT)}&state=xyz&code_challenge=${challenge}&code_challenge_method=S256&scope=astra:read`;
    const res = await handleOAuthRequest(new Request(url), deps());
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("Connect Astra DB");
    expect(body).toContain('name="code_challenge"');
    expect(body).toContain("ChatGPT");
  });
  it("GET rejects an unregistered redirect_uri and unknown clients", async () => {
    const clientId = await registerClient();
    const bad = await handleOAuthRequest(new Request(`${ORIGIN}/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=https://evil.example/cb&code_challenge=x`), deps());
    expect(bad.status).toBe(400);
    const unknown = await handleOAuthRequest(new Request(`${ORIGIN}/authorize?response_type=code&client_id=nope&redirect_uri=${encodeURIComponent(REDIRECT)}`), deps());
    expect(unknown.status).toBe(400);
  });
  it("POST with valid credentials redirects with a code and state", async () => {
    const clientId = await registerClient();
    const { challenge } = await pkcePair();
    const res = await authorize(clientId, challenge);
    expect(res.status).toBe(302);
    const loc = new URL(res.headers.get("location")!);
    expect(loc.origin + loc.pathname).toBe(REDIRECT);
    expect(loc.searchParams.get("state")).toBe("xyz");
    expect(isSealedToken(loc.searchParams.get("code")!)).toBe(true);
  });
  it("POST re-renders with an error when Astra rejects the credentials or the token is malformed", async () => {
    const clientId = await registerClient();
    const { challenge } = await pkcePair();
    const rejected = await authorize(clientId, challenge, GOOD, deps({ ok: false }));
    expect(rejected.status).toBe(400);
    expect(await rejected.text()).toContain("rejected these credentials");
    const malformed = await authorize(clientId, challenge, { token: "not-a-token", endpoint: GOOD.endpoint });
    expect(await malformed.text()).toContain("does not look like an Astra application token");
  });
});

describe("token + resource server", () => {
  it("exchanges a code with PKCE for sealed access/refresh tokens that the MCP handler accepts", async () => {
    const clientId = await registerClient();
    const { verifier, challenge } = await pkcePair();
    const code = new URL((await authorize(clientId, challenge)).headers.get("location")!).searchParams.get("code")!;
    const tokenRes = await exchange(code, verifier, clientId);
    expect(tokenRes.status).toBe(200);
    const tokens = await tokenRes.json();
    expect(tokens.token_type).toBe("Bearer");
    expect(isSealedToken(tokens.access_token)).toBe(true);
    expect(await credentialsFromAccessToken(tokens.access_token, SECRET)).toEqual({ ...GOOD, keyspace: undefined });

    const mcp = await handleMcpRequest(
      new Request(`${ORIGIN}/mcp`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: `Bearer ${tokens.access_token}` }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) }),
      SECRET,
    );
    expect(mcp.status).toBe(200);
    expect((await mcp.json()).result.tools.length).toBe(4);

    const refreshed = await handleOAuthRequest(new Request(`${ORIGIN}/token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ grant_type: "refresh_token", refresh_token: tokens.refresh_token }) }), deps());
    expect(refreshed.status).toBe(200);
    expect(isSealedToken((await refreshed.json()).access_token)).toBe(true);
  });
  it("rejects a wrong verifier, an expired code, and a reused-with-other-client code", async () => {
    const clientId = await registerClient();
    const { verifier, challenge } = await pkcePair();
    const code = new URL((await authorize(clientId, challenge)).headers.get("location")!).searchParams.get("code")!;
    expect((await exchange(code, "wrong-verifier", clientId)).status).toBe(400);
    expect((await exchange(code, verifier, "someone-else")).status).toBe(400);
    const late = await exchange(code, verifier, clientId, deps({ now: Math.floor(Date.now() / 1000) + 3600 }));
    expect(late.status).toBe(400);
    expect((await late.json()).error).toBe("invalid_grant");
  });
  it("ignores a non-string second argument (host context objects) and still resolves the env secret", async () => {
    const clientId = await registerClient();
    const { verifier, challenge } = await pkcePair();
    const code = new URL((await authorize(clientId, challenge)).headers.get("location")!).searchParams.get("code")!;
    const tokens = await (await exchange(code, verifier, clientId)).json();
    process.env.ASTRA_WIDGETS_AUTH_SECRET = SECRET;
    try {
      const res = await handleMcpRequest(
        new Request(`${ORIGIN}/mcp`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: `Bearer ${tokens.access_token}` }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) }),
        { waitUntil: () => undefined } as unknown,
      );
      expect(res.status).toBe(200);
    } finally {
      delete process.env.ASTRA_WIDGETS_AUTH_SECRET;
    }
  });
  it("MCP 401s advertise the resource metadata and flag expired sealed tokens", async () => {
    const anon = await handleMcpRequest(new Request(`${ORIGIN}/mcp`, { method: "POST", body: "{}" }), SECRET);
    expect(anon.status).toBe(401);
    expect(anon.headers.get("www-authenticate")).toContain(`resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource"`);
    const expired = await seal({ t: "access", creds: GOOD, exp: 1 }, SECRET);
    const res = await handleMcpRequest(new Request(`${ORIGIN}/mcp`, { method: "POST", headers: { authorization: `Bearer ${expired}` }, body: "{}" }), SECRET);
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toContain('error="invalid_token"');
  });
});
