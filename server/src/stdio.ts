import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { credentialsFromEnv } from "./core/client.js";
import { registerAstraWidgetTools, registerWidgetResources } from "./core/tools.js";

export const SERVER_INFO = { name: "astra-widgets", version: "1.2.0" };

async function main(): Promise<void> {
  const server = new McpServer(SERVER_INFO);
  registerAstraWidgetTools(server, { resolveCredentials: () => credentialsFromEnv() });
  registerWidgetResources(server);
  await server.connect(new StdioServerTransport());
}

main().catch((err) => {
  process.stderr.write(`astra-widgets: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
