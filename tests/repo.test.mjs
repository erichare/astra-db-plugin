// Integrity checks over the real repository: skills, links, assets.
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { REPO_ROOT, exists, frontmatter, read, relativeLinks, walk } from "./helpers.mjs";

const SKILLS = readdirSync(join(REPO_ROOT, "skills")).filter((name) => exists(`skills/${name}/SKILL.md`));
const LANGUAGES = ["python", "typescript", "java", "csharp", "go"];

test("every skill follows the Agent Skills spec (name matches folder, bounded description)", () => {
  assert.ok(SKILLS.length > 0);
  for (const skill of SKILLS) {
    const fields = frontmatter(read(`skills/${skill}/SKILL.md`));
    assert.ok(fields, `${skill}: missing frontmatter`);
    assert.equal(fields.name, skill, `${skill}: frontmatter name must match its folder`);
    assert.match(skill, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${skill}: name must be lowercase-hyphenated`);
    assert.ok(fields.description && fields.description.length <= 1024, `${skill}: description missing or > 1024 chars`);
    assert.ok(read(`skills/${skill}/SKILL.md`).split("\n").length < 500, `${skill}: SKILL.md must stay under 500 lines`);
  }
});

test("astra-toolkit ships every client language with a substantial example library", () => {
  for (const language of LANGUAGES) {
    const base = `skills/astra-toolkit/clients/${language}`;
    assert.ok(exists(`${base}/README.md`), `${language}: README missing`);
    const examples = readdirSync(join(REPO_ROOT, base, "examples"));
    assert.ok(examples.length >= 300, `${language}: only ${examples.length} examples`);
  }
});

test("relative links in shipped markdown resolve", () => {
  const docs = [...walk("skills"), ...walk("docs"), "README.md"].filter((p) => p.endsWith(".md") && exists(p));
  for (const doc of docs) {
    for (const target of relativeLinks(read(doc))) {
      assert.ok(existsSync(join(REPO_ROOT, dirname(doc), target)), `${doc}: broken link -> ${target}`);
    }
  }
});

test("SVG assets are well-formed with a viewBox", () => {
  for (const svg of walk("assets").filter((p) => p.endsWith(".svg"))) {
    const text = read(svg);
    assert.match(text, /<svg[\s>]/, `${svg}: not an SVG`);
    assert.match(text, /viewBox="/, `${svg}: missing viewBox`);
    assert.match(text.trim(), /<\/svg>$/, `${svg}: not terminated`);
  }
});

test("README local references resolve", () => {
  const text = read("README.md");
  for (const match of text.matchAll(/(?:src|href|srcset)="([^"#:]+)"|\]\(([^)\s#:]+)\)/g)) {
    const target = match[1] ?? match[2];
    if (!target || target.includes("://")) continue;
    assert.ok(exists(target), `README references missing path: ${target}`);
  }
});
