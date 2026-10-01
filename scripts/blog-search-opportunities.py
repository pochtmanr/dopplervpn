#!/usr/bin/env python3
"""Read-only, repeatable GSC blog briefs. Never writes or generates articles.

Usage: python3 scripts/blog-search-opportunities.py [YYYY-MM-DD final-end-date]
The caller can persist stdout with its editorial job. Windows are inclusive,
28 days, final data only. Query rows omit anonymized terms; not site totals.
"""
import importlib.util
import json
import sys
import urllib.parse
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

spec = importlib.util.spec_from_file_location("gsc", Path(__file__).with_name("gsc-api.py"))
gsc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gsc)


def window(site, start, end):
    rows = []
    offset = 0
    while True:
        report = gsc.call("POST", f"/sites/{urllib.parse.quote(site, safe='')}/searchAnalytics/query", {
            "startDate": str(start), "endDate": str(end),
            "dimensions": ["page", "query"], "rowLimit": 25000,
            "startRow": offset, "dataState": "final",
            "dimensionFilterGroups": [{"filters": [{"dimension": "page", "operator": "contains", "expression": "/blog/"}]}],
        })
        batch = report.get("rows", [])
        rows.extend(batch)
        if len(batch) < 25000:
            break
        offset += len(batch)
    return {"start": str(start), "end": str(end), "rows": rows,
            "clicks": sum(row["clicks"] for row in rows),
            "impressions": sum(row["impressions"] for row in rows)}


def main():
    end = date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else datetime.now(timezone.utc).date() - timedelta(days=4)
    site = "sc-domain:dopplervpn.org"
    windows = [window(site, end-timedelta(days=27), end),
               window(site, end-timedelta(days=55), end-timedelta(days=28))]
    prior = {tuple(row["keys"]): row for row in windows[1]["rows"]}
    opportunities = []
    for row in windows[0]["rows"]:
        page, query = row["keys"]
        branded = "doppler" in query.casefold()
        if branded or row["impressions"] < 20 or row["position"] > 20:
            continue
        opportunities.append({"page": page, "query": query, "branded": branded,
                              "current": {key: row[key] for key in ("clicks", "impressions", "ctr", "position")},
                              "previous": prior.get(tuple(row["keys"])),
                              "action": "Review the existing page against this reader query; retrieve evidence and repair material gaps before considering a new overlapping article."})
    opportunities.sort(key=lambda item: item["current"]["impressions"], reverse=True)
    print(json.dumps({"version": "blog-search-brief-v1", "site": site,
                      "retrieved_at": datetime.now(timezone.utc).isoformat(),
                      "dimensions": ["page", "query"], "data_state": "final",
                      "caveat": "Query-level data excludes anonymized queries; totals are not property totals. Opportunities require relevance and content review.",
                      "windows": windows, "opportunities": opportunities}, indent=2))


if __name__ == "__main__":
    main()
