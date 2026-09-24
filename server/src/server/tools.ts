/** Registers the 18 Astra DB tools on an McpServer. */
import { pathToFileURL } from "node:url";
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import type { CallToolResult, McpServer, ServerContext, ToolAnnotations } from "@modelcontextprotocol/server";
import type { z } from "zod";
import type { AstraConnections, Target } from "../astra/connection.js";
import { connectionStatus, databaseOverview, describeCollection, describeTable, listDatabases } from "../astra/data/inspect.js";
import {
  createCollection, createIndex, createTable, drop, insert, isEmptyFilter, remove, update,
} from "../astra/data/mutate.js";
import { count, distinctValues, find, vectorSearch, vectorizeProviders } from "../astra/data/query.js";
import { AstraMcpError } from "../astra/errors.js";
import { type ExampleEntry, searchExamples } from "../examples/search.js";
import { writeHtmlFile } from "../widgets/html-file.js";
import { requireConfirmation } from "./confirm.js";
import { DDL, DELETE, ICONS, INSERT, OFFLINE_READ, READ, UPDATE, appMeta } from "./meta.js";
import { fail, ok } from "./results.js";
import * as S from "./schemas.js";
import * as T from "./summaries.js";

export interface ToolContext {
  server: McpServer;
  connections: AstraConnections;
  mode: "stdio" | "http";
  /** Register write/DDL tools at all (false in read-only mode or without the hosted write scope). */
  allowWrites: boolean;
  examples: () => ExampleEntry[] | null;
  htmlDir?: string;
}

type Result = Awaited<ReturnType<Parameters<McpServer["registerTool"]>[2]>>;
type Handler<I extends z.ZodObject> = (args: z.infer<I>, ctx: ServerContext) => Promise<Result>;

interface ToolSpec<I extends z.ZodObject, O extends z.ZodObject> {
  title: string;
  description: string;
  input: I;
  output: O;
  annotations: ToolAnnotations;
  app?: boolean;
  meta?: Record<string, unknown>;
  handler: Handler<I>;
}

export const WRITE_TOOLS = ["insert", "update", "delete", "create_collection", "create_table", "create_index", "drop"] as const;

