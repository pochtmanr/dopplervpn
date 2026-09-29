#!/usr/bin/env python3
"""Build per-locale refund/help overlays from parallel string lists."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EN = json.loads((ROOT / "content/policy-release/2026-09-28/en.json").read_text())["en"]


def leaves(obj, path=""):
    if isinstance(obj, dict):
        for key, value in obj.items():
            yield from leaves(value, f"{path}.{key}" if path else key)
    else:
        yield path, obj


PATHS = [path for path, _ in leaves(EN)]


def set_path(obj, path: str, value: str) -> None:
    cursor = obj
    parts = path.split(".")
    for part in parts[:-1]:
        cursor = cursor[part]
    cursor[parts[-1]] = value


def bundle(strings: list[str]) -> dict:
    if len(strings) != len(PATHS):
        raise SystemExit(f"expected {len(PATHS)} strings, got {len(strings)}")
    data = deepcopy(EN)
    for path, value in zip(PATHS, strings):
        set_path(data, path, value)
    return data
