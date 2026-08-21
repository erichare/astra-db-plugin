#!/usr/bin/env python3
"""Convert the canonical Claude Code commands/agents into Codex skills and
IBM Bob assets (commands, custom modes, MCP config, rules).

Pure functions over text; stdlib only. build_layouts.py writes the results,
tests/test_convert.py pins the behavior.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

PREFIX = "astra-"
PORTED_COMMANDS = ("setup", "doctor", "data-model-review", "overview", "collection", "similar", "explore")  # sync-check is maintainer-only
AGENT_NAMES = ("astra-reviewer", "astra-data-modeler", "astra-migration-helper")
SKILL_PATH_IN_PLUGIN = "${CLAUDE_PLUGIN_ROOT}/skills/"  # any plugin skill dir

COMMAND_TRIGGERS = {
    "setup": "Use when the user wants to connect a project to Astra DB or install the Astra CLI.",
    "doctor": "Use when Astra DB connectivity, credentials, or MCP wiring misbehave.",
    "data-model-review": (
        "Use when the user asks to review or audit an Astra DB data model or Data API usage."
    ),
    "overview": "Use when the user wants to see what is in an Astra DB database: keyspaces, collections, tables, counts.",
    "collection": "Use when the user asks about one Astra DB collection's configuration, vector settings, or a sample document.",
    "similar": "Use when the user wants a vector or similarity search in an Astra DB collection and wants to see the results.",
    "explore": "Use when the user wants to browse, filter, or page through documents in an Astra DB collection.",
}

_AGENT_WORDING = [(f"{name} agent", name) for name in AGENT_NAMES]

CODEX_SUBSTITUTIONS = [
    (SKILL_PATH_IN_PLUGIN, "${PLUGIN_ROOT}/skills/"),
    ("../skills/astra-toolkit/", "../astra-toolkit/"),
    ("/astra-db:", "$astra-"),
    *[(old, f"${name} skill") for old, name in _AGENT_WORDING],
]
BOB_COMMAND_SUBSTITUTIONS = [
    (SKILL_PATH_IN_PLUGIN, ".bob/skills/"),
    ("/astra-db:", "/astra-"),
    *[(old, f"{name} mode") for old, name in _AGENT_WORDING],
]
BOB_MODE_SUBSTITUTIONS = [
    (SKILL_PATH_IN_PLUGIN, ".bob/skills/"),
    ("../skills/astra-toolkit/", ".bob/skills/astra-toolkit/"),
    ("/astra-db:", "/astra-"),
    *[(old, f"{name} mode") for old, name in _AGENT_WORDING],
]

CODEX_MCP_CONFIG = {  # Codex "direct" format: server names at the top level
    "astra-db": {"command": "npx", "args": ["-y", "@datastax/astra-db-mcp"]},
    "astra-widgets": {"command": "node", "args": ["${PLUGIN_ROOT}/server/index.js"]},
}

BOB_MCP_CONFIG = {
    "mcpServers": {
        "astra-db": {"command": "npx", "args": ["-y", "@datastax/astra-db-mcp"]},
        "astra-widgets": {"command": "node", "args": [".bob/server/index.js"]},
    }
}

BOB_RULE = """# Astra DB

