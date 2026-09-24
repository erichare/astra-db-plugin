// Every place the release version lives. bump-version.mjs writes them all;
// check-versions.mjs fails CI when any of them drift apart.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PACKAGE_NAME = "@erichare/astra-mcp";
export const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

// Exact-version pins of the server inside plugin manifests: "@erichare/astra-mcp@2.0.0".
const PIN = /@erichare\/astra-mcp@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/g;

/** JSON files and the key paths that hold the version. `pins: true` also rewrites npx pins. */
export const JSON_TARGETS = [
  { file: ".claude-plugin/plugin.json", paths: [["version"]], pins: true },
  { file: ".claude-plugin/marketplace.json", paths: [["metadata", "version"]] },
  { file: ".codex-plugin/plugin.json", paths: [["version"]], pins: true },
  { file: "server/package.json", paths: [["version"]] },
  { file: "server/package-lock.json", paths: [["version"], ["packages", "", "version"]] },
  { file: "server/server.json", paths: [["version"], ["packages", 0, "version"]] },
  { file: "server/mcpb/manifest.json", paths: [["version"]], pins: true },
];

export const CHANGELOG = "CHANGELOG.md";

function getPath(obj, path) {
  return path.reduce((node, key) => (node == null ? undefined : node[key]), obj);
}

function setPath(obj, path, value) {
  const parent = getPath(obj, path.slice(0, -1));
  if (parent == null || !(path.at(-1) in parent)) {
    throw new Error(`missing key ${JSON.stringify(path)}`);
  }
  parent[path.at(-1)] = value;
}

/** [{file, where, version}] for every version location that exists in the tree. */
export function readVersions(root = REPO_ROOT) {
  const found = [];
  for (const target of JSON_TARGETS) {
    const abs = join(root, target.file);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, "utf8");
    const data = JSON.parse(text);
    for (const path of target.paths) {
      const version = getPath(data, path);
      if (version !== undefined) found.push({ file: target.file, where: path.join("."), version });
    }
    if (target.pins) {
      for (const match of text.matchAll(PIN)) {
        found.push({ file: target.file, where: `${PACKAGE_NAME} pin`, version: match[1] });
      }
    }
  }
  return found;
}

export function writeVersion(version, root = REPO_ROOT) {
  if (!SEMVER.test(version)) throw new Error(`not a semver version: ${version}`);
  const touched = [];
  for (const target of JSON_TARGETS) {
    const abs = join(root, target.file);
    if (!existsSync(abs)) continue;
    const data = JSON.parse(readFileSync(abs, "utf8"));
    for (const path of target.paths) {
      if (getPath(data, path) !== undefined) setPath(data, path, version);
    }
    let text = `${JSON.stringify(data, null, 2)}\n`;
    if (target.pins) text = text.replace(PIN, `${PACKAGE_NAME}@${version}`);
    writeFileSync(abs, text);
    touched.push(target.file);
  }
  return touched;
}

export function bump(version, level) {
  const [major, minor, patch] = version.split("-")[0].split(".").map(Number);
  switch (level) {
    case "major": return `${major + 1}.0.0`;
    case "minor": return `${major}.${minor + 1}.0`;
    case "patch": return `${major}.${minor}.${patch + 1}`;
    default:
      if (SEMVER.test(level)) return level;
      throw new Error(`unknown bump level or version: ${level}`);
  }
}

/** Promote "## Unreleased" to "## <version> — <date>", or add a stub entry. */
export function promoteChangelog(version, date, root = REPO_ROOT) {
  const abs = join(root, CHANGELOG);
  const header = "# Changelog\n";
  const text = existsSync(abs) ? readFileSync(abs, "utf8") : header;
  if (!text.startsWith(header)) throw new Error(`${CHANGELOG} must start with "# Changelog"`);
  const heading = `## ${version} — ${date}`;
  if (text.includes(heading)) return;
  if (text.includes("## Unreleased")) {
    writeFileSync(abs, text.replace("## Unreleased", heading));
    return;
  }
  const body = text.slice(header.length).replace(/^\n+/, "");
  writeFileSync(abs, `${header}\n${heading}\n\n- Maintenance release.\n\n${body}`);
}

/** The body of a version's changelog section (for GitHub Release notes). */
export function changelogSection(version, root = REPO_ROOT) {
  const text = readFileSync(join(root, CHANGELOG), "utf8");
  const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^## ${escaped} — [^\\n]+\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return match ? match[1].trim() : null;
}
