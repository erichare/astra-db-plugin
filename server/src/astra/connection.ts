/**
 * Turns (credentials + optional `database`/`keyspace` tool arguments) into a
 * live Data API handle. Stateless per call — the only memory is caching:
 * client handles, the DevOps database list (60 s), and schema listings (30 s,
 * invalidated by DDL).
 */
import type { CredentialProvider, ResolvedCredentials } from "../credentials/resolver.js";
import { AstraMcpError, LOGIN_HINT } from "./errors.js";
import type {
  AstraGateway, CollectionDescriptorLike, DatabaseInfoLike, DbLike, TableDescriptorLike,
} from "./gateway.js";

export interface DatabaseRef {
  id?: string;
  name?: string;
  region?: string;
}

export interface Target {
  db: DbLike;
  endpoint: string;
  keyspace: string;
  database: DatabaseRef;
  creds: ResolvedCredentials;
}

export interface Schema {
  collections: CollectionDescriptorLike[];
  tables: TableDescriptorLike[];
}

export type ResolvedKind =
  | { kind: "collection"; descriptor: CollectionDescriptorLike }
  | { kind: "table"; descriptor: TableDescriptorLike };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ASTRA_ENDPOINT = /^https:\/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-([a-z0-9-]+)\.apps\.astra(?:-dev|-test)?\.datastax\.com/i;
const DB_LIST_TTL = 60_000;
const SCHEMA_TTL = 30_000;

/** Database id and region encoded in an Astra Data API endpoint URL. */
export function parseEndpoint(endpoint: string): DatabaseRef {
  const match = endpoint.match(ASTRA_ENDPOINT);
  return match ? { id: match[1].toLowerCase(), region: match[2] } : {};
}

