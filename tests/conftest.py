"""Shared fixtures: a fake upstream skill repo and path helpers."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))


def git(args: list[str], cwd: Path) -> None:
    subprocess.run(
        [
            "git",
            "-c", "user.email=test@example.com",
            "-c", "user.name=test",
            "-c", "init.defaultBranch=main",
            *args,
        ],
        cwd=cwd,
        check=True,
        capture_output=True,
    )


def head_sha(repo: Path) -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=repo,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


@pytest.fixture
def fake_upstream(tmp_path: Path) -> Path:
    """A minimal git repo mimicking sl-at-ibm/astra-toolkit-skill's layout."""
    repo = tmp_path / "upstream"
    skill = repo / ".bob" / "skills" / "astra-toolkit"
    (skill / "clients" / "python" / "examples").mkdir(parents=True)
    (skill / "SKILL.md").write_text(
        "---\n"
        "name: astra-toolkit\n"
        "description: Old upstream description.\n"
        "---\n"
        "\n"
        "Body text.\n"
    )
    (skill / "clients" / "python" / "README.md").write_text("# Python client\n")
    (skill / "clients" / "python" / "examples" / "demo.py").write_text("print('hi')\n")
    git(["init", "-q"], repo)
    git(["add", "-A"], repo)
    git(["commit", "-q", "-m", "init"], repo)
    return repo
