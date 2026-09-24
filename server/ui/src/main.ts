/**
 * The Astra DB app shell: one MCP Apps resource that renders any tool result by
 * its `view`, with drill-downs that call server tools and render *their* result
 * (so an overview → collection → search chain always shows the right view),
 * Back navigation, host theming, and a standalone mode for exported HTML files.
 */
import { AppBridge, applyHostContext, type HostContext, type ToolResult } from "./bridge.js";
import type { CallOptions, ViewContext, ViewData } from "./context.js";
import { h, icon } from "./dom.js";
import { collectionView } from "./views/collection.js";
import { explorerView } from "./views/explorer.js";
import { overviewView } from "./views/overview.js";
import { similarityView } from "./views/similarity.js";
import { tableView } from "./views/table.js";

declare global {
  interface Window {
    __ASTRA_DATA__?: ViewData;
  }
}

const root = document.getElementById("app") as HTMLElement;
const history: ViewData[] = [];
let bridge: AppBridge | null = null;
let busy = false;

function titleFor(data: ViewData): { title: string; subtitle: string } {
  switch (data.view) {
    case "overview":
      return { title: data.database.name ?? "Database overview", subtitle: data.endpointHost };
    case "collection":
      return { title: data.name, subtitle: `Collection · ${data.keyspace}` };
    case "table":
      return { title: data.name, subtitle: `Table · ${data.keyspace}` };
    case "explorer":
      return { title: data.name, subtitle: `${data.kind === "table" ? "Rows" : "Documents"} · ${data.keyspace}` };
    case "similarity":
      return {
        title: data.query ? `“${data.query}”` : data.documentId ? `More like ${data.documentId}` : "Vector search",
        subtitle: `${data.mode} search · ${data.keyspace}.${data.name}`,
      };
    default:
      return { title: "Astra DB", subtitle: "" };
  }
}

function renderBody(data: ViewData, ctx: ViewContext): HTMLElement {
  switch (data.view) {
    case "overview": return overviewView(data, ctx);
    case "collection": return collectionView(data, ctx);
    case "table": return tableView(data, ctx);
    case "explorer": return explorerView(data, ctx);
    case "similarity": return similarityView(data, ctx);
    default: return h("pre", { class: "json" }, JSON.stringify(data, null, 2));
  }
}

function canFullscreen(): boolean {
  const modes = bridge?.hostContext.availableDisplayModes ?? [];
  return modes.includes("fullscreen") && bridge?.hostContext.displayMode !== "fullscreen";
}

function header(data: ViewData): HTMLElement {
  const { title, subtitle } = titleFor(data);
  return h("header", { class: "head" },
    history.length > 1
      ? h("button", { class: "icon-btn", type: "button", "aria-label": "Back", title: "Back", onclick: back }, icon("back"))
      : h("span", { class: "logo", "aria-hidden": "true" }, icon("db")),
    h("div", { class: "head-text" }, h("h1", null, title), subtitle ? h("p", null, subtitle) : null),
    canFullscreen()
      ? h("button", {
        class: "icon-btn", type: "button", "aria-label": "Expand", title: "Expand",
        onclick: () => void bridge?.requestDisplayMode("fullscreen").catch(() => undefined),
      }, icon("expand"))
      : null,
  );
}

function context(): ViewContext {
  return {
    canCall: Boolean(bridge),
    call,
  };
}

function render(): void {
  const data = history.at(-1);
  if (!data) return;
  const view = h("div", { class: "view", "data-view": data.view }, header(data), renderBody(data, context()));
  root.replaceChildren(view);
  root.setAttribute("aria-busy", "false");
}

function show(data: ViewData, reset = false): void {
  if (reset) history.length = 0;
  history.push(data);
  render();
}

function back(): void {
  if (history.length > 1) {
    history.pop();
    render();
  }
}

