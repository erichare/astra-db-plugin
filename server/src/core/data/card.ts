import type { AstraDb, CollectionDescriptorLike } from "../client.js";
import { AstraWidgetsError } from "../errors.js";
import { displayDocument, summarizeFields } from "../fields.js";
import type { CollectionCardResultT } from "../schemas.js";
import { vectorInfo } from "./overview.js";

export async function findDescriptor(
  db: AstraDb,
  collection: string,
  keyspace: string,
): Promise<CollectionDescriptorLike> {
  const descriptors = await db.listCollections({ keyspace, nameOnly: false });
  const match = descriptors.find((d) => d.name === collection);
  if (!match) {
    const names = descriptors.map((d) => d.name).join(", ") || "none";
    throw new AstraWidgetsError(
      "collection_not_found",
      `Collection '${collection}' not found in keyspace '${keyspace}' (available: ${names}).`,
    );
  }
  return match;
}

export async function collectionCard(
  db: AstraDb,
  input: { collection: string; keyspace?: string; includeSample?: boolean },
): Promise<CollectionCardResultT> {
  const keyspace = input.keyspace ?? db.keyspace;
  const descriptor = await findDescriptor(db, input.collection, keyspace);
  const coll = db.collection(input.collection, { keyspace });

  let estimatedCount: number | null = null;
  try {
    estimatedCount = await coll.estimatedDocumentCount();
  } catch {
    estimatedCount = null;
  }

  let sample: Record<string, unknown> | null = null;
  if (input.includeSample !== false) {
    const doc = await coll.findOne({}, { projection: { $vector: 0 } });
    sample = doc ? displayDocument(doc) : null;
  }

  const def = descriptor.definition;
  return {
    widget: "collection-card",
    keyspace,
    name: descriptor.name,
    estimatedCount,
    vector: vectorInfo(def),
    lexical: { enabled: Boolean(def.lexical?.enabled), analyzer: def.lexical?.analyzer },
    rerank: {
      enabled: Boolean(def.rerank?.enabled),
      provider: def.rerank?.service?.provider ?? null,
      model: def.rerank?.service?.modelName ?? null,
    },
    indexing: { allow: def.indexing?.allow ?? null, deny: def.indexing?.deny ?? null },
    defaultIdType: def.defaultId?.type ?? null,
    sampleDocument: sample,
    fields: sample ? summarizeFields([sample]) : [],
  };
}
