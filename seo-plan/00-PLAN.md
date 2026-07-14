# Doppler VPN — SEO Implementation Master Plan

Produced 2026-07-14 from 90 days of GSC data (`sc-domain:dopplervpn.org`) + Bing Webmaster data.
Raw JSON cached in `seo-plan/data/` (gitignored, local only). Prompts `01`–`07` are self-contained —
run each in a fresh Opus session, in order. User approved this priority order on 2026-07-14.

## State of play (90d, GSC)

- **10,631 impressions, 237 clicks, 2.23% CTR** overall. Impressions +65% in the last 28d vs the
  prior 28d (3,418 vs 2,073); CTR dipped (3.04% → 2.08%) because new impressions land on low-CTR pages.
- Brand queries at pos 1 ("doppler vpn": 147 impr, 67 clicks, pos 1.3).
- **The VLESS cluster is the site's engine**: `/vless-vpn` across locales = 7,816 impr @ avg pos 7.9,
  plus `/en/blog/vless-reality-explained` 1,903 impr. But `/en/vless-vpn` converts at 0.22% CTR and
  "what is vless and how does it work?" (662 impr) gets **zero** clicks. `/fa/vless-vpn` is the best
  page on the site (4,724 impr, 208 clicks, 4.4% CTR).
- **Biggest single CTR failure**: `/en/blog/how-to-bypass-internet-censorship-2026` — 5,152 impr,
  4 clicks (0.08% CTR) at pos 6.5.
- **Locale priority by data**: fa ≫ zh/zh-Hant (Google AND Bing) > ru > ko > pt/es/nl (no-registration
  cluster) > de (tools cluster). Weak signal for ar/tr — deprioritized.
- **Bing** (feeds ChatGPT search + DuckDuckGo): `/zh/no-registration-vpn` is the top clicker
  (~40–60 clicks/period); `/zh/vless-vpn` high-impr/low-CTR there too. Crawl health clean
  (0 5xx, ~4,700 pages 2xx, 0 robots blocks). GSC sitemap: 4,699 URLs, 0 errors.
- Data caveats: "bypass isp internet access 2026" (1,820 impr, 0 clicks, US) and
  "build/built with opus 4.7 hackathon" (280 impr) look like AI-overview / off-intent impressions —
  treat CTR upside there as modest.

## Work packages (priority order = impact × effort)

| # | Prompt file | What | Why (evidence) |
|---|---|---|---|
| 01 | `01-technical-fixes.md` | Schema price conflict on platform pages; `account/success` noindex; duplicate Organization on /about; robots AI allowlist; blog og:locale; manifest theme_color; unused font; stale CLAUDE.md; support-email sweep → `support@simnetiq.store` (user-confirmed canonical) | Phase-1 defects 2, 3, 5, 9 — data-independent, all quick |
| 02 | `02-favicon.md` | ≥48px favicon + homepage reindex request | Phase-1 defect 1; Google needs ≥48px for result favicons |
| 03 | `03-internal-linking.md` | Footer link groups in all 44 locales; de-orphan `/vpn-for-tiktok-ban`, `/vless-vpn-android`, `/tools` tree (orphaned in 43 locales); related-pages blocks | Tools pages have real demand (de "wie ist meine ip" cluster ~200 impr, "leak test" ~100 impr) but rank pos 65–90 with zero internal equity |
| 04 | `04-vless-cluster.md` | Title/desc rewrites (en/fa/zh-Hant/zh); FAQ answering "what is VLESS"; resolve vless-reality cannibalization (landing=product vs blog=explainer + cross-links); link `/vless-vpn-android` | 7.8k impr; 662-impr query @ 0 clicks; ~950 impr Persian definitional cluster; 742-impr "vless reality" split across 3 pages |
| 05 | `05-ctr-rewrites.md` | Non-vless title/desc rewrites: bypass-censorship blog post (Supabase), `no-registration-vpn` pt/es/nl/ko, zh-Hant platform pages | 5,152 impr @ 0.08% CTR; "vpn sem registros" 206 impr @ pos 23.7; "vpn windows 版" 44 impr @ pos 43 |
| 06 | `06-content-proposals.md` | Approval-gated: tools-page SEO content (de cluster); visible breadcrumbs (defect 8); RTL/non-Latin fonts (defect 7); hero LCP (defect 6); content-gap proposals | Demand at pos 65–90 on tools; remaining Phase-1 defects |
| 07 | `07-verify-monitor.md` | Phase 4: re-pull GSC ≥48h after each deploy, compare positions/CTR on touched pages, sitemap status, optional Bing URL resubmission (ask first) | Closes the loop on 01–06 |

## Sequencing & rules

- 01–03 are data-independent and can ship immediately, in any order (01 first is cheapest win).
- 04 and 05 change locale strings and Supabase blog rows — they carry the **hand-translation rule**
  (model translates in-session; never scripts/APIs) and the **ask-before-DB-write** rule.
- 06 proposes; nothing in it ships without explicit user approval inside that session.
- Every session: never commit `.secrets/` or `seo-plan/data/`; never push without asking
  (push to main = production deploy); all product facts from `src/lib/facts.ts`; no fabricated
  ratings/review schema.
- After each deployed package, note the deploy date in this file so 07 can compare before/after.

## Deploy log (fill in as packages ship)

- [ ] 01 technical fixes — deployed: ____
- [ ] 02 favicon — deployed: ____
- [ ] 03 internal linking — deployed: ____
- [x] 04 vless cluster — committed 2026-07-14, not yet pushed (fill deploy date on push); Supabase blog retitle applied 2026-07-14
- [ ] 05 CTR rewrites — deployed: ____
- [ ] 06 approved proposals — deployed: ____
