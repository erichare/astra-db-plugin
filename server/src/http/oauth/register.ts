/** RFC 7591 dynamic client registration — stateless: the client_id is the sealed registration. */
import { json } from "../cors.js";
import { nowSeconds, seal } from "../crypto.js";
import { type ClientRegistration, type OAuthDeps, SCOPES, oauthError } from "./types.js";

export function validRedirect(uri: string, applicationType: "web" | "native"): string | null {
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return `Not a URL: ${uri}`;
  }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol === "https:" || (parsed.protocol === "http:" && loopback)) return null;
  // Native apps may use private-use URI schemes (RFC 8252 §7.1).
  if (applicationType === "native" && /^[a-z][a-z0-9+.-]*\.[a-z0-9+.-]+:$/i.test(parsed.protocol)) return null;
  return "redirect_uris must use https (or loopback; custom schemes for native apps).";
}

export async function handleRegister(req: Request, deps: OAuthDeps): Promise<Response> {
  if (!deps.secrets) return oauthError("temporarily_unavailable", "OAuth is not configured on this server.", 503);
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return oauthError("invalid_client_metadata", "Body must be JSON.");
  }
  const applicationType = body.application_type === "native" ? "native" : "web";
  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((u): u is string => typeof u === "string") : [];
  if (!redirectUris.length) return oauthError("invalid_redirect_uri", "redirect_uris is required.");
  for (const uri of redirectUris) {
    const problem = validRedirect(uri, applicationType);
    if (problem) return oauthError("invalid_redirect_uri", problem);
  }
  const clientName = typeof body.client_name === "string" ? body.client_name.slice(0, 120) : "MCP client";
  const registration: ClientRegistration = {
    t: "client", client_name: clientName, redirect_uris: redirectUris, application_type: applicationType, iat: nowSeconds(),
  };
  return json({
    client_id: await seal(registration, deps.secrets),
    client_name: clientName,
    redirect_uris: redirectUris,
    application_type: applicationType,
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    scope: SCOPES.join(" "),
    client_id_issued_at: registration.iat,
  }, 201);
}
