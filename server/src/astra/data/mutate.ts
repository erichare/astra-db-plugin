/** Writes and DDL. Confirmation and read-only gating happen in the tool layer. */
import type { MutationResultT } from "../../server/schemas.js";
import type { AstraConnections, Target } from "../connection.js";
import { AstraMcpError, toAstraMcpError } from "../errors.js";
import type { Doc } from "../gateway.js";
import { fromJson, toJsonSafe } from "../serialize.js";

const MAX_IDS = 50;

function result(target: Target, fields: Omit<MutationResultT, "view" | "keyspace" | "status"> & { status?: MutationResultT["status"] }): MutationResultT {
  return { view: "mutation", keyspace: target.keyspace, status: "ok", ...fields };
}

export function isEmptyFilter(filter: Doc | undefined): boolean {
  return !filter || Object.keys(filter).length === 0;
}

// ------------------------------------------------------------------ insert

export async function insert(
  connections: AstraConnections,
  target: Target,
  args: { name: string; kind?: "collection" | "table"; documents: Doc[]; ordered: boolean },
  onProgress?: (done: number, total: number) => Promise<void>,
): Promise<MutationResultT> {
  const resolved = await connections.resolveKind(target, args.name, args.kind);
  const source = resolved.kind === "collection"
    ? target.db.collection(args.name, { keyspace: target.keyspace })
    : target.db.table(args.name, { keyspace: target.keyspace });
  const docs = args.documents.map((d) => fromJson(d) as Doc);
  const chunkSize = 100;
  const insertedIds: unknown[] = [];
  const failures: { index?: number; message: string }[] = [];
  let insertedCount = 0;

  for (let start = 0; start < docs.length; start += chunkSize) {
    const chunk = docs.slice(start, start + chunkSize);
    try {
      const res = await source.insertMany(chunk, { ordered: args.ordered });
      insertedCount += res.insertedCount;
      insertedIds.push(...res.insertedIds);
    } catch (err) {
      const partial = err as { insertedIds?: () => unknown[]; errors?: () => Error[] };
      const ids = typeof partial.insertedIds === "function" ? partial.insertedIds() : [];
      insertedIds.push(...ids);
      insertedCount += ids.length;
      const errors = typeof partial.errors === "function" ? partial.errors() : [err];
      for (const e of errors.slice(0, 10)) failures.push({ message: toAstraMcpError(e).toPayload().message });
      if (args.ordered || !ids.length) break;
    }
    await onProgress?.(Math.min(start + chunk.length, docs.length), docs.length);
  }

  if (insertedCount === 0 && failures.length) {
    throw new AstraMcpError("invalid_argument", `Nothing was inserted into '${args.name}': ${failures[0].message}`, {
      details: { failures },
    });
  }
  return result(target, {
    operation: "insert",
    name: args.name,
    kind: resolved.kind,
    message: `Inserted ${insertedCount} of ${docs.length} ${resolved.kind === "table" ? "row" : "document"}(s) into ${target.keyspace}.${args.name}${failures.length ? ` (${failures.length} error(s))` : ""}.`,
    insertedCount,
    insertedIds: insertedIds.slice(0, MAX_IDS).map((id) => toJsonSafe(id)),
    ...(failures.length ? { failures } : {}),
  });
}

// ------------------------------------------------------------------ update

export async function update(
  connections: AstraConnections,
  target: Target,
  args: { name: string; kind?: "collection" | "table"; filter: Doc; update: Doc; many: boolean; upsert: boolean },
): Promise<MutationResultT> {
  const resolved = await connections.resolveKind(target, args.name, args.kind);
  const filter = fromJson(args.filter) as Doc;
  const update = fromJson(args.update) as Doc;
  if (resolved.kind === "table") {
    if (args.many) {
      throw new AstraMcpError("unsupported_operation", "Tables update one row at a time (filter on the full primary key).");
    }
    await target.db.table(args.name, { keyspace: target.keyspace }).updateOne(filter, update);
    return result(target, {
      operation: "update", name: args.name, kind: "table",
      message: `Updated the row matching ${JSON.stringify(args.filter)} in ${target.keyspace}.${args.name} (tables upsert on update).`,
    });
  }
  const coll = target.db.collection(args.name, { keyspace: target.keyspace });
  const res = args.many
    ? await coll.updateMany(filter, update, { upsert: args.upsert })
    : await coll.updateOne(filter, update, { upsert: args.upsert });
  return result(target, {
    operation: args.many ? "updateMany" : "updateOne",
    name: args.name,
    kind: "collection",
    message: `Matched ${res.matchedCount}, modified ${res.modifiedCount}${res.upsertedId !== undefined ? ", upserted 1" : ""} in ${target.keyspace}.${args.name}.`,
    matchedCount: res.matchedCount,
    modifiedCount: res.modifiedCount,
    ...(res.upsertedId !== undefined ? { upsertedId: toJsonSafe(res.upsertedId) } : {}),
  });
}

// ------------------------------------------------------------------ delete

export async function remove(
  connections: AstraConnections,
  target: Target,
  args: { name: string; kind?: "collection" | "table"; filter: Doc; many: boolean },
): Promise<MutationResultT> {
  const resolved = await connections.resolveKind(target, args.name, args.kind);
  const filter = fromJson(args.filter) as Doc;
  if (resolved.kind === "table") {
    const table = target.db.table(args.name, { keyspace: target.keyspace });
    await (args.many ? table.deleteMany(filter) : table.deleteOne(filter));
    return result(target, {
      operation: args.many ? "deleteMany" : "deleteOne", name: args.name, kind: "table",
      message: `Deleted the row(s) matching ${JSON.stringify(args.filter)} from ${target.keyspace}.${args.name}.`,
    });
  }
  const coll = target.db.collection(args.name, { keyspace: target.keyspace });
  const res = args.many ? await coll.deleteMany(filter) : await coll.deleteOne(filter);
  return result(target, {
    operation: args.many ? "deleteMany" : "deleteOne",
    name: args.name,
    kind: "collection",
    message: `Deleted ${res.deletedCount} document(s) from ${target.keyspace}.${args.name}.`,
    deletedCount: res.deletedCount,
  });
}

