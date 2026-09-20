# Doppler Web — engineering context

> **This repository is public** (`github.com/pochtmanr/dopplervpn`). Nothing here may contain a
> credential, a node IP, a VPS hostname, a personal address, internal traffic/revenue figures, or
> an internal QA list. Server-side ops live in the private `doppler-infra` repo. When in doubt,
> put it there.

> **Subscriptions, entitlements and anti-fraud live in one place:**
> [`../SUBSCRIPTION-AND-ANTIFRAUD.md`](../SUBSCRIPTION-AND-ANTIFRAUD.md) — the Pro predicate on
> every layer, the purchase→Pro pipeline, per-platform behaviour, the anti-fraud posture with
> honest strength ratings, the known holes, and the schema drift. **Read it before grepping for
> any of that**, and correct it there rather than re-deriving it.

> **Design:** all landing UI work — sections, pages, cards, buttons, OG/social images — follows
> [`DESIGN.md`](DESIGN.md) (the "Glyph Terminal" standard set by the home hero, "Available on" cards
> and "How Doppler VPN Protects Your Traffic" cards). **Read it before styling anything**, and
> update it when the standard changes.

## Overview

Next.js 15 App Router app serving `www.dopplervpn.org`: the 44-language marketing site, the blog
read-path, downloads, web checkout, the account dashboard, privacy tools, and the API routes the
native clients and the Telegram bot call. Deployed on Vercel.

**Not here:** the admin dashboard and the blog *write*-path (including AI translation) are a
separate app, `doppler-admin`. The VPN server side is the private `doppler-infra` repo.

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19
- **Language:** TypeScript (`strict: true`)
- **Styling:** Tailwind CSS v4 + `@tailwindcss/postcss` — tokens in `src/app/globals.css`
- **i18n:** next-intl v3 — 44 locales, URL-routed via `[locale]`
- **Backend:** Supabase (project ref `fzlrhmjdjjzcgstaeblu`)
- **Payments:** Revolut (cards) and OxaPay (crypto)
- **Deployment:** Vercel, auto-deploy on push to `main`

## Architecture

```
src/
  middleware.ts           # www redirect, next-intl routing, click-id cookie, blog 410s
  i18n/
    routing.ts            # the 44 locales
    blog-locales.ts       # the 21 blog locales (subset)
    security-locales.ts   # locales with the /security page translated
    request.ts, navigation.ts, client-namespaces.ts
  app/
    [locale]/             # the whole public site
      (auth)/             # login/, signup/ — the only route group
      page.tsx            # landing
      blog/, blog/[slug]/ # blog read-path (writes live in doppler-admin)
      account/            # account dashboard + checkout
      checkout/success/   # post-payment polling
      downloads/, support/, tools/{what-is-my-ip,dns-leak-test,webrtc-leak-test}/
      delete-account/, delete-account/confirm/
      # Legal: privacy/, terms/, refund/, dpa/, subprocessors/, security/
      # ~20 SEO landings: vpn-for-{ios,android,macos,windows}/,
      #   vpn-for-{china,iran,russia,turkey,uae,...}/, vless-vpn/,
      #   no-registration-vpn/, bypass-censorship/, pay-with-crypto/, giveaway/
    agents/               # human-readable agent surface (not localized)
    checkout/             # non-localized checkout entry (not localized)
    cn-check/             # China reachability probe (not localized)
    q/[slug]/route.ts     # QR short links -> track_qr_scan
    api/                  # see below
    sitemap.ts, sitemap-index/, robots.ts, globals.css
  components/
    landing/              # SeoLandingPage + PlatformLandingPage (see "Shared page shells")
    sections/, layout/, blog/, seo/, glyph/, account/, hero/, tools/,
    downloads/, no-registration/, icons/, ui/, analytics/
  config/platforms/       # per-platform config for the 4 platform landings
  lib/                    # services + shared utilities
    supabase/{client,server,admin,types}.ts   # the ONLY 4 Supabase constructions
  hooks/
```

### API routes (`src/app/api/`)

| Group | Purpose |
|---|---|
| `subscribe/`, `account/` | account creation, lookup, devices, deletion |
| `doppler/{send-code,verify-code}` | email verification codes for account linking |
| `checkout/`, `revolut/`, `oxapay/`, `promo/` | web payments, webhooks, promo validation |
| `support/` | tickets, business inquiries, account recovery |
| `vpn/{connect,disconnect,servers}` | native-client calls — the only routes with real auth (`requireAppApiKey`) |
| `agents/` | MCP server + agent manifest/pricing/privacy surface |
| `android/`, `windows/` | release metadata and download proxying |
| `ip`, `waitlist`, `revalidate`, `dev/grant-pro` | misc |

