// Host bridge for the widget pages — a dependency-free implementation of the MCP Apps
// postMessage dialect (spec 2026-01-26). Bundled by scripts/build.mjs and inlined.
// - MCP Apps host (Claude, ChatGPT...): receives tool results and can call tools back.
// - Standalone HTML file: data is inlined as window.__ASTRA_DATA__; actions are disabled.

type Data = Record<string, unknown>;
type JsonRpcId = number | string;
interface JsonRpcMessage {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string };
}
interface ToolResultLike {
  structuredContent?: unknown;
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
}
export interface WidgetApi {
  canCall: boolean;
  callTool(name: string, args: Record<string, unknown>): Promise<Data | null>;
}
type Renderer = (data: Data, api: WidgetApi) => void;

declare global {
  interface Window {
    __ASTRA_DATA__?: Data;
    AstraBridge: { mount: (render: Renderer) => void };
  }
}

const PROTOCOL_VERSION = "2026-01-26";
const APP_INFO = { name: "astra-widgets", version: "1.2.0" };

function extractData(result: ToolResultLike): Data | null {
  if (result.structuredContent && typeof result.structuredContent === "object") return result.structuredContent as Data;
  const text = result.content?.find((c) => c.type === "text")?.text;
  if (!text) return null;
  try {
    return JSON.parse(text) as Data;
  } catch {
    return null;
  }
}

class HostBridge {
  private nextId = 1;
  private pending = new Map<JsonRpcId, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  constructor(private readonly onToolResult: (result: ToolResultLike) => void) {
    window.addEventListener("message", (event: MessageEvent) => this.onMessage(event));
  }

  private post(message: JsonRpcMessage): void {
    window.parent.postMessage(message, "*");
  }

  request(method: string, params: unknown, timeoutMs = 30000): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this.post({ jsonrpc: "2.0", id, method, params });
    });
  }

  notify(method: string, params: unknown = {}): void {
    this.post({ jsonrpc: "2.0", method, params });
  }

  private onMessage(event: MessageEvent): void {
    const msg = event.data as JsonRpcMessage | undefined;
    if (!msg || msg.jsonrpc !== "2.0") return;
    if (msg.id !== undefined && msg.method === undefined) {
      const waiter = this.pending.get(msg.id);
      if (!waiter) return;
      this.pending.delete(msg.id);
      if (msg.error) waiter.reject(new Error(msg.error.message));
      else waiter.resolve(msg.result);
      return;
    }
    if (msg.method === "ui/notifications/tool-result") {
      this.onToolResult((msg.params ?? {}) as ToolResultLike);
    } else if (msg.method === "ping" && msg.id !== undefined) {
      this.post({ jsonrpc: "2.0", id: msg.id, result: {} });
    } else if (msg.method === "ui/resource-teardown" && msg.id !== undefined) {
      this.post({ jsonrpc: "2.0", id: msg.id, result: {} });
    }
  }

  async connect(): Promise<void> {
    await this.request("ui/initialize", { appInfo: APP_INFO, appCapabilities: {}, protocolVersion: PROTOCOL_VERSION });
    this.notify("ui/notifications/initialized", {});
  }

  reportSize(): void {
    const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
    this.notify("ui/notifications/size-changed", { height });
  }
}

export function mount(render: Renderer): void {
  const root = document.getElementById("root");
  if (!root) return;
  if (window.__ASTRA_DATA__) {
    render(window.__ASTRA_DATA__, { canCall: false, callTool: async () => null });
    return;
  }
  let bridge: HostBridge;
  const api: WidgetApi = {
    canCall: true,
    callTool: async (name, args) => {
      const result = (await bridge.request("tools/call", { name, arguments: args })) as ToolResultLike;
      const data = extractData(result);
      if (data) {
        render(data, api);
        bridge.reportSize();
      } else if (result?.isError) {
        root.textContent = result.content?.[0]?.text ?? "Tool call failed.";
      }
      return data;
    },
  };
  bridge = new HostBridge((result) => {
    const data = extractData(result);
    if (data) {
      render(data, api);
      bridge.reportSize();
    } else if (result.isError) {
      root.textContent = result.content?.[0]?.text ?? "Tool call failed.";
    }
  });
  bridge.connect().catch((err: unknown) => {
    root.textContent = `Widget could not connect to the host: ${err instanceof Error ? err.message : String(err)}`;
  });
}

window.AstraBridge = { mount };
