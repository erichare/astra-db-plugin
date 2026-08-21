"""Tests for scripts/bump_level.py."""

from __future__ import annotations

import sys

import pytest

import bump_level


@pytest.mark.parametrize(
    ("message", "expected"),
    [
        ("feat: add codex parity", "minor"),
        ("feat(bob): custom modes", "minor"),
        ("feat!: drop legacy layout", "major"),
        ("fix: wrap commands\n\nBREAKING CHANGE: renamed install targets", "major"),
        ("fix: guard trap exit status", "patch"),
        ("chore: sync skill content from upstream", "patch"),
        ("docs: README redesign", "patch"),
        ("Merge pull request #12 from sync/upstream", "patch"),
        ("", "patch"),
    ],
)
def test_level_for(message: str, expected: str):
    assert bump_level.level_for(message) == expected


def test_main_reads_argv(monkeypatch, capsys):
    monkeypatch.setattr(sys, "argv", ["bump_level.py", "feat: x"])
    assert bump_level.main() == 0
    assert capsys.readouterr().out.strip() == "minor"


def test_main_reads_env(monkeypatch, capsys):
    monkeypatch.setattr(sys, "argv", ["bump_level.py"])
    monkeypatch.setenv("COMMIT_MESSAGE", "fix: y")
    assert bump_level.main() == 0
    assert capsys.readouterr().out.strip() == "patch"
