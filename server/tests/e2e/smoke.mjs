// Manual smoke: spawn dist/cli.js over stdio with an SDK v2 client (both eras).
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

for (const mode of ["legacy", "auto"]) {
  const client = new Client({ name: "smoke", version: "1" }, { versionNegotiation: { mode } });
  const transport = new StdioClientTransport({ command: process.execPath, args: ["dist/cli.js"], env: { PATH: process.env.PATH, HOME: "/tmp/astra-smoke-home", ...(process.env.EXTRA ? JSON.parse(process.env.EXTRA) : {}) } });
  await client.connect(transport);
  const { tools } = await client.listTools();
  const res = await client.callTool({ name: "connection_status", arguments: {} });
  const ex = await client.callTool({ name: "code_examples", arguments: { language: "python", query: "vector search with vectorize", limit: 2, mode: "list" } });
  console.log(mode, tools.length, "tools:", tools.map((t) => t.name).join(","));
  console.log(" status:", res.content[0].text.slice(0, 160));
  console.log(" examples:", ex.content[0].text.split("\n").slice(0, 4).join(" | "));
  const { prompts } = await client.listPrompts();
  const { resources } = await client.listResources();
  console.log(" prompts:", prompts.map((p) => p.name).join(","), "resources:", resources.map((r) => r.uri).join(","));
  await client.close();
}