- Never hardcode Astra DB application tokens (`AstraCS:...`) in source or config files. Read `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` from environment variables or a git-ignored `.env`, and treat any committed token as leaked: rotate it in the Astra console.
- For any code that talks to Astra DB or HCD through the Data API, the Astra CLI, or vector search, follow the `astra-toolkit` skill in `.bob/skills/astra-toolkit/` (start at `SKILL.md`, then the per-language `clients/<language>/README.md` and `examples/`) rather than relying on memory.
"""

_FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n(.*)\Z", re.DOTALL)
_PLAIN_SCALAR_UNSAFE_START = tuple("-?:,[]{}#&*!|>'\"%@`")


def parse_markdown(text: str) -> tuple[dict[str, str], str]:
    """Split a markdown file into (frontmatter fields, body). Values are unquoted."""
    match = _FRONTMATTER.match(text)
    if not match:
        raise ValueError("missing frontmatter block")
    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        key, sep, value = line.partition(":")
        if not sep:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        fields[key.strip()] = value
    return fields, match.group(2).strip("\n") + "\n"


def apply_substitutions(text: str, substitutions: list[tuple[str, str]]) -> str:
    for old, new in substitutions:
        text = text.replace(old, new)
    return text


def yaml_scalar(value: str) -> str:
    """Render a single-line string as a YAML scalar, quoting only when needed."""
    unsafe = (
        not value
        or value != value.strip()
        or "\n" in value
        or ": " in value
        or " #" in value
        or value.endswith(":")
        or value.startswith(_PLAIN_SCALAR_UNSAFE_START)
    )
    return json.dumps(value, ensure_ascii=False) if unsafe else value


def render_skill(name: str, description: str, body: str) -> str:
    return (
        f"---\nname: {yaml_scalar(name)}\ndescription: {yaml_scalar(description)}\n---\n\n{body}"
    )


def command_to_codex_skill(command_name: str, text: str) -> tuple[str, str]:
    """Return (skill_name, SKILL.md content) for a canonical command file."""
    fields, body = parse_markdown(text)
    skill_name = f"{PREFIX}{command_name}"
    description = f"{fields['description'].rstrip('.')}. {COMMAND_TRIGGERS[command_name]}"
    return skill_name, render_skill(
        skill_name, description, apply_substitutions(body, CODEX_SUBSTITUTIONS)
    )


def agent_to_codex_skill(text: str) -> tuple[str, str]:
    fields, body = parse_markdown(text)
    return fields["name"], render_skill(
        fields["name"], fields["description"], apply_substitutions(body, CODEX_SUBSTITUTIONS)
    )


def command_to_bob_command(command_name: str, text: str) -> tuple[str, str]:
    """Return (file stem, markdown) for .bob/commands/<stem>.md."""
    fields, body = parse_markdown(text)
    content = (
        f"---\ndescription: {yaml_scalar(fields['description'])}\n---\n\n"
        f"{apply_substitutions(body, BOB_COMMAND_SUBSTITUTIONS)}"
    )
    return f"{PREFIX}{command_name}", content


def _title(slug: str) -> str:
    return " ".join(part.capitalize() for part in slug.split("-"))


def _first_sentence(text: str) -> str:
    head, sep, _ = text.partition(". ")
    return f"{head}." if sep else text


def agent_to_bob_mode(text: str) -> dict:
    fields, body = parse_markdown(text)
    body = apply_substitutions(body, BOB_MODE_SUBSTITUTIONS)
    role, _, rest = body.strip().partition("\n\n")
    tools = [tool.strip() for tool in fields.get("tools", "").split(",")]
    groups = ["read"] + (["execute"] if "Bash" in tools else []) + ["skill"]
    return {
        "slug": fields["name"],
        "name": _title(fields["name"]),
        "description": _first_sentence(fields["description"]),
        "roleDefinition": role.strip(),
        "whenToUse": fields["description"],
        "customInstructions": rest.strip(),
        "groups": groups,
    }


def _block_scalar(text: str, indent: int) -> str:
    pad = " " * indent
    lines = [f"{pad}{line}" if line else "" for line in text.splitlines()]
    return "|\n" + "\n".join(lines)


def emit_custom_modes_yaml(modes: list[dict]) -> str:
    lines = ["customModes:"]
    for mode in modes:
        lines.append(f"  - slug: {yaml_scalar(mode['slug'])}")
        for key in ("name", "description", "roleDefinition", "whenToUse"):
            lines.append(f"    {key}: {yaml_scalar(mode[key])}")
        lines.append(f"    customInstructions: {_block_scalar(mode['customInstructions'], 6)}")
        lines.append("    groups:")
        lines.extend(f"      - {group}" for group in mode["groups"])
    return "\n".join(lines) + "\n"


def render_codex_skills(commands_dir: Path, agents_dir: Path) -> dict[str, str]:
    """Map of 'skills/<skill>/SKILL.md' -> content for every ported command and agent."""
    rendered: dict[str, str] = {}
    for command in PORTED_COMMANDS:
        name, content = command_to_codex_skill(command, (commands_dir / f"{command}.md").read_text())
        rendered[f"skills/{name}/SKILL.md"] = content
    for agent in AGENT_NAMES:
        name, content = agent_to_codex_skill((agents_dir / f"{agent}.md").read_text())
        rendered[f"skills/{name}/SKILL.md"] = content
    rendered[".mcp.json"] = json.dumps(CODEX_MCP_CONFIG, indent=2) + "\n"
    return rendered


def render_bob_bundle(commands_dir: Path, agents_dir: Path) -> dict[str, str]:
    """Map of path-relative-to-.bob -> content (excluding the skills/ copy)."""
    rendered: dict[str, str] = {}
    for command in PORTED_COMMANDS:
        stem, content = command_to_bob_command(command, (commands_dir / f"{command}.md").read_text())
        rendered[f"commands/{stem}.md"] = content
    modes = [agent_to_bob_mode((agents_dir / f"{agent}.md").read_text()) for agent in AGENT_NAMES]
    rendered["custom_modes.yaml"] = emit_custom_modes_yaml(modes)
    rendered["mcp.json"] = json.dumps(BOB_MCP_CONFIG, indent=2) + "\n"
    rendered["rules/astra-db.md"] = BOB_RULE
    return rendered
