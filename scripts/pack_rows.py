#!/usr/bin/env python3
"""Short complete locale packs. Each L() result must be 73 strings."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "content/policy-release/2026-09-28/packs"


def L(p: dict[str, str]) -> list[str]:
    u = p["u"]
    rows = [
        p["rt"], u, p["ri"], p["ai"], p["ar"], p["gi"],
        p["e1t"], p["e1"], p["e2t"], p["e2"], p["e3t"], p["e3"],
        p["e4t"], p["e4"], p["e5t"], p["e5"], p["e6t"], p["e6"], p["e7t"], p["e7"],
        p["e8t"], p["e8"], p["e9t"], p["e9"], p["e10t"], p["e10"], p["e11t"], p["e11"],
        p["at"], u, p["ai2"], p["w1t"], p["w1"], p["w2t"], p["w2"], p["w3t"], p["w3"], p["w4t"], p["w4"],
        p["bt"], u, p["bi"], p["b1t"], p["b1"], p["b2t"], p["b2"], p["b3t"], p["b3"], p["b4t"], p["b4"],
        p["ct"], u, p["ci"], p["c1t"], p["c1"], p["c2t"], p["c2"], p["c3t"], p["c3"],
        p["gt"], p["g1"], p["g2"], p["g3"], p["g4"],
        p["faq"], p["home"], p["guar"], p["foot"], p["sub"], p["eb"], p["er"], p["pt"], p["pc"],
    ]
    if len(rows) != 73:
        raise SystemExit(len(rows))
    return rows


def save(locale: str, rows: list[str]) -> None:
    (OUT / f"{locale}.txt").write_text("# " + locale + "\n" + "\n".join(rows) + "\n")
    print(locale, len(rows))
