"""Tests for scripts/bump_version.py."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

import bump_version


@pytest.fixture
def manifests(monkeypatch, tmp_path: Path) -> dict[str, Path]:
    plugin = tmp_path / "plugin.json"
    codex = tmp_path / "codex-plugin.json"
    marketplace = tmp_path / "marketplace.json"
    changelog = tmp_path / "CHANGELOG.md"
    plugin.write_text(json.dumps({"name": "astra-db", "version": "1.2.3"}))
    codex.write_text(json.dumps({"name": "astra-db", "version": "1.2.3"}))
    marketplace.write_text(json.dumps({"metadata": {"version": "1.2.3"}}))
    changelog.write_text("# Changelog\n\n## 1.2.3 — 2026-01-01\n\n- old entry\n")
    monkeypatch.setattr(bump_version, "PLUGIN_MANIFEST", plugin)
    monkeypatch.setattr(bump_version, "CODEX_MANIFEST", codex)
    monkeypatch.setattr(bump_version, "MARKETPLACE_MANIFEST", marketplace)
    monkeypatch.setattr(bump_version, "CHANGELOG", changelog)
    return {
        "plugin": plugin,
        "codex": codex,
        "marketplace": marketplace,
        "changelog": changelog,
    }


@pytest.mark.parametrize(
    ("level", "expected"),
    [("patch", "1.2.4"), ("minor", "1.3.0"), ("major", "2.0.0")],
)
def test_bump_levels(level: str, expected: str):
    assert bump_version.bump("1.2.3", level) == expected


def test_bump_rejects_unknown_level():
    with pytest.raises(ValueError):
        bump_version.bump("1.2.3", "bogus")


def test_main_updates_all_files(manifests, monkeypatch, capsys):
    monkeypatch.setattr(sys, "argv", ["bump_version.py", "patch", "sync release"])
    assert bump_version.main() == 0
    assert capsys.readouterr().out.strip() == "1.2.4"

    assert json.loads(manifests["plugin"].read_text())["version"] == "1.2.4"
    assert json.loads(manifests["codex"].read_text())["version"] == "1.2.4"
    assert json.loads(manifests["marketplace"].read_text())["metadata"]["version"] == "1.2.4"

    changelog = manifests["changelog"].read_text()
    assert changelog.startswith("# Changelog\n\n## 1.2.4")
    assert "- sync release" in changelog
    assert changelog.index("## 1.2.4") < changelog.index("## 1.2.3")


def test_main_rejects_unknown_level(manifests, monkeypatch, capsys):
    monkeypatch.setattr(sys, "argv", ["bump_version.py", "bogus"])
    assert bump_version.main() == 1
    assert "version bump failed" in capsys.readouterr().err


def test_main_rejects_malformed_changelog(manifests, monkeypatch):
    manifests["changelog"].write_text("no header here\n")
    monkeypatch.setattr(sys, "argv", ["bump_version.py", "patch"])
    assert bump_version.main() == 1
