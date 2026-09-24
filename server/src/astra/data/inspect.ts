/** Read-only inspection: connection status, databases, overview, collection/table descriptions. */
import type {
  CollectionResultT, DatabasesResultT, OverviewResultT, StatusResultT, TableResultT,
} from "../../server/schemas.js";
import { maskToken } from "../../credentials/sanitize.js";
import type { AstraConnections, Target } from "../connection.js";
import { endpointHost } from "../connection.js";
import { AstraMcpError, LOGIN_HINT, toAstraMcpError } from "../errors.js";
import { displayDocument, summarizeFields } from "../fields.js";
import type { CollectionDefinitionLike, TableDescriptorLike } from "../gateway.js";
import { toJsonSafe } from "../serialize.js";

export function vectorInfo(def: CollectionDefinitionLike) {
  if (!def.vector) return null;
  return {
    dimension: def.vector.dimension ?? null,
    metric: def.vector.metric ?? null,
    provider: def.vector.service?.provider ?? null,
    model: def.vector.service?.modelName ?? null,
  };
}

const safeDoc = (doc: Record<string, unknown>) => displayDocument(toJsonSafe(doc) as Record<string, unknown>);

// ------------------------------------------------------------------ connection_status

export async function connectionStatus(connections: AstraConnections, check: boolean): Promise<StatusResultT> {
  const creds = connections.resolveCredentials();
  const hints: string[] = [];
  const base: StatusResultT = {
    view: "status",
    configured: Boolean(creds.token),
    readOnly: creds.readOnly,
    environment: creds.environment,
    token: creds.token ? { source: creds.token.source, detail: creds.token.detail, masked: maskToken(creds.token.value) } : null,
    endpoint: creds.endpoint
      ? { source: creds.endpoint.source, detail: creds.endpoint.detail, host: endpointHost(creds.endpoint.value) }
      : null,
    keyspace: creds.keyspace ? { source: creds.keyspace.source, detail: creds.keyspace.detail, value: creds.keyspace.value } : null,
    database: null,
    checks: {},
    hints,
    consulted: creds.consulted,
  };
  if (!creds.token) {
    hints.push(LOGIN_HINT);
    return base;
  }
  if (!creds.endpoint && creds.environment === "astra") {
    hints.push("No endpoint configured: the database is picked through the DevOps API (the only one, or ASTRA_DB_NAME).");
  }
  if (creds.readOnly) hints.push("Read-only mode: write and schema tools are disabled.");
  if (!check) return base;
  try {
    const target = await connections.target();
    base.database = target.database;
    if (!base.endpoint) base.endpoint = { source: "devops", detail: "picked via DevOps API", host: endpointHost(target.endpoint) };
    const schema = await connections.schema(target, true);
    base.checks.dataApi = { ok: true, collections: schema.collections.length, tables: schema.tables.length };
  } catch (err) {
    const e = toAstraMcpError(err);
    base.checks.dataApi = { ok: false, message: e.toPayload().message };
    if (e.hint) hints.push(e.hint);
  }
  return base;
}

// ------------------------------------------------------------------ list_databases

export async function listDatabases(connections: AstraConnections, include: "active" | "all"): Promise<DatabasesResultT> {
  const list = await connections.listDatabases(include);
  const creds = connections.resolveCredentials();
  const current = creds.endpoint?.value;
  return {
    view: "databases",
    databases: list.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status,
      cloudProvider: d.cloudProvider ?? null,
      regions: (d.regions ?? []).map((r) => ({ name: r.name, apiEndpoint: r.apiEndpoint })),
      keyspaces: d.keyspaces ?? [],
      current: Boolean(current && (d.regions ?? []).some((r) => current.startsWith(r.apiEndpoint))),
    })),
  };
}

// ------------------------------------------------------------------ database_overview

async function keyspaceNames(target: Target): Promise<string[]> {
  try {
    const names = await target.db.admin().listKeyspaces();
    return [target.keyspace, ...names.filter((n) => n !== target.keyspace)];
  } catch {
    return [target.keyspace];
  }
}

export async function databaseOverview(
  target: Target,
  options: { keyspaces?: string[]; maxPerKeyspace: number; includeCounts: boolean },
): Promise<OverviewResultT> {
  const all = options.keyspaces?.length ? options.keyspaces : await keyspaceNames(target);
  const names = all.slice(0, 25);
  let itemsTruncated = false;
  let documents = 0;
  let anyCount = false;

  const keyspaces = await Promise.all(names.map(async (name) => {
    try {
      const [collections, tables] = await Promise.all([
        target.db.listCollections({ keyspace: name, nameOnly: false }),
        target.db.listTables({ keyspace: name, nameOnly: false }).catch(() => [] as TableDescriptorLike[]),
      ]);
      if (collections.length > options.maxPerKeyspace || tables.length > options.maxPerKeyspace) itemsTruncated = true;
      const keptCollections = collections.slice(0, options.maxPerKeyspace);
      const counts = options.includeCounts
        ? await Promise.all(keptCollections.map((c) =>
          target.db.collection(c.name, { keyspace: name }).estimatedDocumentCount().catch(() => null)))
        : keptCollections.map(() => null);
      return {
        name,
        isDefault: name === target.keyspace,
        collections: keptCollections.map((c, i) => {
          const estimatedCount = counts[i];
          if (typeof estimatedCount === "number") {
            documents += estimatedCount;
            anyCount = true;
          }
          return {
            name: c.name,
            vector: vectorInfo(c.definition),
            lexical: Boolean(c.definition.lexical?.enabled),
            rerank: Boolean(c.definition.rerank?.enabled),
            estimatedCount: typeof estimatedCount === "number" ? estimatedCount : null,
          };
        }),
        tables: tables.slice(0, options.maxPerKeyspace).map((t) => {
          const columns = Object.values(t.definition?.columns ?? {});
          return { name: t.name, columns: columns.length, vectorColumns: columns.filter((c) => c.type === "vector").length };
        }),
      };
    } catch (err) {
      return {
        name,
        isDefault: name === target.keyspace,
        error: toAstraMcpError(err).toPayload().message,
        collections: [],
        tables: [],
      };
    }
  }));

  return {
    view: "overview",
    endpointHost: endpointHost(target.endpoint),
    database: target.database,
    keyspaces,
    totals: {
      keyspaces: keyspaces.length,
      collections: keyspaces.reduce((n, k) => n + k.collections.length, 0),
      tables: keyspaces.reduce((n, k) => n + k.tables.length, 0),
      documents: anyCount ? documents : null,
    },
    truncated: { keyspaces: all.length > names.length, items: itemsTruncated },
  };
}

