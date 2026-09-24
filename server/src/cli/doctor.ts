/** `astra-mcp doctor`: diagnose credentials, connectivity, hygiene, and agent setup. */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { AstraConnections, endpointHost } from "../astra/connection.js";
import { toAstraMcpError } from "../astra/errors.js";
import type { AstraGateway } from "../astra/gateway.js";
import { CredentialResolver } from "../credentials/resolver.js";
import { maskToken } from "../credentials/sanitize.js";
import { VERSION } from "../version.js";
import { AGENTS, type Env } from "./agents.js";
import { gitIgnoreStatus } from "./fsutil.js";

export type CheckStatus = "ok" | "warn" | "fail" | "skip";

export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  fix?: string;
}

export interface DoctorOptions {
  env: Env;
  live?: boolean;
  agents?: boolean;
}

export async function doctor(gateway: AstraGateway, options: DoctorOptions): Promise<Check[]> {
  const { env } = options;
  const checks: Check[] = [];
  const add = (check: Check) => checks.push(check);

  const major = Number(process.versions.node.split(".")[0]);
  add({
    id: "node", label: "Node.js", status: major >= 20 ? "ok" : "fail", detail: `v${process.versions.node} (astra-mcp ${VERSION})`,
    fix: major >= 20 ? undefined : "Install Node.js 20 or newer (https://nodejs.org).",
  });

  const resolver = new CredentialResolver({ env: env.env, cwd: env.cwd, home: env.home, platform: env.platform });
  const creds = resolver.resolve();
  add(creds.token
    ? { id: "token", label: "Token", status: "ok", detail: `${maskToken(creds.token.value)} from ${creds.token.detail}` }
    : { id: "token", label: "Token", status: "fail", detail: "not found (env, .env, plugin settings, ~/.astrarc)", fix: "Run `npx -y @erichare/astra-mcp login`." });
  add(creds.endpoint
    ? { id: "endpoint", label: "Endpoint", status: "ok", detail: `${endpointHost(creds.endpoint.value)} from ${creds.endpoint.detail}` }
    : { id: "endpoint", label: "Endpoint", status: creds.token ? "warn" : "skip", detail: "not set — the database is picked via the DevOps API", fix: creds.token ? "Set ASTRA_DB_API_ENDPOINT (login does this) to pin a database." : undefined });
  if (creds.keyspace) add({ id: "keyspace", label: "Keyspace", status: "ok", detail: `${creds.keyspace.value} from ${creds.keyspace.detail}` });
  if (creds.readOnly) add({ id: "read-only", label: "Mode", status: "ok", detail: "read-only (write tools disabled)" });

  if (options.live !== false && creds.token) {
    const connections = new AstraConnections(resolver, gateway);
    try {
      const target = await connections.target();
      const schema = await connections.schema(target, true);
      add({ id: "data-api", label: "Data API", status: "ok", detail: `${target.database.name ?? endpointHost(target.endpoint)} · ${target.keyspace}: ${schema.collections.length} collection(s), ${schema.tables.length} table(s)` });
    } catch (err) {
      const e = toAstraMcpError(err);
      add({ id: "data-api", label: "Data API", status: "fail", detail: e.toPayload().message, fix: e.hint });
    }
  }

  const envFile = join(env.cwd, ".env");
  if (existsSync(envFile)) {
    const status = gitIgnoreStatus(envFile);
    add({
      id: "gitignore", label: ".env ignored", status: status === "not-ignored" ? "fail" : "ok",
      detail: status === "no-git" ? "not a git repository" : status === "ignored" ? "yes" : "NO — .env would be committed",
      fix: status === "not-ignored" ? "Add `.env` to .gitignore." : undefined,
    });
  }

  const grep = spawnSync("git", ["grep", "-lE", "AstraCS:[A-Za-z0-9]{16,}:[A-Za-z0-9]{16,}"], { cwd: env.cwd, encoding: "utf8" });
  if (grep.status === 0 && grep.stdout.trim()) {
    add({
      id: "committed-tokens", label: "Tracked tokens", status: "fail", detail: `tokens in: ${grep.stdout.trim().split("\n").slice(0, 5).join(", ")}`,
      fix: "Move them to .env, rotate the tokens in the Astra console, and purge them from git history.",
    });
  } else if (grep.status === 1) {
    add({ id: "committed-tokens", label: "Tracked tokens", status: "ok", detail: "none found in git-tracked files" });
  }

  if (options.agents !== false) {
    for (const agent of AGENTS) {
      if (!agent.detect(env)) continue;
      const status = agent.status(env, { project: false });
      if (status === "unknown") continue;
      add({
        id: `agent-${agent.id}`, label: agent.label,
        status: status === "configured" ? "ok" : "warn",
        detail: status === "configured" ? "configured" : status === "legacy" ? "legacy astra-widgets / @datastax/astra-db-mcp entry" : "not configured",
        fix: status === "configured" ? undefined : `npx -y @erichare/astra-mcp init --agents ${agent.id}`,
      });
    }
  }
  return checks;
}

const ICON: Record<CheckStatus, string> = { ok: "✓", warn: "!", fail: "✗", skip: "·" };

export function formatChecks(checks: Check[]): string {
  const width = Math.max(...checks.map((c) => c.label.length));
  return checks.map((c) => `${ICON[c.status]} ${c.label.padEnd(width)}  ${c.detail}${c.fix ? `\n  ${" ".repeat(width)}  → ${c.fix}` : ""}`).join("\n");
}
