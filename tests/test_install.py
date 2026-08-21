"""Tests for install.sh (run against the local checkout as the skill source)."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

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


def _bob_target(tmp_path: Path) -> Path:
    return tmp_path / ".bob"


def test_bob_target_installs_full_bundle(tmp_path: Path):
    result = run_installer(["bob"], cwd=tmp_path)
    assert result.returncode == 0, result.stderr
    bob = _bob_target(tmp_path)
    assert_skill_installed(bob / "skills" / "astra-toolkit")
    assert (bob / "commands" / "astra-doctor.md").is_file()
    assert (bob / "rules" / "astra-db.md").is_file()
    assert "astra-db" in json.loads((bob / "mcp.json").read_text())["mcpServers"]
    assert "- slug: astra-reviewer" in (bob / "custom_modes.yaml").read_text()


def test_bob_install_merges_existing_config(tmp_path: Path):
    bob = _bob_target(tmp_path)
    (bob / "commands").mkdir(parents=True)
    (bob / "commands" / "team-review.md").write_text("team command")
    (bob / "mcp.json").write_text(json.dumps({"mcpServers": {"github": {"command": "gh-mcp"}}}))
    (bob / "custom_modes.yaml").write_text(
        "customModes:\n  - slug: team-mode\n    name: Team\n    roleDefinition: r\n    groups:\n      - read\n"
    )
    result = run_installer(["bob"], cwd=tmp_path)
    assert result.returncode == 0, result.stderr

    assert (bob / "commands" / "team-review.md").read_text() == "team command"
    servers = json.loads((bob / "mcp.json").read_text())["mcpServers"]
    assert set(servers) == {"github", "astra-db", "astra-widgets"}
    modes = (bob / "custom_modes.yaml").read_text()
    assert "- slug: team-mode" in modes and modes.count("- slug: astra-reviewer") == 1
    assert "# astra-db:begin" in modes and "# astra-db:end" in modes
    yaml = pytest.importorskip("yaml")
    slugs = [m["slug"] for m in yaml.safe_load(modes)["customModes"]]
    assert slugs[0] == "team-mode" or slugs[-1] == "team-mode"
    assert {"astra-reviewer", "astra-data-modeler", "astra-migration-helper"} <= set(slugs)


def test_bob_install_is_idempotent(tmp_path: Path):
    assert run_installer(["bob"], cwd=tmp_path).returncode == 0
    first = (_bob_target(tmp_path) / "custom_modes.yaml").read_text()
    assert run_installer(["bob"], cwd=tmp_path).returncode == 0
    assert (_bob_target(tmp_path) / "custom_modes.yaml").read_text() == first


def test_bob_install_refuses_to_clobber_invalid_mcp_json(tmp_path: Path):
    bob = _bob_target(tmp_path)
    bob.mkdir()
    (bob / "mcp.json").write_text("{not json")
    result = run_installer(["bob"], cwd=tmp_path)
    assert result.returncode != 0
    assert (bob / "mcp.json").read_text() == "{not json"


def test_bob_global_install_uses_home(tmp_path: Path):
    home = tmp_path / "home"
    home.mkdir()
    result = run_installer(["bob", "--global"], cwd=tmp_path, env_overrides={"HOME": str(home)})
    assert result.returncode == 0, result.stderr
    assert_skill_installed(home / ".bob" / "skills" / "astra-toolkit")
    assert (home / ".bob" / "settings" / "custom_modes.yaml").is_file()
    assert (home / ".bob" / "settings" / "mcp.json").is_file()
    assert (home / ".bob" / "commands" / "astra-setup.md").is_file()


def test_bob_rejects_unknown_option(tmp_path: Path):
    result = run_installer(["bob", "--nope"], cwd=tmp_path)
    assert result.returncode != 0
    assert "unknown option for bob" in result.stderr


def test_codex_plugin_target_requires_codex_cli(tmp_path: Path):
    fake_bin = tmp_path / "bin"
    fake_bin.mkdir()
    for tool in ("bash", "python3", "git", "cp", "rm", "mkdir", "dirname", "cat", "printf", "mktemp"):
        real = shutil.which(tool)
        if real:
            (fake_bin / tool).symlink_to(real)
    result = run_installer(["codex-plugin"], cwd=tmp_path, env_overrides={"PATH": str(fake_bin)})
    assert result.returncode != 0
    assert "codex CLI not found" in result.stderr
