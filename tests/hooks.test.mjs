// The hooks, run as subprocesses the way Claude Code / Codex / Bob run them.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { REPO_ROOT } from "./helpers.mjs";

// Real token shape (24 letters : 64 hex), assembled at runtime so secret scanners don't flag the source.
const TOKEN = ["AstraCS", "abcdefghijklmnopqrstuvwx", "0123456789abcdef".repeat(4)].join(":");
const GUARD = join(REPO_ROOT, "hooks/credential-guard.mjs");
const SESSION = join(REPO_ROOT, "hooks/session-start.mjs");

function repo() {
  const dir = mkdtempSync(join(tmpdir(), "astra-hooks-"));
  execFileSync("git", ["init", "-q"], { cwd: dir });
  return dir;
}

function run(script, payload, { args = [], env = {} } = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    input: JSON.stringify(payload),
    encoding: "utf8",
    env: { PATH: process.env.PATH, HOME: mkdtempSync(join(tmpdir(), "astra-home-")), ...env },
  });
  let decision = null;
  try {
    decision = JSON.parse(result.stdout).hookSpecificOutput;
  } catch {}
  return { code: result.status, stdout: result.stdout, stderr: result.stderr, decision };
}

const write = (cwd, file, content) => ({ tool_name: "Write", cwd, tool_input: { file_path: join(cwd, file), content } });

test("guard denies a real token written into source", () => {
  const cwd = repo();
  const r = run(GUARD, write(cwd, "app.py", `token = "${TOKEN}"`));
  assert.equal(r.code, 0);
  assert.equal(r.decision.permissionDecision, "deny");
  assert.match(r.decision.permissionDecisionReason, /npx -y @erichare\/astra-mcp login/);
});

test("guard allows placeholders, env reads, and removing a token (old_string)", () => {
  const cwd = repo();
  assert.equal(run(GUARD, write(cwd, "app.py", 'token = os.environ["ASTRA_DB_APPLICATION_TOKEN"]')).stdout, "");
  assert.equal(run(GUARD, write(cwd, "README.md", "ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token-here")).stdout, "");
  const edit = { tool_name: "Edit", cwd, tool_input: { file_path: join(cwd, "app.py"), old_string: `"${TOKEN}"`, new_string: 'os.environ["ASTRA_DB_APPLICATION_TOKEN"]' } };
  assert.equal(run(GUARD, edit).stdout, "");
});

test("guard allows a git-ignored .env, asks for a tracked one, denies templates", () => {
  const cwd = repo();
  writeFileSync(join(cwd, ".gitignore"), ".env\n");
  assert.equal(run(GUARD, write(cwd, ".env", `ASTRA_DB_APPLICATION_TOKEN=${TOKEN}`)).stdout, "");
  const other = repo();
  assert.equal(run(GUARD, write(other, ".env", `ASTRA_DB_APPLICATION_TOKEN=${TOKEN}`)).decision.permissionDecision, "ask");
  assert.equal(run(GUARD, write(cwd, ".env.example", `ASTRA_DB_APPLICATION_TOKEN=${TOKEN}`)).decision.permissionDecision, "deny");
});

test("guard turns ask into deny for Codex and exits 2 for Bob", () => {
  const cwd = repo();
  const payload = write(cwd, ".env", `ASTRA_DB_APPLICATION_TOKEN=${TOKEN}`);
  assert.equal(run(GUARD, payload, { env: { PLUGIN_ROOT: "/p" } }).decision.permissionDecision, "deny");
  const bob = run(GUARD, write(cwd, "app.ts", `const t = "${TOKEN}"`), { args: ["--host=bob"] });
  assert.equal(bob.code, 2);
  assert.match(bob.stderr, /Blocked/);
});

test("guard inspects only added lines of an apply_patch and shell redirects", () => {
  const cwd = repo();
  const patch = `*** Begin Patch\n*** Update File: app.py\n-token = "${TOKEN}"\n+token = os.environ["ASTRA_DB_APPLICATION_TOKEN"]\n*** End Patch`;
  assert.equal(run(GUARD, { tool_name: "apply_patch", cwd, tool_input: { input: patch } }).stdout, "");
  const adding = patch.replace(`+token = os.environ["ASTRA_DB_APPLICATION_TOKEN"]`, `+token = "${TOKEN}"`);
  assert.equal(run(GUARD, { tool_name: "apply_patch", cwd, tool_input: { input: adding } }).decision.permissionDecision, "deny");
  assert.equal(run(GUARD, { tool_name: "Bash", cwd, tool_input: { command: `echo ${TOKEN} > config.txt` } }).decision.permissionDecision, "deny");
  assert.equal(run(GUARD, { tool_name: "Bash", cwd, tool_input: { command: `astra db list --token ${TOKEN}` } }).stdout, "");
});

test("guard never crashes on junk input", () => {
  const r = spawnSync(process.execPath, [GUARD], { input: "not json", encoding: "utf8" });
  assert.equal(r.status, 0);
});

test("session-start reports the credential source, never the token", () => {
  const cwd = repo();
  writeFileSync(join(cwd, ".env"), `ASTRA_DB_APPLICATION_TOKEN=${TOKEN}\nASTRA_DB_API_ENDPOINT=https://abc-us-east-2.apps.astra.datastax.com\nASTRA_DB_KEYSPACE=shop\n`);
  const r = run(SESSION, { cwd, hook_event_name: "SessionStart" });
  const context = r.decision.additionalContext;
  assert.match(context, /credentials from \.env → abc-us-east-2\.apps\.astra\.datastax\.com, keyspace shop/);
  assert.doesNotMatch(r.stdout, /AstraCS/);
});

test("session-start nudges Astra projects without credentials and stays silent otherwise", () => {
  const astra = repo();
  writeFileSync(join(astra, "requirements.txt"), "astrapy>=2\n");
  assert.match(run(SESSION, { cwd: astra }).decision.additionalContext, /npx -y @erichare\/astra-mcp login/);
  const plain = repo();
  assert.equal(run(SESSION, { cwd: plain }).stdout, "");
  const bob = run(SESSION, { cwd: astra }, { args: ["--host=bob"] });
  assert.match(bob.stdout, /^Astra DB:/);
});

test("session-start respects ignored plugin-config templates", () => {
  const cwd = repo();
  mkdirSync(join(cwd, "src"));
  const r = run(SESSION, { cwd }, { env: { ASTRA_MCP_CONFIG_TOKEN: "${user_config.token}" } });
  assert.equal(r.stdout, "");
});

test("hooks.json runs both hooks through node", async () => {
  const { readFileSync } = await import("node:fs");
  const config = JSON.parse(readFileSync(join(REPO_ROOT, "hooks/hooks.json"), "utf8"));
  const commands = JSON.stringify(config);
  assert.match(commands, /node \\"\$\{CLAUDE_PLUGIN_ROOT\}\/hooks\/credential-guard\.mjs\\"/);
  assert.match(commands, /session-start\.mjs/);
  assert.match(config.hooks.PreToolUse[0].matcher, /apply_patch/);
});
