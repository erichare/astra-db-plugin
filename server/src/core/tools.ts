import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AstraDb, Credentials } from "./client.js";
import { createDb } from "./client.js";
import { collectionCard } from "./data/card.js";
import { exploreCollection } from "./data/explore.js";
import { databaseOverview } from "./data/overview.js";
import { similaritySearch } from "./data/similarity.js";
import { AstraWidgetsError, sanitizeErrorMessage } from "./errors.js";
import {
  CollectionCardInput, ExploreCollectionInput, OverviewInput, SimilaritySearchInput,
  type WidgetName, type WidgetResult,
} from "./schemas.js";
import { cardSummary, exploreSummary, overviewSummary, similaritySummary } from "./summaries.js";
import { WIDGET_NAMES, widgetHtml, widgetResourceUri, writeHtmlFile } from "./widgets.js";

export interface ToolDeps {
  resolveCredentials: () => Credentials;
  createDb?: (creds: Credentials) => AstraDb;
  writeHtmlFile?: (widget: WidgetName, data: unknown) => string;
}

type ServerLike = Pick<McpServer, "registerTool" | "registerResource">;

function uiMeta(widget: WidgetName) {
  const resourceUri = widgetResourceUri(widget);
  return { ui: { resourceUri }, "openai/outputTemplate": resourceUri };
}

function okResult(text: string, structuredContent: WidgetResult) {
  return { content: [{ type: "text" as const, text }], structuredContent };
}

function errorResult(err: unknown) {
  const message = err instanceof AstraWidgetsError
    ? err.message
    : `Astra DB request failed: ${sanitizeErrorMessage(err instanceof Error ? err.message : String(err))}`;
  return { isError: true, content: [{ type: "text" as const, text: message }] };
}

export function registerAstraWidgetTools(server: ServerLike, deps: ToolDeps): void {
  const dbCache = new Map<string, AstraDb>();
  const makeDb = deps.createDb ?? createDb;
  const emitHtml = deps.writeHtmlFile ?? writeHtmlFile;
  const getDb = (): { db: AstraDb; creds: Credentials } => {
    const creds = deps.resolveCredentials();
    const key = `${creds.endpoint}|${creds.keyspace ?? ""}|${creds.token.slice(-8)}`;
    let db = dbCache.get(key);
    if (!db) {
      db = makeDb(creds);
      dbCache.set(key, db);
    }
    return { db, creds };
  };
  const finish = <T extends WidgetResult>(widget: WidgetName, result: T, summary: string, emit: string) => {
    if (emit === "html_file") {
      const htmlPath = emitHtml(widget, result);
      return okResult(`${summary}\nStandalone widget written to: ${htmlPath}`, { ...result, htmlPath });
    }
    return okResult(summary, result);
  };

  registerAppTool(server, "database_overview", {
    title: "Astra DB overview",
    description: "Summarize the database: keyspaces, collections (vector config, vectorize model, lexical/rerank, estimated counts) and tables. Renders the overview widget.",
    inputSchema: OverviewInput.shape,
    annotations: { readOnlyHint: true, openWorldHint: true },
    _meta: uiMeta("overview"),
  }, async (args) => {
    try {
      const input = OverviewInput.parse(args ?? {});
      const { db, creds } = getDb();
      const result = await databaseOverview(db, creds.endpoint, { maxCollections: input.maxCollections });
      return finish("overview", result, overviewSummary(result), input.emit);
    } catch (err) {
      return errorResult(err);
    }
  });

  registerAppTool(server, "collection_card", {
    title: "Astra DB collection card",
    description: "Show one collection's metadata: vector dimension/metric, vectorize model, lexical/rerank, indexing, default id, estimated count and a sample document. Renders the collection card widget.",
    inputSchema: CollectionCardInput.shape,
    annotations: { readOnlyHint: true, openWorldHint: true },
    _meta: uiMeta("collection-card"),
  }, async (args) => {
    try {
      const input = CollectionCardInput.parse(args);
      const { db } = getDb();
      const result = await collectionCard(db, input);
      return finish("collection-card", result, cardSummary(result), input.emit);
    } catch (err) {
      return errorResult(err);
    }
  });

  registerAppTool(server, "similarity_search", {
    title: "Astra DB similarity search",
    description: "Vector similarity search in a collection by natural-language query ($vectorize), by an existing document's vector (documentId), or hybrid with reranking. Returns ranked hits with $similarity scores and renders the similarity widget (ranked bars + constellation).",
    inputSchema: SimilaritySearchInput.shape,
    annotations: { readOnlyHint: true, openWorldHint: true },
    _meta: uiMeta("similarity"),
  }, async (args) => {
    try {
      const input = SimilaritySearchInput.parse(args);
      const { db } = getDb();
      const result = await similaritySearch(db, input);
      return finish("similarity", result, similaritySummary(result), input.emit);
    } catch (err) {
      return errorResult(err);
    }
  });

  registerAppTool(server, "explore_collection", {
    title: "Astra DB collection explorer",
    description: "Browse a page of documents in a collection (optionally filtered), with a field inventory and a page state for the next page. Renders the explorer widget.",
    inputSchema: ExploreCollectionInput.shape,
    annotations: { readOnlyHint: true, openWorldHint: true },
    _meta: uiMeta("explorer"),
  }, async (args) => {
    try {
      const input = ExploreCollectionInput.parse(args);
      const { db } = getDb();
      const result = await exploreCollection(db, input);
      return finish("explorer", result, exploreSummary(result), input.emit);
    } catch (err) {
      return errorResult(err);
    }
  });
}

export function registerWidgetResources(server: ServerLike): void {
  for (const widget of WIDGET_NAMES) {
    const uri = widgetResourceUri(widget);
    registerAppResource(server, `astra-widgets-${widget}`, uri, {
      title: `Astra DB ${widget} widget`,
      description: `Interactive ${widget} view for Astra DB (MCP Apps UI).`,
      mimeType: RESOURCE_MIME_TYPE,
    }, async () => ({
      contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: widgetHtml(widget) }],
    }));
  }
}
