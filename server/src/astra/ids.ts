/**
 * Document `_id` handling. Collections can use typed default ids (uuid,
 * uuidv6/7, objectId); a plain string filter misses those, so lookups coerce
 * by the collection's `defaultId` type or, failing that, by shape.
 */
import { oid, uuid } from "@datastax/astra-db-ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OBJECT_ID = /^[0-9a-f]{24}$/i;

export type IdType = "auto" | "string" | "uuid" | "objectId";

/** Accepts "abc", {"$uuid": "…"}, {"$objectId": "…"}; returns what to put in a filter. */
export function coerceId(raw: unknown, idType: IdType = "auto", defaultIdType?: string | null): unknown {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.$uuid === "string") return uuid(obj.$uuid);
    if (typeof obj.$objectId === "string") return oid(obj.$objectId);
    return raw;
  }
  if (typeof raw !== "string") return raw;
  const effective = idType === "auto" ? inferType(defaultIdType) : idType;
  if (effective === "uuid" && UUID.test(raw)) return uuid(raw);
  if (effective === "objectId" && OBJECT_ID.test(raw)) return oid(raw);
  return raw;
}

function inferType(defaultIdType?: string | null): IdType {
  if (defaultIdType) {
    if (defaultIdType.startsWith("uuid")) return "uuid";
    if (defaultIdType === "objectId") return "objectId";
    return "string";
  }
  return "string";
}

/** Alternative typed forms of a string id to retry with when the first lookup misses. */
export function alternativeIds(raw: unknown): unknown[] {
  if (typeof raw !== "string") return [];
  if (UUID.test(raw)) return [uuid(raw)];
  if (OBJECT_ID.test(raw)) return [oid(raw)];
  return [];
}

/** A stable display/string form for any id (typed ids, primary-key objects). */
export function idToString(id: unknown): string {
  if (typeof id === "string") return id;
  if (id == null) return "";
  if (typeof id === "object") {
    const ctor = (id as { constructor?: { name?: string } }).constructor?.name;
    if (ctor && ctor !== "Object" && typeof (id as { toString?: unknown }).toString === "function") return String(id);
    return JSON.stringify(id);
  }
  return String(id);
}
