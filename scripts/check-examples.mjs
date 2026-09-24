#!/usr/bin/env node
// Syntax-check the vendored Data API examples, one snippet at a time.
//
//   node scripts/check-examples.mjs [--strict]
//
// - no credential placeholders remain (examples read ASTRA_DB_* env vars)
// - Python: py_compile per snippet    - TypeScript: parser diagnostics
// - Go: gofmt -e per snippet          - Java: javac tree parse
// Snippets that contain bare template placeholders (e.g. **MODEL_DIMENSIONS**
// outside a string) are intentionally not valid code and are skipped.
// Missing toolchains are skipped with a warning unless --strict.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EXTENSIONS, exampleFiles } from "./codemod-examples.mjs";
import { REPO_ROOT } from "./lib/versions.mjs";

const strict = process.argv.includes("--strict");
const BOUNDARY = /^(?:#|\/\/) =+\s+BOUNDARY BETWEEN EXAMPLE SNIPPETS\s+=+$/m;
const CREDENTIAL_PLACEHOLDER = /"\*\*(APPLICATION_TOKEN|API_ENDPOINT)\*\*"/;
const BARE_TEMPLATE = /(^|[^"\w])\*\*[A-Z][A-Z_]*\*\*(?!")/m;
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(message);
}

function has(cmd, args = ["--version"]) {
  return !spawnSync(cmd, args, { input: "", stdio: ["pipe", "ignore", "ignore"] }).error;
}

function skipped(lang, why) {
  const message = `skip ${lang}: ${why}`;
  if (strict) fail(message);
  else console.warn(message);
}

/** [{file, index, code}] for every checkable snippet of a language. */
function snippets(lang) {
  const out = [];
  for (const file of exampleFiles(lang)) {
    const text = readFileSync(file, "utf8");
    if (CREDENTIAL_PLACEHOLDER.test(text)) fail(`${file}: credential placeholder left (run codemod-examples.mjs)`);
    text.split(BOUNDARY).forEach((code, index) => {
      if (!BARE_TEMPLATE.test(code)) out.push({ file, index, code });
    });
  }
  return out;
}

function writeSnippets(lang, list) {
  const dir = mkdtempSync(join(tmpdir(), `astra-examples-${lang}-`));
  return list.map((snippet, i) => {
    // Java requires the file name to match a public class; parse-only mode tolerates mismatch.
    const path = join(dir, `s${i}${EXTENSIONS[lang]}`);
    writeFileSync(path, snippet.code);
    return { ...snippet, path };
  });
}

function checkPython() {
  if (!has("python3")) return skipped("python", "python3 not found");
  const written = writeSnippets("python", snippets("python"));
  const script = [
    "import sys",
    "bad = 0",
    "for p in sys.argv[1:]:",
    "    try: compile(open(p, encoding='utf-8').read(), p, 'exec')",
    "    except SyntaxError as e: bad += 1; print(f'{p}:{e.lineno}: {e.msg}', file=sys.stderr)",
    "sys.exit(1 if bad else 0)",
  ].join("\n");
  const result = spawnSync("python3", ["-c", script, ...written.map((s) => s.path)], { encoding: "utf8" });
  if (result.status !== 0) fail(`python: syntax errors\n${result.stderr}`);
  console.log(`python: ${written.length} snippets`);
}

function checkTypeScript() {
  let ts;
  try {
    ts = createRequire(join(REPO_ROOT, "server/package.json"))("typescript");
  } catch {
    return skipped("typescript", "typescript not installed (npm ci in server/)");
  }
  const list = snippets("typescript");
  for (const { file, index, code } of list) {
    const source = ts.createSourceFile(file, code, ts.ScriptTarget.ES2022, true);
    for (const diag of source.parseDiagnostics) {
      const { line } = source.getLineAndCharacterOfPosition(diag.start ?? 0);
      fail(`${file}#${index}:${line + 1}: ${ts.flattenDiagnosticMessageText(diag.messageText, " ")}`);
    }
  }
  console.log(`typescript: ${list.length} snippets`);
}

function checkGo() {
  if (!has("gofmt", [])) return skipped("go", "gofmt not found");
  const list = snippets("go");
  for (const { file, index, code } of list) {
    const result = spawnSync("gofmt", ["-e"], { input: code, encoding: "utf8" });
    if (result.status !== 0) fail(`${file}#${index}: ${result.stderr.trim()}`);
  }
  console.log(`go: ${list.length} snippets`);
}

function checkJava() {
  if (!has("java", ["-version"])) return skipped("java", "java not found");
  const written = writeSnippets("java", snippets("java"));
  try {
    execFileSync("java", [join(REPO_ROOT, "scripts/checks/ParseJava.java"), ...written.map((s) => s.path)], {
      stdio: ["ignore", "inherit", "pipe"],
      encoding: "utf8",
    });
  } catch (err) {
    fail(`java: parse errors\n${err.stderr}`);
  }
}

mkdirSync(tmpdir(), { recursive: true });
checkPython();
checkTypeScript();
checkGo();
checkJava();
snippets("csharp"); // placeholder check only; no C# parser in this toolchain
if (failures) {
  console.error(`${failures} example check failure(s)`);
  process.exit(1);
}
console.log("examples OK");
