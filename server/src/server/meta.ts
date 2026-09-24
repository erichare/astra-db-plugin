import type { ToolAnnotations } from "@modelcontextprotocol/server";

/** The single MCP Apps UI resource; every visual tool renders into it by `view`. */
export const APP_URI = "ui://astra-db/app.html";

/** Original neutral glyph (database + constellation), not a vendor mark. */
export const ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#5B21B6"/></linearGradient></defs>' +
  '<rect width="64" height="64" rx="14" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round">' +
  '<ellipse cx="27" cy="19" rx="13" ry="5"/><path d="M14 19v22c0 2.8 5.8 5 13 5s13-2.2 13-5V19"/><path d="M14 30c0 2.8 5.8 5 13 5s13-2.2 13-5"/></g>' +
  '<path d="M47 39 52 26M47 39l-4 11" stroke="#fff" stroke-width="1.6" opacity=".75"/>' +
  '<g fill="#fff"><circle cx="47" cy="39" r="3.2"/><circle cx="52" cy="26" r="2.2"/><circle cx="43" cy="50" r="2.2"/></g></svg>';

export const ICONS = [
  { src: `data:image/svg+xml;base64,${Buffer.from(ICON_SVG).toString("base64")}`, mimeType: "image/svg+xml", sizes: ["any"] },
];

export const READ: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
export const OFFLINE_READ: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
export const INSERT: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
export const UPDATE: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };
export const DELETE: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true };
export const DDL: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true };

/** Tool `_meta` linking a tool to the app shell (MCP Apps; `openai/outputTemplate` for older ChatGPT builds). */
export function appMeta(): Record<string, unknown> {
  return { ui: { resourceUri: APP_URI }, "openai/outputTemplate": APP_URI };
}
