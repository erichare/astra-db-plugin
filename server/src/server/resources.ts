/**
 * Resources: the MCP Apps shell, the database list, and per-collection/table
 * schemas (with completion for keyspace and name).
 */
import { RESOURCE_MIME_TYPE, registerAppResource } from "@modelcontextprotocol/ext-apps/server";
import { type McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import type { AstraConnections } from "../astra/connection.js";
import { describeCollection, describeTable, listDatabases } from "../astra/data/inspect.js";
import { toAstraMcpError } from "../astra/errors.js";
import { APP_HTML } from "../generated/ui.js";
import { APP_URI } from "./meta.js";

const DEFAULT = "default";

function json(uri: string, data: unknown) {
  return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) }] };
}

function errorContents(uri: string, err: unknown) {
  return json(uri, { error: toAstraMcpError(err).toPayload() });
}

export function registerResources(server: McpServer, connections: AstraConnections): void {
  registerAppResource(server, "astra-db-app", APP_URI, {
    title: "Astra DB views",
    description: "Interactive views for Astra DB tool results (overview, collection, table, explorer, similarity).",
    mimeType: RESOURCE_MIME_TYPE,
    _meta: { ui: { prefersBorder: true } },
  } as never, async () => ({
    contents: [{ uri: APP_URI, mimeType: RESOURCE_MIME_TYPE, text: APP_HTML, _meta: { ui: { prefersBorder: true } } }],
  }));

  server.registerResource("databases", "astra://databases", {
    title: "Astra databases",
    description: "Databases visible to the configured token (DevOps API).",
    mimeType: "application/json",
  }, async (uri) => {
    try {
      return json(uri.href, await listDatabases(connections, "active"));
    } catch (err) {
      return errorContents(uri.href, err);
    }
  });

  const names = async (keyspace?: string) => {
    try {
      const t = await connections.target({ keyspace: keyspace && keyspace !== DEFAULT ? keyspace : undefined });
      const schema = await connections.schema(t);
      return [...schema.collections.map((c) => c.name), ...schema.tables.map((x) => x.name)];
    } catch {
      return [];
    }
  };

  server.registerResource("schema", new ResourceTemplate("astra://{database}/{keyspace}/{name}/schema", {
    list: undefined,
    complete: {
      database: async (value) => {
        try {
          const dbs = await connections.listDatabases("active");
          return [DEFAULT, ...dbs.map((d) => d.name)].filter((n) => n.startsWith(value));
        } catch {
          return [DEFAULT];
        }
      },
      keyspace: async (value) => {
        try {
          const t = await connections.target();
          const list = await t.db.admin().listKeyspaces();
          return [DEFAULT, ...list].filter((n) => n.startsWith(value));
        } catch {
          return [DEFAULT];
        }
      },
      name: async (value, context) => (await names(context?.arguments?.keyspace)).filter((n) => n.startsWith(value)),
    },
  }), {
    title: "Collection or table schema",
    description: "Configuration and shape of one collection or table. Use \"default\" for the configured database/keyspace.",
    mimeType: "application/json",
  }, async (uri, variables) => {
    const pick = (v: unknown) => {
      const value = Array.isArray(v) ? v[0] : v;
      return typeof value === "string" && value && value !== DEFAULT ? decodeURIComponent(value) : undefined;
    };
    try {
      const t = await connections.target({ database: pick(variables.database), keyspace: pick(variables.keyspace) });
      const name = pick(variables.name) ?? "";
      const kind = await connections.resolveKind(t, name);
      const data = kind.kind === "collection"
        ? await describeCollection(connections, t, { collection: name, includeSample: true })
        : await describeTable(connections, t, { table: name, includeSample: true });
      return json(uri.href, data);
    } catch (err) {
      return errorContents(uri.href, err);
    }
  });
}