// ------------------------------------------------------------------ DDL

export async function createCollection(
  connections: AstraConnections,
  target: Target,
  args: {
    name: string;
    vector?: { dimension?: number; metric: string; service?: Doc };
    lexical?: boolean;
    rerank?: { provider: string; modelName: string };
    indexing?: { allow?: string[]; deny?: string[] };
    defaultId?: string;
  },
): Promise<MutationResultT> {
  if (args.vector && !args.vector.dimension && !args.vector.service) {
    throw new AstraMcpError("invalid_argument", "A vector collection needs `vector.dimension` or a vectorize `vector.service`.");
  }
  if (args.indexing?.allow && args.indexing?.deny) {
    throw new AstraMcpError("invalid_argument", "Use either indexing.allow or indexing.deny, not both.");
  }
  const definition: Doc = {
    keyspace: target.keyspace,
    ...(args.vector ? { vector: args.vector } : {}),
    ...(args.lexical !== undefined ? { lexical: { enabled: args.lexical, ...(args.lexical ? { analyzer: "standard" } : {}) } } : {}),
    ...(args.rerank ? { rerank: { enabled: true, service: args.rerank } } : {}),
    ...(args.indexing ? { indexing: args.indexing } : {}),
    ...(args.defaultId ? { defaultId: { type: args.defaultId } } : {}),
  };
  await target.db.createCollection(args.name, definition);
  connections.invalidate(target);
  const features = [
    args.vector ? `vector ${args.vector.dimension ?? "auto"}d ${args.vector.metric}${args.vector.service ? ` via ${String((args.vector.service as { provider?: string }).provider)}` : ""}` : "no vector",
    args.lexical ? "lexical" : "",
    args.rerank ? "rerank" : "",
  ].filter(Boolean).join(", ");
  return result(target, { operation: "createCollection", name: args.name, kind: "collection", message: `Created collection ${target.keyspace}.${args.name} (${features}).` });
}

function normalizeColumns(columns: Record<string, string | Doc>): Record<string, Doc | string> {
  return Object.fromEntries(Object.entries(columns).map(([name, def]) => [name, typeof def === "string" ? def : def]));
}

export async function createTable(
  connections: AstraConnections,
  target: Target,
  args: { name: string; columns: Record<string, string | Doc>; primaryKey: string | { partitionBy: string[]; partitionSort?: Record<string, 1 | -1> }; ifNotExists: boolean },
): Promise<MutationResultT> {
  const pkColumns = typeof args.primaryKey === "string"
    ? [args.primaryKey]
    : [...args.primaryKey.partitionBy, ...Object.keys(args.primaryKey.partitionSort ?? {})];
  const missing = pkColumns.filter((c) => !(c in args.columns));
  if (missing.length) throw new AstraMcpError("invalid_argument", `Primary key column(s) not defined in columns: ${missing.join(", ")}.`);
  await target.db.createTable(args.name, {
    keyspace: target.keyspace,
    ifNotExists: args.ifNotExists,
    definition: { columns: normalizeColumns(args.columns), primaryKey: args.primaryKey },
  });
  connections.invalidate(target);
  return result(target, {
    operation: "createTable", name: args.name, kind: "table",
    message: `Created table ${target.keyspace}.${args.name} with ${Object.keys(args.columns).length} column(s). Add indexes (create_index) for columns you filter or vector-search on.`,
  });
}

export async function createIndex(
  connections: AstraConnections,
  target: Target,
  args: { table: string; name: string; column: string; type: "regular" | "vector" | "text"; options?: Doc; ifNotExists: boolean },
): Promise<MutationResultT> {
  const resolved = await connections.resolveKind(target, args.table);
  if (resolved.kind !== "table") {
    throw new AstraMcpError("unsupported_operation", `'${args.table}' is a collection; collections index fields automatically (configure with indexing on create_collection).`);
  }
  const table = target.db.table(args.table, { keyspace: target.keyspace });
  const options = { ifNotExists: args.ifNotExists, ...(args.options ? { options: args.options } : {}) };
  if (args.type === "vector") await table.createVectorIndex(args.name, args.column, options);
  else if (args.type === "text") await table.createTextIndex(args.name, args.column, options);
  else await table.createIndex(args.name, args.column, options);
  return result(target, {
    operation: "createIndex", name: args.name, kind: "index",
    message: `Created ${args.type} index ${args.name} on ${target.keyspace}.${args.table}(${args.column}).`,
  });
}

export async function drop(
  connections: AstraConnections,
  target: Target,
  args: { kind: "collection" | "table" | "index"; name: string },
): Promise<MutationResultT> {
  if (args.kind === "collection") await target.db.dropCollection(args.name, { keyspace: target.keyspace });
  else if (args.kind === "table") await target.db.dropTable(args.name, { keyspace: target.keyspace });
  else await target.db.dropTableIndex(args.name, { keyspace: target.keyspace });
  connections.invalidate(target);
  return result(target, {
    operation: `drop${args.kind[0].toUpperCase()}${args.kind.slice(1)}`, name: args.name, kind: args.kind,
    message: `Dropped ${args.kind} ${target.keyspace}.${args.name}.`,
  });
}
