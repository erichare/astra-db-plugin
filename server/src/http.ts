import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Credentials } from "./core/client.js";
import { registerAstraWidgetTools, registerWidgetResources } from "./core/tools.js";

export const SERVER_INFO = { name: "astra-widgets", version: "1.2.0" };
export const ENDPOINT_HEADER = "x-astra-endpoint";

/** Hosted mode: the caller brings its own Astra credentials on every request. */
export function credentialsFromRequest(req: Request): Credentials | null {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const url = new URL(req.url);
  const endpoint = req.headers.get(ENDPOINT_HEADER) ?? url.searchParams.get("endpoint") ?? "";
  const keyspace = req.headers.get("x-astra-keyspace") ?? url.searchParams.get("keyspace") ?? undefined;
  if (!token || !endpoint) return null;
  return { token, endpoint, keyspace: keyspace || undefined };
}

function unauthorized(): Response {
  return new Response(
    JSON.stringify({
      error: "unauthorized",
      message: "Send Authorization: Bearer <ASTRA_DB_APPLICATION_TOKEN> and the Data API endpoint via the X-Astra-Endpoint header (or ?endpoint=).",
    }),
    { status: 401, headers: { "content-type": "application/json", "www-authenticate": "Bearer" } },
  );
}

export async function handleMcpRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  const creds = credentialsFromRequest(req);
  if (!creds) return unauthorized();
  const server = new McpServer(SERVER_INFO);
  registerAstraWidgetTools(server, { resolveCredentials: () => creds });
  registerWidgetResources(server);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  const response = await transport.handleRequest(req);
  for (const [k, v] of Object.entries(corsHeaders())) response.headers.set(k, v);
  return response;
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, content-type, mcp-session-id, mcp-protocol-version, x-astra-endpoint, x-astra-keyspace",
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  };
}
