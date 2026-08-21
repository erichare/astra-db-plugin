"""Tests for scripts/convert.py — the Codex/Bob converters and YAML emitter."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

import convert
from conftest import REPO_ROOT

COMMANDS_DIR = REPO_ROOT / "commands"
AGENTS_DIR = REPO_ROOT / "agents"

SAMPLE_COMMAND = """---
description: Diagnose things — CLI and MCP wiring
---

Run `/astra-db:setup` first. Files live under `${CLAUDE_PLUGIN_ROOT}/skills/astra-toolkit/`.

## Steps

1. See [README-tables.md](../skills/astra-toolkit/data-modeling/README-tables.md).
2. Ask the astra-data-modeler agent for help.
"""

SAMPLE_AGENT = """---
name: astra-reviewer
description: Astra DB reviewer. Use when code has changed (Python, C#, Go).
tools: Read, Grep, Glob, Bash
---

You are an expert reviewer.

## Method

1. Read [SKILL.md](../skills/astra-toolkit/SKILL.md).
2. Report.
"""


def test_parse_markdown_unquotes_values():
    fields, body = convert.parse_markdown('---\ndescription: "Quoted: value"\n---\n\nBody.\n')
    assert fields == {"description": "Quoted: value"}
    assert body == "Body.\n"


def test_parse_markdown_requires_frontmatter():
    with pytest.raises(ValueError):
        convert.parse_markdown("no frontmatter here\n")


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("plain text — with dashes", "plain text — with dashes"),
        ("has: colon", '"has: colon"'),
        ("C#, Go", "C#, Go"),
        ("price # note", '"price # note"'),
        ("- leading dash", '"- leading dash"'),
        ("", '""'),
        ("trailing:", '"trailing:"'),
    ],
)
def test_yaml_scalar_quotes_only_when_needed(value: str, expected: str):
    assert convert.yaml_scalar(value) == expected


def test_command_to_codex_skill_rewrites_for_codex():
    name, content = convert.command_to_codex_skill("doctor", SAMPLE_COMMAND)
    assert name == "astra-doctor"
    assert content.startswith("---\nname: astra-doctor\ndescription: ")
    assert "Use when Astra DB connectivity" in content
    assert "`$astra-setup`" in content
    assert "${PLUGIN_ROOT}/skills/astra-toolkit/" in content
    assert "](../astra-toolkit/data-modeling/README-tables.md)" in content
    assert "$astra-data-modeler skill" in content
    assert "/astra-db:" not in content and "CLAUDE_PLUGIN_ROOT" not in content


def test_agent_to_codex_skill_drops_tools():
    name, content = convert.agent_to_codex_skill(SAMPLE_AGENT)
    assert name == "astra-reviewer"
    assert "tools:" not in content
    assert "description: Astra DB reviewer. Use when code has changed (Python, C#, Go).\n" in content
    assert "](../astra-toolkit/SKILL.md)" in content


def test_command_to_bob_command_rewrites_for_bob():
    stem, content = convert.command_to_bob_command("doctor", SAMPLE_COMMAND)
    assert stem == "astra-doctor"
    assert content.startswith("---\ndescription: Diagnose things — CLI and MCP wiring\n---\n")
    assert "`/astra-setup`" in content
    assert ".bob/skills/astra-toolkit/" in content
    assert "](../skills/astra-toolkit/data-modeling/README-tables.md)" in content
    assert "astra-data-modeler mode" in content


def test_agent_to_bob_mode_maps_fields_and_groups():
    mode = convert.agent_to_bob_mode(SAMPLE_AGENT)
    assert mode["slug"] == "astra-reviewer"
    assert mode["name"] == "Astra Reviewer"
    assert mode["description"] == "Astra DB reviewer."
    assert mode["whenToUse"].startswith("Astra DB reviewer. Use when")
    assert mode["roleDefinition"] == "You are an expert reviewer."
    assert mode["customInstructions"].startswith("## Method")
    assert ".bob/skills/astra-toolkit/SKILL.md" in mode["customInstructions"]
    assert mode["groups"] == ["read", "execute", "skill"]


def test_agent_without_bash_gets_no_execute_group():
    text = SAMPLE_AGENT.replace("tools: Read, Grep, Glob, Bash", "tools: Read, Grep, Glob")
    assert convert.agent_to_bob_mode(text)["groups"] == ["read", "skill"]


def test_custom_modes_yaml_round_trips():
    yaml = pytest.importorskip("yaml")
    mode = convert.agent_to_bob_mode(SAMPLE_AGENT)
    emitted = convert.emit_custom_modes_yaml([mode])
    parsed = yaml.safe_load(emitted)
    loaded = parsed["customModes"][0]
    assert loaded["slug"] == mode["slug"]
    assert loaded["description"] == mode["description"]
    assert loaded["whenToUse"] == mode["whenToUse"]
    assert loaded["roleDefinition"] == mode["roleDefinition"]
    assert loaded["customInstructions"].strip() == mode["customInstructions"]
    assert loaded["groups"] == mode["groups"]


def test_render_codex_skills_covers_ported_items():
    rendered = convert.render_codex_skills(COMMANDS_DIR, AGENTS_DIR)
    assert set(rendered) == {
        "skills/astra-setup/SKILL.md",
        "skills/astra-doctor/SKILL.md",
        "skills/astra-data-model-review/SKILL.md",
        "skills/astra-reviewer/SKILL.md",
        "skills/astra-data-modeler/SKILL.md",
        "skills/astra-migration-helper/SKILL.md",
        ".mcp.json",
    }
    assert "astra-db" in json.loads(rendered[".mcp.json"])
    for path, content in rendered.items():
        if not path.endswith("SKILL.md"):
            continue
        assert "Use when" in content.split("---")[1]
        assert "/astra-db:" not in content
        assert "CLAUDE_PLUGIN_ROOT" not in content


def test_render_bob_bundle_covers_all_assets():
    rendered = convert.render_bob_bundle(COMMANDS_DIR, AGENTS_DIR)
    assert set(rendered) == {
        "commands/astra-setup.md",
        "commands/astra-doctor.md",
        "commands/astra-data-model-review.md",
        "custom_modes.yaml",
        "mcp.json",
        "rules/astra-db.md",
    }
    assert rendered["custom_modes.yaml"].count("- slug: ") == 3
    assert "AstraCS" in rendered["rules/astra-db.md"]
