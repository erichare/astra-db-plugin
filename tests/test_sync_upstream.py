"""Tests for scripts/sync_upstream.py."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

import sync_upstream
from conftest import head_sha


@pytest.fixture
def patched_paths(monkeypatch, tmp_path: Path) -> tuple[Path, Path]:
    canonical = tmp_path / "plugin" / "skills" / "astra-toolkit"
    manifest = tmp_path / "plugin" / "sync-manifest.json"
    canonical.parent.mkdir(parents=True)
    monkeypatch.setattr(sync_upstream, "CANONICAL_DIR", canonical)
    monkeypatch.setattr(sync_upstream, "MANIFEST_PATH", manifest)
    return canonical, manifest


def run_main(monkeypatch, *argv: str) -> int:
    monkeypatch.setattr(sys, "argv", ["sync_upstream.py", *argv])
    return sync_upstream.main()


def test_local_checkout_sync(patched_paths, fake_upstream, monkeypatch):
    canonical, manifest = patched_paths
    assert run_main(monkeypatch, "--local-checkout", str(fake_upstream)) == 0

    skill_md = (canonical / "SKILL.md").read_text()
    assert "Use when" in skill_md
    assert "Old upstream description." not in skill_md
    assert (canonical / "clients" / "python" / "examples" / "demo.py").is_file()

    recorded = json.loads(manifest.read_text())
    assert recorded["upstream_sha"] == head_sha(fake_upstream)


def test_sync_is_idempotent(patched_paths, fake_upstream, monkeypatch):
    _, manifest = patched_paths
    assert run_main(monkeypatch, "--local-checkout", str(fake_upstream)) == 0
    first = manifest.read_bytes()
    assert run_main(monkeypatch, "--local-checkout", str(fake_upstream)) == 0
    assert manifest.read_bytes() == first


def test_clone_sync_from_local_url(patched_paths, fake_upstream, monkeypatch):
    canonical, manifest = patched_paths
    assert run_main(monkeypatch, "--url", str(fake_upstream), "--ref", "main") == 0
    assert (canonical / "SKILL.md").is_file()
    assert json.loads(manifest.read_text())["upstream_sha"] == head_sha(fake_upstream)


def test_replace_tree_missing_source(tmp_path: Path):
    with pytest.raises(FileNotFoundError):
        sync_upstream.replace_tree(tmp_path / "nope", tmp_path / "target")


def test_replace_tree_overwrites_stale_files(tmp_path: Path):
    source = tmp_path / "source"
    source.mkdir()
    (source / "keep.md").write_text("keep")
    target = tmp_path / "target"
    target.mkdir()
    (target / "stale.md").write_text("stale")

    sync_upstream.replace_tree(source, target)

    assert (target / "keep.md").is_file()
    assert not (target / "stale.md").exists()


def test_override_requires_description_line(tmp_path: Path):
    (tmp_path / "SKILL.md").write_text("---\nname: astra-toolkit\n---\nBody.\n")
    with pytest.raises(ValueError):
        sync_upstream.apply_description_overrides(tmp_path)


def test_override_requires_target_file(tmp_path: Path):
    with pytest.raises(FileNotFoundError):
        sync_upstream.apply_description_overrides(tmp_path)


def test_read_synced_sha_tolerates_corrupt_manifest(patched_paths):
    _, manifest = patched_paths
    assert sync_upstream.read_synced_sha() is None
    manifest.write_text("{not json")
    assert sync_upstream.read_synced_sha() is None


def test_main_reports_git_failure(patched_paths, tmp_path: Path, monkeypatch, capsys):
    assert run_main(monkeypatch, "--url", str(tmp_path / "missing-repo")) == 1
    assert "git command failed" in capsys.readouterr().err
