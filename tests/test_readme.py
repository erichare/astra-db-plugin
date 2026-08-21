"""README integrity: local images and links resolve, SVG assets are valid."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from pathlib import Path

import pytest

from conftest import REPO_ROOT

README = REPO_ROOT / "README.md"
ASSETS = REPO_ROOT / "assets"
LOCAL_REF = re.compile(r'(?:src|href)="([^"#:]+)"|\]\(([^)\s#:]+)\)')


def local_references() -> list[str]:
    refs = []
    for src_attr, md_link in LOCAL_REF.findall(README.read_text()):
        target = src_attr or md_link
        if target and "://" not in target:
            refs.append(target)
    return refs


@pytest.mark.parametrize("target", local_references())
def test_readme_local_references_resolve(target: str):
    assert (REPO_ROOT / target).exists(), f"README references missing path: {target}"


@pytest.mark.parametrize("svg", sorted(ASSETS.rglob("*.svg")), ids=lambda p: str(p.relative_to(ASSETS)))
def test_svg_assets_are_valid_xml(svg: Path):
    root = ET.parse(svg).getroot()
    assert root.tag.endswith("svg")
    assert root.get("viewBox"), f"{svg.name} has no viewBox"


def test_install_cards_present():
    text = README.read_text()
    for platform in ("install-claude.svg", "install-codex.svg", "install-bob.svg"):
        assert platform in text, f"README is missing the {platform} install card"


def test_bob_card_comes_first():
    text = README.read_text()
    assert text.index("install-bob.svg") < text.index("install-claude.svg") < text.index("install-codex.svg")
    assert "Built for IBM Bob" in text


def test_logo_assets_present():
    for name in ("bob", "claude", "openai", "ibm", "datastax", "datastax-wordmark", "datastax-wordmark-dark"):
        assert (ASSETS / "logos" / f"{name}.svg").is_file(), f"missing logo asset: {name}"
