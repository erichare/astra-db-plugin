#!/usr/bin/env node
// Bump the release version everywhere it lives (plugin manifests, the npm
// package, MCP Registry and MCPB manifests, exact npx pins) and promote the
// CHANGELOG's "## Unreleased" section.
//
//   node scripts/bump-version.mjs <major|minor|patch|X.Y.Z>
//
// Prints the new version.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT, bump, promoteChangelog, writeVersion } from "./lib/versions.mjs";

const level = process.argv[2];
if (!level) {
  console.error("usage: bump-version.mjs <major|minor|patch|X.Y.Z>");
  process.exit(2);
}

try {
  const current = JSON.parse(readFileSync(join(REPO_ROOT, ".claude-plugin/plugin.json"), "utf8")).version;
  const next = bump(current, level);
  writeVersion(next);
  promoteChangelog(next, new Date().toISOString().slice(0, 10));
  console.log(next);
} catch (err) {
  console.error(`version bump failed: ${err.message}`);
  process.exit(1);
}
