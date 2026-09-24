#!/usr/bin/env node
// Rewrite the vendored Data API examples so credentials come from the
// environment instead of "**APPLICATION_TOKEN**" / "**API_ENDPOINT**"
// placeholders. Idempotent; multi-snippet files are processed per snippet
// (split on the BOUNDARY marker lines) so each snippet stays self-contained.
//
//   node scripts/codemod-examples.mjs [--check]
//
// --check exits 1 if any file would change (CI guard against regressions).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT } from "./lib/versions.mjs";

export const TOKEN_VAR = "ASTRA_DB_APPLICATION_TOKEN";
export const ENDPOINT_VAR = "ASTRA_DB_API_ENDPOINT";
const CLIENTS = join(REPO_ROOT, "skills/astra-toolkit/clients");
const BOUNDARY = /^(?:#|\/\/) =+\s+BOUNDARY BETWEEN EXAMPLE SNIPPETS\s+=+$/;

/** Placeholder literals per language. C# has a few unstarred variants upstream. */
function placeholders(lang) {
  const base = [
    ['"**APPLICATION_TOKEN**"', TOKEN_VAR],
    ['"**API_ENDPOINT**"', ENDPOINT_VAR],
  ];
  if (lang === "csharp") base.push(['"APPLICATION_TOKEN"', TOKEN_VAR], ['"API_ENDPOINT"', ENDPOINT_VAR]);
  return base;
}

const ENV_READ = {
  python: (v) => `os.environ["${v}"]`,
  typescript: (v) => `process.env.${v}!`,
  java: (v) => `System.getenv("${v}")`,
  csharp: (v) => `System.Environment.GetEnvironmentVariable("${v}")`,
  go: (v) => `os.Getenv("${v}")`,
};

export const EXTENSIONS = { python: ".py", typescript: ".ts", java: ".java", csharp: ".cs", go: ".go" };

function ensurePythonImport(snippet) {
  if (!snippet.includes("os.environ[") || /^import os$/m.test(snippet)) return snippet;
  const lines = snippet.split("\n");
  const firstImport = lines.findIndex((line) => /^(from \S+ import |import )/.test(line));
  const at = firstImport >= 0 ? firstImport : lines.findIndex((line) => line.trim() !== "");
  lines.splice(Math.max(at, 0), 0, "import os");
  if (firstImport < 0) lines.splice(Math.max(at, 0) + 1, 0, "");
  return lines.join("\n");
}

/** Insert "os" into the standard-library group of a Go import block, keeping it sorted. */
function ensureGoImport(snippet) {
  if (!snippet.includes("os.Getenv(") || /^\s*"os"$/m.test(snippet)) return snippet;
  const single = snippet.match(/^import ("[^"]+")$/m);
  if (single) {
    return snippet.replace(single[0], `import (\n\t"os"\n\t${single[1]}\n)`);
  }
  const lines = snippet.split("\n");
  const open = lines.findIndex((line) => line === "import (");
  if (open < 0) return snippet;
  const close = lines.indexOf(")", open);
  // Standard-library imports have no dot in their first path element.
  const isStd = (line) => /^\t"[^".]+"$/.test(line) || /^\t"[^".]+\/[^"]*"$/.test(line);
  let groupStart = -1;
  let groupEnd = -1;
  for (let i = open + 1; i < close; i++) {
    if (isStd(lines[i])) {
      if (groupStart < 0) groupStart = i;
      groupEnd = i;
    } else if (groupStart >= 0) {
      break;
    }
  }
  if (groupStart < 0) {
    lines.splice(open + 1, 0, '\t"os"', "");
    return lines.join("\n");
  }
  const group = lines.slice(groupStart, groupEnd + 1);
  group.push('\t"os"');
  group.sort();
  lines.splice(groupStart, groupEnd - groupStart + 1, ...group);
  return lines.join("\n");
}

export function transformSnippet(lang, snippet) {
  let out = snippet;
  for (const [literal, variable] of placeholders(lang)) {
    out = out.split(literal).join(ENV_READ[lang](variable));
  }
  if (lang === "python") out = ensurePythonImport(out);
  if (lang === "go") out = ensureGoImport(out);
  return out;
}

/** Apply transformSnippet to each snippet of a (possibly multi-snippet) file. */
export function transformFile(lang, text) {
  const lines = text.split("\n");
  const chunks = [];
  let current = [];
  for (const line of lines) {
    if (BOUNDARY.test(line)) {
      chunks.push({ body: current.join("\n") }, { marker: line });
      current = [];
    } else {
      current.push(line);
    }
  }
  chunks.push({ body: current.join("\n") });
  return chunks.map((chunk) => (chunk.marker ?? transformSnippet(lang, chunk.body))).join("\n");
}

export function exampleFiles(lang) {
  const dir = join(CLIENTS, lang, "examples");
  return readdirSync(dir)
    .filter((name) => name.endsWith(EXTENSIONS[lang]))
    .sort()
    .map((name) => join(dir, name));
}

function main() {
  const check = process.argv.includes("--check");
  let changed = 0;
  for (const lang of Object.keys(EXTENSIONS)) {
    for (const file of exampleFiles(lang)) {
      const before = readFileSync(file, "utf8");
      const after = transformFile(lang, before);
      if (after === before) continue;
      changed += 1;
      if (check) console.error(`would rewrite ${file}`);
      else writeFileSync(file, after);
    }
  }
  console.log(`${check ? "checked" : "rewrote"}: ${changed} file(s) ${check ? "need" : "changed"} credential rewrites`);
  if (check && changed > 0) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
