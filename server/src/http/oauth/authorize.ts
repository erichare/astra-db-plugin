/** GET/POST /authorize: validate the client, show consent, seal the grant into a code. */
import { isAstraEndpoint } from "../../astra/connection.js";
import { html } from "../cors.js";
import { nowSeconds, open, seal } from "../crypto.js";
import { isMetadataClientId, resolveMetadataClient } from "./cimd.js";
import { resourceUrl } from "./metadata.js";
import { renderAuthorizePage } from "./page.js";
import {
  CODE_TTL, type ClientRegistration, type CodeToken, type OAuthDeps, type ResolvedClient, SCOPE_READ, SCOPE_WRITE,
} from "./types.js";

const HIDDEN = ["client_id", "redirect_uri", "state", "code_challenge", "code_challenge_method", "scope", "resource"];

export async function resolveClient(clientId: string, deps: OAuthDeps): Promise<ResolvedClient | { error: string }> {
  if (isMetadataClientId(clientId)) {
    try {
      return await resolveMetadataClient(clientId, deps.fetchClientMetadata);
    } catch (err) {
      return { error: `Could not load client metadata: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
  const registered = deps.secrets ? await open<ClientRegistration>(clientId, deps.secrets) : null;
  if (registered?.t !== "client") return { error: "Unknown client. Register via /register or use a client ID metadata document." };
  return { client_id: clientId, client_name: registered.client_name, redirect_uris: registered.redirect_uris, origin: "registered" };
}

function redirectWith(redirectUri: string, params: Record<string, string | undefined>): Response {
  const url = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  return new Response(null, { status: 302, headers: { location: url.toString(), "cache-control": "no-store" } });
}

function requestedScopes(scope: string | undefined): string[] {
  const asked = (scope ?? SCOPE_READ).split(/\s+/).filter(Boolean);
  return asked.includes(SCOPE_WRITE) ? [SCOPE_READ, SCOPE_WRITE] : [SCOPE_READ];
}

export async function handleAuthorizeGet(req: Request, deps: OAuthDeps): Promise<Response> {
  if (!deps.secrets) return html("<p>OAuth is not configured on this server.</p>", 503);
  const url = new URL(req.url);
  const issuer = url.origin;
  const p = Object.fromEntries(url.searchParams.entries());
  const client = p.client_id ? await resolveClient(p.client_id, deps) : { error: "client_id is required." };
  if ("error" in client) return html(`<p>${client.error}</p>`, 400);
  if (!p.redirect_uri || !client.redirect_uris.includes(p.redirect_uri)) {
    return html("<p>redirect_uri does not match the client's registered redirect URIs.</p>", 400);
  }
  const fail = (error: string, description: string) =>
    redirectWith(p.redirect_uri, { error, error_description: description, state: p.state, iss: issuer });
  if (p.response_type !== "code") return fail("unsupported_response_type", "Only response_type=code is supported.");
  if (!p.code_challenge || (p.code_challenge_method ?? "S256") !== "S256") return fail("invalid_request", "PKCE with S256 is required.");
  if (p.resource && p.resource !== resourceUrl(issuer)) return fail("invalid_target", `Unknown resource; expected ${resourceUrl(issuer)}.`);

  const hidden: Record<string, string> = {};
  for (const key of HIDDEN) if (p[key]) hidden[key] = p[key];
  return html(renderAuthorizePage({
    client,
    hidden,
    writesRequested: requestedScopes(p.scope).includes(SCOPE_WRITE),
  }));
}

export async function handleAuthorizePost(req: Request, deps: OAuthDeps): Promise<Response> {
  if (!deps.secrets) return html("<p>OAuth is not configured on this server.</p>", 503);
  const issuer = new URL(req.url).origin;
  const p = Object.fromEntries(new URLSearchParams(await req.text()).entries());
  const client = p.client_id ? await resolveClient(p.client_id, deps) : { error: "client_id is required." };
  if ("error" in client) return html(`<p>${client.error}</p>`, 400);
  if (!p.redirect_uri || !client.redirect_uris.includes(p.redirect_uri)) {
    return html("<p>redirect_uri does not match the client's registered redirect URIs.</p>", 400);
  }
  const hidden: Record<string, string> = {};
  for (const key of HIDDEN) if (p[key]) hidden[key] = p[key];
  const allowWrites = p.allow_writes === "on";
  const rerender = (error: string) => html(renderAuthorizePage({
    client, hidden, error, endpoint: p.endpoint, keyspace: p.keyspace, writesRequested: allowWrites,
  }), 400);

  if (p.action === "deny") return redirectWith(p.redirect_uri, { error: "access_denied", error_description: "The user denied access.", state: p.state, iss: issuer });
  if (!p.code_challenge) return rerender("Missing PKCE challenge — restart the connection from your client.");

  const token = (p.token ?? "").trim();
  if (!/^AstraCS:\S{8,}$/.test(token)) return rerender("That does not look like an Astra application token (AstraCS:…).");
  const endpointInput = (p.endpoint ?? "").trim();
  let endpoint: string | undefined;
  if (endpointInput) {
    try {
      const u = new URL(endpointInput);
      if (!isAstraEndpoint(u.origin)) return rerender("Enter your database's Data API endpoint: https://<database-id>-<region>.apps.astra.datastax.com.");
      endpoint = u.origin;
    } catch {
      return rerender("Enter the full Data API endpoint URL, or leave it empty to pick your only database.");
    }
  }
  const creds = { token, endpoint, keyspace: (p.keyspace ?? "").trim() || undefined };
  const problem = await deps.verify(creds).catch((err: unknown) => (err instanceof Error ? err.message : String(err)));
  if (problem) return rerender(problem);

  const now = deps.now?.() ?? nowSeconds();
  const code: CodeToken = {
    t: "code",
    grant: {
      creds,
      scope: allowWrites ? [SCOPE_READ, SCOPE_WRITE] : [SCOPE_READ],
      client_id: client.client_id,
      aud: resourceUrl(issuer),
    },
    redirect_uri: p.redirect_uri,
    code_challenge: p.code_challenge,
    exp: now + CODE_TTL,
  };
  return redirectWith(p.redirect_uri, { code: await seal(code, deps.secrets), state: p.state, iss: issuer });
}
