/**
 * Standalone HTML fallback for terminal-only hosts: the app shell with the
 * tool result inlined (window.__ASTRA_DATA__), written to a private temp dir.
 */
import { chmodSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { APP_HTML } from "../generated/ui.js";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_FILES = 50;

export function defaultHtmlDir(): string {
  return join(tmpdir(), "astra-mcp");
}

/** The app shell with data inlined; `</` and `<!--` escaped so the payload cannot break out of the script tag. */
export function renderStandalone(data: unknown): string {
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  return APP_HTML.replace("<body>", `<body>\n<script>window.__ASTRA_DATA__ = ${payload};</script>`);
}

function prune(dir: string, now: number): void {
  let files: { path: string; mtime: number }[] = [];
  try {
    files = readdirSync(dir)
      .filter((name) => name.endsWith(".html"))
      .map((name) => ({ path: join(dir, name), mtime: statSync(join(dir, name)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
  } catch {
    return;
  }
  files.forEach((file, index) => {
    if (index >= MAX_FILES || now - file.mtime > MAX_AGE_MS) {
      try {
        unlinkSync(file.path);
      } catch {
        // already gone
      }
    }
  });
}

export function writeHtmlFile(view: string, data: unknown, dir = defaultHtmlDir(), now = Date.now()): string {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  try {
    chmodSync(dir, 0o700);
  } catch {
    // not ours / Windows
  }
  prune(dir, now);
  const stamp = new Date(now).toISOString().replace(/[:.]/g, "-");
  const path = join(dir, `${view}-${stamp}.html`);
  writeFileSync(path, renderStandalone(data), { encoding: "utf8", mode: 0o600 });
  return path;
}
