import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderStandalone, WIDGET_NAMES, widgetHtml, widgetResourceUri, writeHtmlFile } from "../src/core/widgets.js";

describe("widget html", () => {
  it("bundles every widget with shared styles, helpers, and the bridge inlined", () => {
    for (const name of WIDGET_NAMES) {
      const html = widgetHtml(name);
      expect(html).toContain("<!doctype html>");
      expect(html).toContain("--accent:#7C3AED");
      expect(html).toContain("window.AstraUI");
      expect(html).toContain("AstraBridge");
      expect(html).not.toMatch(/\/\*@(shared-css|shared-js|bridge)\*\//);
      // zero external resource loads (CSP-free): no remote scripts/styles/fonts/fetches
      expect(html).not.toMatch(/<(script|link|img|iframe)[^>]+(src|href)=["']https?:/i);
      expect(html).not.toMatch(/@import|url\(\s*["']?https?:|fetch\(/);
    }
  });

  it("maps widget names to ui:// resource URIs", () => {
    expect(widgetResourceUri("similarity")).toBe("ui://astra-widgets/similarity.html");
  });

  it("renders standalone pages with the data inlined and script-safe", () => {
    const html = renderStandalone("overview", { widget: "overview", note: "</script><!--x" });
    expect(html).toContain("window.__ASTRA_DATA__ = ");
    expect(html).toContain("<\\/script><\\!--x");
    expect(html.indexOf("__ASTRA_DATA__")).toBeLessThan(html.indexOf("AstraBridge.mount"));
  });

  it("writes a timestamped html file", () => {
    const dir = join(tmpdir(), `astra-widgets-test-${process.pid}`);
    const path = writeHtmlFile("explorer", { widget: "explorer", documents: [] }, dir);
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, "utf8")).toContain('"widget":"explorer"');
    rmSync(dir, { recursive: true, force: true });
  });
});
