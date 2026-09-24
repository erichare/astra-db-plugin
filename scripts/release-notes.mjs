#!/usr/bin/env node
// Print the CHANGELOG section for a version (used as the GitHub Release body).
//
//   node scripts/release-notes.mjs 2.0.0
import { changelogSection } from "./lib/versions.mjs";

const version = (process.argv[2] ?? "").replace(/^v/, "");
if (!version) {
  console.error("usage: release-notes.mjs <version>");
  process.exit(2);
}
console.log(changelogSection(version) ?? "See CHANGELOG.md.");
