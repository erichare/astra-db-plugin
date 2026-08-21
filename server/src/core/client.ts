import { DataAPIClient } from "@datastax/astra-db-ts";
import { AstraWidgetsError } from "./errors.js";

export interface Credentials {
  token: string;
  endpoint: string;
  keyspace?: string;
}

export type Doc = Record<string, unknown>;

/** Minimal surface of astra-db-ts that the widget data functions use (mockable in tests). */
export interface FindPageLike<T = Doc> {
  result: T[];
  nextPageState: string | null;
}
export interface FindCursorLike<T = Doc> {
  toArray(): Promise<T[]>;
  initialPageState(state?: string): FindCursorLike<T>;
  fetchNextPage(): Promise<FindPageLike<T>>;
}
export interface RerankedLike<T = Doc> {
  document: T;
  scores?: Record<string, number>;
}
export interface RerankCursorLike<T = Doc> {
  toArray(): Promise<RerankedLike<T>[]>;
}
export interface CollectionLike {
  estimatedDocumentCount(): Promise<number>;
  findOne(filter: Doc, options?: Doc): Promise<Doc | null>;
  find(filter: Doc, options?: Doc): FindCursorLike;
  findAndRerank(filter: Doc, options?: Doc): RerankCursorLike;
}
export interface CollectionDescriptorLike {
  name: string;
  definition: {
    vector?: {
      dimension?: number;
      metric?: string;
      service?: { provider: string; modelName: string };
      sourceModel?: string;
    };
    indexing?: { allow?: string[]; deny?: string[] };
    defaultId?: { type?: string };
    lexical?: { enabled: boolean; analyzer?: unknown };
    rerank?: { enabled?: boolean; service?: { provider: string; modelName: string } };
  };
}
export interface AstraDb {
  readonly keyspace: string;
  listCollections(options: { keyspace?: string; nameOnly: false }): Promise<CollectionDescriptorLike[]>;
  listTables(options: { keyspace?: string; nameOnly: true }): Promise<string[]>;
  collection(name: string, options?: { keyspace?: string }): CollectionLike;
  admin(): { listKeyspaces(): Promise<string[]> };
}

export function credentialsFromEnv(env: NodeJS.ProcessEnv = process.env): Credentials {
  const token = env.ASTRA_DB_APPLICATION_TOKEN;
  const endpoint = env.ASTRA_DB_API_ENDPOINT;
  if (!token || !endpoint) {
    throw new AstraWidgetsError(
      "missing_credentials",
      "Set ASTRA_DB_APPLICATION_TOKEN and ASTRA_DB_API_ENDPOINT (run /astra-db:setup to create a .env).",
    );
  }
  return { token, endpoint, keyspace: env.ASTRA_DB_KEYSPACE || undefined };
}

export function createDb(creds: Credentials): AstraDb {
  const client = new DataAPIClient(creds.token);
  const db = client.db(creds.endpoint, creds.keyspace ? { keyspace: creds.keyspace } : {});
  return db as unknown as AstraDb;
}

export function endpointHost(endpoint: string): string {
  try {
    return new URL(endpoint).hostname;
  } catch {
    return "unknown-endpoint";
  }
}
