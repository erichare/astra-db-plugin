// Test host: the official ext-apps AppBridge embedding the real app shell in an
// iframe. Proves wire compatibility of our slim bridge and drives drill-downs.
import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";
import { VIEWS } from "../fixtures.js";

declare global {
  interface Window {
    __APP_HTML__: string;
    __THEME__: "light" | "dark";
    __log: { calls: { name: string; arguments: unknown }[]; context: unknown[]; sizes: { height?: number }[]; initialized: boolean };
    __sendResult: (view: keyof typeof VIEWS) => Promise<void>;
  }
}

const log = { calls: [] as { name: string; arguments: unknown }[], context: [] as unknown[], sizes: [] as { height?: number }[], initialized: false };
window.__log = log;

const iframe = document.createElement("iframe");
iframe.style.cssText = "width:760px;height:600px;border:0;display:block";
iframe.srcdoc = window.__APP_HTML__;
document.body.style.cssText = `margin:0;background:${window.__THEME__ === "dark" ? "#141417" : "#ffffff"}`;
document.body.appendChild(iframe);

const toolFor: Record<string, keyof typeof VIEWS> = {
  database_overview: "overview", describe_collection: "collection", describe_table: "table", find: "explorer", vector_search: "similarity",
};

iframe.addEventListener("load", async () => {
  const bridge = new AppBridge(null, { name: "harness", version: "1" }, { serverTools: {}, updateModelContext: {}, openLinks: {} }, {
    hostContext: { theme: window.__THEME__, displayMode: "inline", availableDisplayModes: ["inline", "fullscreen"] },
  });
  bridge.oncalltool = async (params) => {
    log.calls.push({ name: params.name, arguments: params.arguments });
    const view = toolFor[params.name];
    return { content: [{ type: "text", text: `${params.name} ok` }], structuredContent: VIEWS[view] as unknown as Record<string, unknown> };
  };
  bridge.onupdatemodelcontext = async (params) => {
    log.context.push(params);
    return {};
  };
  bridge.onsizechange = (params) => {
    log.sizes.push(params);
    iframe.style.height = `${Math.max(200, params.height ?? 600)}px`;
  };
  bridge.oninitialized = () => {
    log.initialized = true;
  };
  window.__sendResult = async (view) => {
    await bridge.sendToolResult({ content: [{ type: "text", text: view }], structuredContent: VIEWS[view] as unknown as Record<string, unknown> });
  };
  await bridge.connect(new PostMessageTransport(iframe.contentWindow as Window, iframe.contentWindow as Window));
});
