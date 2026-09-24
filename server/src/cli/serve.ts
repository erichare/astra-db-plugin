/** `astra-mcp serve` (the default when stdin is not a terminal): the stdio MCP server. */
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { AstraConnections } from "../astra/connection.js";
import { createGateway } from "../astra/gateway.js";
import { CredentialResolver } from "../credentials/resolver.js";
import { sanitizeMessage } from "../credentials/sanitize.js";
import { createAstraServer } from "../server/factory.js";
import { VERSION } from "../version.js";

export interface ServeOptions {
  readOnly?: boolean;
}

export function serve(options: ServeOptions = {}): void {
  if (options.readOnly) process.env.ASTRA_MCP_READ_ONLY = "1";
  const resolver = new CredentialResolver();
  const connections = new AstraConnections(resolver, createGateway(VERSION, { devopsUrl: process.env.ASTRA_MCP_DEVOPS_URL }));
  const allowWrites = !resolver.resolve().readOnly;
  serveStdio(() => createAstraServer({ connections, mode: "stdio", allowWrites }), {
    onerror: (error) => process.stderr.write(`astra-mcp: ${sanitizeMessage(error.message)}\n`),
  });
}
