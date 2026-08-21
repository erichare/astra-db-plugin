"""Tests for scripts/build_layouts.py."""

from __future__ import annotations

from pathlib import Path

import build_layouts


def _patch(monkeypatch, tmp_path: Path) -> tuple[Path, Path]:
    canonical = tmp_path / "skills" / "astra-toolkit"
    derived = tmp_path / ".bob" / "skills" / "astra-toolkit"
    monkeypatch.setattr(build_layouts, "REPO_ROOT", tmp_path)
    monkeypatch.setattr(build_layouts, "CANONICAL_DIR", canonical)
    monkeypatch.setattr(build_layouts, "DERIVED_DIRS", [derived])
    return canonical, derived


def test_builds_identical_copy(monkeypatch, tmp_path: Path):
    canonical, derived = _patch(monkeypatch, tmp_path)
    (canonical / "sub").mkdir(parents=True)
    (canonical / "SKILL.md").write_text("skill")
    (canonical / "sub" / "notes.md").write_text("notes")

    assert build_layouts.main() == 0

    assert (derived / "SKILL.md").read_text() == "skill"
    assert (derived / "sub" / "notes.md").read_text() == "notes"


def test_rebuild_removes_stale_derived_files(monkeypatch, tmp_path: Path):
    canonical, derived = _patch(monkeypatch, tmp_path)
    canonical.mkdir(parents=True)
    (canonical / "SKILL.md").write_text("skill")
    assert build_layouts.main() == 0

    (derived / "stale.md").write_text("stale")
    assert build_layouts.main() == 0
    assert not (derived / "stale.md").exists()


def test_missing_canonical_tree_fails(monkeypatch, tmp_path: Path, capsys):
    _patch(monkeypatch, tmp_path)
    assert build_layouts.main() == 1
    assert "canonical tree missing" in capsys.readouterr().err
