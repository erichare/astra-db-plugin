#!/usr/bin/env node
// Fail when the release version differs between any two manifests (or an npx
// pin), or when a tag ref (GITHUB_REF_NAME=vX.Y.Z / --tag vX.Y.Z) disagrees.
import { readVersions } from "./lib/versions.mjs";

const tagArg = process.argv.indexOf("--tag");
const tag = tagArg > 0 ? process.argv[tagArg + 1] : undefined;

const found = readVersions();
const versions = new Set(found.map((entry) => entry.version));
if (tag) versions.add(tag.replace(/^v/, ""));

if (versions.size !== 1) {
  console.error("version mismatch:");
  for (const entry of found) console.error(`  ${entry.file} (${entry.where}): ${entry.version}`);
  if (tag) console.error(`  tag: ${tag}`);
  process.exit(1);
}
console.log(`all ${found.length} version locations at ${[...versions][0]}`);
