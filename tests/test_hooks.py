"""Behavioral tests for the shell hooks (run as subprocesses, like Claude Code does)."""

from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

from conftest import REPO_ROOT, git, head_sha

GUARD = REPO_ROOT / "hooks" / "scripts" / "credential-guard.sh"
FRESHNESS = REPO_ROOT / "hooks" / "scripts" / "freshness-check.sh"


def run_guard(payload: dict) -> subprocess.CompletedProcess:
    return subprocess.run(
        [str(GUARD)],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
    )


def write_payload(content: str) -> dict:
    return {"tool_name": "Write", "tool_input": {"file_path": "app.py", "content": content}}


def test_guard_blocks_real_token():
    result = run_guard(write_payload('token = "AstraCS:abcDEF123456789012345678"'))
    assert result.returncode == 2
    assert "Blocked" in result.stderr


def test_guard_allows_placeholder():
    result = run_guard(write_payload("# set ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token"))
    assert result.returncode == 0
    assert result.stderr == ""


def test_guard_allows_clean_content():
    result = run_guard(write_payload('token = os.environ["ASTRA_DB_APPLICATION_TOKEN"]'))
    assert result.returncode == 0


def _freshness_env(tmp_path: Path, plugin_root: Path) -> dict[str, str]:
    return {
        **os.environ,
        "CLAUDE_PLUGIN_ROOT": str(plugin_root),
        "XDG_CACHE_HOME": str(tmp_path / "cache"),
    }


def _plugin_root(tmp_path: Path, repo: Path, sha: str) -> Path:
    root = tmp_path / "plugin-root"
    root.mkdir(exist_ok=True)
    (root / "sync-manifest.json").write_text(
        json.dumps({"upstream_repo": str(repo), "upstream_sha": sha})
    )
    return root


def run_freshness(env: dict[str, str]) -> subprocess.CompletedProcess:
    return subprocess.run([str(FRESHNESS)], env=env, text=True, capture_output=True)


def test_freshness_silent_when_current(tmp_path: Path, fake_upstream: Path):
    root = _plugin_root(tmp_path, fake_upstream, head_sha(fake_upstream))
    result = run_freshness(_freshness_env(tmp_path, root))
    assert result.returncode == 0
    assert result.stdout == ""


def test_freshness_reports_stale_content(tmp_path: Path, fake_upstream: Path):
    root = _plugin_root(tmp_path, fake_upstream, "0" * 40)
    result = run_freshness(_freshness_env(tmp_path, root))
    assert result.returncode == 0
    assert "behind upstream" in result.stdout


def test_freshness_uses_cache_within_ttl(tmp_path: Path, fake_upstream: Path):
    root = _plugin_root(tmp_path, fake_upstream, "0" * 40)
    env = _freshness_env(tmp_path, root)
    first = run_freshness(env)
    assert "behind upstream" in first.stdout

    # Manifest is now current, but the cached verdict must be replayed until TTL.
    _plugin_root(tmp_path, fake_upstream, head_sha(fake_upstream))
    second = run_freshness(env)
    assert second.stdout == first.stdout


def test_freshness_silent_without_manifest(tmp_path: Path):
    root = tmp_path / "empty-root"
    root.mkdir()
    result = run_freshness(_freshness_env(tmp_path, root))
    assert result.returncode == 0
    assert result.stdout == ""


def test_freshness_new_commit_marks_stale(tmp_path: Path, fake_upstream: Path):
    root = _plugin_root(tmp_path, fake_upstream, head_sha(fake_upstream))
    (fake_upstream / "new-file.md").write_text("update")
    git(["add", "-A"], fake_upstream)
    git(["commit", "-q", "-m", "update"], fake_upstream)

    result = run_freshness(_freshness_env(tmp_path, root))
    assert "behind upstream" in result.stdout
