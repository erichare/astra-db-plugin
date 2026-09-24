/** Prompts: ready-made starting points (shown as slash commands in many hosts). */
import { type McpServer, completable } from "@modelcontextprotocol/server";
import { z } from "zod";
import type { AstraConnections } from "../astra/connection.js";

const user = (text: string) => ({ messages: [{ role: "user" as const, content: { type: "text" as const, text } }] });

export function registerPrompts(server: McpServer, connections: AstraConnections): void {
  const collectionNames = async (value: string) => {
    try {
      const t = await connections.target();
      const schema = await connections.schema(t);
      return [...schema.collections.map((c) => c.name), ...schema.tables.map((x) => x.name)].filter((n) => n.startsWith(value));
    } catch {
      return [];
    }
  };

  server.registerPrompt("overview", {
    title: "Astra DB overview",
    description: "Summarize what's in the database.",
  }, () => user("Call database_overview and give me a short summary of the database: keyspaces, the notable collections and tables, and how each is configured for search."));

  server.registerPrompt("explore", {
    title: "Explore a collection",
    description: "Describe a collection or table and browse its data.",
    argsSchema: z.object({
      name: completable(z.string().describe("Collection or table name"), collectionNames),
    }),
  }, ({ name }) => user(`Describe "${name}" (describe_collection or describe_table), then show a page of its data with find, and point out anything notable about its shape.`));

  server.registerPrompt("similar", {
    title: "Vector search",
    description: "Run a similarity search and explain the results.",
    argsSchema: z.object({
      name: completable(z.string().describe("Collection or table name"), collectionNames),
      query: z.string().describe("What to search for"),
    }),
  }, ({ name, query }) => user(`Run vector_search on "${name}" for: ${query}. Then explain briefly why the top hits match.`));

  server.registerPrompt("setup", {
    title: "Set up Astra DB",
    description: "Check the connection and walk through fixing it.",
  }, () => user("Call connection_status. If Astra DB isn't configured or the check fails, walk me through fixing it: I'll run `npx -y @erichare/astra-mcp login` in my own terminal — don't ask me to paste tokens here."));
}
