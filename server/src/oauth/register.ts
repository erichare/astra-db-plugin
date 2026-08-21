import { nowSeconds, seal } from "./crypto.js";
import { json, oauthError, SCOPE, type ClientToken, type OAuthDeps } from "./types.js";

/** RFC 7591 dynamic client registration — stateless: the client_id is the sealed registration. */
export async function handleRegister(req: Request, deps: OAuthDeps): Promise<Response> {
  if (!deps.secret) return oauthError("temporarily_unavailable", "OAuth is not configured on this server.", 503);
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return oauthError("invalid_client_metadata", "Body must be JSON.");
  }
  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((u): u is string => typeof u === "string") : [];
  if (redirectUris.length === 0) return oauthError("invalid_redirect_uri", "redirect_uris is required.");
  for (const uri of redirectUris) {
    let parsed: URL;
    try {
      parsed = new URL(uri);
    } catch {
      return oauthError("invalid_redirect_uri", `Not a URL: ${uri}`);
    }
    const isLoopback = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (parsed.protocol !== "https:" && !isLoopback) return oauthError("invalid_redirect_uri", "redirect_uris must use https (or loopback).");
  }
  const clientName = typeof body.client_name === "string" ? body.client_name.slice(0, 120) : "MCP client";
  const token: ClientToken = { t: "client", client_name: clientName, redirect_uris: redirectUris, iat: nowSeconds() };
  const clientId = await seal(token, deps.secret);
  return json(
    {
      client_id: clientId,
      client_name: clientName,
      redirect_uris: redirectUris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: SCOPE,
      client_id_issued_at: token.iat,
    },
    201,
  );
}
