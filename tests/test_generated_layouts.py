"""Integrity tests over the committed generated layouts: codex/skills and .bob."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from conftest import REPO_ROOT
from test_skill_integrity import content_files, frontmatter

CODEX_SKILLS = REPO_ROOT / "codex" / "skills"
BOB = REPO_ROOT / ".bob"
CANONICAL = REPO_ROOT / "skills" / "astra-toolkit"
PORTED_SKILLS = {
    "astra-setup",
    "astra-doctor",
    "astra-data-model-review",
    "astra-overview",
    "astra-collection",
    "astra-similar",
    "astra-explore",
    "astra-reviewer",
    "astra-data-modeler",
    "astra-migration-helper",
}
PLUGIN_SKILLS = {"astra-toolkit", "astra-widgets"}


def test_codex_skills_collection_is_complete():
    assert {p.name for p in CODEX_SKILLS.iterdir() if p.is_dir()} == PORTED_SKILLS | PLUGIN_SKILLS


@pytest.mark.parametrize("skill", sorted(PORTED_SKILLS))
def test_codex_ported_skill_is_routable_and_rewritten(skill: str):
    text = (CODEX_SKILLS / skill / "SKILL.md").read_text()
    fields = frontmatter(CODEX_SKILLS / skill / "SKILL.md")
    assert fields["name"] == skill
    assert "Use when" in fields["description"]
    assert "tools:" not in text.split("---")[1]
    assert "/astra-db:" not in text
    assert "CLAUDE_PLUGIN_ROOT" not in text
    assert "../skills/astra-toolkit/" not in text


def test_codex_astra_toolkit_copy_matches_canonical():
    assert content_files(CODEX_SKILLS / "astra-toolkit") == content_files(CANONICAL)


def test_codex_plugin_root_is_self_contained():
    codex_root = REPO_ROOT / "codex"
    manifest = json.loads((codex_root / ".codex-plugin" / "plugin.json").read_text())
    assert manifest["skills"] == "./skills/"
    assert manifest["hooks"] == "./hooks/hooks.json"
    assert manifest["mcpServers"] == "./.mcp.json"
    assert (codex_root / "hooks" / "hooks.json").read_text() == (REPO_ROOT / "hooks" / "hooks.json").read_text()
    assert (codex_root / "hooks" / "scripts" / "credential-guard.sh").is_file()
    assert "astra-db" in json.loads((codex_root / ".mcp.json").read_text())
    assert not (codex_root / "commands").exists()  # nothing for Codex to auto-import


def test_bob_commands_present_and_rewritten():
    names = sorted(p.name for p in (BOB / "commands").glob("*.md"))
    assert names == sorted(f"astra-{c}.md" for c in ("setup", "doctor", "data-model-review", "overview", "collection", "similar", "explore"))
    for name in names:
        text = (BOB / "commands" / name).read_text()
        assert frontmatter(BOB / "commands" / name)["description"]
        assert "/astra-db:" not in text and "CLAUDE_PLUGIN_ROOT" not in text


def test_bob_custom_modes_yaml_is_valid_and_scoped():
    yaml = pytest.importorskip("yaml")
    modes = yaml.safe_load((BOB / "custom_modes.yaml").read_text())["customModes"]
    by_slug = {m["slug"]: m for m in modes}
    assert set(by_slug) == {"astra-reviewer", "astra-data-modeler", "astra-migration-helper"}
    assert by_slug["astra-reviewer"]["groups"] == ["read", "execute", "skill"]
    assert by_slug["astra-data-modeler"]["groups"] == ["read", "skill"]
    assert by_slug["astra-migration-helper"]["groups"] == ["read", "execute", "skill"]
    for mode in modes:
        assert mode["roleDefinition"].startswith("You are")
        assert "edit" not in mode["groups"]
        assert ".bob/skills/astra-toolkit/" in mode["customInstructions"]


def test_bob_mcp_and_rule():
    servers = json.loads((BOB / "mcp.json").read_text())["mcpServers"]
    assert servers["astra-db"] == {"command": "npx", "args": ["-y", "@datastax/astra-db-mcp"]}
    assert servers["astra-widgets"] == {"command": "node", "args": [".bob/server/index.js"]}
    rule = (BOB / "rules" / "astra-db.md").read_text()
    assert "AstraCS" in rule and ".bob/skills/astra-toolkit/" in rule


def test_hooks_matcher_covers_codex_edit_tool():
    hooks = json.loads((REPO_ROOT / "hooks" / "hooks.json").read_text())["hooks"]
    assert hooks["PreToolUse"][0]["matcher"] == "Write|Edit|apply_patch"
    assert hooks["SessionStart"][0]["hooks"][0]["statusMessage"]


def test_plugin_skills_ship_to_both_layouts():
    for root in (CODEX_SKILLS, BOB / "skills"):
        assert (root / "astra-widgets" / "SKILL.md").is_file()
        assert (root / "astra-widgets" / "templates" / "similarity.html").is_file()
    assert content_files(CODEX_SKILLS / "astra-widgets") == content_files(REPO_ROOT / "skills" / "astra-widgets")


def test_server_bundle_copies_match_build():
    bundle = (REPO_ROOT / "server" / "dist" / "index.js").read_bytes()
    assert len(bundle) > 100_000
    assert (REPO_ROOT / "codex" / "server" / "index.js").read_bytes() == bundle
    assert (BOB / "server" / "index.js").read_bytes() == bundle
    codex_mcp = json.loads((REPO_ROOT / "codex" / ".mcp.json").read_text())
    assert codex_mcp["astra-widgets"]["args"] == ["${PLUGIN_ROOT}/server/index.js"]
