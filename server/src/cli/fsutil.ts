/** File helpers for installers: JSONC-preserving edits, one-time backups, git checks. */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { type ModificationOptions, applyEdits, modify, parse, printParseErrorCode, type ParseError } from "jsonc-parser";

const FORMAT: ModificationOptions = { formattingOptions: { insertSpaces: true, tabSize: 2, eol: "\n" } };

export function readText(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}

export function readJsonc<T = Record<string, unknown>>(path: string): T | undefined {
  const text = readText(path);
  if (text === undefined || !text.trim()) return undefined;
  const errors: ParseError[] = [];
  const value = parse(text, errors, { allowTrailingComma: true });
  if (errors.length) throw new Error(`${path} is not valid JSON (${printParseErrorCode(errors[0].error)} at offset ${errors[0].offset}); fix it or remove it first`);
  return value as T;
}

/** Back up a file once (…/.bak-astra) before the first modification. */
export function backupOnce(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  const backup = `${path}.bak-astra`;
  if (!existsSync(backup)) copyFileSync(path, backup);
  return backup;
}

/**
 * Set (or with `undefined`, remove) a value at a JSON path in a JSON/JSONC file,
 * preserving comments and formatting. Returns before/after text (unchanged → equal).
 */
export function editJsonc(path: string, jsonPath: (string | number)[], value: unknown, options: { dryRun?: boolean } = {}) {
  const before = readText(path) ?? "";
  const base = before.trim() ? before : "{}\n";
  readJsonc(path); // throws on invalid JSON
  const edits = modify(base, jsonPath, value, FORMAT);
  let after = applyEdits(base, edits);
  if (!after.endsWith("\n")) after += "\n";
  if (!options.dryRun && after !== before) {
    mkdirSync(dirname(path), { recursive: true });
    backupOnce(path);
    writeFileSync(path, after);
  }
  return { before, after, changed: after !== before };
}

export function writeFileEnsured(path: string, content: string, mode?: number): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, mode ? { mode } : undefined);
}

/** Is `file` inside a git work tree, and is it ignored? */
export function gitIgnoreStatus(file: string): "ignored" | "not-ignored" | "no-git" {
  const cwd = dirname(file);
  const inside = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd, encoding: "utf8" });
  if (inside.status !== 0 || inside.stdout.trim() !== "true") return "no-git";
  const check = spawnSync("git", ["check-ignore", "-q", file], { cwd });
  return check.status === 0 ? "ignored" : "not-ignored";
}

export function gitRoot(dir: string): string | undefined {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd: dir, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : undefined;
}

/** Commands on PATH (portable `which`). */
export function onPath(command: string): boolean {
  const probe = process.platform === "win32" ? spawnSync("where", [command], { stdio: "ignore" }) : spawnSync("sh", ["-c", `command -v ${command}`], { stdio: "ignore" });
  return probe.status === 0;
}

export interface RunResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
}

export function run(command: string, args: string[], options: { cwd?: string; timeoutMs?: number } = {}): RunResult {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    timeout: options.timeoutMs ?? 120_000,
    shell: process.platform === "win32",
  });
  return { ok: result.status === 0, code: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}
