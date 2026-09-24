import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { bump, changelogSection, promoteChangelog, readVersions, writeVersion } from "../scripts/lib/versions.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "astra-versions-"));
  mkdirSync(join(root, ".claude-plugin"));
  mkdirSync(join(root, "server"));
  writeFileSync(join(root, ".claude-plugin/plugin.json"), JSON.stringify({
    name: "astra-db", version: "1.2.1",
    mcpServers: { "astra-db": { command: "npx", args: ["-y", "@erichare/astra-mcp@1.2.1"] } },
  }));
  writeFileSync(join(root, ".claude-plugin/marketplace.json"), JSON.stringify({ metadata: { version: "1.2.1" } }));
  writeFileSync(join(root, "server/package.json"), JSON.stringify({ name: "@erichare/astra-mcp", version: "1.2.1" }));
  writeFileSync(join(root, "CHANGELOG.md"), "# Changelog\n\n## Unreleased\n\n- Something new.\n\n## 1.2.1 — 2026-08-21\n\n- Old.\n");
  return root;
}

test("bump handles levels and explicit versions", () => {
  assert.equal(bump("1.2.1", "patch"), "1.2.2");
  assert.equal(bump("1.2.1", "minor"), "1.3.0");
  assert.equal(bump("1.2.1", "major"), "2.0.0");
  assert.equal(bump("1.2.1", "2.0.0-rc.1"), "2.0.0-rc.1");
  assert.throws(() => bump("1.2.1", "huge"));
});

test("writeVersion updates every manifest and npx pin; readVersions sees them", () => {
  const root = fixture();
  writeVersion("2.0.0", root);
  const versions = new Set(readVersions(root).map((v) => v.version));
  assert.deepEqual([...versions], ["2.0.0"]);
  const plugin = JSON.parse(readFileSync(join(root, ".claude-plugin/plugin.json"), "utf8"));
  assert.deepEqual(plugin.mcpServers["astra-db"].args, ["-y", "@erichare/astra-mcp@2.0.0"]);
});

test("readVersions reports drift", () => {
  const root = fixture();
  writeFileSync(join(root, "server/package.json"), JSON.stringify({ version: "0.1.0" }));
  const versions = new Set(readVersions(root).map((v) => v.version));
  assert.equal(versions.size, 2);
});

test("promoteChangelog promotes Unreleased and changelogSection extracts it", () => {
  const root = fixture();
  promoteChangelog("2.0.0", "2026-09-24", root);
  const text = readFileSync(join(root, "CHANGELOG.md"), "utf8");
  assert.match(text, /^## 2\.0\.0 — 2026-09-24$/m);
  assert.doesNotMatch(text, /Unreleased/);
  assert.equal(changelogSection("2.0.0", root), "- Something new.");
  assert.equal(changelogSection("1.2.1", root), "- Old.");
  assert.equal(changelogSection("9.9.9", root), null);
});

test("promoteChangelog adds a stub entry without an Unreleased section", () => {
  const root = fixture();
  writeFileSync(join(root, "CHANGELOG.md"), "# Changelog\n\n## 1.2.1 — 2026-08-21\n\n- Old.\n");
  promoteChangelog("1.2.2", "2026-09-24", root);
  assert.match(readFileSync(join(root, "CHANGELOG.md"), "utf8"), /## 1\.2\.2 — 2026-09-24\n\n- Maintenance release\./);
});

test("check-versions passes on the real repository", () => {
  const out = execFileSync(process.execPath, ["scripts/check-versions.mjs"], { encoding: "utf8" });
  assert.match(out, /all \d+ version locations at/);
});
