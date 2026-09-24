/**
 * Where the server finds Astra credentials, highest priority first:
 *
 *   1. shell environment        ASTRA_DB_APPLICATION_TOKEN | ASTRA_DB_TOKEN | APPLICATION_TOKEN, …
 *   2. project dotenv           .env.local / .env, nearest directory first, up to the git root
 *   3. host plugin config       ASTRA_MCP_CONFIG_* (Claude Code userConfig, MCPB user_config)
 *   4. user credentials file    written by `astra-mcp login --global`
 *   5. Astra CLI profile        ~/.astrarc (token only)
 *
 * Token, endpoint, and keyspace resolve independently and each records where
 * it came from. Files are re-read only when they change, so a `login` in
 * another terminal takes effect on the next tool call — no restart.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, posix, resolve, win32 } from "node:path";
import { astrarcCandidates, profileFrom } from "./astrarc.js";
import { parseDotenv } from "./dotenv.js";
import { clean, parseBool } from "./sanitize.js";

export type SourceId = "env" | "dotenv" | "plugin-config" | "user-file" | "astra-cli" | "request";

export interface Sourced<T> {
  value: T;
  source: SourceId;
  /** Human-readable origin: a file path, "ASTRA_DB_API_ENDPOINT", "~/.astrarc [default]". */
  detail: string;
}

export type Environment = "astra" | "hcd" | "dse" | "cassandra" | "other";

export interface ResolvedCredentials {
  token?: Sourced<string>;
  endpoint?: Sourced<string>;
  keyspace?: Sourced<string>;
  /** Database name or id to pick when only a token is known (ASTRA_DB_NAME / ASTRA_DB_ID). */
  database?: Sourced<string>;
  /** Data API environment; anything other than "astra" disables DevOps lookups. */
  environment: Environment;
  /** Astra control-plane environment from the CLI profile (prod | dev | test). */
  astraEnv: "prod" | "dev" | "test";
  readOnly: boolean;
  /** Files that were consulted, for `doctor` and `connection_status`. */
  consulted: string[];
}

export interface CredentialProvider {
  resolve(): ResolvedCredentials;
}

const ALIASES = {
  token: ["ASTRA_DB_APPLICATION_TOKEN", "ASTRA_DB_TOKEN", "APPLICATION_TOKEN"],
  endpoint: ["ASTRA_DB_API_ENDPOINT", "API_ENDPOINT"],
  keyspace: ["ASTRA_DB_KEYSPACE", "ASTRA_DB_NAMESPACE"],
  database: ["ASTRA_DB_NAME", "ASTRA_DB_ID"],
} as const;

type Field = keyof typeof ALIASES;
const FIELDS = Object.keys(ALIASES) as Field[];

const PLUGIN_CONFIG = {
  token: "ASTRA_MCP_CONFIG_TOKEN",
  endpoint: "ASTRA_MCP_CONFIG_ENDPOINT",
  keyspace: "ASTRA_MCP_CONFIG_KEYSPACE",
  database: "ASTRA_MCP_CONFIG_DATABASE",
} as const;

export interface ResolverOptions {
  env?: NodeJS.ProcessEnv;
  cwd?: string;
  home?: string;
  platform?: NodeJS.Platform;
}

export function userCredentialsPath(env: NodeJS.ProcessEnv, home: string, platform: NodeJS.Platform): string {
  if (clean(env.ASTRA_MCP_CREDENTIALS_FILE)) return env.ASTRA_MCP_CREDENTIALS_FILE as string;
  // Join for the target platform, not the host (the two differ in tests and when paths are displayed).
  const path = platform === "win32" ? win32 : posix;
  if (platform === "win32" && env.APPDATA) return path.join(env.APPDATA, "astra-mcp", "credentials.json");
  const base = clean(env.XDG_CONFIG_HOME) ?? path.join(home, ".config");
  return path.join(base, "astra-mcp", "credentials.json");
}

/** Directories to search for dotenv files: the project dir upward to its git root (never past $HOME). */
export function dotenvDirectories(start: string, home: string, maxDepth = 8): string[] {
  const dirs: string[] = [];
  const stop = resolve(home);
  let dir = resolve(start);
  for (let depth = 0; depth < maxDepth; depth++) {
    dirs.push(dir);
    if (dir === stop || existsSync(join(dir, ".git"))) break;
    const parent = dirname(dir);
    // Stop at the filesystem root, and never climb into $HOME itself: a stray ~/.env
    // should not silently apply to every project that is not a git repository.
    if (parent === dir || parent === stop) break;
    dir = parent;
  }
  return dirs;
}

interface CachedFile<T> {
  mtimeMs: number;
  size: number;
  value: T;
}

