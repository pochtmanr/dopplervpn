# Prompt 05 — Non-VLESS CTR rewrites: bypass-censorship post, no-registration-vpn locales, zh-Hant platform pages

You are working in `/Volumes/RomanSSD/Developer28062026/doppler/landing` — the Next.js 15 App Router
marketing site for Doppler VPN (dopplervpn.org), 44 locales via next-intl (strings in
`messages/<locale>.json`). This prompt is self-contained.

## Ground rules (do not skip)

- Never commit anything under `.secrets/` or `seo-plan/data/`.
- Do NOT `git push` without asking — pushes to main auto-deploy to production (Vercel).
- **Hand-translation rule (absolute):** all locale-string writing (pt, es, nl, ko, zh-Hant, …) is
  done BY YOU, by hand, in this session — never via scripts, APIs, or translation services. Match
  each locale's existing register.
- Blog posts live in **Supabase** (project `fzlrhmjdjjzcgstaeblu`, tables `blog_posts` +
  `blog_translations`). Inspect schema first; show the exact UPDATE to the user for approval before
  executing; never change slugs.
- No fabricated claims; product facts from `src/lib/facts.ts`.
- Verify with `npm run build` before committing.

## Evidence (GSC 90d, pulled 2026-07-14)

| Target | Impr | Clicks | CTR | Pos | Main queries |
|---|---|---|---|---|---|
| `/en/blog/how-to-bypass-internet-censorship-2026` | 5,152 | 4 | **0.08%** | 6.5 | "bypass isp internet access 2026" (1,820 impr, 0 cl), "best ways to bypass internet censorship 2026" (44), "best vpn for bypassing (internet) censorship 2026" (56), "best tools to…" (13) |
| `/pt/no-registration-vpn` | 209 | 0 | 0% | 23.5 | "vpn sem registros" (206 impr, pos 23.7) |
| `/es/no-registration-vpn` | ~30 | 0 | 0% | ~31 | "vpn sin registro" (11 impr) |
| `/nl/no-registration-vpn` | ~25 | 0 | ~0% | ~20 | "vpn account maken" (10 impr, pos 19.9) |
| `/ko/no-registration-vpn` | 296 | 15 | 5.07% | 6.7 | "로그인 없는 무료 vpn" — already good, light touch only |
| `/zh-Hant/vpn-for-windows` | ~50 | 0 | 0% | ~43 | "vpn windows 版" (44 impr, pos 43.3) |
| `/zh-Hant/vpn-for-android` | ~60 | 1 | ~1% | 30–35 | "vpn for android" (24, pos 33.5), "vpn下載安卓" (14, pos 29.3), "vpn apk" (11, pos 34.9) |

Context: `/no-registration-vpn` aggregated across locales does well (1,106 impr, 5.06% CTR) — the
pt/es/nl variants are the laggards. Caveat on the bypass post: most impressions are the US query
"bypass isp internet access 2026" with 0 clicks at pos 6.1 — likely partly AI-overview impressions,
so expect improvement, not miracles.

## Changes

1. **Bypass-censorship blog post (Supabase).** Rewrite the meta title + description (and the visible
   H1/title if it's the same field) of `how-to-bypass-internet-censorship-2026` to match how people
   actually search: they want *methods/tools that work in 2026* ("best ways/tools to bypass internet
   censorship 2026", "bypass ISP restrictions"). Current title evidently reads like news, not an
   answer. Keep the year, lead with the how-to promise, mention VPN/VLESS as the method. Description:
   one-sentence direct answer + differentiator. Don't change the slug. If `blog_translations` holds
   per-locale titles for this post, update only locales you can write well by hand — and only where
   data justifies it (en first; the post's non-en variants have little traffic).
2. **`/pt/no-registration-vpn`** — pos 23.7 with 206 impr on "vpn sem registros" is striking
   distance. In `messages/pt.json` (namespace for the no-registration page — find it via
   `src/app/[locale]/no-registration-vpn/page.tsx`): make the exact phrase "VPN sem registros" (and
   the sem-cadastro variant if natural) present in the metadata title, H1, and opening copy. Write
   the Portuguese by hand. Position gain needs relevance, not just CTR bait — check the page copy
   actually uses the phrase, not a paraphrase.
3. **`/es/no-registration-vpn`** — same treatment with "VPN sin registro(s)".
4. **`/nl/no-registration-vpn`** — same with "VPN zonder account/registratie" ("vpn account maken"
   searchers want *no* account — make the title say that).
5. **`/ko/no-registration-vpn`** — already 5.07% CTR; only tighten if the title obviously misses
   "로그인 없는 VPN" phrasing. Don't break what works.
6. **zh-Hant platform pages** — `/zh-Hant/vpn-for-windows` + `/zh-Hant/vpn-for-android` metadata
   titles in `messages/zh-Hant.json` (namespaces via the page files, e.g.
   `src/app/[locale]/vpn-for-windows/page.tsx`): include the natural Traditional-Chinese search forms
   (e.g. "Windows 版 VPN", "VPN 下載", "安卓 VPN APK" — write natural zh-Hant by hand, don't
   keyword-stuff). Positions 30–43 mean these need relevance in title+H1+copy, not just meta tweaks —
   adjust the H1/opening string too if it lacks the platform-download phrasing.

## Verification

1. `npm run build` green.
2. `npm run dev`: render `/pt/no-registration-vpn`, `/es/…`, `/nl/…`, `/zh-Hant/vpn-for-windows`,
   `/zh-Hant/vpn-for-android` — titles/H1s show the new phrasing; nothing overflows visually.
3. Supabase: SELECT the blog row after UPDATE, paste old→new in chat for the user.
4. Commit; **ask before pushing**. Note deploy date in `seo-plan/00-PLAN.md`.
5. Expected outcome (prompt 07, ≥2 weeks): bypass post CTR 0.08% → >0.5%; pt page climbs from
   pos ~24 toward top-10 on "vpn sem registros"; zh-Hant platform pages move up from pos 30–43.
