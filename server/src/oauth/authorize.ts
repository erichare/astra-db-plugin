import { nowSeconds, open, pkceMatches, seal } from "./crypto.js";
import { renderAuthorizePage } from "./page.js";
import {
  ACCESS_TTL_SECONDS, CODE_TTL_SECONDS, REFRESH_TTL_SECONDS, SCOPE, json, oauthError,
  type AccessToken, type ClientToken, type CodeToken, type OAuthDeps, type RefreshToken,
} from "./types.js";

const HIDDEN_PARAMS = ["client_id", "redirect_uri", "state", "code_challenge", "code_challenge_method", "scope", "resource"];

function html(body: string, status = 200): Response {
  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

async function loadClient(clientId: string, secret: string): Promise<ClientToken | null> {
  const client = await open<ClientToken>(clientId, secret);
  return client && client.t === "client" ? client : null;
}

function errorRedirect(redirectUri: string, state: string | null, error: string, description: string): Response {
  const url = new URL(redirectUri);
  url.searchParams.set("error", error);
  url.searchParams.set("error_description", description);
  if (state) url.searchParams.set("state", state);
  return Response.redirect(url.toString(), 302);
}

/** GET /authorize — validate the request and show the consent/credentials page. */
export async function handleAuthorizeGet(req: Request, deps: OAuthDeps): Promise<Response> {
  if (!deps.secret) return html("<p>OAuth is not configured on this server.</p>", 503);
  const url = new URL(req.url);
  const p = Object.fromEntries(url.searchParams.entries());
  const client = p.client_id ? await loadClient(p.client_id, deps.secret) : null;
  if (!client) return html("<p>Unknown client. Register via /register first.</p>", 400);
  if (!p.redirect_uri || !client.redirect_uris.includes(p.redirect_uri)) return html("<p>redirect_uri does not match the registered client.</p>", 400);
  if (p.response_type !== "code") return errorRedirect(p.redirect_uri, p.state ?? null, "unsupported_response_type", "Only response_type=code is supported.");
  if (!p.code_challenge || (p.code_challenge_method ?? "S256") !== "S256") {
    return errorRedirect(p.redirect_uri, p.state ?? null, "invalid_request", "PKCE with S256 is required.");
  }
  const hidden: Record<string, string> = {};
  for (const key of HIDDEN_PARAMS) if (p[key]) hidden[key] = p[key];
  return html(renderAuthorizePage({ clientName: client.client_name, hidden }));
}

/** POST /authorize — verify the credentials, seal them into a code, redirect back. */
export async function handleAuthorizePost(req: Request, deps: OAuthDeps): Promise<Response> {
  if (!deps.secret) return html("<p>OAuth is not configured on this server.</p>", 503);
  const form = new URLSearchParams(await req.text());
  const p = Object.fromEntries(form.entries());
  const client = p.client_id ? await loadClient(p.client_id, deps.secret) : null;
  if (!client) return html("<p>Unknown client.</p>", 400);
  if (!p.redirect_uri || !client.redirect_uris.includes(p.redirect_uri)) return html("<p>redirect_uri does not match the registered client.</p>", 400);
  const hidden: Record<string, string> = {};
  for (const key of HIDDEN_PARAMS) if (p[key]) hidden[key] = p[key];
  const rerender = (error: string) =>
    html(renderAuthorizePage({ clientName: client.client_name, hidden, error, endpoint: p.endpoint, keyspace: p.keyspace }), 400);

  const token = (p.token ?? "").trim();
  const endpoint = (p.endpoint ?? "").trim();
  const keyspace = (p.keyspace ?? "").trim() || undefined;
  if (!token.startsWith("AstraCS:")) return rerender("That does not look like an Astra application token (AstraCS:…).");
  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    return rerender("Enter the full Data API endpoint URL.");
  }
  if (endpointUrl.protocol !== "https:") return rerender("The endpoint must use https.");
  if (!p.code_challenge) return rerender("Missing PKCE challenge — restart the connection from your client.");

  const creds = { token, endpoint: endpointUrl.origin, keyspace };
  let ok = false;
  try {
    ok = await deps.verifyCredentials(creds);
  } catch {
    ok = false;
  }
  if (!ok) return rerender("Astra DB rejected these credentials — check the token and endpoint and try again.");

  const now = deps.now?.() ?? nowSeconds();
  const code: CodeToken = { t: "code", creds, client_id: p.client_id, redirect_uri: p.redirect_uri, code_challenge: p.code_challenge, exp: now + CODE_TTL_SECONDS };
  const redirect = new URL(p.redirect_uri);
  redirect.searchParams.set("code", await seal(code, deps.secret));
  if (p.state) redirect.searchParams.set("state", p.state);
  return Response.redirect(redirect.toString(), 302);
}

/** POST /token — authorization_code (PKCE) and refresh_token grants. */
export async function handleToken(req: Request, deps: OAuthDeps): Promise<Response> {
  if (!deps.secret) return oauthError("temporarily_unavailable", "OAuth is not configured on this server.", 503);
  const contentType = req.headers.get("content-type") ?? "";
  let p: Record<string, string>;
  if (contentType.includes("application/json")) {
    p = (await req.json()) as Record<string, string>;
  } else {
    p = Object.fromEntries(new URLSearchParams(await req.text()).entries());
  }
  const now = deps.now?.() ?? nowSeconds();

  if (p.grant_type === "authorization_code") {
    const code = p.code ? await open<CodeToken>(p.code, deps.secret) : null;
    if (!code || code.t !== "code") return oauthError("invalid_grant", "Unknown or malformed authorization code.");
    if (code.exp <= now) return oauthError("invalid_grant", "Authorization code expired.");
    if (p.client_id && p.client_id !== code.client_id) return oauthError("invalid_grant", "client_id mismatch.");
    if (p.redirect_uri && p.redirect_uri !== code.redirect_uri) return oauthError("invalid_grant", "redirect_uri mismatch.");
    if (!p.code_verifier || !(await pkceMatches(p.code_verifier, code.code_challenge))) return oauthError("invalid_grant", "PKCE verification failed.");
    return issueTokens(code.creds, code.client_id, now, deps.secret);
  }
  if (p.grant_type === "refresh_token") {
    const refresh = p.refresh_token ? await open<RefreshToken>(p.refresh_token, deps.secret) : null;
    if (!refresh || refresh.t !== "refresh") return oauthError("invalid_grant", "Unknown or malformed refresh token.");
    if (refresh.exp <= now) return oauthError("invalid_grant", "Refresh token expired.");
    return issueTokens(refresh.creds, refresh.client_id, now, deps.secret);
  }
  return oauthError("unsupported_grant_type", "Use authorization_code or refresh_token.");
}

async function issueTokens(creds: AccessToken["creds"], clientId: string, now: number, secret: string): Promise<Response> {
  const access: AccessToken = { t: "access", creds, exp: now + ACCESS_TTL_SECONDS };
  const refresh: RefreshToken = { t: "refresh", creds, client_id: clientId, exp: now + REFRESH_TTL_SECONDS };
  return json({
    access_token: await seal(access, secret),
    token_type: "Bearer",
    expires_in: ACCESS_TTL_SECONDS,
    refresh_token: await seal(refresh, secret),
    scope: SCOPE,
  });
}

/** Resolve credentials from a sealed access token (null when not ours, invalid, or expired). */
export async function credentialsFromAccessToken(bearer: string, secret: string, now = nowSeconds()): Promise<AccessToken["creds"] | null> {
  const access = await open<AccessToken>(bearer, secret);
  if (!access || access.t !== "access" || access.exp <= now) return null;
  return access.creds;
}
