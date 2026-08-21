"""Tests for scripts/check_ts_syntax.mjs (skipped when node/typescript are absent)."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import pytest

from conftest import REPO_ROOT

SCRIPT = REPO_ROOT / "scripts" / "check_ts_syntax.mjs"
NODE = shutil.which("node")

pytestmark = pytest.mark.skipif(NODE is None, reason="node is not installed")


def typescript_available() -> bool:
    result = subprocess.run(
        [NODE, "-e", "require.resolve('typescript')"],
        cwd=REPO_ROOT,
        capture_output=True,
    )
    return result.returncode == 0


def run_checker(target: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [NODE, str(SCRIPT), str(target)],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )


@pytest.fixture(autouse=True)
def require_typescript():
    if not typescript_available():
        pytest.skip("typescript package is not installed")


def test_valid_snippets_pass(tmp_path: Path):
    (tmp_path / "good.ts").write_text("const answer: number = 42;\nexport { answer };\n")
    result = run_checker(tmp_path)
    assert result.returncode == 0
    assert "0 parse error(s)" in result.stdout


def test_invalid_snippet_fails_with_location(tmp_path: Path):
    (tmp_path / "bad.ts").write_text("const = ;\n")
    result = run_checker(tmp_path)
    assert result.returncode == 1
    assert "bad.ts:1" in result.stderr


def test_missing_directory_argument_is_usage_error():
    result = subprocess.run([NODE, str(SCRIPT)], cwd=REPO_ROOT, capture_output=True, text=True)
    assert result.returncode == 2
    assert "usage" in result.stderr
