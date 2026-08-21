import type { Doc } from "./client.js";

const HIDDEN_KEYS = new Set(["_id", "$vector", "$vectorize", "$similarity", "$lexical", "$hybrid"]);
const TITLE_PRIORITY = [
  "title", "name", "headline", "subject", "label", "question",
  "text", "content", "body", "description", "summary", "abstract", "url",
];
export const DEFAULT_SNIPPET_LENGTH = 140;

export function isHiddenKey(key: string): boolean {
  return HIDDEN_KEYS.has(key);
}

/** Choose up to `max` human-meaningful fields, preferring title-like string fields. */
export function pickDisplayFields(doc: Doc, max = 3): string[] {
  const keys = Object.keys(doc).filter((k) => !isHiddenKey(k));
  const byPriority = TITLE_PRIORITY.filter((k) => keys.includes(k) && typeof doc[k] === "string");
  const otherStrings = keys.filter((k) => typeof doc[k] === "string" && !byPriority.includes(k));
  const scalars = keys.filter(
    (k) => !byPriority.includes(k) && !otherStrings.includes(k) && ["number", "boolean"].includes(typeof doc[k]),
  );
  return [...byPriority, ...otherStrings, ...scalars].slice(0, max);
}

export function snippet(value: unknown, max = DEFAULT_SNIPPET_LENGTH): string {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (text === undefined) return "";
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function valueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

export interface FieldSummary {
  name: string;
  type: string;
  present: number;
}

/** Top-level field inventory across a set of documents (hidden keys excluded). */
export function summarizeFields(docs: Doc[]): FieldSummary[] {
  const seen = new Map<string, { types: Map<string, number>; present: number }>();
  for (const doc of docs) {
    for (const [key, value] of Object.entries(doc)) {
      if (isHiddenKey(key)) continue;
      const entry = seen.get(key) ?? { types: new Map(), present: 0 };
      entry.present += 1;
      const type = valueType(value);
      entry.types.set(type, (entry.types.get(type) ?? 0) + 1);
      seen.set(key, entry);
    }
  }
  return [...seen.entries()]
    .map(([name, { types, present }]) => ({
      name,
      type: [...types.entries()].sort((a, b) => b[1] - a[1])[0][0],
      present,
    }))
    .sort((a, b) => b.present - a.present || a.name.localeCompare(b.name));
}

/** A display-safe copy of a document: hidden keys removed, long values snipped. */
export function displayDocument(doc: Doc, maxValue = 400): Doc {
  const out: Doc = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === "$vector") continue;
    out[key] = typeof value === "string" && value.length > maxValue ? snippet(value, maxValue) : value;
  }
  return out;
}