function banner(message: string, hint?: string): void {
  root.querySelector(".banner.danger.transient")?.remove();
  const node = h("div", { class: "banner danger transient", role: "alert" }, icon("alert"),
    h("div", null, h("strong", null, message), hint ? h("p", null, hint) : null));
  const head = root.querySelector(".head");
  if (head) head.after(node);
  else root.prepend(node);
}

function errorFrom(result: ToolResult): { message: string; hint?: string } {
  const payload = (result.structuredContent?.error ?? {}) as { message?: string; hint?: string };
  const text = result.content?.find((c) => c.type === "text")?.text;
  return { message: payload.message ?? text ?? "The request failed.", hint: payload.hint };
}

function isView(value: unknown): value is ViewData {
  const view = (value as { view?: string } | null)?.view;
  return typeof view === "string" && ["overview", "collection", "table", "explorer", "similarity"].includes(view);
}

async function call(tool: string, args: Record<string, unknown>, options: CallOptions = {}): Promise<void> {
  if (!bridge || busy) return;
  busy = true;
  root.setAttribute("aria-busy", "true");
  root.classList.add("loading");
  try {
    // Follow-ups query the database the current view came from, not the configured default.
    const endpoint = (history.at(-1) as { endpoint?: string } | undefined)?.endpoint;
    const result = await bridge.callTool(tool, endpoint && args.database === undefined ? { ...args, database: endpoint } : args);
    if (result.isError) {
      const { message, hint } = errorFrom(result);
      banner(message, hint);
      return;
    }
    const data = result.structuredContent;
    if (!isView(data)) {
      banner("This result has no visual view.");
      return;
    }
    const current = history.at(-1);
    if (options.mode === "merge" && current?.view === "explorer" && data.view === "explorer") {
      history[history.length - 1] = { ...data, documents: [...current.documents, ...data.documents] };
      render();
    } else {
      show(data);
    }
    if (options.label && bridge.hostCapabilities.updateModelContext) {
      void bridge.updateModelContext(`The user opened ${options.label} in the Astra DB view.`).catch(() => undefined);
    }
  } catch (err) {
    banner(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    root.classList.remove("loading");
    root.setAttribute("aria-busy", "false");
  }
}

function skeleton(label = "Loading…"): void {
  root.replaceChildren(h("div", { class: "skeleton", role: "status" },
    h("div", { class: "sk sk-title" }), h("div", { class: "sk-tiles" }, [1, 2, 3, 4].map(() => h("div", { class: "sk sk-tile" }))),
    h("div", { class: "sk sk-row" }), h("div", { class: "sk sk-row" }), h("div", { class: "sk sk-row" }),
    h("span", { class: "sr-only" }, label)));
  root.setAttribute("aria-busy", "true");
}

function onResult(result: ToolResult): void {
  if (result.isError) {
    const { message, hint } = errorFrom(result);
    root.replaceChildren(h("div", { class: "view" }, h("div", { class: "banner danger", role: "alert" }, icon("alert"),
      h("div", null, h("strong", null, message), hint ? h("p", null, hint) : null))));
    return;
  }
  if (isView(result.structuredContent)) show(result.structuredContent, true);
}

async function start(): Promise<void> {
  const inline = window.__ASTRA_DATA__;
  if (inline) {
    document.documentElement.classList.add("standalone");
    show(inline, true);
    return;
  }
  skeleton();
  const candidate = new AppBridge({
    onToolInput: () => {
      if (!history.length) skeleton("Running…");
    },
    onToolResult: onResult,
    onToolCancelled: () => {
      if (!history.length) root.replaceChildren(h("p", { class: "empty" }, "Cancelled."));
    },
    onHostContextChanged: (ctx: HostContext) => {
      applyHostContext(ctx);
      if (history.length) render();
    },
  });
  try {
    await candidate.connect();
    bridge = candidate;
    applyHostContext(bridge.hostContext);
    if (history.length) render();
  } catch {
    candidate.close();
    if (!history.length) root.replaceChildren(h("p", { class: "empty" }, "Waiting for data from the host…"));
  }
}

void start();
