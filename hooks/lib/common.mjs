// Shared helpers for the Astra DB hooks (plain ESM, no dependencies, fast).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

/** Which agent is running us: --host=<id> wins; Codex exports PLUGIN_ROOT. */
export function detectHost(argv = process.argv, env = process.env) {
  const flag = argv.find((a) => a.startsWith("--host="));
  if (flag) return flag.slice("--host=".length);
  if (env.PLUGIN_ROOT && !env.CLAUDECODE) return "codex";
  return "claude";
}

export async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

const TEMPLATE = /^\$\{[^}]*\}$/;
export function clean(value) {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v && !TEMPLATE.test(v) ? v : undefined;
}

export function parseDotenv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') || v.startsWith("'")) && v.lastIndexOf(v[0]) > 0) v = v.slice(1, v.lastIndexOf(v[0]));
    else v = v.replace(/\s+#.*$/, "").trim();
    out[m[1]] = v;
  }
  return out;
}

function readIf(path) {
  try {
    return statSync(path).isFile() ? readFileSync(path, "utf8") : undefined;
  } catch {
    return undefined;
  }
}

/** Project directories from `start` up to the git root, never into $HOME. */
export function projectDirs(start, home = homedir()) {
  const dirs = [];
  let dir = resolve(start);
  const stop = resolve(home);
  for (let i = 0; i < 8; i++) {
    dirs.push(dir);
    if (dir === stop || existsSync(join(dir, ".git"))) break;
    const parent = dirname(dir);
    if (parent === dir || parent === stop) break;
    dir = parent;
  }
  return dirs;
}

const ALIASES = {
  token: ["ASTRA_DB_APPLICATION_TOKEN", "ASTRA_DB_TOKEN", "APPLICATION_TOKEN"],
  endpoint: ["ASTRA_DB_API_ENDPOINT", "API_ENDPOINT"],
  keyspace: ["ASTRA_DB_KEYSPACE", "ASTRA_DB_NAMESPACE"],
};

/**
 * Where credentials would come from (same order as the MCP server): env,
 * project dotenv, plugin config, user credentials file, Astra CLI profile.
 * Returns sources only — never values.
 */
export function credentialSources(projectDir, env = process.env, home = homedir()) {
  const found = {};
  const take = (field, value, source) => {
    if (!found[field] && clean(value)) found[field] = { source, value: clean(value) };
  };
  for (const [field, names] of Object.entries(ALIASES)) for (const n of names) take(field, env[n], n);
  for (const dir of projectDirs(projectDir, home)) {
    for (const name of [".env.local", ".env"]) {
      const text = readIf(join(dir, name));
      if (!text) continue;
      const vars = parseDotenv(text);
      for (const [field, names] of Object.entries(ALIASES)) for (const n of names) take(field, vars[n], name);
    }
  }
  take("token", env.ASTRA_MCP_CONFIG_TOKEN, "plugin settings");
  take("endpoint", env.ASTRA_MCP_CONFIG_ENDPOINT, "plugin settings");
  take("keyspace", env.ASTRA_MCP_CONFIG_KEYSPACE, "plugin settings");
  const base = clean(env.XDG_CONFIG_HOME) ?? join(home, ".config");
  const userFile = clean(env.ASTRA_MCP_CREDENTIALS_FILE) ?? (process.platform === "win32" && env.APPDATA ? join(env.APPDATA, "astra-mcp", "credentials.json") : join(base, "astra-mcp", "credentials.json"));
  const stored = readIf(userFile);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      take("token", data.token, "astra-mcp login --global");
      take("endpoint", data.endpoint, "astra-mcp login --global");
      take("keyspace", data.keyspace, "astra-mcp login --global");
    } catch {}
  }
  for (const path of [env.ASTRARC, env.XDG_CONFIG_HOME && join(env.XDG_CONFIG_HOME, "astra", ".astrarc"), join(home, ".astrarc")].filter(Boolean)) {
    const text = readIf(path);
    if (!text) continue;
    const profile = clean(env.ASTRA_PROFILE) ?? "default";
    const section = text.split(/^\[/m).find((s) => s.startsWith(`${profile}]`));
    const token = section?.match(/^ASTRA_DB_APPLICATION_TOKEN\s*=\s*(.+)$/m)?.[1];
    take("token", token?.trim().replace(/^["']|["']$/g, ""), "Astra CLI profile");
    break;
  }
  return found;
}

export function endpointHost(endpoint) {
  try {
    return new URL(endpoint).hostname;
  } catch {
    return "unknown";
  }
}

export function gitIgnored(file, cwd) {
  const r = spawnSync("git", ["check-ignore", "-q", file], { cwd, stdio: "ignore", timeout: 3000 });
  return r.status === 0;
}

export function inGitRepo(cwd) {
  const r = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd, encoding: "utf8", timeout: 3000 });
  return r.status === 0 && r.stdout.trim() === "true";
}
