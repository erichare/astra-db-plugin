import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { AstraConnections } from "../src/astra/connection.js";
import type { CredentialProvider, ResolvedCredentials } from "../src/credentials/resolver.js";
import { createAstraServer } from "../src/server/factory.js";
import { type FakeState, createFakeState, fakeGateway } from "./fake.js";

export const TOKEN = "AstraCS:testtesttest:0123456789abcdef0123456789abcdef";
export const ENDPOINT = "https://11111111-1111-1111-1111-111111111111-us-east-2.apps.astra.datastax.com";

export function credentials(overrides: Partial<ResolvedCredentials> = {}): CredentialProvider {
  return {
    resolve: () => ({
      token: { value: TOKEN, source: "env", detail: "ASTRA_DB_APPLICATION_TOKEN" },
      endpoint: { value: ENDPOINT, source: "dotenv", detail: "/repo/.env" },
      environment: "astra",
      astraEnv: "prod",
      readOnly: false,
      consulted: ["/repo/.env"],
      ...overrides,
    }),
  };
}

export interface Setup {
  client: Client;
  state: FakeState;
  connections: AstraConnections;
  htmlDir: string;
}

export async function setup(options: {
  creds?: Partial<ResolvedCredentials>;
  allowWrites?: boolean;
  elicit?: (params: Record<string, unknown>) => Record<string, unknown>;
} = {}): Promise<Setup> {
  const state = createFakeState();
  const connections = new AstraConnections(credentials(options.creds), fakeGateway(state));
  const htmlDir = mkdtempSync(join(tmpdir(), "astra-html-"));
  const server = createAstraServer({ connections, mode: "stdio", allowWrites: options.allowWrites ?? true, htmlDir });
  const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
  await server.connect(serverSide);
  const client = new Client({ name: "test", version: "1" }, { capabilities: options.elicit ? { elicitation: { form: {} } } : {} });
  if (options.elicit) {
    const elicit = options.elicit;
    client.setRequestHandler("elicitation/create", async (request) => elicit(request.params as Record<string, unknown>) as never);
  }
  await client.connect(clientSide);
  return { client, state, connections, htmlDir };
}

export interface ToolCall {
  isError: boolean;
  text: string;
  data: Record<string, unknown>;
  content: { type: string; text?: string; uri?: string }[];
}

export async function call(client: Client, name: string, args: Record<string, unknown> = {}): Promise<ToolCall> {
  const result = await client.callTool({ name, arguments: args }) as {
    isError?: boolean; content: { type: string; text?: string; uri?: string }[]; structuredContent?: Record<string, unknown>;
  };
  return {
    isError: Boolean(result.isError),
    text: result.content.filter((c) => c.type === "text").map((c) => c.text).join("\n"),
    data: result.structuredContent ?? {},
    content: result.content,
  };
}
