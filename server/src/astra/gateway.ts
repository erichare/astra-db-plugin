/**
 * The slice of astra-db-ts the server uses, as structural interfaces so tests
 * can supply an in-memory fake. `createGateway()` is the real implementation.
 */
import { DataAPIClient } from "@datastax/astra-db-ts";
import type { Environment } from "../credentials/resolver.js";

export type Doc = Record<string, unknown>;

export interface PageLike<T = Doc> {
  result: T[];
  nextPageState: string | null;
}

export interface CursorLike<T = Doc> {
  toArray(): Promise<T[]>;
  initialPageState(state?: string): CursorLike<T>;
  fetchNextPage(): Promise<PageLike<T>>;
}

export interface RerankedLike<T = Doc> {
  document: T;
  scores?: Record<string, number>;
}

export interface CollectionLike {
  estimatedDocumentCount(): Promise<number>;
  countDocuments(filter: Doc, upperBound: number): Promise<number>;
  findOne(filter: Doc, options?: Doc): Promise<Doc | null>;
  find(filter: Doc, options?: Doc): CursorLike;
  findAndRerank(filter: Doc, options?: Doc): { toArray(): Promise<RerankedLike[]> };
  insertMany(docs: Doc[], options?: Doc): Promise<{ insertedIds: unknown[]; insertedCount: number }>;
  updateOne(filter: Doc, update: Doc, options?: Doc): Promise<UpdateResultLike>;
  updateMany(filter: Doc, update: Doc, options?: Doc): Promise<UpdateResultLike>;
  deleteOne(filter: Doc, options?: Doc): Promise<{ deletedCount: number }>;
  deleteMany(filter: Doc, options?: Doc): Promise<{ deletedCount: number }>;
}

export interface UpdateResultLike {
  matchedCount: number;
  modifiedCount: number;
  upsertedCount?: number;
  upsertedId?: unknown;
}

export interface TableIndexLike {
  name: string;
  definition: { column: unknown; options?: Doc; apiSupport?: Doc };
  indexType?: string;
}

export interface TableLike {
  findOne(filter: Doc, options?: Doc): Promise<Doc | null>;
  find(filter: Doc, options?: Doc): CursorLike;
  insertMany(rows: Doc[], options?: Doc): Promise<{ insertedIds: unknown[]; insertedCount: number }>;
  updateOne(filter: Doc, update: Doc, options?: Doc): Promise<void>;
  deleteOne(filter: Doc, options?: Doc): Promise<void>;
  deleteMany(filter: Doc, options?: Doc): Promise<void>;
  listIndexes(options: { nameOnly: false }): Promise<TableIndexLike[]>;
  createIndex(name: string, column: unknown, options?: Doc): Promise<void>;
  createVectorIndex(name: string, column: string, options?: Doc): Promise<void>;
  createTextIndex(name: string, column: string, options?: Doc): Promise<void>;
}

export interface CollectionDefinitionLike {
  vector?: {
    dimension?: number;
    metric?: string;
    service?: { provider: string; modelName: string; authentication?: Doc; parameters?: Doc };
    sourceModel?: string;
  };
  indexing?: { allow?: string[]; deny?: string[] };
  defaultId?: { type?: string };
  lexical?: { enabled: boolean; analyzer?: unknown };
  rerank?: { enabled?: boolean; service?: { provider: string; modelName: string } };
}

export interface CollectionDescriptorLike {
  name: string;
  definition: CollectionDefinitionLike;
}

export interface TableDescriptorLike {
  name: string;
  definition: {
    columns: Record<string, Doc>;
    primaryKey: { partitionBy: string[]; partitionSort?: Record<string, number> };
  };
}

export interface DbAdminLike {
  listKeyspaces(): Promise<string[]>;
  findEmbeddingProviders(): Promise<{ embeddingProviders: Record<string, Doc> }>;
  findRerankingProviders(): Promise<{ rerankingProviders: Record<string, Doc> }>;
}

export interface DbLike {
  readonly keyspace: string;
  listCollections(options: { keyspace?: string; nameOnly: false }): Promise<CollectionDescriptorLike[]>;
  listTables(options: { keyspace?: string; nameOnly: false }): Promise<TableDescriptorLike[]>;
  collection(name: string, options?: { keyspace?: string }): CollectionLike;
  table(name: string, options?: { keyspace?: string }): TableLike;
  createCollection(name: string, options?: Doc): Promise<unknown>;
  createTable(name: string, options: Doc): Promise<unknown>;
  dropCollection(name: string, options?: { keyspace?: string }): Promise<void>;
  dropTable(name: string, options?: { keyspace?: string; ifExists?: boolean }): Promise<void>;
  dropTableIndex(name: string, options?: { keyspace?: string; ifExists?: boolean }): Promise<void>;
  admin(): DbAdminLike;
}

export interface DatabaseInfoLike {
  id: string;
  name: string;
  status: string;
  keyspaces: string[];
  cloudProvider?: string;
  orgId?: string;
  regions: { name: string; apiEndpoint: string }[];
}

export interface DevOpsLike {
  listDatabases(options?: { include?: string }): Promise<DatabaseInfoLike[]>;
  dbInfo(id: string): Promise<DatabaseInfoLike>;
}

export interface AstraGateway {
  db(token: string, endpoint: string, keyspace: string | undefined, environment: Environment): DbLike;
  devops(token: string, astraEnv: "prod" | "dev" | "test"): DevOpsLike;
}

/** The real gateway, backed by @datastax/astra-db-ts. `devopsUrl` overrides the DevOps API base (tests). */
export function createGateway(version = "dev", options: { devopsUrl?: string } = {}): AstraGateway {
  const caller = ["astra-mcp", version] as const;
  return {
    db(token, endpoint, keyspace, environment) {
      const client = new DataAPIClient(token, { environment, caller });
      return client.db(endpoint, keyspace ? { keyspace } : {}) as unknown as DbLike;
    },
    devops(token, astraEnv) {
      const client = new DataAPIClient(token, { caller });
      return client.admin({ astraEnv, ...(options.devopsUrl ? { endpointUrl: options.devopsUrl } : {}) }) as unknown as DevOpsLike;
    },
  };
}