## Key patterns

- **Shared page shells.** Two, and new pages should use one rather than hand-rolling markup:
  - `components/landing/seo-landing-page.tsx` — the article-style SEO landings (China, Iran, …).
  - `components/landing/platform-landing-page.tsx` — the four platform pages, driven by
    `config/platforms/{ios,android,macos,windows}.ts`. These were four ~550-line near-copies
    before; do not fork them again.
  - Both use `components/landing/seo-landing-metadata.ts` — never hand-write `generateMetadata`
    with the 44-locale `alternates.languages` fan-out again.
- **Icons** live in `components/icons/`. `ShieldIcon` was once declared in seven files; add to the
  shared module instead.
- **Supabase clients** are constructed in exactly four places, all under `lib/supabase/`. Do not
  create an ad-hoc client anywhere else.
- **Blog locales:** 44 site locales but **21** blog locales (`i18n/blog-locales.ts`). Non-blog
  locales 308-redirect `/{locale}/blog/*` → `/en/blog/*` in `middleware.ts`.
- **i18n:** `useTranslations()` in Client Components, `getTranslations()` in Server Components. A
  namespace used client-side must be listed in `i18n/client-namespaces.ts` or `check:i18n` fails.
- **`"use client"` sits on leaf components**, never on a `page.tsx`. Keep it that way.

## Backend integration

**Tables written/read from here** (by query volume): `accounts`, `vpn_invoices`,
`verification_codes`, `blog_posts`, `vpn_user_configs`, `checkout_tokens`, `vpn_servers`,
`promo_codes`, `promo_redemptions`, `support_tickets`, `ad_conversions`, `waitlist`,
`device_sessions`, `blog_tags`. `blog_post_translations` is read only as an embedded join.

**RPCs:** `delete_account`, `increment_promo_redemptions`, `track_qr_scan`.

**Auth model.** There is no Supabase Auth on the public path. The account code
(`VPN-XXXX-XXXX-XXXX`) is the only credential, and most routes authorise on knowledge of it alone
via the service-role client — see *Known issues*.

## Commands

```bash
npm run dev         # dev server (localhost:3000)
npm run build       # production build — runs `prebuild` first (see below)
npm run start       # serve the production build
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run check:facts # facts.ts vs the static /public mirrors  ── prebuild gate
npm run check:i18n  # client namespaces declared             ── prebuild gate
npm run indexnow    # ping IndexNow for changed URLs
```

`npm run build` runs a **blocking** `prebuild` (`check:facts && check:i18n`). A build that fails
there has not reached Next.js yet — read the script output, not the Next error.

## Known issues

- **The account ID is a bearer password.** 30 of 42 API routes use the service-role client and
  authorise purely on a submitted `account_id`; only `/api/vpn/*` checks a real secret. The fix is
  a signed, expiring session token minted by the verify-code flow — it touches all three native
  clients, so it is a cross-platform change, not a web-only one.
- **Rate limiting is in-memory** (`lib/rate-limit.ts`) and therefore per-serverless-instance. It is
  best-effort, not a security boundary.
- **CSP allows `script-src 'unsafe-inline'`** (`next.config.ts`) — deliberate, because nonces would
  break static generation, but it removes CSP's XSS value.
- **No test suite yet.** See `.github/workflows/ci.yml` for what is gated today.

## Important notes

- **Always use `www.dopplervpn.org`** in links and API calls — the apex redirects and that strips
  auth headers. `vercel.json` holds the redirect; `middleware.ts` explains the split.
- **Never hardcode a price, a contact address or a product fact** — `lib/facts.ts` owns them, and
  `check:facts` enforces agreement with the static mirrors in `/public`.
- **Never hardcode the site URL** — `lib/site-url.ts` / `SITE_URL` in `lib/facts.ts`.
- Images from Unsplash/Pixabay/Pexels are allowed in `next.config.ts`; adding another external
  image host requires updating `images.remotePatterns`.
- Migrations for the whole product live in `supabase/migrations/`. Do not start a second
  migrations directory.

## Related repositories

- `doppler-admin/` — admin dashboard, blog write-path, AI translation pipeline
- `doppler-infra/` — **private**: node config, n8n workflows, ops runbooks
- `doppler-apple/`, `doppler-android/`, `doppler-windows/` — the native clients
- `doppler-support-bot/` — `@DopplerSupportBot`, which links here for downloads and checkout
