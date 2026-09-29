#!/usr/bin/env python3
"""Strip the unpublished video product from terms, then apply a refund-copy overlay.

Usage:
  python3 scripts/apply-refund-copy.py --strip
  python3 scripts/apply-refund-copy.py --overlay content/policy-release/2026-09-28/en.json
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

VIDEO = re.compile(
    r"video|vídeo|видео|відео|视频|影片|וידאו|فيديو|ویدیو|वीडियो|비디오|動画|วิดีโอ|videó|wideo|videon|videoa",
    re.I,
)
B_CLAUSE = re.compile(
    r"\s*[\(（](?:b|б|B|ب|ข)[\)）]\s*.{0,700}?(?:[.。।]|(?=บริการทั้งสอง))",
    re.I,
)


def drop_video_sentences(text: str) -> str:
    parts = re.split(r"(?<=[.!?。।])\s*", text)
    kept = [part for part in parts if not VIDEO.search(part)]
    return " ".join(kept).strip()


def strip_semicolon_clauses(text: str) -> str:
    parts = re.split(r"\s*[;؛]\s*", text)
    kept = [part for part in parts if not VIDEO.search(part)]
    return "; ".join(kept)


def strip_intro(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return "," if VIDEO.search(match.group(0)) else match.group(0)

    text = re.sub(r",\s*[^,，、]{0,220},", repl, text)
    # Clause with no closing comma: ", <video phrase> and/und/и/et/以及 ..."
    text = re.sub(
        r",\s*(?:our |unserem |нашему |нашому |notre |nuestro |nosso |il nostro |naszego |ons |우리 |我们的 |我們的 |ה)?[^,.]{0,80}"
        + VIDEO.pattern
        + r"[^,.]{0,80}(?=\s+(?:and|und|и|та|et|y|e|és|och|og|ja|ve|以及|および|و|و)\b)",
        "",
        text,
        count=1,
        flags=re.I,
    )
    text = re.sub(r"、[^、。]{0,30}(?:動画|视频|影片)[^、。]{0,30}、", "、", text, count=1)
    text = text.replace("),,", "),").replace("  ", " ")
    return text


def strip_privacy_intro(text: str) -> str:
    match = VIDEO.search(text)
    if not match:
        return text.replace(")(", ") (").replace("）（", "） （")
    start = max(text.rfind(")", 0, match.start()), text.rfind("）", 0, match.start()))
    ends = [pos for pos in (text.find("(", match.end()), text.find("（", match.end())) if pos >= 0]
    if start < 0 or not ends:
        return text
    end = min(ends)
    return (text[: start + 1] + " " + text[end:]).replace("  ", " ")


def strip_privacy(privacy: dict) -> None:
    intro = privacy.get("intro")
    if isinstance(intro, str):
        privacy["intro"] = strip_privacy_intro(intro)
    collect = privacy.get("sections", {}).get("collect", {})
    if isinstance(collect, dict) and isinstance(collect.get("content"), str):
        collect["content"] = drop_video_sentences(collect["content"])
        collect["content"] = strip_semicolon_clauses(collect["content"])


def strip_terms(terms: dict) -> None:
    terms["intro"] = strip_intro(terms["intro"])
    service = terms["sections"]["service"]["content"]
    service = B_CLAUSE.sub(" ", service)
    service = drop_video_sentences(service)
    service = service.replace("two categories of digital services", "a digital service")
    service = service.replace("Both Services are provided", "The service is provided")
    service = service.replace("(a) DopplerVPN —", "Doppler VPN —")
    terms["sections"]["service"]["content"] = re.sub(r"\s{2,}", " ", service).strip()
    terms["sections"]["accounts"]["content"] = drop_video_sentences(terms["sections"]["accounts"]["content"])
    terms["sections"]["usage"]["content"] = strip_semicolon_clauses(terms["sections"]["usage"]["content"])
    terms["sections"]["ip"]["content"] = drop_video_sentences(terms["sections"]["ip"]["content"])


REPLACE_KEYS = {"refund", "helpAccountId", "helpWebAndStore", "helpRestoreCancelRefund"}


def deep_set(target: dict, overlay: dict) -> None:
    for key, value in overlay.items():
        if key in REPLACE_KEYS:
            target[key] = value
        elif isinstance(value, dict) and isinstance(target.get(key), dict):
            deep_set(target[key], value)
        else:
            target[key] = value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strip", action="store_true")
    parser.add_argument("--overlay", type=Path)
    parser.add_argument("--locales", nargs="*")
    args = parser.parse_args()
    overlay = json.loads(args.overlay.read_text()) if args.overlay else None
    for path in sorted(MESSAGES.glob("*.json")):
        locale = path.stem
        if args.locales and locale not in args.locales:
            continue
        data = json.loads(path.read_text())
        if args.strip or overlay is None:
            strip_terms(data["terms"])
            strip_privacy(data["privacy"])
        if overlay and locale in overlay:
            deep_set(data, overlay[locale])
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        print("updated", locale)


if __name__ == "__main__":
    main()
