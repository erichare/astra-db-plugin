#!/usr/bin/env node
// PreToolUse: stop an agent from writing a real Astra DB token (AstraCS:…) into
// files. Only NEW content is inspected (so removing a leaked token is allowed);
// a git-ignored .env is allowed; example/sample/template env files never are.
//
// Hosts: Claude Code (JSON decision; "ask" when an .env is not git-ignored),
// Codex (JSON "deny" — its hooks fail open on "ask"), Bob (--host=bob: exit 2).
import { basename, dirname, isAbsolute, join } from "node:path";
import { detectHost, gitIgnored, inGitRepo, readStdinJson } from "./lib/common.mjs";

const TOKEN = /AstraCS:[A-Za-z0-9]{16,}:[A-Za-z0-9]{32,}|AstraCS:[A-Za-z0-9:_-]{48,}/;
const PATCH_FILE = /^\*\*\* (?:Add|Update) File: (.+)$/;

/** [{path, text}] — the new content each tool call would write. */
export function newContent(toolName, input = {}) {
  const out = [];
  const add = (path, text) => {
    if (typeof text === "string" && text) out.push({ path: typeof path === "string" ? path : undefined, text });
  };
  switch (toolName) {
    case "Write":
      add(input.file_path, input.content);
      return out;
    case "Edit":
      add(input.file_path, input.new_string);
      return out;
    case "MultiEdit":
      for (const edit of input.edits ?? []) add(input.file_path, edit?.new_string);
      return out;
    case "NotebookEdit":
      add(input.notebook_path, input.new_source);
      return out;
    default:
      break;
  }
  const strings = [];
  const collect = (value, key = "") => {
    if (typeof value === "string") strings.push({ key, value });
    else if (Array.isArray(value)) value.forEach((v) => collect(v, key));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) collect(v, k);
  };
  collect(input);
  const patch = strings.find((s) => s.value.includes("*** Begin Patch"));
  if (patch) {
    let file;
    for (const line of patch.value.split("\n")) {
      const header = line.match(PATCH_FILE);
      if (header) file = header[1].trim();
      else if (line.startsWith("+") && !line.startsWith("+++")) add(file, line.slice(1));
    }
    return out;
  }
  if (/^(Bash|shell|exec_command|run_shell_command)$/.test(toolName)) {
    const command = strings.map((s) => s.value).join(" ");
    // Only commands that write files: redirects, tee, heredocs.
    if (!/(>|\btee\b|<<)/.test(command)) return out;
    const target = command.match(/(?:>>?|\btee\s+(?:-a\s+)?)\s*["']?([^\s"';|&]+)/)?.[1];
    add(target, command);
    return out;
  }
  // Unknown tools (e.g. Bob): everything except the text being replaced.
  for (const s of strings) if (!/^(old|search|original)/i.test(s.key)) add(input.file_path ?? input.path, s.value);
  return out;
}

export function classify(path, cwd) {
  if (!path) return "source";
  const name = basename(path);
  if (!/^\.env(\..+)?$/.test(name)) return "source";
  if (/\.(example|sample|template|dist)$/.test(name)) return "template";
  const abs = isAbsolute(path) ? path : join(cwd, path);
  if (!inGitRepo(dirname(abs))) return "env-unknown";
  return gitIgnored(abs, dirname(abs)) ? "env-ignored" : "env-tracked";
}

function respond(host, decision, reason) {
  if (host === "bob") {
    process.stderr.write(`${reason}\n`);
    process.exit(2);
  }
  const effective = host === "codex" && decision === "ask" ? "deny" : decision;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: effective, permissionDecisionReason: reason },
  }));
  process.exit(0);
}

async function main() {
  const host = detectHost();
  const payload = await readStdinJson();
  const cwd = payload.cwd || process.cwd();
  const hits = newContent(payload.tool_name ?? "", payload.tool_input ?? {}).filter((c) => TOKEN.test(c.text));
  if (!hits.length) process.exit(0);

  const kinds = hits.map((h) => classify(h.path, cwd));
  if (kinds.every((k) => k === "env-ignored")) process.exit(0);
  if (kinds.includes("source") || kinds.includes("template")) {
    respond(host, "deny", [
      "Blocked: this would hardcode an Astra DB application token (AstraCS:…).",
      "Read it from the environment instead (ASTRA_DB_APPLICATION_TOKEN, e.g. from a git-ignored .env).",
      "To connect, the user runs `npx -y @erichare/astra-mcp login` in their terminal. Rotate the token if it was ever committed.",
    ].join(" "));
  }
  respond(host, "ask", "This writes an Astra DB token into an .env file that git does not ignore. Add .env to .gitignore first (or confirm you want this).");
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("credential-guard.mjs")) {
  main().catch(() => process.exit(0));
}
