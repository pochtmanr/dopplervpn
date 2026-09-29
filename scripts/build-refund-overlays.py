#!/usr/bin/env python3
"""Turn pack files into one overlay and leave it at content/policy-release/2026-09-28/overlay.json."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from refund_overlay_lib import bundle

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "content/policy-release/2026-09-28"
PACKS = RELEASE / "packs"

overlay = json.loads((RELEASE / "en.json").read_text())
for path in sorted(PACKS.glob("*.json")):
    overlay[path.stem] = bundle(json.loads(path.read_text()))
for path in sorted(PACKS.glob("*.txt")):
    lines = [line for line in path.read_text().splitlines() if not line.startswith("#")]
    overlay[path.stem] = bundle(lines)

out = RELEASE / "overlay.json"
out.write_text(json.dumps(overlay, ensure_ascii=False, indent=2) + "\n")
print("locales", ", ".join(sorted(overlay)))
