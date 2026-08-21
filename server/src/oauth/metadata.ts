import { json, SCOPE } from "./types.js";

export function protectedResourceMetadata(origin: string): Response {
  return json({
    resource: `${origin}/mcp`,
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: [SCOPE],
    resource_name: "Astra widgets MCP",
    resource_documentation: "https://github.com/erichare/astra-db-plugin",
  });
}

export function authorizationServerMetadata(origin: string): Response {
  return json({
    issuer: origin,
    authorization_endpoint: `${origin}/authorize`,
    token_endpoint: `${origin}/token`,
    registration_endpoint: `${origin}/register`,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [SCOPE],
    service_documentation: "https://github.com/erichare/astra-db-plugin",
  });
}

export function wwwAuthenticate(origin: string, error?: string, description?: string): string {
  const parts = [`Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource"`];
  if (error) parts.push(`error="${error}"`);
  if (description) parts.push(`error_description="${description.replace(/"/g, "'")}"`);
  return parts.join(", ");
}
