#!/usr/bin/env node
// Build skills/astra-toolkit/clients/<language>/INDEX.md: a compact map of the
// example library (category → operation → variants) so an agent can pick the
// right file without listing ~340 names. `catalog()` is also used by the MCP
// server build to bundle examples for the `code_examples` tool.
//
//   node scripts/build-examples-index.mjs [--check]
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { EXTENSIONS, exampleFiles } from "./codemod-examples.mjs";
import { REPO_ROOT } from "./lib/versions.mjs";

export const LANGUAGE_NAMES = {
  python: "Python", typescript: "TypeScript", java: "Java", csharp: "C#", go: "Go",
};
const CATEGORY_ORDER = ["client", "admin", "collections", "tables", "vectorize"];

/** Longest dash-prefix of `tokens` shared with at least one other name (the "operation"). */
function operationOf(tokens, all) {
  for (let len = tokens.length - 1; len >= 1; len--) {
    const prefix = tokens.slice(0, len).join("-");
    const shared = all.filter((other) => other === prefix || other.startsWith(`${prefix}-`)).length;
    if (shared >= 2) return { operation: prefix, variant: tokens.slice(len).join("-") };
  }
  return { operation: tokens.join("-"), variant: "" };
}

/** Every example, parsed from its file name: <category>-<operation>[-<variant>].<ext>. */
export function catalog() {
  const entries = [];
  for (const language of Object.keys(EXTENSIONS)) {
    const names = exampleFiles(language).map((file) => basename(file, EXTENSIONS[language]));
    const byCategory = new Map();
    for (const name of names) {
      const [category, ...rest] = name.split("-");
      if (!byCategory.has(category)) byCategory.set(category, []);
      byCategory.get(category).push({ name, rest: rest.join("-") });
    }
    for (const [category, items] of byCategory) {
      const rests = items.map((item) => item.rest);
      for (const item of items) {
        const { operation, variant } = operationOf(item.rest.split("-"), rests);
        entries.push({
          language,
          category,
          operation,
          variant,
          file: `skills/astra-toolkit/clients/${language}/examples/${item.name}${EXTENSIONS[language]}`,
        });
      }
    }
  }
  return entries;
}

function renderIndex(language, entries) {
  const ext = EXTENSIONS[language];
  const lines = [
    `# ${LANGUAGE_NAMES[language]} examples index`,
    "",
    `${entries.length} snippets in [examples/](examples/). Each file is \`examples/<category>-<operation>[-<variant>]${ext}\`;`,
    "every line below is one operation followed by its variants. Snippets read credentials from",
    "`ASTRA_DB_APPLICATION_TOKEN` / `ASTRA_DB_API_ENDPOINT`; other `**PLACEHOLDERS**` are yours to fill in.",
    "Some files hold several snippets separated by a `BOUNDARY BETWEEN EXAMPLE SNIPPETS` comment.",
    "",
  ];
  const categories = [...new Set(entries.map((e) => e.category))].sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b),
  );
  for (const category of categories) {
    const inCategory = entries.filter((e) => e.category === category);
    lines.push(`## ${category} (${inCategory.length})`, "");
    const operations = new Map();
    for (const entry of inCategory) {
      if (!operations.has(entry.operation)) operations.set(entry.operation, []);
      operations.get(entry.operation).push(entry.variant);
    }
    for (const [operation, variants] of [...operations].sort(([a], [b]) => a.localeCompare(b))) {
      const named = variants.filter(Boolean).sort();
      const base = variants.includes("") ? ["(base)"] : [];
      const list = [...base, ...named];
      lines.push(`- \`${category}-${operation}\`${list.length > 1 || named.length ? `: ${list.join(", ")}` : ""}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function main() {
  const check = process.argv.includes("--check");
  const entries = catalog();
  let stale = 0;
  for (const language of Object.keys(EXTENSIONS)) {
    const path = join(REPO_ROOT, "skills/astra-toolkit/clients", language, "INDEX.md");
    const next = renderIndex(language, entries.filter((e) => e.language === language));
    let current = "";
    try {
      current = readFileSync(path, "utf8");
    } catch {}
    if (current === next) continue;
    stale += 1;
    if (check) console.error(`stale: ${path} (run node scripts/build-examples-index.mjs)`);
    else writeFileSync(path, next);
  }
  console.log(`${entries.length} examples indexed${check ? `, ${stale} stale index file(s)` : ""}`);
  if (check && stale) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
