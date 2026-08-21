"""Integrity of the widget feature wiring: root MCP config, skill, templates, commands."""

from __future__ import annotations

import json
import re

from conftest import REPO_ROOT
from test_skill_integrity import frontmatter

WIDGETS = REPO_ROOT / "skills" / "astra-widgets"
WIDGET_COMMANDS = ("overview", "collection", "similar", "explore")
TEMPLATES = ("overview", "collection-card", "similarity", "explorer")


def test_root_mcp_declares_widget_server():
    servers = json.loads((REPO_ROOT / ".mcp.json").read_text())["mcpServers"]
    widgets = servers["astra-widgets"]
    assert widgets["command"] == "node"
    assert widgets["args"] == ["${CLAUDE_PLUGIN_ROOT}/server/dist/index.js"]
    for variable, value in widgets["env"].items():
        assert value == f"${{{variable}}}"


def test_widgets_skill_routes_and_ships_templates():
    fields = frontmatter(WIDGETS / "SKILL.md")
    assert fields["name"] == "astra-widgets"
    assert "Use when" in fields["description"]
    assert (WIDGETS / "DESIGN.md").is_file()
    assert (WIDGETS / "templates" / "markdown.md").is_file()
    for name in TEMPLATES:
        html = (WIDGETS / "templates" / f"{name}.html").read_text()
        assert 'class="sr-only"' in html
        assert "var(--surface-2)" in html
        assert "sendPrompt(" in html
        assert not re.search(r"(src|href)=[\"']https?:", html), f"{name}: external resource"
        assert "linear-gradient" not in html and "box-shadow" not in html


def test_widget_commands_exist_and_reference_the_skill():
    for name in WIDGET_COMMANDS:
        text = (REPO_ROOT / "commands" / f"{name}.md").read_text()
        assert frontmatter(REPO_ROOT / "commands" / f"{name}.md")["description"]
        assert "skills/astra-widgets/SKILL.md" in text
        assert "astra-widgets" in text