// ------------------------------------------------------------------ describe_collection

export async function describeCollection(
  connections: AstraConnections,
  target: Target,
  input: { collection: string; includeSample: boolean },
): Promise<CollectionResultT> {
  const resolved = await connections.resolveKind(target, input.collection, "collection");
  if (resolved.kind !== "collection") throw new AstraMcpError("not_found", `'${input.collection}' is a table; use describe_table.`);
  const def = resolved.descriptor.definition;
  const coll = target.db.collection(input.collection, { keyspace: target.keyspace });
  const [estimatedCount, sample] = await Promise.all([
    coll.estimatedDocumentCount().catch(() => null),
    input.includeSample ? coll.findOne({}, { projection: { $vector: 0 } }) : Promise.resolve(null),
  ]);
  const sampleDocument = sample ? safeDoc(sample) : null;
  return {
    view: "collection",
    keyspace: target.keyspace,
    name: resolved.descriptor.name,
    estimatedCount: typeof estimatedCount === "number" ? estimatedCount : null,
    vector: vectorInfo(def),
    lexical: { enabled: Boolean(def.lexical?.enabled), ...(def.lexical?.analyzer !== undefined ? { analyzer: def.lexical.analyzer } : {}) },
    rerank: {
      enabled: Boolean(def.rerank?.enabled),
      provider: def.rerank?.service?.provider ?? null,
      model: def.rerank?.service?.modelName ?? null,
    },
    indexing: { allow: def.indexing?.allow ?? null, deny: def.indexing?.deny ?? null },
    defaultIdType: def.defaultId?.type ?? null,
    sampleDocument,
    fields: sampleDocument ? summarizeFields([sampleDocument]) : [],
  };
}

// ------------------------------------------------------------------ describe_table

function columnDetail(column: Record<string, unknown>): string | null {
  const type = column.type;
  if (type === "vector") {
    const service = column.service as { provider?: string; modelName?: string } | undefined;
    return [`${column.dimension ?? "?"} dims`, service ? `vectorize ${service.provider}/${service.modelName}` : ""].filter(Boolean).join(", ");
  }
  if (type === "map") return `${column.keyType} → ${column.valueType}`;
  if (type === "list" || type === "set") return String(column.valueType ?? "");
  if (type === "userDefined") return String(column.udtName ?? "");
  return null;
}

export function tableShape(descriptor: TableDescriptorLike) {
  const pk = descriptor.definition.primaryKey ?? { partitionBy: [] };
  const partitionBy = pk.partitionBy ?? [];
  const partitionSort = pk.partitionSort ?? {};
  const columns = Object.entries(descriptor.definition.columns ?? {}).map(([name, column]) => ({
    name,
    type: String(column.type ?? "unknown"),
    detail: columnDetail(column),
    primaryKey: partitionBy.includes(name) ? "partition" as const : name in partitionSort ? "clustering" as const : null,
  }));
  const vectorColumns = Object.entries(descriptor.definition.columns ?? {})
    .filter(([, c]) => c.type === "vector")
    .map(([name, c]) => {
      const service = c.service as { provider?: string; modelName?: string } | undefined;
      return {
        name,
        dimension: typeof c.dimension === "number" ? c.dimension : null,
        provider: service?.provider ?? null,
        model: service?.modelName ?? null,
      };
    });
  return { columns, primaryKey: { partitionBy, partitionSort }, vectorColumns };
}

export async function describeTable(
  connections: AstraConnections,
  target: Target,
  input: { table: string; includeSample: boolean },
): Promise<TableResultT> {
  const resolved = await connections.resolveKind(target, input.table, "table");
  if (resolved.kind !== "table") throw new AstraMcpError("not_found", `'${input.table}' is a collection; use describe_collection.`);
  const table = target.db.table(input.table, { keyspace: target.keyspace });
  const shape = tableShape(resolved.descriptor);
  const vectorProjection = Object.fromEntries(shape.vectorColumns.map((c) => [c.name, 0]));
  const [indexes, rows] = await Promise.all([
    table.listIndexes({ nameOnly: false }).catch(() => []),
    input.includeSample
      ? table.find({}, { limit: 3, ...(shape.vectorColumns.length ? { projection: vectorProjection } : {}) }).toArray().catch(() => [])
      : Promise.resolve([]),
  ]);
  return {
    view: "table",
    keyspace: target.keyspace,
    name: resolved.descriptor.name,
    ...shape,
    indexes: indexes.map((ix) => ({
      name: ix.name,
      column: typeof ix.definition?.column === "string" ? ix.definition.column : JSON.stringify(ix.definition?.column ?? ""),
      type: ix.indexType ?? "regular",
      options: (ix.definition?.options as Record<string, unknown> | undefined) ?? null,
    })),
    sampleRows: rows.map((r) => safeDoc(r)),
  };
}
