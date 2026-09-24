/**
 * Hosted Streamable HTTP endpoint (Vercel): authenticate, then serve the same
 * server factory as stdio through SDK v2's stateless createMcpHandler.
 *
 * Auth, either:
 *  - an OAuth access token issued by this server (sealed grant: credentials + scopes), or
 *  - `Authorization: Bearer <AstraCS token>` + `X-Astra-Endpoint` (or ?endpoint=); writes
 *    only with `X-Astra-Allow-Writes: true`.
 */
import { type AuthInfo, createMcpHandler } from "@modelcontextprotocol/server";
import { AstraConnections, isAstraEndpoint } from "../astra/connection.js";
import { type AstraGateway, createGateway } from "../astra/gateway.js";
import { StaticCredentials } from "../credentials/resolver.js";
import { createAstraServer } from "../server/factory.js";
import { VERSION } from "../version.js";
import { CORS_HEADERS, json, withCors } from "./cors.js";
import { type Secrets, fingerprint, isSealedToken, secretsFromEnv } from "./crypto.js";
import { resourceUrl, wwwAuthenticate } from "./oauth/metadata.js";
import { grantFromAccessToken } from "./oauth/token.js";
import { type AstraGrantCreds, SCOPE_READ, SCOPE_WRITE } from "./oauth/types.js";

export const ENDPOINT_HEADER = "x-astra-endpoint";

export interface HttpDeps {
  secrets?: Secrets;
  gateway?: AstraGateway;
  now?: () => number;
}

interface Authenticated {
  creds: AstraGrantCreds;
  scopes: string[];
  clientId: string;
}

/** Raw bearer mode: the caller brings its Astra token and endpoint on every request. */
export function credentialsFromRequest(req: Request): Authenticated | null {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token || isSealedToken(token)) return null;
  const url = new URL(req.url);
  const endpoint = req.headers.get(ENDPOINT_HEADER) ?? url.searchParams.get("endpoint") ?? undefined;
  const keyspace = req.headers.get("x-astra-keyspace") ?? url.searchParams.get("keyspace") ?? undefined;
  const writes = (req.headers.get("x-astra-allow-writes") ?? "").toLowerCase() === "true";
  return {
    creds: { token, endpoint: endpoint || undefined, keyspace: keyspace || undefined },
    scopes: writes ? [SCOPE_READ, SCOPE_WRITE] : [SCOPE_READ],
    clientId: "bearer",
  };
}

function unauthorized(origin: string, description?: string): Response {
  return json({
    error: "unauthorized",
    message: description ?? "Authenticate with OAuth (see /.well-known/oauth-protected-resource), or send Authorization: Bearer <Astra token> plus X-Astra-Endpoint.",
  }, 401, { "www-authenticate": wwwAuthenticate(origin, description ? "invalid_token" : undefined, description) });
}

/** Warm serverless instances keep DevOps/schema caches per credential set (bounded, per handler). */
function connectionPool(gateway: AstraGateway) {
  const pool = new Map<string, AstraConnections>();
  return async (auth: Authenticated): Promise<AstraConnections> => {
    const key = await fingerprint(`${auth.creds.token}|${auth.creds.endpoint ?? ""}|${auth.creds.keyspace ?? ""}`);
    let connections = pool.get(key);
    if (!connections) {
      connections = new AstraConnections(new StaticCredentials(auth.creds), gateway);
      if (pool.size >= 100) pool.delete(pool.keys().next().value as string);
      pool.set(key, connections);
    }
    return connections;
  };
}

export function createHttpHandler(deps: HttpDeps = {}) {
  const secrets = deps.secrets ?? secretsFromEnv();
  const gateway = deps.gateway ?? createGateway(VERSION, { devopsUrl: process.env.ASTRA_MCP_DEVOPS_URL });
  const connectionsFor = connectionPool(gateway);
  const mcp = createMcpHandler(async ({ authInfo }) => {
    const auth = authInfo?.extra?.astra as Authenticated;
    return createAstraServer({
      connections: await connectionsFor(auth),
      mode: "http",
      allowWrites: auth.scopes.includes(SCOPE_WRITE),
    });
  }, { legacy: "stateless", responseMode: "json" });

  return async function handleMcpRequest(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    const origin = new URL(req.url).origin;
    const bearer = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();

    let auth: Authenticated | null = null;
    if (bearer && isSealedToken(bearer)) {
      const grant = await grantFromAccessToken(bearer, { secrets, now: deps.now }, resourceUrl(origin));
      if (!grant) return unauthorized(origin, "The access token is invalid or expired; re-authorize.");
      auth = { creds: grant.creds, scopes: grant.scope, clientId: grant.client_id };
    } else {
      auth = credentialsFromRequest(req);
    }
    if (!auth) return unauthorized(origin);
    // The server calls this endpoint with the caller's token: only Astra's own hosts, never an arbitrary URL.
    if (auth.creds.endpoint && !isAstraEndpoint(auth.creds.endpoint)) {
      return json({
        error: "invalid_request",
        message: "The endpoint must be an Astra Data API endpoint (https://<database-id>-<region>.apps.astra.datastax.com).",
      }, 400);
    }

    const authInfo: AuthInfo = {
      token: bearer,
      clientId: auth.clientId,
      scopes: auth.scopes,
      resource: new URL(resourceUrl(origin)),
      extra: { astra: auth },
    };
    return withCors(await mcp.fetch(req, { authInfo }));
  };
}
