"""Tests for install.sh (run against the local checkout as the skill source)."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

from conftest import REPO_ROOT

INSTALLER = REPO_ROOT / "install.sh"


def run_installer(
    args: list[str], cwd: Path, env_overrides: dict[str, str] | None = None
) -> subprocess.CompletedProcess:
    env = {**os.environ, **(env_overrides or {})}
    return subprocess.run(
        ["bash", str(INSTALLER), *args],
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
    )


def assert_skill_installed(skill_dir: Path) -> None:
    assert (skill_dir / "SKILL.md").is_file()
    assert (skill_dir / "clients" / "python" / "README.md").is_file()


def test_codex_target_installs_to_codex_home(tmp_path: Path):
    result = run_installer(["codex"], cwd=tmp_path, env_overrides={"CODEX_HOME": str(tmp_path / ".codex")})
    assert result.returncode == 0, result.stderr
    assert_skill_installed(tmp_path / ".codex" / "skills" / "astra-toolkit")


def test_bob_target_installs_into_project(tmp_path: Path):
    result = run_installer(["bob"], cwd=tmp_path)
    assert result.returncode == 0, result.stderr
    assert_skill_installed(tmp_path / ".bob" / "skills" / "astra-toolkit")


def test_skills_dir_target_installs_to_custom_path(tmp_path: Path):
    dest = tmp_path / "custom-skills"
    result = run_installer(["skills-dir", str(dest)], cwd=tmp_path)
    assert result.returncode == 0, result.stderr
    assert_skill_installed(dest / "astra-toolkit")


def test_reinstall_replaces_stale_files(tmp_path: Path):
    dest = tmp_path / "custom-skills"
    assert run_installer(["skills-dir", str(dest)], cwd=tmp_path).returncode == 0
    stale = dest / "astra-toolkit" / "stale.md"
    stale.write_text("stale")
    assert run_installer(["skills-dir", str(dest)], cwd=tmp_path).returncode == 0
    assert not stale.exists()
    assert_skill_installed(dest / "astra-toolkit")


def test_skills_dir_requires_path(tmp_path: Path):
    result = run_installer(["skills-dir"], cwd=tmp_path)
    assert result.returncode != 0
    assert "requires a path" in result.stderr


def test_unknown_target_prints_usage(tmp_path: Path):
    result = run_installer(["nonsense"], cwd=tmp_path)
    assert result.returncode != 0
    assert "unknown target" in result.stderr
    assert "Usage" in result.stderr


def test_help_prints_usage(tmp_path: Path):
    result = run_installer(["--help"], cwd=tmp_path)
    assert result.returncode == 0
    assert "Usage" in result.stdout
