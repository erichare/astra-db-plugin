import type { AstraDb, CollectionDescriptorLike } from "../client.js";
import { endpointHost } from "../client.js";
import type { OverviewResultT } from "../schemas.js";

const MAX_KEYSPACES = 10;

export function vectorInfo(def: CollectionDescriptorLike["definition"]) {
  if (!def.vector) return null;
  return {
    dimension: def.vector.dimension ?? null,
    metric: def.vector.metric ?? null,
    provider: def.vector.service?.provider ?? null,
    model: def.vector.service?.modelName ?? null,
  };
}

async function safeKeyspaces(db: AstraDb): Promise<string[]> {
  try {
    const names = await db.admin().listKeyspaces();
    if (names.length === 0) return [db.keyspace];
    return [db.keyspace, ...names.filter((n) => n !== db.keyspace)];
  } catch {
    return [db.keyspace];
  }
}

async function safeTables(db: AstraDb, keyspace: string): Promise<string[]> {
  try {
    return await db.listTables({ keyspace, nameOnly: true });
  } catch {
    return [];
  }
}

async function safeCount(db: AstraDb, keyspace: string, name: string): Promise<number | null> {
  try {
    return await db.collection(name, { keyspace }).estimatedDocumentCount();
  } catch {
    return null;
  }
}

export async function databaseOverview(
  db: AstraDb,
  endpoint: string,
  options: { maxCollections?: number } = {},
): Promise<OverviewResultT> {
  const maxCollections = options.maxCollections ?? 25;
  const keyspaceNames = (await safeKeyspaces(db)).slice(0, MAX_KEYSPACES);
  let budget = maxCollections;
  let truncated = false;
  let documents = 0;
  let anyCount = false;

  const keyspaces = [];
  for (const name of keyspaceNames) {
    const descriptors = await db.listCollections({ keyspace: name, nameOnly: false });
    const kept = descriptors.slice(0, Math.max(0, budget));
    if (descriptors.length > kept.length) truncated = true;
    budget -= kept.length;
    const counts = await Promise.all(kept.map((d) => safeCount(db, name, d.name)));
    const collections = kept.map((d, i) => {
      const estimatedCount = counts[i];
      if (estimatedCount !== null) {
        documents += estimatedCount;
        anyCount = true;
      }
      return {
        name: d.name,
        vector: vectorInfo(d.definition),
        lexical: Boolean(d.definition.lexical?.enabled),
        rerank: Boolean(d.definition.rerank?.enabled),
        estimatedCount,
      };
    });
    keyspaces.push({ name, isDefault: name === db.keyspace, collections, tables: await safeTables(db, name) });
  }

  return {
    widget: "overview",
    endpointHost: endpointHost(endpoint),
    keyspaces,
    totals: {
      keyspaces: keyspaces.length,
      collections: keyspaces.reduce((n, k) => n + k.collections.length, 0),
      tables: keyspaces.reduce((n, k) => n + k.tables.length, 0),
      documents: anyCount ? documents : null,
    },
    truncated,
  };
}
