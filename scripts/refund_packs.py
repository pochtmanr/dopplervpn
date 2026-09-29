#!/usr/bin/env python3
"""Locale string packs for the 28 September refund release. Each list has 73 strings."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "content/policy-release/2026-09-28/packs"

# Imported by build step. PACKS[locale] is a list of 73 strings in leaf order.
PACKS: dict[str, list[str]] = {}


def add(locale: str, strings: list[str]) -> None:
    if len(strings) != 73:
        raise SystemExit(f"{locale} has {len(strings)}")
    PACKS[locale] = strings


def dump() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for locale, strings in PACKS.items():
        (OUT / f"{locale}.json").write_text(json.dumps(strings, ensure_ascii=False, indent=2) + "\n")
        print(locale, len(strings))
