#!/usr/bin/env node
// SessionStart: one line of context about the Astra DB connection — offline,
// fast, and silent in projects that don't use Astra DB. Never prints secrets.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { credentialSources, detectHost, endpointHost, projectDirs, readStdinJson } from "./lib/common.mjs";

const SIGNALS = [
  ["package.json", /@datastax\/astra-db-ts/],
  ["requirements.txt", /astrapy/i],
  ["pyproject.toml", /astrapy/i],
  ["go.mod", /astra-db-go/],
  ["pom.xml", /astra-db-java/],
  ["build.gradle", /astra-db-java/],
  ["build.gradle.kts", /astra-db-java/],
  [".env", /ASTRA_DB_|APPLICATION_TOKEN|API_ENDPOINT/],
  [".env.example", /ASTRA_DB_/],
];

export function usesAstra(dir) {
  for (const d of projectDirs(dir)) {
    for (const [file, pattern] of SIGNALS) {
      try {
        if (existsSync(join(d, file)) && pattern.test(readFileSync(join(d, file), "utf8"))) return true;
      } catch {}
    }
    try {
      if (readdirSync(d).some((f) => f.endsWith(".csproj") && /DataStax\.AstraDB/.test(readFileSync(join(d, f), "utf8")))) return true;
    } catch {}
  }
  return false;
}

export function contextLine(projectDir, env = process.env) {
  const found = credentialSources(projectDir, env);
  if (found.token) {
    const target = found.endpoint ? endpointHost(found.endpoint.value) : "a database picked via the DevOps API";
    const readOnly = /^(1|true|yes|on)$/i.test(env.ASTRA_MCP_READ_ONLY ?? env.ASTRA_MCP_CONFIG_READ_ONLY ?? "") ? ", read-only" : "";
    return `Astra DB: credentials from ${found.token.source} → ${target}${found.keyspace ? `, keyspace ${found.keyspace.value}` : ""}${readOnly}. The astra-db MCP tools (database_overview, describe_collection, find, vector_search, …) can inspect the real schema before you write code against it.`;
  }
  if (usesAstra(projectDir)) {
    return "Astra DB: this project uses Astra DB, but no credentials were found. If live database access is needed, ask the user to run `npx -y @erichare/astra-mcp login` in their own terminal — never ask for the token in chat.";
  }
  return "";
}

async function main() {
  const host = detectHost();
  const payload = await readStdinJson();
  const dir = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
  const line = contextLine(dir);
  if (!line) return;
  if (host === "bob") process.stdout.write(`${line}\n`);
  else process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: line } }));
}

if (process.argv[1]?.endsWith("session-start.mjs")) main().catch(() => undefined);
