/**
 * Offline search over the Data API example library bundled from
 * skills/astra-toolkit (examples.json, generated at build time), so hosts
 * without skills (claude.ai, ChatGPT, Cursor…) still get canonical client code.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExamplesResultT } from "../server/schemas.js";

export interface ExampleEntry {
  language: string;
  file: string;
  category: string;
  operation: string;
  variant: string;
  content: string;
}

const SYNONYMS: Record<string, string[]> = {
  search: ["find", "vector", "vectorize", "similarity"],
  similar: ["vector", "vectorize", "similarity"],
  similarity: ["vector", "vectorize", "similarity"],
  semantic: ["vectorize", "vector"],
  embed: ["vectorize"],
  embedding: ["vectorize", "vector"],
  embeddings: ["vectorize", "vector"],
  query: ["find"],
  get: ["find", "get"],
  read: ["find"],
  fetch: ["find"],
  add: ["insert"],
  write: ["insert"],
  save: ["insert"],
  remove: ["delete"],
  modify: ["update"],
  upsert: ["upsert", "update", "replace"],
  hybrid: ["hybrid", "rerank"],
  rerank: ["rerank"],
  bm25: ["lexical"],
  keyword: ["lexical"],
  text: ["lexical", "text"],
  paginate: ["iterate", "skip", "limit"],
  pagination: ["iterate", "skip", "limit"],
  connect: ["client", "database", "token"],
  connection: ["client", "database", "token"],
  auth: ["token", "client"],
  collection: ["collections"],
  table: ["tables"],
  row: ["tables"],
  rows: ["tables"],
  document: ["collections"],
  documents: ["collections"],
  schema: ["create", "alter", "definition"],
  database: ["admin", "database"],
  keyspace: ["keyspace"],
  count: ["count"],
  distinct: ["distinct"],
};

const STOP = new Set(["a", "an", "the", "to", "with", "and", "or", "of", "in", "on", "for", "by", "how", "do", "i", "my", "using", "use", "from", "into", "that", "is"]);

export function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t && !STOP.has(t));
}

function expand(tokens: string[]): Map<string, number> {
  const weights = new Map<string, number>();
  const bump = (token: string, weight: number) => weights.set(token, Math.max(weights.get(token) ?? 0, weight));
  for (const token of tokens) {
    bump(token, 1);
    const stem = token.replace(/(ing|es|s)$/, "");
    if (stem.length > 2 && stem !== token) bump(stem, 0.8);
    const aliases = SYNONYMS[token] ?? SYNONYMS[stem] ?? [];
    for (const alias of aliases) bump(alias, aliases.length > 3 ? 0.4 : 0.6);
  }
  return weights;
}

const ADVANCED = /(^|-)(rerank|hybrid|lexical)(-|$)/;
const ADVANCED_ASK = /hybrid|rerank|lexical|bm25|keyword/;
const READ_ASK = /search|find|query|get|read|fetch|similar|lookup|retriev/;
const WRITE_OP = /(^|-)(insert|update|replace|delete|drop|create|alter|migrate)(-|$)/;
const WRITE_ASK = /insert|update|replace|delete|drop|create|alter|add|write|save|remove|modify|upsert|schema|migrat|new/;

export function rank(entries: ExampleEntry[], language: string, query: string, limit: number) {
  const tokens = tokenize(query);
  const weights = expand(tokens);
  const phrase = tokens.map((t) => t.replace(/(ing|es|s)$/, "")).join("-");
  const wantsAdvanced = ADVANCED_ASK.test(query.toLowerCase());
  const wantsWrite = WRITE_ASK.test(query.toLowerCase());
  const wantsRead = READ_ASK.test(query.toLowerCase());
  const scored = entries
    .filter((e) => e.language === language)
    .map((entry) => {
      const operation = new Set(entry.operation.split("-"));
      const variantTokens = entry.variant.split("-").filter(Boolean);
      const variant = new Set(variantTokens);
      const content = entry.content.toLowerCase();
      let score = 0;
      for (const [token, weight] of weights) {
        if (entry.category.startsWith(token)) score += 2 * weight;
        if (operation.has(token)) score += 5 * weight;
        if (variant.has(token)) score += 3 * weight;
        if (content.includes(token)) score += 0.5 * weight;
      }
      // "update one" should prefer update-one over find-one-and-update.
      const op = entry.operation.replace(/(ing|es|s)(?=-|$)/g, "");
      if (phrase.includes(op) && op.includes("-")) score += 4;
      // Rerank/hybrid/lexical snippets only when asked for.
      if (!wantsAdvanced && (ADVANCED.test(entry.operation) || ADVANCED.test(entry.variant))) score -= 6;
      if (wantsRead && /^(find|sort)(-|$)/.test(entry.operation)) score += 2;
      // Reads ("search", "find", "get") should not surface write snippets.
      if (!wantsWrite && WRITE_OP.test(entry.operation)) score -= 4;
      // "no-vectorize" when the query says "vectorize" is the opposite of what's wanted.
      variantTokens.forEach((t, i) => {
        if (t === "no" && variantTokens[i + 1] && weights.has(variantTokens[i + 1])) score -= 4;
      });
      // Prefer base examples over niche variants when scores tie.
      score -= variant.size * 0.1;
      if (!weights.has("escape") && variant.has("escape")) score -= 1;
      if (variant.has("2")) score -= 0.5;
      return { entry, score };
    })
    .filter((r) => r.score > 0.5)
    .sort((a, b) => b.score - a.score || a.entry.file.localeCompare(b.entry.file));
  return scored.slice(0, limit);
}

let cached: ExampleEntry[] | null | undefined;

/** Load the bundled catalog (dist/examples.json, or src/generated/examples.json in development). */
export function loadCatalog(): ExampleEntry[] | null {
  if (cached !== undefined) return cached;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    process.env.ASTRA_MCP_EXAMPLES,
    join(here, "examples.json"),
    join(here, "..", "generated", "examples.json"),
  ].filter((p): p is string => Boolean(p));
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    try {
      cached = JSON.parse(readFileSync(path, "utf8")) as ExampleEntry[];
      return cached;
    } catch {
      // fall through to the next candidate
    }
  }
  cached = null;
  return cached;
}

export function searchExamples(
  catalog: ExampleEntry[],
  args: { language: string; query: string; limit: number; mode: "content" | "list" },
): ExamplesResultT {
  const results = rank(catalog, args.language, args.query, args.limit);
  return {
    view: "examples",
    language: args.language,
    query: args.query,
    results: results.map(({ entry, score }) => ({
      file: entry.file,
      operation: `${entry.category}-${entry.operation}${entry.variant ? ` (${entry.variant})` : ""}`,
      score: Math.round(score * 10) / 10,
      ...(args.mode === "content" ? { content: entry.content } : {}),
    })),
    indexFile: `skills/astra-toolkit/clients/${args.language}/INDEX.md`,
  };
}
