# Prompt 03 — Internal linking: footer groups (44 locales) + de-orphaning + related-pages blocks

You are working in `/Volumes/RomanSSD/Developer28062026/doppler/landing` — the Next.js 15 App Router
marketing site for Doppler VPN (dopplervpn.org), 44 locales via next-intl. Strings live in
`messages/<locale>.json`; navigation components are `src/components/layout/{footer,desktop-nav,mobile-nav}.tsx`.
This prompt is self-contained.

## Ground rules (do not skip)

- Never commit anything under `.secrets/` or `seo-plan/data/`.
- Do NOT `git push` without asking — pushes to main auto-deploy to production (Vercel).
- **Hand-translation rule (absolute):** every new locale string you add to `messages/<locale>.json`
  is translated BY YOU, by hand, in this session — never via scripts, third-party APIs, or
  translation services. Batch by locale file and work through all 44 sequentially. Match each
  locale's existing tone/formality (read neighboring strings first).
- Verify with `npm run build` before committing.

## Evidence (GSC 90d, pulled 2026-07-14)

- `/tools/what-is-my-ip`: 713 impr at avg pos ~71 (de cluster: "wie ist meine ip" 55 impr pos 89,
  "was ist meine ip", "mein ip check"…, ~200 impr total). `/tools/dns-leak-test`: 207 impr at pos ~66
  ("leak test" 57 impr pos 90, "dns test" 21 impr pos 84). Real demand, near-zero internal equity.
- Orphans found in the Phase-1 audit: `/vpn-for-tiktok-ban` (323 impr, 0.31% CTR) and
  `/vless-vpn-android` (442 impr, 2.7% CTR) have ZERO inbound internal links; the `/tools` tree is
  footer-linked only for `en` (orphaned in the other 43 locales); `/vpn-for-macos` + `/vpn-for-windows`
  are only cross-linked from each other; `/giveaway`, `/pay-with-crypto`, `/agents` weakly linked.

## Current footer structure (verified 2026-07-14)

`src/components/layout/footer.tsx` builds three `LinkItem[]` groups (~lines 55–90):
`productLinks` (pricing, downloads, blog*, bypass-censorship, vless-vpn, no-registration-vpn,
vpn-for-ios, vpn-for-android, tools*), `locationLinks` (uae, iran, china, russia, turkey), and a
support/legal set. Items marked * are gated by `showBlogLink` / `showToolsLink` flags — find how
those flags are computed and why tools is en-only.

## Changes

1. **Un-gate `/tools` for all 44 locales** (remove/loosen `showToolsLink`). The tools pages exist in
   all locales (verify one, e.g. `/de/tools/what-is-my-ip`, renders). If the gate existed because the
   footer label was only translated in `en`, translate the label into all 44 locales by hand.
2. **Add missing footer links**, in sensible groups (keep the footer scannable — consider a fourth
   column or extending existing groups):
   - Product/platforms: `/vpn-for-macos`, `/vpn-for-windows`, `/vless-vpn-android`
   - Use cases: `/vpn-for-tiktok-ban` (+ it already has bypass-censorship etc.)
   - Misc: `/giveaway`, `/pay-with-crypto`, `/agents` (agents can live in the support/legal column)
   Each new label needs a `footer.*` key in all 44 `messages/<locale>.json` files — hand-translated.
3. **Related-pages blocks** on the SEO landing pages (shared component
   `src/components/landing/seo-landing-page.tsx` — check whether a related-links section already
   exists there or per-page). Add a consistent "Related" block so topical pages cross-link:
   - vless cluster: `/vless-vpn` ↔ `/vless-vpn-android` ↔ `/bypass-censorship`
   - platform pages: ios ↔ android ↔ macos ↔ windows (all four, not just macos↔windows)
   - country pages: iran/china/russia/turkey/uae cross-link + link `/vpn-for-travelers-china`,
     `/vpn-for-instagram-russia`, `/vpn-for-telegram-calls-uae`, `/vpn-for-whatsapp-calls-uae`,
     `/vpn-for-public-wifi-iphone`, `/vpn-for-tiktok-ban` from their thematically-closest siblings.
   Use existing translated page titles for anchor text where possible (metadata namespaces in
   `messages/`) to avoid inventing new strings; if a heading string like "Related pages" is needed,
   add it once and hand-translate into all 44 locales.
4. Do NOT add `nofollow`/`noindex` anywhere; these are plain internal links.

## Verification

1. `npm run build` (this also catches missing message keys in any locale — build must be green).
2. `npm run dev`: check footer on `/en`, `/de`, `/fa` (RTL!), `/zh-Hant` — tools link visible, new
   links present, layout not broken (especially RTL).
3. Confirm de-orphaning: `grep -rn "vpn-for-tiktok-ban\|vless-vpn-android" src/components src/app | grep -v "app/\[locale\]/vpn-for-tiktok\|app/\[locale\]/vless-vpn-android"`
   → at least one nav/related-block hit each.
4. Commit; **ask before pushing**. Note deploy date in `seo-plan/00-PLAN.md`.
5. Expected outcome (checked in prompt 07): tools pages climb from pos 65–90; tiktok-ban and
   vless-vpn-android impressions/positions improve over 2–4 weeks.
