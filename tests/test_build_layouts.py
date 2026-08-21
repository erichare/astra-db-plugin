"""Tests for scripts/build_layouts.py."""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

import build_layouts
from conftest import REPO_ROOT


@pytest.fixture
def mini_repo(tmp_path: Path) -> Path:
    """A tiny repo: one-file canonical skill + the real commands/ and agents/."""
    canonical = tmp_path / "skills" / "astra-toolkit"
    (canonical / "sub").mkdir(parents=True)
    (canonical / "SKILL.md").write_text("---\nname: astra-toolkit\ndescription: d\n---\nskill\n")
    (canonical / "sub" / "notes.md").write_text("notes")
    shutil.copytree(REPO_ROOT / "commands", tmp_path / "commands")
    shutil.copytree(REPO_ROOT / "agents", tmp_path / "agents")
    shutil.copytree(REPO_ROOT / "hooks", tmp_path / "hooks")
    (tmp_path / "codex" / ".codex-plugin").mkdir(parents=True)
    (tmp_path / "codex" / ".codex-plugin" / "plugin.json").write_text("{}")
    return tmp_path


def test_build_all_generates_bob_and_codex_trees(mini_repo: Path):
    built = build_layouts.build_all(mini_repo)
    assert [p.relative_to(mini_repo) for p in built] == [Path(".bob"), Path("codex")]
    assert (mini_repo / ".bob" / "skills" / "astra-toolkit" / "sub" / "notes.md").read_text() == "notes"
    assert (mini_repo / ".bob" / "commands" / "astra-setup.md").is_file()
    assert (mini_repo / ".bob" / "custom_modes.yaml").is_file()
    assert (mini_repo / ".bob" / "mcp.json").is_file()
    assert (mini_repo / ".bob" / "rules" / "astra-db.md").is_file()
    assert (mini_repo / "codex" / "skills" / "astra-toolkit" / "SKILL.md").is_file()
    assert (mini_repo / "codex" / "skills" / "astra-doctor" / "SKILL.md").is_file()
    assert (mini_repo / "codex" / "skills" / "astra-reviewer" / "SKILL.md").is_file()
    assert (mini_repo / "codex" / "hooks" / "hooks.json").is_file()
    assert (mini_repo / "codex" / ".mcp.json").is_file()
    assert (mini_repo / "codex" / ".codex-plugin" / "plugin.json").read_text() == "{}"


def test_rebuild_removes_stale_generated_files(mini_repo: Path):
    build_layouts.build_all(mini_repo)
    stale_bob = mini_repo / ".bob" / "commands" / "stale.md"
    stale_codex = mini_repo / "codex" / "skills" / "old-skill" / "SKILL.md"
    stale_bob.write_text("stale")
    stale_codex.parent.mkdir(parents=True)
    stale_codex.write_text("stale")

    build_layouts.build_all(mini_repo)

    assert not stale_bob.exists()
    assert not stale_codex.exists()


def test_missing_canonical_tree_fails(tmp_path: Path, monkeypatch, capsys):
    monkeypatch.setattr(build_layouts, "REPO_ROOT", tmp_path)
    assert build_layouts.main() == 1
    assert "canonical tree missing" in capsys.readouterr().err


def test_main_reports_built_roots(mini_repo: Path, monkeypatch, capsys):
    monkeypatch.setattr(build_layouts, "REPO_ROOT", mini_repo)
    assert build_layouts.main() == 0
    out = capsys.readouterr().out
    assert "built .bob" in out and "built codex" in out
