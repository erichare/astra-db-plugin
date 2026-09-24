/**
 * Make Data API values JSON-safe for tool results (and parse the extended JSON
 * a model may send back). Typed ids become {"$uuid"} / {"$objectId"}, dates
 * {"$date"}, vectors a short summary — so results round-trip into filters.
 */
import { DataAPIVector, ObjectId, UUID, oid, uuid } from "@datastax/astra-db-ts";

const MAX_DEPTH = 12;

export function toJsonSafe(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value ?? null;
  if (depth > MAX_DEPTH) return "[…]";
  if (value instanceof UUID) return { $uuid: value.toString() };
  if (value instanceof ObjectId) return { $objectId: value.toString() };
  if (value instanceof Date) return { $date: value.getTime() };
  if (value instanceof DataAPIVector) return { $vector: `[${value.length} dims]` };
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Map) return Object.fromEntries([...value].map(([k, v]) => [String(k), toJsonSafe(v, depth + 1)]));
  if (value instanceof Set) return [...value].map((v) => toJsonSafe(v, depth + 1));
  if (Array.isArray(value)) return value.map((v) => toJsonSafe(v, depth + 1));
  if (typeof value === "object") {
    const ctor = (value as { constructor?: { name?: string } }).constructor?.name;
    if (ctor && ctor !== "Object" && typeof (value as { toString?: unknown }).toString === "function") {
      const text = String(value);
      if (text !== "[object Object]") return text;
    }
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toJsonSafe(v, depth + 1)]));
  }
  return value;
}

/** Revive {"$uuid"}, {"$objectId"}, {"$date"} inside filters/documents sent by the model. */
export function fromJson(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== "object" || depth > MAX_DEPTH) return value;
  if (Array.isArray(value)) return value.map((v) => fromJson(v, depth + 1));
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    if (typeof obj.$uuid === "string") return uuid(obj.$uuid);
    if (typeof obj.$objectId === "string") return oid(obj.$objectId);
    if (typeof obj.$date === "number" || typeof obj.$date === "string") return new Date(obj.$date as number | string);
  }
  return Object.fromEntries(keys.map((k) => [k, fromJson(obj[k], depth + 1)]));
}