export function endpointHost(endpoint: string): string {
  try {
    return new URL(endpoint).hostname;
  } catch {
    return "unknown-endpoint";
  }
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function activeEndpoint(info: DatabaseInfoLike): string | undefined {
  return info.regions?.[0]?.apiEndpoint;
}

export class AstraConnections {
  private readonly dbHandles = new Map<string, DbLike>();
  private dbList?: { key: string; at: number; list: DatabaseInfoLike[] };
  private readonly schemas = new Map<string, { at: number; schema: Schema }>();

  constructor(
    readonly credentials: CredentialProvider,
    private readonly gateway: AstraGateway,
    private readonly now: () => number = Date.now,
  ) {}

  resolveCredentials(): ResolvedCredentials {
    return this.credentials.resolve();
  }

  private requireToken(creds: ResolvedCredentials): string {
    if (!creds.token) {
      throw new AstraMcpError("not_configured", "No Astra DB credentials found (no token in env, .env, plugin settings, or Astra CLI profile).", {
        hint: LOGIN_HINT,
      });
    }
    return creds.token.value;
  }

  /** DevOps database list for the configured token (cached 60 s). */
  async listDatabases(include: "active" | "all" = "active"): Promise<DatabaseInfoLike[]> {
    const creds = this.resolveCredentials();
    const token = this.requireToken(creds);
    if (creds.environment !== "astra") {
      throw new AstraMcpError("unsupported_operation", `Listing databases needs Astra's DevOps API; this server targets ${creds.environment}.`, {
        hint: "Set ASTRA_DB_API_ENDPOINT to the Data API endpoint instead.",
      });
    }
    const key = `${token.slice(-12)}|${creds.astraEnv}|${include}`;
    if (this.dbList && this.dbList.key === key && this.now() - this.dbList.at < DB_LIST_TTL) return this.dbList.list;
    const list = await this.gateway.devops(token, creds.astraEnv).listDatabases({ include: include === "all" ? "NONTERMINATED" : "ACTIVE" });
    this.dbList = { key, at: this.now(), list };
    return list;
  }

  /** Resolve a `database` argument (URL, id, or name) or the configured default to an endpoint. */
  async resolveEndpoint(database?: string): Promise<{ endpoint: string; database: DatabaseRef }> {
    const creds = this.resolveCredentials();
    this.requireToken(creds);
    const wanted = database?.trim() || undefined;

    if (wanted && isUrl(wanted)) return { endpoint: wanted.replace(/\/+$/, ""), database: parseEndpoint(wanted) };
    if (!wanted && creds.endpoint) {
      return { endpoint: creds.endpoint.value.replace(/\/+$/, ""), database: parseEndpoint(creds.endpoint.value) };
    }

    const hint = wanted ?? creds.database?.value;
    if (wanted && UUID.test(wanted)) {
      const token = this.requireToken(creds);
      const info = await this.gateway.devops(token, creds.astraEnv).dbInfo(wanted);
      const endpoint = activeEndpoint(info);
      if (!endpoint) throw new AstraMcpError("not_found", `Database ${wanted} has no Data API endpoint (status ${info.status}).`);
      return { endpoint, database: { id: info.id, name: info.name, region: info.regions[0]?.name } };
    }

    const databases = await this.listDatabases("active");
    let matches = hint
      ? databases.filter((d) => d.name === hint || d.id === hint)
      : databases;
    if (hint && matches.length === 0) matches = databases.filter((d) => d.name.toLowerCase() === hint.toLowerCase());
    if (matches.length === 1) {
      const info = matches[0];
      const endpoint = activeEndpoint(info);
      if (!endpoint) throw new AstraMcpError("not_found", `Database '${info.name}' has no Data API endpoint yet (status ${info.status}).`);
      return { endpoint, database: { id: info.id, name: info.name, region: info.regions[0]?.name } };
    }
    const names = databases.map((d) => d.name);
    if (matches.length === 0) {
      throw new AstraMcpError("not_found", hint ? `No active database named '${hint}'.` : "The token can see no active databases.", {
        hint: names.length ? `Available: ${names.join(", ")}.` : "Create one in the Astra console or with `astra db create`.",
        details: { databases: names },
      });
    }
    throw new AstraMcpError("ambiguous_database", `Several databases match${hint ? ` '${hint}'` : ""}; pass \`database\` (name or id).`, {
      hint: `Choose one of: ${matches.map((d) => `${d.name} (${d.id})`).join(", ")}. To make it the default, set ASTRA_DB_API_ENDPOINT or ASTRA_DB_NAME in .env.`,
      details: { databases: matches.map((d) => ({ id: d.id, name: d.name })) },
    });
  }

  async target(args: { database?: string; keyspace?: string } = {}): Promise<Target> {
    const creds = this.resolveCredentials();
    const token = this.requireToken(creds);
    const { endpoint, database } = await this.resolveEndpoint(args.database);
    const requestedKeyspace = args.keyspace?.trim() || creds.keyspace?.value;
    const handleKey = `${token.slice(-12)}|${endpoint}|${requestedKeyspace ?? ""}|${creds.environment}`;
    let db = this.dbHandles.get(handleKey);
    if (!db) {
      db = this.gateway.db(token, endpoint, requestedKeyspace, creds.environment);
      this.dbHandles.set(handleKey, db);
    }
    return { db, endpoint, keyspace: requestedKeyspace ?? db.keyspace, database, creds };
  }

  /** Collections and tables of the target keyspace (cached 30 s). */
  async schema(target: Target, fresh = false): Promise<Schema> {
    const key = `${target.endpoint}|${target.keyspace}`;
    const hit = this.schemas.get(key);
    if (!fresh && hit && this.now() - hit.at < SCHEMA_TTL) return hit.schema;
    const [collections, tables] = await Promise.all([
      target.db.listCollections({ keyspace: target.keyspace, nameOnly: false }),
      target.db.listTables({ keyspace: target.keyspace, nameOnly: false }).catch(() => [] as TableDescriptorLike[]),
    ]);
    const schema = { collections, tables };
    this.schemas.set(key, { at: this.now(), schema });
    return schema;
  }

  invalidate(target: Target): void {
    this.schemas.delete(`${target.endpoint}|${target.keyspace}`);
  }

  /** Is `name` a collection or a table in the target keyspace? */
  async resolveKind(target: Target, name: string, kind?: "collection" | "table"): Promise<ResolvedKind> {
    for (const fresh of [false, true]) {
      const schema = await this.schema(target, fresh);
      const collection = schema.collections.find((c) => c.name === name);
      const table = schema.tables.find((t) => t.name === name);
      if (collection && kind !== "table") return { kind: "collection", descriptor: collection };
      if (table && kind !== "collection") return { kind: "table", descriptor: table };
      if (fresh) {
        const available = [...schema.collections.map((c) => c.name), ...schema.tables.map((t) => `${t.name} (table)`)];
        throw new AstraMcpError("not_found", `No ${kind ?? "collection or table"} named '${name}' in keyspace '${target.keyspace}'.`, {
          hint: available.length ? `Available: ${available.join(", ")}.` : "The keyspace is empty — create_collection or create_table first.",
          details: { available },
        });
      }
    }
    throw new Error("unreachable");
  }
}