export function registerTools(tc: ToolContext): string[] {
  const { server, connections } = tc;
  const stdio = tc.mode === "stdio";
  const names: string[] = [];

  const define = <I extends z.ZodObject, O extends z.ZodObject>(name: string, spec: ToolSpec<I, O>) => {
    const input = (spec.app && stdio ? spec.input.extend({ emit: S.Emit }) : spec.input) as I;
    const config = {
      title: spec.title,
      description: spec.description,
      inputSchema: input,
      outputSchema: spec.output,
      annotations: { title: spec.title, ...spec.annotations },
      icons: ICONS,
      _meta: { ...(spec.app ? appMeta() : {}), ...(spec.meta ?? {}) },
    };
    const callback = async (args: z.infer<I>, ctx: ServerContext): Promise<Result> => {
      try {
        return await spec.handler(args, ctx);
      } catch (err) {
        return fail(err);
      }
    };
    if (spec.app) registerAppTool(server, name, config as never, callback as never);
    else server.registerTool(name, config, callback as never);
    names.push(name);
  };

  /** Visual results: optionally also write the standalone HTML page (stdio only). */
  const visual = (view: string, t: { endpoint: string }, result: Record<string, unknown>, summary: string, emit?: unknown): CallToolResult => {
    const data = { ...result, endpoint: t.endpoint };
    if (emit !== "html_file") return ok(summary, data);
    const path = writeHtmlFile(view, data, tc.htmlDir);
    return ok(`${summary}\n\nInteractive view written to ${path} — open it in a browser.`, data, [
      { type: "resource_link", uri: pathToFileURL(path).href, name: `${view}.html`, mimeType: "text/html", description: "Standalone Astra DB view" },
    ]);
  };

  const target = (args: { database?: string; keyspace?: string }) => connections.target(args);
  const ensureWritable = () => {
    if (connections.resolveCredentials().readOnly) {
      throw new AstraMcpError("read_only", "The server is in read-only mode; nothing was changed.", {
        hint: "Unset ASTRA_MCP_READ_ONLY (or the plugin's read-only option) to enable writes.",
      });
    }
  };

  // ---------------------------------------------------------------- connection & discovery

  define("connection_status", {
    title: "Astra DB connection status",
    description: "Check whether Astra DB credentials are configured and working: where the token, endpoint, and keyspace come from (env, .env, plugin settings, Astra CLI), which database is targeted, and a live connectivity check. Call it first when another tool reports not_configured or an auth error.",
    input: S.ConnectionStatusInput,
    output: S.StatusResult,
    annotations: READ,
    handler: async (args) => {
      const data = await connectionStatus(connections, args.check);
      return ok(T.statusSummary(data), data);
    },
  });

  define("list_databases", {
    title: "List Astra databases",
    description: "List the Astra databases this token can access (DevOps API): name, id, status, regions with Data API endpoints, and keyspaces. Use it to choose the `database` argument of other tools.",
    input: S.ListDatabasesInput,
    output: S.DatabasesResult,
    annotations: READ,
    handler: async (args) => {
      const data = await listDatabases(connections, args.include);
      return ok(T.databasesSummary(data), data);
    },
  });

  define("database_overview", {
    title: "Astra DB overview",
    description: "Map a database: keyspaces → collections (vector dimension/metric, vectorize model, lexical/rerank, estimated counts) and tables (column and vector-column counts). Start here to see what exists. Renders an interactive overview.",
    input: S.OverviewInput,
    output: S.OverviewResult,
    annotations: READ,
    app: true,
    handler: async (args) => {
      const t = await target({ database: args.database });
      const data = await databaseOverview(t, args);
      return visual("overview", t, data, T.overviewSummary(data), (args as { emit?: string }).emit);
    },
  });

  define("describe_collection", {
    title: "Describe collection",
    description: "Show one collection's configuration and shape: vector settings, vectorize and rerank services, lexical, indexing allow/deny, default id type, estimated count, and a sample document with field types. Use before writing queries or code against it.",
    input: S.DescribeCollectionInput,
    output: S.CollectionResult,
    annotations: READ,
    app: true,
    handler: async (args) => {
      const t = await target(args);
      const data = await describeCollection(connections, t, args);
      return visual("collection", t, data, T.collectionSummary(data), (args as { emit?: string }).emit);
    },
  });

  define("describe_table", {
    title: "Describe table",
    description: "Show one table's schema: columns and types, primary key (partition and clustering columns), indexes, vector columns, and sample rows. Use before writing queries or code against it.",
    input: S.DescribeTableInput,
    output: S.TableResult,
    annotations: READ,
    app: true,
    handler: async (args) => {
      const t = await target(args);
      const data = await describeTable(connections, t, args);
      return visual("table", t, data, T.tableSummary(data), (args as { emit?: string }).emit);
    },
  });

  // ---------------------------------------------------------------- queries

  define("find", {
    title: "Find documents or rows",
    description: "Read documents (collections) or rows (tables) with an optional Data API filter, sort, and projection. Returns pages of 20 plus nextPageState for more. For similarity search use vector_search. Renders an interactive explorer.",
    input: S.FindInput,
    output: S.ExplorerResult,
    annotations: READ,
    app: true,
    handler: async (args) => {
      const t = await target(args);
      const data = await find(connections, t, args);
      return visual("explorer", t, data, T.explorerSummary(data), (args as { emit?: string }).emit);
    },
  });

  define("vector_search", {
    title: "Vector search",
    description: "Similarity search by natural-language `query` (server-side vectorize), an explicit `vector`, or `documentId` (more like this). `hybrid` combines vector and lexical (BM25) results with reranking on collections that have both. A filter narrows candidates. Returns ranked hits with similarity scores; renders an interactive results view.",
    input: S.VectorSearchInput,
    output: S.SimilarityResult,
    annotations: READ,
    app: true,
    handler: async (args) => {
      const t = await target(args);
      const data = await vectorSearch(connections, t, args);
      return visual("similarity", t, data, T.similaritySummary(data), (args as { emit?: string }).emit);
    },
  });

  define("count", {
    title: "Count documents",
    description: "Exact count of documents in a collection matching a filter, up to upperBound (Data API maximum 1000); unfiltered counts also report the estimated total.",
    input: S.CountInput,
    output: S.CountResult,
    annotations: READ,
    handler: async (args) => {
      const t = await target(args);
      const data = await count(connections, t, args);
      return ok(T.countSummary(data), data);
    },
  });

  define("distinct_values", {
    title: "Distinct values",
    description: "Distinct values of a field (dot paths allowed) across up to scanLimit documents or rows, optionally filtered — useful for discovering categories before filtering.",
    input: S.DistinctInput,
    output: S.DistinctResult,
    annotations: READ,
    handler: async (args) => {
      const t = await target(args);
      const data = await distinctValues(connections, t, args);
      return ok(T.distinctSummary(data), data);
    },
  });

  define("list_vectorize_providers", {
    title: "Vectorize providers",
    description: "List the embedding (vectorize) and reranking providers and models available to the database, with dimensions and authentication options. Use before create_collection with a vectorize service.",
    input: S.ProvidersInput,
    output: S.ProvidersResult,
    annotations: READ,
    handler: async (args) => {
      const t = await target({ database: args.database });
      const data = await vectorizeProviders(t, args.kind);
      return ok(T.providersSummary(data), data);
    },
  });

  define("code_examples", {
    title: "Data API code examples",
    description: "Canonical Data API client code for Python (astrapy), TypeScript (@datastax/astra-db-ts), Java, C#, and Go from the bundled, documentation-derived example library. Use when writing application code; snippets read ASTRA_DB_APPLICATION_TOKEN / ASTRA_DB_API_ENDPOINT from the environment.",
    input: S.CodeExamplesInput,
    output: S.ExamplesResult,
    annotations: OFFLINE_READ,
    handler: async (args) => {
      const catalog = tc.examples();
      if (!catalog) throw new AstraMcpError("unsupported_operation", "The example library is not bundled with this build.");
      const data = searchExamples(catalog, args);
      return ok(T.examplesSummary(data), data, [], false);
    },
  });

  if (!tc.allowWrites) return names;

  // ---------------------------------------------------------------- writes

  const impactCount = async (t: Target, name: string, filter: Record<string, unknown>) => {
    try {
      const coll = t.db.collection(name, { keyspace: t.keyspace });
      if (isEmptyFilter(filter)) return `~${(await coll.estimatedDocumentCount()).toLocaleString("en-US")} documents`;
      const n = await coll.countDocuments(filter, 1000).catch(() => 1000);
      return n >= 1000 ? "1,000+ matching documents" : `${n} matching document(s)`;
    } catch {
      return "an unknown number of documents";
    }
  };

  define("insert", {
    title: "Insert documents or rows",
    description: "Insert 1–1000 documents into a collection (or rows into a table), in chunks. On vectorize collections use \"$vectorize\": \"text\" to embed server-side; otherwise \"$vector\": [...] for your own embeddings. Reports inserted ids and any per-document errors.",
    input: S.InsertInput,
    output: S.MutationResult,
    annotations: INSERT,
    handler: async (args, ctx) => {
      ensureWritable();
      const t = await target(args);
      const progressToken = ctx.mcpReq._meta?.progressToken;
      const onProgress = progressToken === undefined ? undefined : async (done: number, total: number) => {
        await ctx.mcpReq.notify({ method: "notifications/progress", params: { progressToken, progress: done, total } }).catch(() => undefined);
      };
      const data = await insert(connections, t, args, onProgress);
      return ok(T.mutationSummary(data), data);
    },
  });

  define("update", {
    title: "Update documents or rows",
    description: "Update the document/row matching a filter with operators ($set, $unset, $inc, $push, …). `many` updates every match (collections only); `many` or an empty filter requires the user's confirmation. `upsert` inserts when nothing matches.",
    input: S.UpdateInput,
    output: S.MutationResult,
    annotations: UPDATE,
    handler: async (args, ctx) => {
      ensureWritable();
      const t = await target(args);
      if (args.many || isEmptyFilter(args.filter)) {
        const impact = `Updates ${await impactCount(t, args.name, args.filter)} in ${t.keyspace}.${args.name}${t.database.name ? ` (database ${t.database.name})` : ""} with ${JSON.stringify(args.update)}.`;
        const gate = requireConfirmation(server, ctx, args.confirm, { operation: "update", expected: args.name, impact, keyspace: t.keyspace, kind: "collection" });
        if (gate !== "confirmed") return gate;
      }
      const data = await update(connections, t, args);
      return ok(T.mutationSummary(data), data);
    },
  });

  define("delete", {
    title: "Delete documents or rows",
    description: "Delete the document/row matching a filter. `many` deletes every match; `many` or an empty filter requires the user's confirmation.",
    input: S.DeleteInput,
    output: S.MutationResult,
    annotations: DELETE,
    handler: async (args, ctx) => {
      ensureWritable();
      const t = await target(args);
      if (args.many || isEmptyFilter(args.filter)) {
        const impact = `Deletes ${await impactCount(t, args.name, args.filter)} from ${t.keyspace}.${args.name}${t.database.name ? ` (database ${t.database.name})` : ""}.`;
        const gate = requireConfirmation(server, ctx, args.confirm, { operation: "delete", expected: args.name, impact, keyspace: t.keyspace, kind: "collection" });
        if (gate !== "confirmed") return gate;
      }
      const data = await remove(connections, t, args);
      return ok(T.mutationSummary(data), data);
    },
  });

  define("create_collection", {
    title: "Create collection",
    description: "Create a collection: plain JSON, vector (dimension + metric), or vectorize (server-side embeddings from a provider — see list_vectorize_providers), optionally with lexical (BM25) and rerank for hybrid search, indexing allow/deny, and a default id type. Idempotent when the settings match an existing collection.",
    input: S.CreateCollectionInput,
    output: S.MutationResult,
    annotations: DDL,
    handler: async (args) => {
      ensureWritable();
      const t = await target(args);
      const data = await createCollection(connections, t, args);
      return ok(T.mutationSummary(data), data);
    },
  });

  define("create_table", {
    title: "Create table",
    description: "Create a table with typed columns (text, int, uuid, timestamp, map/list/set, vector…) and a primary key (partition columns plus optional clustering order). Then add indexes with create_index for columns you filter or vector-search on.",
    input: S.CreateTableInput,
    output: S.MutationResult,
    annotations: DDL,
    handler: async (args) => {
      ensureWritable();
      const t = await target(args);
      const data = await createTable(connections, t, args);
      return ok(T.mutationSummary(data), data);
    },
  });

  define("create_index", {
    title: "Create table index",
    description: "Create an index on a table column: regular (filtering and sorting), vector (similarity search on a vector column), or text (BM25 lexical search). Collections index fields automatically.",
    input: S.CreateIndexInput,
    output: S.MutationResult,
    annotations: DDL,
    handler: async (args) => {
      ensureWritable();
      const t = await target(args);
      const data = await createIndex(connections, t, args);
      return ok(T.mutationSummary(data), data);
    },
  });

  define("drop", {
    title: "Drop collection, table, or index",
    description: "Permanently drop a collection, a table, or a table index, with all its data. Always requires the user's explicit confirmation.",
    input: S.DropInput,
    output: S.MutationResult,
    annotations: DELETE,
    meta: { "anthropic/requiresUserInteraction": true },
    handler: async (args, ctx) => {
      ensureWritable();
      const t = await target(args);
      const size = args.kind === "collection" ? ` (${await impactCount(t, args.name, {})})` : args.kind === "table" ? " and all its rows" : "";
      const impact = `Drops ${args.kind} ${t.keyspace}.${args.name}${size}${t.database.name ? ` in database ${t.database.name}` : ""}.`;
      const gate = requireConfirmation(server, ctx, args.confirm, { operation: "drop", expected: args.name, impact, keyspace: t.keyspace, kind: args.kind });
      if (gate !== "confirmed") return gate;
      const data = await drop(connections, t, args);
      return ok(T.mutationSummary(data), data);
    },
  });

  return names;
}
