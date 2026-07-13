# Prompt 07 — Verify & monitor pass (run ≥48h after deploys; repeat weekly)

You are working in `/Volumes/RomanSSD/Developer28062026/doppler/landing`. This prompt is
self-contained. It closes the loop on the SEO packages in `seo-plan/00-PLAN.md` (check its deploy
log for what shipped and when — GSC data lags ~2 days, so compare periods that start after
deploy+2d).

## Ground rules

- Read-only against Google/Bing except where noted. Never commit `.secrets/` or `seo-plan/data/`.
- Do NOT push without asking. If any API key gets pasted into chat, tell the user to rotate it.

## API access (already set up)

- **GSC**: `python3 scripts/gsc-api.py` (service-account key in `.secrets/gsc-service-account.json`,
  property `sc-domain:dopplervpn.org`):
  - `python3 scripts/gsc-api.py sites` — sanity check
  - `python3 scripts/gsc-api.py sitemaps sc-domain:dopplervpn.org`
  - `python3 scripts/gsc-api.py query sc-domain:dopplervpn.org <days> query,page`
  - `python3 scripts/gsc-api.py raw POST '/sites/sc-domain%3Adopplervpn.org/searchAnalytics/query' body.json`
    for explicit date ranges: body = `{"startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","dimensions":["query","page"],"rowLimit":25000}`
- **Bing**: key in `.secrets/bing-api-key.txt`; REST
  `https://ssl.bing.com/webmaster/api.svc/json/<Method>?apikey=<KEY>&siteUrl=https://www.dopplervpn.org/`
  — `GetQueryStats`, `GetPageStats`, `GetRankAndTrafficStats`, `GetCrawlStats`,
  `GetUrlSubmissionQuota`, `SubmitUrlBatch` (**ask the user before submitting URLs**; quota 100/day).

## Baseline (90d ending 2026-07-12, cached in `seo-plan/data/`)

| Metric / page | Baseline |
|---|---|
| Site 90d | 10,631 impr / 237 clicks / 2.23% CTR |
| Site 28d (06-15→07-12) | 3,418 impr / 71 clicks / 2.08% CTR |
| `/en/vless-vpn` | 2,264 impr, 0.22% CTR, pos 8.7 |
| `/fa/vless-vpn` | 4,724 impr, 4.40% CTR, pos 7.7 |
| `/en/blog/how-to-bypass-internet-censorship-2026` | 5,152 impr, 0.08% CTR, pos 6.5 |
| `/pt/no-registration-vpn` | 209 impr, 0% CTR, pos 23.5 |
| `/tools/what-is-my-ip` Σ | 713 impr, pos ~71 |
| `/tools/dns-leak-test` Σ | 207 impr, pos ~66 |
| `/vpn-for-tiktok-ban` Σ | 323 impr, 0.31% CTR, pos 8.1 |
| `/vless-vpn-android` Σ | 442 impr, 2.71% CTR, pos 9.8 |
| "what is vless and how does it work?" | 662 impr, 0 clicks, pos 9.6 |
| "vpn sem registros" | 206 impr, 0 clicks, pos 23.7 |
| "vpn windows 版" | 44 impr, 0 clicks, pos 43.3 |

## Steps

1. Read `seo-plan/00-PLAN.md` deploy log → determine the post-deploy comparison window (start =
   deploy date + 2d).
2. Pull post-deploy GSC data (`raw` with explicit dates, dims `["page"]` and `["query","page"]`)
   into `seo-plan/data/monitor-<date>-*.json`. Pull the matching pre-deploy window for fairness
   (same length, ending the day before deploy).
3. Compare against the baseline table above for every touched page: impressions, CTR, position.
   Also: sitemap status (`sitemaps` — errors must stay 0), and spot-check live URLs
   (`curl -sI https://www.dopplervpn.org/en/vless-vpn` → 200; JSON-LD present where changed).
4. Bing: `GetCrawlStats` (5xx must stay 0, robots blocks 0), `GetPageStats` for `/zh/…` pages.
   If key pages were changed, propose `SubmitUrlBatch` for those exact URLs and ask the user.
5. Report a before/after table in chat with a verdict per package: working / too early / regressed.
   Flag any page whose position dropped >2 spots or CTR halved — investigate before blaming the
   change (seasonality, SERP feature shifts).
6. Update the baseline table in this file with the new numbers and date, so the next run compares
   against the freshest data.

## Cadence

Run 48h after each deploy for a smoke check, then weekly for a month. Title/CTR changes show in
days; position changes from internal linking take 2–6 weeks; favicon changes (prompt 02) can take
weeks to appear in SERPs.
