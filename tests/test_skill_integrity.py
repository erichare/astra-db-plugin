"""Integrity tests over the real repository content: manifests, frontmatter,
cross-references, and the synced skill tree."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

import pytest

from conftest import REPO_ROOT

SKILL_DIR = REPO_ROOT / "skills" / "astra-toolkit"
LANGUAGES = ["python", "typescript", "java", "csharp", "go"]
MIN_EXAMPLES_PER_LANGUAGE = 300
LINK_PATTERN = re.compile(r"\]\(([^)\s]+)\)")


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text()
    assert text.startswith("---\n"), f"{path} has no frontmatter"
    block = text.split("---\n", 2)[1]
    fields = {}
    for line in block.splitlines():
        if ":" in line and not line.startswith((" ", "\t")):
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    return fields


def test_skill_frontmatter_routes():
    fields = frontmatter(SKILL_DIR / "SKILL.md")
    assert fields["name"] == "astra-toolkit"
    assert "Use when" in fields["description"]


@pytest.mark.parametrize("language", LANGUAGES)
def test_client_language_tree(language: str):
    client = SKILL_DIR / "clients" / language
    assert (client / "README.md").is_file()
    examples = list((client / "examples").rglob("*"))
    files = [p for p in examples if p.is_file()]
    assert len(files) >= MIN_EXAMPLES_PER_LANGUAGE, (
        f"{language}: only {len(files)} example files"
    )


def markdown_files() -> list[Path]:
    docs = [p for p in SKILL_DIR.rglob("*.md")]
    docs += list((REPO_ROOT / "commands").glob("*.md"))
    docs += list((REPO_ROOT / "agents").glob("*.md"))
    return docs


@pytest.mark.parametrize("doc", markdown_files(), ids=lambda p: str(p.relative_to(REPO_ROOT)))
def test_relative_links_resolve(doc: Path):
    for raw_target in LINK_PATTERN.findall(doc.read_text()):
        target = raw_target.split("#", 1)[0]
        if not target or "://" in target or target.startswith(("mailto:", "/")):
            continue
        if "<" in target or "$" in target:
            continue
        resolved = (doc.parent / target).resolve()
        assert resolved.exists(), f"{doc}: broken link -> {raw_target}"


def test_plugin_and_marketplace_versions_match():
    plugin = json.loads((REPO_ROOT / ".claude-plugin" / "plugin.json").read_text())
    marketplace = json.loads(
        (REPO_ROOT / ".claude-plugin" / "marketplace.json").read_text()
    )
    assert plugin["name"] == "astra-db"
    assert plugin["version"] == marketplace["metadata"]["version"]
    assert marketplace["plugins"][0]["name"] == "astra-db"


def test_commands_have_descriptions():
    commands = list((REPO_ROOT / "commands").glob("*.md"))
    assert len(commands) >= 3
    for command in commands:
        assert frontmatter(command)["description"]


def test_agents_have_routing_frontmatter():
    agents = list((REPO_ROOT / "agents").glob("*.md"))
    assert len(agents) >= 3
    for agent in agents:
        fields = frontmatter(agent)
        assert fields["name"] == agent.stem
        assert "Use when" in fields["description"]
        assert fields["tools"]


def test_hooks_manifest_points_at_executable_scripts():
    hooks = json.loads((REPO_ROOT / "hooks" / "hooks.json").read_text())
    commands = [
        hook["command"]
        for event_matchers in hooks["hooks"].values()
        for matcher in event_matchers
        for hook in matcher["hooks"]
    ]
    assert commands, "no hook commands declared"
    for command in commands:
        assert command.startswith("${CLAUDE_PLUGIN_ROOT}/")
        script = REPO_ROOT / command.removeprefix("${CLAUDE_PLUGIN_ROOT}/")
        assert script.is_file(), f"missing hook script: {script}"
        assert os.access(script, os.X_OK), f"hook script not executable: {script}"


def test_mcp_manifest_uses_env_passthrough():
    mcp = json.loads((REPO_ROOT / ".mcp.json").read_text())
    server = mcp["mcpServers"]["astra-db"]
    assert server["command"] == "npx"
    assert "@datastax/astra-db-mcp" in server["args"]
    for variable, value in server["env"].items():
        assert value == f"${{{variable}}}", "env must pass through, never hardcode"


def is_generated_artifact(path: Path) -> bool:
    """Build/OS artifacts that may appear in a working tree but are not content."""
    return (
        "__pycache__" in path.parts
        or path.suffix == ".pyc"
        or path.name == ".DS_Store"
    )


def content_files(root: Path) -> dict[Path, bytes]:
    return {
        p.relative_to(root): p.read_bytes()
        for p in root.rglob("*")
        if p.is_file() and not is_generated_artifact(p)
    }


def test_bob_layout_matches_canonical():
    bob = REPO_ROOT / ".bob" / "skills" / "astra-toolkit"
    canonical_files = content_files(SKILL_DIR)
    bob_files = content_files(bob)
    assert set(canonical_files) == set(bob_files)
    mismatched = [
        str(path) for path, data in canonical_files.items() if bob_files[path] != data
    ]
    assert mismatched == []
