#!/usr/bin/env node
// Browser test of the app shell inside the official MCP Apps host bridge.
//   node tests/ui/harness/run.mjs [--screenshots <dir>]
// Requires Chromium (PLAYWRIGHT_BROWSERS_PATH or `npx playwright install chromium`).
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const shotsIdx = process.argv.indexOf("--screenshots");
const shots = shotsIdx > 0 ? process.argv[shotsIdx + 1] : null;
const generated = readFileSync(join(root, "src/generated/ui.ts"), "utf8");
const appHtml = JSON.parse(generated.slice(generated.indexOf("=") + 1).trim().replace(/;$/, ""));

const bundle = await build({
  entryPoints: [join(root, "tests/ui/harness/host.ts")], bundle: true, format: "iife", platform: "browser",
  target: "es2022", write: false, logLevel: "silent",
});
const hostJs = bundle.outputFiles[0].text;

const browser = await chromium.launch();
let failures = 0;
async function scenario(name, theme, fn) {
  const page = await browser.newPage({ viewport: { width: 760, height: 900 }, deviceScaleFactor: 2, colorScheme: theme });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body><script>window.__APP_HTML__=${JSON.stringify(appHtml).replace(/</g, "\\u003c")};window.__THEME__=${JSON.stringify(theme)};</script><script>${hostJs}</script></body></html>`);
  await page.waitForFunction(() => window.__log?.initialized === true, null, { timeout: 10_000 });
  const frame = page.frames().find((f) => f !== page.mainFrame());
  try {
    await fn(page, frame);
    assert.deepEqual(errors, [], "page errors");
    console.log(`ok - ${name} (${theme})`);
  } catch (err) {
    failures += 1;
    console.error(`not ok - ${name} (${theme}): ${err.message}`);
  }
  await page.close();
}

const shoot = async (page, frame, file) => {
  if (!shots) return;
  mkdirSync(shots, { recursive: true });
  await page.waitForTimeout(150);
  const box = await (await frame.frameElement()).boundingBox();
  await page.screenshot({ path: join(shots, file), clip: { x: 0, y: 0, width: 760, height: Math.min(box.height, 1400) } });
};

for (const theme of ["light", "dark"]) {
  await scenario("drill-down chain renders each result with its own view", theme, async (page, frame) => {
    await page.evaluate(() => window.__sendResult("overview"));
    await frame.waitForSelector('[data-view="overview"]');
    assert.equal(await frame.getAttribute("html", "data-theme"), theme);
    await shoot(page, frame, `overview-${theme}.png`);
    await frame.click('[aria-label="Open collection articles"]');
    await frame.waitForSelector('[data-view="collection"]');
    await shoot(page, frame, `card-${theme}.png`);
    await frame.click("text=Browse documents");
    await frame.waitForSelector('[data-view="explorer"]');
    await frame.focus("tr.clickable");
    await page.keyboard.press("Enter");
    await shoot(page, frame, `explorer-${theme}.png`);
    await frame.click('button[aria-label="Back"]');
    await frame.waitForSelector('[data-view="collection"]');
    await frame.fill("input[type=search]", "black holes");
    await frame.click("button[type=submit]");
    await frame.waitForSelector('[data-view="similarity"]');
    await shoot(page, frame, `similarity-${theme}.png`);
    const log = await page.evaluate(() => window.__log);
    assert.deepEqual(log.calls.map((c) => c.name), ["describe_collection", "find", "vector_search"]);
    assert.deepEqual(log.calls[2].arguments, { name: "articles", keyspace: "default_keyspace", kind: "collection", query: "black holes", hybrid: false });
    assert.ok(log.context.length >= 3, "model context updated after drill-downs");
    assert.ok(log.sizes.length > 0 && log.sizes.at(-1).height > 100, "size-changed reported");
  });

  await scenario("table view and similarity map", theme, async (page, frame) => {
    await page.evaluate(() => window.__sendResult("table"));
    await frame.waitForSelector('[data-view="table"]');
    await shoot(page, frame, `table-${theme}.png`);
    await page.evaluate(() => window.__sendResult("similarity"));
    await frame.waitForSelector('[data-view="similarity"]');
    await frame.click("button.seg >> text=Map");
    await frame.waitForSelector("svg.constellation");
    await frame.focus("circle.star");
    await page.keyboard.press("Enter");
    await frame.waitForSelector(".hit-detail-head");
    await shoot(page, frame, `constellation-${theme}.png`);
  });
}

await browser.close();
if (failures) {
  console.error(`${failures} UI scenario(s) failed`);
  process.exit(1);
}
console.log("UI harness OK");
