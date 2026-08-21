"""In-process tests for scripts/bob_install.py (merge semantics)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

import bob_install
from conftest import REPO_ROOT

SOURCE_BOB = REPO_ROOT / ".bob"
OUR_SLUGS = {"astra-reviewer", "astra-data-modeler", "astra-migration-helper"}


def parse_modes(path: Path) -> list[dict]:
    yaml = pytest.importorskip("yaml")
    return yaml.safe_load(path.read_text())["customModes"]


def test_merge_creates_file_when_missing(tmp_path: Path):
    dest = bob_install.merge_custom_modes(SOURCE_BOB, tmp_path / "custom_modes.yaml")
    assert {m["slug"] for m in parse_modes(dest)} == OUR_SLUGS
    text = dest.read_text()
    assert text.startswith("customModes:\n  # astra-db:begin\n")


def test_merge_replaces_marked_block_idempotently(tmp_path: Path):
    dest = tmp_path / "custom_modes.yaml"
    bob_install.merge_custom_modes(SOURCE_BOB, dest)
    first = dest.read_text()
    bob_install.merge_custom_modes(SOURCE_BOB, dest)
    assert dest.read_text() == first


def test_merge_inserts_after_key_preserving_other_modes(tmp_path: Path):
    dest = tmp_path / "custom_modes.yaml"
    dest.write_text(
        "customModes:\n  - slug: team\n    name: Team\n    roleDefinition: r\n    groups:\n      - read\n"
    )
    bob_install.merge_custom_modes(SOURCE_BOB, dest)
    slugs = [m["slug"] for m in parse_modes(dest)]
    assert set(slugs) == OUR_SLUGS | {"team"}
    assert slugs[-1] == "team"  # inserted right after the key, before existing items


def test_merge_matches_existing_four_space_indent(tmp_path: Path):
    dest = tmp_path / "custom_modes.yaml"
    dest.write_text("customModes:\n    - slug: team\n      name: Team\n      roleDefinition: r\n      groups:\n        - read\n")
    bob_install.merge_custom_modes(SOURCE_BOB, dest)
    text = dest.read_text()
    assert "    # astra-db:begin\n    - slug: astra-reviewer" in text
    assert {m["slug"] for m in parse_modes(dest)} == OUR_SLUGS | {"team"}


def test_merge_handles_inline_empty_list(tmp_path: Path):
    dest = tmp_path / "custom_modes.yaml"
    dest.write_text("customModes: []\n")
    bob_install.merge_custom_modes(SOURCE_BOB, dest)
    assert {m["slug"] for m in parse_modes(dest)} == OUR_SLUGS


def test_merge_appends_key_when_absent(tmp_path: Path):
    dest = tmp_path / "custom_modes.yaml"
    dest.write_text("# team config\nsomethingElse: true\n")
    bob_install.merge_custom_modes(SOURCE_BOB, dest)
    yaml = pytest.importorskip("yaml")
    data = yaml.safe_load(dest.read_text())
    assert data["somethingElse"] is True
    assert {m["slug"] for m in data["customModes"]} == OUR_SLUGS


def test_merge_mcp_preserves_other_servers(tmp_path: Path):
    dest = tmp_path / "mcp.json"
    dest.write_text(json.dumps({"mcpServers": {"github": {"command": "gh-mcp"}}, "other": 1}))
    bob_install.merge_mcp(SOURCE_BOB, dest)
    data = json.loads(dest.read_text())
    assert set(data["mcpServers"]) == {"github", "astra-db"}
    assert data["other"] == 1


def test_merge_mcp_rejects_invalid_json(tmp_path: Path):
    (tmp_path / "mcp.json").write_text("{nope")
    with pytest.raises(json.JSONDecodeError):
        bob_install.merge_mcp(SOURCE_BOB, tmp_path / "mcp.json")


def test_install_files_only_touches_astra_files(tmp_path: Path):
    (tmp_path / "commands").mkdir()
    (tmp_path / "commands" / "team.md").write_text("team")
    written = bob_install.install_files(SOURCE_BOB, tmp_path, "commands")
    assert {p.name for p in written} == {"astra-setup.md", "astra-doctor.md", "astra-data-model-review.md"}
    assert (tmp_path / "commands" / "team.md").read_text() == "team"


def test_main_installs_everything(tmp_path: Path, monkeypatch, capsys):
    target = tmp_path / ".bob"
    monkeypatch.setattr(sys, "argv", ["bob_install.py", "--source", str(REPO_ROOT), "--target", str(target)])
    assert bob_install.main() == 0
    out = capsys.readouterr().out
    assert "custom_modes.yaml" in out and "mcp.json" in out
    assert (target / "skills" / "astra-toolkit" / "SKILL.md").is_file()
    assert (target / "rules" / "astra-db.md").is_file()


def test_main_global_uses_settings_dir(tmp_path: Path, monkeypatch):
    target = tmp_path / "home" / ".bob"
    monkeypatch.setattr(sys, "argv", ["bob_install.py", "--source", str(REPO_ROOT), "--target", str(target), "--global"])
    assert bob_install.main() == 0
    assert (target / "settings" / "custom_modes.yaml").is_file()
    assert (target / "settings" / "mcp.json").is_file()
    assert not (target / "custom_modes.yaml").exists()
    assert not (target / "mcp.json").exists()


def test_main_requires_generated_bundle(tmp_path: Path, monkeypatch, capsys):
    monkeypatch.setattr(sys, "argv", ["bob_install.py", "--source", str(tmp_path), "--target", str(tmp_path / ".bob")])
    assert bob_install.main() == 1
    assert "no generated Bob bundle" in capsys.readouterr().err


def test_main_reports_invalid_existing_config(tmp_path: Path, monkeypatch, capsys):
    target = tmp_path / ".bob"
    target.mkdir()
    (target / "mcp.json").write_text("{nope")
    monkeypatch.setattr(sys, "argv", ["bob_install.py", "--source", str(REPO_ROOT), "--target", str(target)])
    assert bob_install.main() == 1
    assert "bob install failed" in capsys.readouterr().err
