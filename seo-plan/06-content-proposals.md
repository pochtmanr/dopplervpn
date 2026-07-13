# Prompt 06 — Approval-gated: tools-page SEO, breadcrumbs, RTL fonts, hero LCP, content gaps

You are working in `/Volumes/RomanSSD/Developer28062026/doppler/landing` — the Next.js 15 App Router
marketing site for Doppler VPN (dopplervpn.org), 44 locales via next-intl. This prompt is
self-contained. **Nothing in this package ships without the user approving each item in-session:
present each proposal (with the evidence below), get a yes/no, then implement only the approved ones.**

## Ground rules (do not skip)

- Never commit anything under `.secrets/` or `seo-plan/data/`.
- Do NOT `git push` without asking — pushes to main auto-deploy to production (Vercel).
- **Hand-translation rule (absolute):** all locale strings are written BY YOU, by hand, in-session —
  never via scripts, APIs, or translation services.
- No fabricated claims; product facts from `src/lib/facts.ts`; no ratings/reviews schema.
- New pages are a bigger commitment than edits — that's why each item here needs explicit approval.
- Verify with `npm run build` before committing.

## Item A — Tools pages SEO content (evidence-backed, recommended)

GSC 90d: `/tools/what-is-my-ip` 713 impr at avg pos ~71; `/tools/dns-leak-test` 207 impr at pos ~66.
German cluster alone ~200 impr ("wie ist meine ip" 55, "was ist meine ip", "mein ip check",
"meine ip standort"…); generic "leak test" 57 impr pos 90, "dns test" 21 pos 84. Ranking pos 65–90
means Google sees the pages as thin. Proposal:
- Add a substantive explainer section under each tool (what the tool shows, why it matters for
  privacy, how a VPN changes the result), localized by hand starting with de + en (the locales with
  demand), metadata titles matching the query forms ("Wie ist meine IP?" for de).
- Internal links between the tools and to `/vless-vpn`//homepage.
- Prompt 03 (internal linking) should already have footer-linked the tools tree in all locales —
  verify that shipped; if not, do it here.

## Item B — Visible breadcrumbs (Phase-1 defect 8)

All SEO landing pages emit BreadcrumbList JSON-LD without visible breadcrumbs (only the blog has
them — `src/components/blog/blog-breadcrumb.tsx`). Google tolerates it, but visible breadcrumbs are
the safe, consistent version. Proposal: reuse/adapt the blog breadcrumb component on the landing
pages (shared shell: `src/components/landing/seo-landing-page.tsx`). Any new label strings
hand-translated into 44 locales.

## Item C — RTL/non-Latin fonts (Phase-1 defect 7)

ar/he/fa/ur locales get Latin-only `next/font` fonts globally (`src/app/[locale]/layout.tsx`
~line 158–161). The hero has a `FALLBACK_FONT_LOCALES` workaround; other headings render with
fallback system fonts inconsistently. fa is the site's best-performing locale (5,809 impr, 293
clicks) — it deserves clean typography. Proposal: add proper Arabic/Hebrew script font(s) via
next/font (e.g. Vazirmatn for fa, Noto Sans Arabic/Hebrew) conditionally by locale, remove the
hero-only workaround. Indirect SEO benefit (engagement), direct UX benefit.

## Item D — Hero LCP (Phase-1 defect 6)

`.hero-word { opacity:0; animation: hero-word-up 0.85s … }` (`src/app/globals.css` ~line 194–199,
stagger in `src/components/sections/hero.tsx` ~line 121) delays LCP ~0.85s on server-rendered text.
**Check Vercel Speed Insights first** (ask the user for the dashboard numbers or use the Vercel MCP
tools): if p75 LCP is green (<2.5s), skip; if not, proposal: keep the animation but start words at
low-but-nonzero opacity (e.g. 0.3) or shorten stagger so the LCP element paints immediately;
`prefers-reduced-motion` already disables it.

## Item E — Content-gap proposals (propose only; build only what user approves)

From the 90d query scan there are NO large unserved clusters — existing pages cover the demand.
Small candidates, in descending confidence:
1. **VLESS per-platform setup guides** (`/vless-vpn-windows`, `/vless-vpn-ios`): "vpn vless" queries
   land on `/fa/vless-vpn-android` today; the android guide exists, other platforms don't. Modest
   volume; natural extension of the strongest cluster.
2. **"Is a VPN legal in X" explainer** (single page or blog series for Iran/China/Russia/Turkey/UAE —
   the country pages get impressions and legality is the classic adjacent query; no current impressions
   because no page exists, so this is speculative).
3. **No-logs verification explainer**: "how to verify a vpn is no log" (19 impr) + "how to check…"
   (14 impr) land on the no-logs blog post at pos 13–31 — could be strengthened in-post instead of a
   new page (cheaper, recommended over a new page).
Present these three; implement only what's approved. New pages must follow the existing SEO landing
pattern (`src/components/landing/seo-landing-page.tsx` + `seo-landing-metadata.ts` + sitemap
inclusion — check `src/app/sitemap.ts` picks them up) with all-44-locale strings hand-translated.

## Verification

1. `npm run build` green; visual check of touched pages in `npm run dev` (include one RTL locale).
2. For Item D: before/after Lighthouse LCP on `/en` locally.
3. Commit; **ask before pushing**. Note deploy date + approved items in `seo-plan/00-PLAN.md`.
