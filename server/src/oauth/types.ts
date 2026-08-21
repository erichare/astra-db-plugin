import type { Credentials } from "../core/client.js";

export const SCOPE = "astra:read";
export const CODE_TTL_SECONDS = 10 * 60;
export const ACCESS_TTL_SECONDS = 30 * 24 * 3600;
export const REFRESH_TTL_SECONDS = 90 * 24 * 3600;

export interface ClientToken {
  t: "client";
  client_name: string;
  redirect_uris: string[];
  iat: number;
}
export interface CodeToken {
  t: "code";
  creds: Credentials;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  exp: number;
}
export interface AccessToken {
  t: "access";
  creds: Credentials;
  exp: number;
}
export interface RefreshToken {
  t: "refresh";
  creds: Credentials;
  client_id: string;
  exp: number;
}

export interface OAuthDeps {
  /** Server secret used to seal tokens; OAuth is disabled when absent. */
  secret?: string;
  /** Verify that the supplied credentials reach Astra (throws / returns false when not). */
  verifyCredentials: (creds: Credentials) => Promise<boolean>;
  now?: () => number;
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...corsHeaders(), ...headers },
  });
}

export function oauthError(error: string, description: string, status = 400): Response {
  return json({ error, error_description: description }, status);
}

export function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, content-type, mcp-session-id, mcp-protocol-version, x-astra-endpoint, x-astra-keyspace",
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  };
}
