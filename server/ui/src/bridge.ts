/**
 * A small MCP Apps (protocol 2026-01-26) client over postMessage — wire-compatible
 * with @modelcontextprotocol/ext-apps' App, without bundling zod and the full MCP
 * client (≈600 KB) into every view. Tested against the official AppBridge host.
 */

export const PROTOCOL_VERSION = "2026-01-26";

export interface ToolResult {
  content?: { type: string; text?: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
}

export interface HostContext {
  theme?: "light" | "dark";
  styles?: { variables?: Record<string, string | undefined>; css?: { fonts?: string } };
  displayMode?: "inline" | "fullscreen" | "pip";
  availableDisplayModes?: ("inline" | "fullscreen" | "pip")[];
  locale?: string;
  [key: string]: unknown;
}

export interface HostCapabilities {
  openLinks?: unknown;
  serverTools?: unknown;
  updateModelContext?: unknown;
  message?: unknown;
  [key: string]: unknown;
}

export interface BridgeHandlers {
  onToolInput?: (args: Record<string, unknown> | undefined) => void;
  onToolResult?: (result: ToolResult) => void;
  onToolCancelled?: (reason?: string) => void;
  onHostContextChanged?: (context: HostContext) => void;
  onTeardown?: () => void;
}

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

type Message = {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: Record<string, unknown>;
  result?: unknown;
  error?: { code: number; message: string };
};

export class AppBridge {
  hostContext: HostContext = {};
  hostCapabilities: HostCapabilities = {};
  private nextId = 1;
  private readonly pending = new Map<number | string, Pending>();
  private resizeObserver?: ResizeObserver;
  private lastSize = { width: 0, height: 0 };

  constructor(
    private readonly handlers: BridgeHandlers,
    private readonly target: Window = window.parent,
    private readonly appInfo = { name: "astra-db", version: "2" },
  ) {}

  /** Handshake with the host. Rejects if no host answers (e.g. opened as a plain file). */
  async connect(timeoutMs = 5000): Promise<void> {
    window.addEventListener("message", this.onMessage);
    const result = await this.request("ui/initialize", {
      appInfo: this.appInfo,
      appCapabilities: { availableDisplayModes: ["inline", "fullscreen"] },
      protocolVersion: PROTOCOL_VERSION,
    }, timeoutMs) as { hostContext?: HostContext; hostCapabilities?: HostCapabilities };
    this.hostContext = result?.hostContext ?? {};
    this.hostCapabilities = result?.hostCapabilities ?? {};
    this.notify("ui/notifications/initialized", {});
    this.observeSize();
  }

  callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    return this.request("tools/call", { name, arguments: args }, 120_000) as Promise<ToolResult>;
  }

  updateModelContext(text: string, structuredContent?: Record<string, unknown>): Promise<unknown> {
    return this.request("ui/update-model-context", { content: [{ type: "text", text }], ...(structuredContent ? { structuredContent } : {}) });
  }

  openLink(url: string): Promise<unknown> {
    return this.request("ui/open-link", { url });
  }

  requestDisplayMode(mode: "inline" | "fullscreen"): Promise<{ mode?: string }> {
    return this.request("ui/request-display-mode", { mode }) as Promise<{ mode?: string }>;
  }

  sendMessage(text: string): Promise<unknown> {
    return this.request("ui/message", { role: "user", content: [{ type: "text", text }] });
  }

  /** Report content size now (also done automatically on every layout change). */
  reportSize(): void {
    const root = document.documentElement;
    const previous = root.style.height;
    root.style.height = "max-content";
    const height = Math.ceil(root.getBoundingClientRect().height);
    root.style.height = previous;
    const width = Math.ceil(window.innerWidth);
    if (width === this.lastSize.width && height === this.lastSize.height) return;
    this.lastSize = { width, height };
    this.notify("ui/notifications/size-changed", { width, height });
  }

  private observeSize(): void {
    if (typeof ResizeObserver === "undefined") return;
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        this.reportSize();
      });
    };
    this.resizeObserver = new ResizeObserver(schedule);
    this.resizeObserver.observe(document.documentElement);
    this.resizeObserver.observe(document.body);
    schedule();
  }

  private post(message: Message): void {
    this.target.postMessage(message, "*");
  }

  private notify(method: string, params: Record<string, unknown>): void {
    this.post({ jsonrpc: "2.0", method, params });
  }

  private request(method: string, params: Record<string, unknown>, timeoutMs = 30_000): Promise<unknown> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${method} timed out`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.post({ jsonrpc: "2.0", id, method, params });
    });
  }

  private readonly onMessage = (event: MessageEvent): void => {
    // Only the embedding host may talk to us.
    if (event.source !== this.target) return;
    const msg = event.data as Message;
    if (msg?.jsonrpc !== "2.0") return;

    if (msg.id !== undefined && !msg.method) {
      const waiter = this.pending.get(msg.id);
      if (!waiter) return;
      this.pending.delete(msg.id);
      clearTimeout(waiter.timer);
      if (msg.error) waiter.reject(new Error(msg.error.message));
      else waiter.resolve(msg.result);
      return;
    }

    const params = msg.params ?? {};
    switch (msg.method) {
      case "ui/notifications/tool-input":
        this.handlers.onToolInput?.(params.arguments as Record<string, unknown> | undefined);
        break;
      case "ui/notifications/tool-result":
        this.handlers.onToolResult?.(params as ToolResult);
        break;
      case "ui/notifications/tool-cancelled":
        this.handlers.onToolCancelled?.(params.reason as string | undefined);
        break;
      case "ui/notifications/host-context-changed":
        this.hostContext = { ...this.hostContext, ...(params as HostContext) };
        this.handlers.onHostContextChanged?.(this.hostContext);
        break;
      case "ui/resource-teardown":
        this.handlers.onTeardown?.();
        this.respond(msg.id, {});
        break;
      case "ping":
        this.respond(msg.id, {});
        break;
      default:
        if (msg.id !== undefined) {
          this.post({ jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: `Method not found: ${msg.method}` } });
        }
    }
  };

  private respond(id: number | string | undefined, result: unknown): void {
    if (id !== undefined) this.post({ jsonrpc: "2.0", id, result });
  }

  close(): void {
    window.removeEventListener("message", this.onMessage);
    this.resizeObserver?.disconnect();
    for (const waiter of this.pending.values()) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error("closed"));
    }
    this.pending.clear();
  }
}

/** Apply host theme, CSS variables, and fonts (same conventions as ext-apps' helpers). */
export function applyHostContext(context: HostContext): void {
  const root = document.documentElement;
  if (context.theme === "light" || context.theme === "dark") {
    root.setAttribute("data-theme", context.theme);
    root.style.colorScheme = context.theme;
  }
  for (const [key, value] of Object.entries(context.styles?.variables ?? {})) {
    if (value !== undefined) root.style.setProperty(key, value);
  }
  const fonts = context.styles?.css?.fonts;
  if (fonts && !document.getElementById("__mcp-host-fonts")) {
    const style = document.createElement("style");
    style.id = "__mcp-host-fonts";
    style.textContent = fonts;
    document.head.appendChild(style);
  }
}
