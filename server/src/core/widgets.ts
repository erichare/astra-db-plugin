import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WIDGET_HTML } from "../generated/ui.js";
import type { WidgetName } from "./schemas.js";

export const WIDGET_NAMES: WidgetName[] = ["overview", "collection-card", "similarity", "explorer"];

export function widgetResourceUri(widget: WidgetName): string {
  return `ui://astra-widgets/${widget}.html`;
}

export function widgetHtml(widget: WidgetName): string {
  const html = WIDGET_HTML[widget];
  if (!html) throw new Error(`unknown widget: ${widget}`);
  return html;
}

/** Inline the data so the page renders without a host (HTML-file fallback). */
export function renderStandalone(widget: WidgetName, data: unknown): string {
  const payload = JSON.stringify(data).replace(/<\//g, "<\\/").replace(/<!--/g, "<\\!--");
  const inject = `<script>window.__ASTRA_DATA__ = ${payload};</script>`;
  return widgetHtml(widget).replace("<body>", `<body>\n${inject}`);
}

export function writeHtmlFile(widget: WidgetName, data: unknown, baseDir = join(tmpdir(), "astra-widgets")): string {
  mkdirSync(baseDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(baseDir, `${widget}-${stamp}.html`);
  writeFileSync(path, renderStandalone(widget, data), "utf8");
  return path;
}