export class CredentialResolver implements CredentialProvider {
  private readonly env: NodeJS.ProcessEnv;
  private readonly cwd: string;
  private readonly home: string;
  private readonly platform: NodeJS.Platform;
  private readonly cache = new Map<string, CachedFile<unknown>>();

  constructor(options: ResolverOptions = {}) {
    this.env = options.env ?? process.env;
    this.cwd = options.cwd ?? process.cwd();
    this.home = options.home ?? homedir();
    this.platform = options.platform ?? process.platform;
  }

  /** Read and parse a file, re-parsing only when mtime/size change. Missing/unreadable → undefined. */
  private readCached<T>(path: string, parse: (text: string) => T): T | undefined {
    let stat: { mtimeMs: number; size: number };
    try {
      const st = statSync(path);
      if (!st.isFile()) return undefined;
      stat = st;
    } catch {
      this.cache.delete(path);
      return undefined;
    }
    const hit = this.cache.get(path) as CachedFile<T> | undefined;
    if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) return hit.value;
    try {
      const value = parse(readFileSync(path, "utf8"));
      this.cache.set(path, { mtimeMs: stat.mtimeMs, size: stat.size, value });
      return value;
    } catch {
      return undefined;
    }
  }

  projectDir(): string {
    return clean(this.env.ASTRA_MCP_PROJECT_DIR) ?? clean(this.env.CLAUDE_PROJECT_DIR) ?? this.cwd;
  }

  resolve(): ResolvedCredentials {
    const found: Partial<Record<Field, Sourced<string>>> = {};
    const consulted: string[] = [];
    const take = (field: Field, value: string | undefined, source: SourceId, detail: string) => {
      const v = clean(value);
      if (v !== undefined && !found[field]) found[field] = { value: v, source, detail };
    };

    // 1. shell environment
    for (const field of FIELDS) {
      for (const name of ALIASES[field]) take(field, this.env[name], "env", name);
    }

    // 2. project dotenv files, nearest first; .env.local beats .env in the same directory
    for (const dir of dotenvDirectories(this.projectDir(), this.home)) {
      for (const name of [".env.local", ".env"]) {
        const path = join(dir, name);
        const vars = this.readCached(path, parseDotenv);
        if (!vars) continue;
        consulted.push(path);
        for (const field of FIELDS) {
          for (const key of ALIASES[field]) take(field, vars[key], "dotenv", path);
        }
      }
    }

    // 3. host plugin config (Claude Code userConfig / MCPB user_config), passed as env
    for (const field of FIELDS) take(field, this.env[PLUGIN_CONFIG[field]], "plugin-config", "plugin settings");

    // 4. user credentials file from `astra-mcp login --global`
    const userFile = userCredentialsPath(this.env, this.home, this.platform);
    const stored = this.readCached(userFile, (text) => JSON.parse(text) as Partial<Record<Field, string>>);
    if (stored) {
      consulted.push(userFile);
      for (const field of FIELDS) take(field, stored[field], "user-file", userFile);
    }

    // 5. Astra CLI profile (token only)
    let astraEnv: ResolvedCredentials["astraEnv"] = "prod";
    const profile = clean(this.env.ASTRA_PROFILE) ?? "default";
    for (const path of astrarcCandidates(this.env, this.home)) {
      const entry = this.readCached(path, (text) => profileFrom(text, profile));
      if (entry === undefined) continue;
      consulted.push(path);
      take("token", entry?.token, "astra-cli", `${path} [${profile}]`);
      if (entry?.environment && ["prod", "dev", "test"].includes(entry.environment.toLowerCase())) {
        astraEnv = entry.environment.toLowerCase() as ResolvedCredentials["astraEnv"];
      }
      break;
    }

    const envName = clean(this.env.ASTRA_DB_ENVIRONMENT)?.toLowerCase();
    const environment: Environment = ["hcd", "dse", "cassandra", "other"].includes(envName ?? "") ? (envName as Environment) : "astra";
    const readOnly = parseBool(this.env.ASTRA_MCP_READ_ONLY) ?? parseBool(this.env.ASTRA_MCP_CONFIG_READ_ONLY) ?? false;

    return { ...found, environment, astraEnv, readOnly, consulted };
  }
}

/** Fixed credentials (hosted mode: the request brings them). */
export class StaticCredentials implements CredentialProvider {
  constructor(private readonly creds: { token: string; endpoint?: string; keyspace?: string; readOnly?: boolean }) {}

  resolve(): ResolvedCredentials {
    const from = (value: string | undefined) => (value ? { value, source: "request" as const, detail: "request" } : undefined);
    return {
      token: from(this.creds.token),
      endpoint: from(this.creds.endpoint),
      keyspace: from(this.creds.keyspace),
      environment: "astra",
      astraEnv: "prod",
      readOnly: this.creds.readOnly ?? false,
      consulted: [],
    };
  }
}
