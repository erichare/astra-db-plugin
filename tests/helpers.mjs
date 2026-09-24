// Shared helpers for the repo-level `node --test` suites (dependency-free).
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function read(path) {
  return readFileSync(join(REPO_ROOT, path), "utf8");
}

export function readJson(path) {
  return JSON.parse(read(path));
}

export function exists(path) {
  return existsSync(join(REPO_ROOT, path));
}

/** Top-level `key: value` pairs of a SKILL.md-style frontmatter block (nested maps become raw text). */
export function frontmatter(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---", 4);
  if (end < 0) return null;
  const fields = {};
  let current = null;
  for (const line of text.slice(4, end).split("\n")) {
    if (/^\s/.test(line) && current) {
      fields[current] += `\n${line}`;
      continue;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (!match) continue;
    current = match[1];
    fields[current] = match[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

/** Recursively list files under `dir` (relative to repo root), skipping heavy/generated dirs. */
export function walk(dir, { skip = ["node_modules", ".git", "dist", "examples"] } = {}) {
  const out = [];
  const root = join(REPO_ROOT, dir);
  if (!existsSync(root)) return out;
  const visit = (abs) => {
    for (const name of readdirSync(abs)) {
      if (skip.includes(name)) continue;
      const child = join(abs, name);
      if (statSync(child).isDirectory()) visit(child);
      else out.push(relative(REPO_ROOT, child));
    }
  };
  visit(root);
  return out;
}

/** Relative markdown link targets (`](path)`) in a document, minus anchors and URLs. */
export function relativeLinks(text) {
  const links = [];
  for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = match[1].split("#", 1)[0];
    if (!target || target.includes("://") || target.startsWith("mailto:") || target.startsWith("/")) continue;
    if (target.includes("<") || target.includes("$")) continue;
    links.push(target);
  }
  return links;
}
