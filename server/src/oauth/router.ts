import { handleAuthorizeGet, handleAuthorizePost, handleToken } from "./authorize.js";
import { authorizationServerMetadata, protectedResourceMetadata } from "./metadata.js";
import { handleRegister } from "./register.js";
import { corsHeaders, oauthError, type OAuthDeps } from "./types.js";

export type OAuthRoute = "prm" | "as" | "authorize" | "token" | "register";

/** Route from an explicit ?route= (Vercel rewrites) or from the pathname. */
export function routeFor(req: Request): OAuthRoute | null {
  const url = new URL(req.url);
  const explicit = url.searchParams.get("route");
  if (explicit && ["prm", "as", "authorize", "token", "register"].includes(explicit)) return explicit as OAuthRoute;
  const path = url.pathname.replace(/\/+$/, "");
  if (path.startsWith("/.well-known/oauth-protected-resource")) return "prm";
  if (path === "/.well-known/oauth-authorization-server") return "as";
  if (path.endsWith("/authorize")) return "authorize";
  if (path.endsWith("/token")) return "token";
  if (path.endsWith("/register")) return "register";
  return null;
}

export async function handleOAuthRequest(req: Request, deps: OAuthDeps): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  const origin = new URL(req.url).origin;
  const route = routeFor(req);
  switch (route) {
    case "prm":
      return protectedResourceMetadata(origin);
    case "as":
      return authorizationServerMetadata(origin);
    case "register":
      return req.method === "POST" ? handleRegister(req, deps) : oauthError("invalid_request", "POST JSON to register.", 405);
    case "authorize":
      if (req.method === "GET") return handleAuthorizeGet(req, deps);
      if (req.method === "POST") return handleAuthorizePost(req, deps);
      return oauthError("invalid_request", "GET or POST.", 405);
    case "token":
      return req.method === "POST" ? handleToken(req, deps) : oauthError("invalid_request", "POST to token.", 405);
    default:
      return oauthError("not_found", "Unknown OAuth route.", 404);
  }
}
