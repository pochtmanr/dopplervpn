# Prompt 01 — Quick technical SEO fixes (schema, indexing hygiene, minor cleanups)

You are working in `/Volumes/RomanSSD/Developer28062026/doppler/landing` — the Next.js 15 App Router
marketing site for Doppler VPN (dopplervpn.org), 44 locales via next-intl (`src/app/[locale]/…`,
strings in `messages/<locale>.json`). This prompt is self-contained; do not look for prior context.

## Ground rules (do not skip)

- Never commit anything under `.secrets/` or `seo-plan/data/` (both gitignored — keep it that way).
- Do NOT `git push` without asking the user — pushes to main auto-deploy to production (Vercel).
- All product facts (prices, plans, features) come from `src/lib/facts.ts`. No fabricated schema
  claims — never add ratings/reviews markup.
- If any locale string changes are needed, YOU translate them by hand in this session — never via
  scripts, APIs, or translation services. (This task only needs a mechanical email swap, not translation.)
- Verify with `npm run build` before committing. Ask before pushing.

## Fixes (all pre-audited; line numbers verified 2026-07-14)

### 1. Conflicting schema prices on platform pages

`/vpn-for-{ios,android,macos,windows}` each render `<PlatformAppSchema … price="0">`
(e.g. `src/app/[locale]/vpn-for-ios/page.tsx` ~line 217–224). The root layout simultaneously emits
a sitewide SoftwareApplication node priced at the monthly plan (6.99) from
`src/components/seo/json-ld.tsx` (SoftwareApplicationSchema, offers at ~line 115–120; Product schema
offers at ~line 77–92). Google sees two SoftwareApplication-type nodes with contradictory prices on
the same URL.

Fix: represent the story once, consistently — the app is a **free download** with a **paid
subscription**. Recommended: change `PlatformAppSchema` (in `src/components/seo/json-ld.tsx`) so its
`offers` matches reality: keep the free-download offer AND add the subscription offers imported from
`PLANS` in `src/lib/facts.ts` (same shape the sitewide node uses), so both nodes agree. Do not
hardcode any price. Apply to all four platform pages (they share the component, so one change should
cover them — verify each page passes no conflicting props).

### 2. `account/success` is indexable and canonicalizes to the homepage

`src/app/[locale]/account/success/page.tsx` exports NO metadata, so it inherits the root canonical.
Add a `metadata` export (or `generateMetadata`) with `robots: { index: false, follow: false }`.
Check siblings under `src/app/[locale]/account/` and `src/app/[locale]/checkout/success/` for the
same problem and fix identically if present.

### 3. Duplicate Organization schema on /about

`src/app/[locale]/about/page.tsx` ~line 57–67 defines an inline Organization JSON-LD
(`legalName: "Simnetiq Ltd"`, empty `sameAs`, hardcoded `foundingDate: "2025"`), conflicting with
the sitewide Organization from `src/components/seo/json-ld.tsx` (which uses "SIMNETIQ LTD").
Fix: delete the inline node from the about page (the sitewide one, mounted in
`src/app/[locale]/layout.tsx`, already covers it). If the sitewide node lacks anything valuable from
the inline one, merge it there instead of keeping two.

### 4. robots.ts AI allowlist gaps

`src/app/robots.ts` ~line 29–36, `AI_USER_AGENTS` array: add `"Bytespider"` and
`"meta-externalagent"` so those crawlers get the same explicit allow treatment.

### 5. Blog index passes raw locale to og:locale

`src/app/[locale]/blog/page.tsx` ~line 64: `locale: locale` in openGraph. Every other page maps via
`ogLocaleMap` (see `src/lib/og-locale-map.ts`, used in `src/components/landing/seo-landing-metadata.ts`).
Fix: `locale: ogLocaleMap[locale] || "en_US"`. Check the blog post page
(`src/app/[locale]/blog/[slug]/page.tsx`) for the same bug.

### 6. Manifest theme_color mismatch

`public/site.webmanifest` has `theme_color: #0a0a0a`, but the viewport theme colors are
`#FAFAF8` (light) / `#141414` (dark) (search `themeColor` in `src/app/[locale]/layout.tsx`).
Align the manifest to `#141414`.

### 7. Unused font file

`src/fonts/FKRasterRomanCompact-Blended.otf` appears unreferenced. Verify with
`grep -rn "FKRasterRomanCompact" src/` — if truly unused, delete it.

### 8. Stale CLAUDE.md

`CLAUDE.md` (repo root of `landing/`) says 21 locales and Framer Motion. Actual: 44 locales, and
Framer Motion is no longer used (verify with `grep -rn "framer-motion" src/ package.json`).
Update those two facts (and anything else you notice that contradicts the code — e.g. the page list
under `src/app/[locale]/` is much longer now). Keep edits factual and minimal.

### 9. Support-email sweep → `support@simnetiq.store` (user-confirmed canonical, 2026-07-14)

The user confirmed `support@simnetiq.store` is the canonical support address. Replace every
user-facing occurrence of `support@dopplervpn.org` with `support@simnetiq.store`. Verified
occurrences (re-grep to be sure: `grep -rn "support@dopplervpn.org" src public messages`):

- `src/app/[locale]/checkout/success/success-client.tsx:13` (`SUPPORT_EMAIL` const)
- `src/lib/email.ts:105`, `:211` (`supportEmail` consts) and `:335` (fallback from-address)
- `public/ads.txt:1` (`contact=`)
- `messages/<locale>.json` — the `supportLine` string (line ~38 in `en.json`) exists in all 44 locale
  files with the old address embedded. This is a mechanical email swap inside existing translated
  strings — do NOT retranslate the sentences, only swap the address. Sweep all 44 files.

Leave `support@simnetiq.store` occurrences as they are (facts.ts, llms-full.txt, agents.json, etc.).

## Verification

1. `npm run build` — must pass. `npm run lint` on touched files.
2. `grep -rn "support@dopplervpn.org" src public messages` → zero hits.
3. Locally (`npm run dev`): view-source on `/en/vpn-for-ios` — exactly one consistent price story in
   JSON-LD (free app + subscription from facts.ts); `/en/about` — exactly one Organization node;
   `/en/account/success` (or via curl of the built output) — `noindex` robots meta.
4. Commit with a clear message. **Ask the user before pushing** (push = production deploy).
5. Post-deploy (user-run or with approval): `curl -s https://www.dopplervpn.org/en/vpn-for-ios | grep -o 'application/ld+json.\{0,400\}'`
   to confirm schema in production, and validate one platform URL in Google's Rich Results Test.
6. Note the deploy date in `seo-plan/00-PLAN.md` deploy log.
