#!/usr/bin/env node
// Best-effort syntax check for the TypeScript example snippets: parse each
// file with the TypeScript compiler API and fail on parse diagnostics.
// Semantic checks are skipped -- snippets import packages that are not
// installed here.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: check_ts_syntax.mjs <directory>");
  process.exit(2);
}

let checked = 0;
let failures = 0;

for (const name of readdirSync(dir).filter((f) => f.endsWith(".ts")).sort()) {
  const path = join(dir, name);
  const source = ts.createSourceFile(
    path,
    readFileSync(path, "utf8"),
    ts.ScriptTarget.ES2022,
    true,
  );
  checked += 1;
  for (const diag of source.parseDiagnostics) {
    failures += 1;
    const { line } = source.getLineAndCharacterOfPosition(diag.start ?? 0);
    const message = ts.flattenDiagnosticMessageText(diag.messageText, " ");
    console.error(`${path}:${line + 1}: ${message}`);
  }
}

console.log(`checked ${checked} TypeScript snippets, ${failures} parse error(s)`);
process.exit(failures > 0 ? 1 : 0);
