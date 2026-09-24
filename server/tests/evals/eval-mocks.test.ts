/**
 * The `claude plugin eval` MCP mocks (evals/mocks/astra-db/) are the real
 * server's output against the eval world (world.ts). This test regenerates them
 * and fails when the committed copies are stale:
 *
 *   UPDATE_EVAL_MOCKS=1 npx vitest run tests/evals      # rewrite them
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { expect, test } from "vitest";
import { AstraConnections } from "../../src/astra/connection.js";
import { createAstraServer } from "../../src/server/factory.js";
import { fakeGateway } from "../fake.js";
import { TOKEN, credentials } from "../helpers.js";
import { WORLD_ENDPOINT, evalWorld } from "./world.js";

const MOCKS = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "evals", "mocks", "astra-db");
const UPDATE = process.env.UPDATE_EVAL_MOCKS === "1";

async function connect(): Promise<Client> {
  const connections = new AstraConnections(
    credentials({
      token: { value: TOKEN, source: "dotenv", detail: "/work/app/.env" },
      endpoint: { value: WORLD_ENDPOINT, source: "dotenv", detail: "/work/app/.env" },
      keyspace: { value: "default_keyspace", source: "dotenv", detail: "/work/app/.env" },
      consulted: ["/work/app/.env"],
    }),
    fakeGateway(evalWorld()),
  );
  const server = createAstraServer({ connections, mode: "stdio", allowWrites: true, htmlDir: mkdtempSync(join(tmpdir(), "astra-eval-")) });
  const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  const client = new Client({ name: "eval-mocks", version: "1" }, { capabilities: {} });
  await client.connect(clientSide);
  return client;
}

async function text(client: Client, name: string, args: Record<string, unknown>): Promise<{ text: string; isError: boolean }> {
  const result = await client.callTool({ name, arguments: args }) as { isError?: boolean; content: { type: string; text?: string }[] };
  return {
    isError: Boolean(result.isError),
    text: result.content.filter((c) => c.type === "text").map((c) => c.text).join("\n\n"),
  };
}

function frontmatter(fields: Record<string, unknown>): string {
  const lines = Object.entries(fields).map(([key, value]) => {
    if (value && typeof value === "object") {
      return `${key}:\n${Object.entries(value).map(([k, v]) => `  ${k}: ${Array.isArray(v) ? `[${v.join(", ")}]` : v}`).join("\n")}`;
    }
    return `${key}: ${value}`;
  });
  return lines.length ? `---\n${lines.join("\n")}\n---\n\n` : "";
}

async function generate(): Promise<Record<string, string>> {
  const client = await connect();
  const files: Record<string, string> = {};
  const fixed = async (tool: string, args: Record<string, unknown>, meta: Record<string, unknown> = {}) => {
    const result = await text(client, tool, args);
    files[`${tool}.md`] = `${frontmatter({ ...meta, ...(result.isError ? { error: true } : {}) })}${result.text}\n`;
  };
  // A mock keyed by one input field: each value is a fixture file.
  const keyed = async (tool: string, field: string, cases: Record<string, Record<string, unknown>>) => {
    for (const [key, args] of Object.entries(cases)) {
      files[`fixtures/${tool}/${key}.txt`] = `${(await text(client, tool, { [field]: key, ...args })).text}\n`;
    }
    files[`${tool}.md`] = `{{file:fixtures/${tool}/{input.${field}}.txt}}\n`;
  };

  await fixed("connection_status", {});
  await fixed("list_databases", {});
  await fixed("database_overview", {});
  await keyed("describe_collection", "collection", { articles: {}, orders: {}, products: {}, scratch_embeddings: {} });
  await keyed("find", "name", {
    orders: { filter: { customerId: "c-1042", status: "pending" }, sort: { createdAt: -1 }, limit: 5 },
    articles: { limit: 20 },
    products: { filter: { category: "electronics" }, limit: 20 },
  });
  await keyed("vector_search", "name", { articles: { query: "how do black holes evaporate", limit: 5 } });

  // code_examples: one fixture per language covering the eval tasks' topics.
  const topics = ["create a vector collection", "insert documents with vectorize", "vector search sort limit", "find with filter projection sort limit"];
  for (const language of ["python", "typescript", "java", "csharp", "go"]) {
    const seen = new Set<string>();
    const parts: string[] = [];
    for (const query of topics) {
      for (const block of (await text(client, "code_examples", { language, query, limit: 1 })).text.split("\n\n")) {
        if (!seen.has(block)) {
          seen.add(block);
          parts.push(block);
        }
      }
    }
    files[`fixtures/code_examples/${language}.txt`] = `${parts.join("\n\n")}\n`;
  }
  files["code_examples.md"] = "{{file:fixtures/code_examples/{input.language}.txt}}\n";

  // Destructive: the client here cannot elicit, so the server asks the model to get consent.
  await fixed("drop", { kind: "collection", name: "scratch_embeddings" }, { expect: { name: "[scratch_embeddings]" } });

  const { tools } = await client.listTools();
  const mocked = new Set(Object.keys(files).filter((f) => !f.includes("/")).map((f) => f.replace(/\.md$/, "")));
  files["_tools.json"] = `${JSON.stringify({ tools: tools.filter((t) => mocked.has(t.name)) }, null, 2)}\n`;
  await client.close();
  return files;
}

test("eval MCP mocks match the server's real output", async () => {
  const files = await generate();
  const stale: string[] = [];
  for (const [rel, content] of Object.entries(files)) {
    const path = join(MOCKS, rel);
    if (UPDATE) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
    } else if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
      stale.push(rel);
    }
  }
  expect(stale, "stale eval mocks — run: UPDATE_EVAL_MOCKS=1 npx vitest run tests/evals").toEqual([]);
});
