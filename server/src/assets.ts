/**
 * Plugin content bundled into the npm package at build time (dist/assets.json):
 * the skills (for Bob bundles and code_examples) and hook scripts, keyed by
 * repository-relative path, plus the example catalog.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface CatalogEntry {
  language: string;
  file: string;
  category: string;
  operation: string;
  variant: string;
}

export interface Assets {
  version: string;
  files: Record<string, string>;
  catalog: CatalogEntry[];
}

let cached: Assets | null | undefined;

export function loadAssets(): Assets | null {
  if (cached !== undefined) return cached;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [process.env.ASTRA_MCP_ASSETS, join(here, "assets.json"), join(here, "generated", "assets.json"), join(here, "..", "generated", "assets.json")]
    .filter((p): p is string => Boolean(p));
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      cached = JSON.parse(readFileSync(path, "utf8")) as Assets;
      return cached;
    } catch {
      // try the next candidate
    }
  }
  cached = null;
  return cached;
}

/** Files under a prefix, keyed by the path relative to that prefix. */
export function filesUnder(assets: Assets, prefix: string): Record<string, string> {
  const base = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return Object.fromEntries(Object.entries(assets.files).filter(([k]) => k.startsWith(base)).map(([k, v]) => [k.slice(base.length), v]));
}
