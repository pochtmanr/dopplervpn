# Doppler VPN — Web

The public site at **[dopplervpn.org](https://www.dopplervpn.org)**: marketing pages, the blog,
app downloads, web checkout, account tools and the support form. Served in **44 languages**.

Next.js 15 (App Router) on Vercel.

## Stack

| | |
|---|---|
| Framework | Next.js 15, App Router, React Server Components |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| i18n | `next-intl` v3 — 44 locales, routed as `/[locale]/…` |
| Data | Supabase (REST + RPC) |
| Payments | Revolut and OxaPay, via `/api/checkout/init` |
| Hosting | Vercel |

## Layout

```
src/
  middleware.ts          www redirect, locale routing, click-id cookie, blog 410s
  app/
    [locale]/            44 locale routes — landing, blog, downloads, support,
                         account, checkout, tools, legal pages, ~20 SEO pages
    agents/              Human-readable agent surface (not localized)
    checkout/            Non-localized checkout entry
    cn-check/            China reachability probe
    q/[slug]/            QR short links
    api/
      vpn/               Native-client routes (the only ones with real auth)
      checkout/  revolut/  oxapay/  promo/      payments
      account/  subscribe/  support/  doppler/  accounts + support
      agents/            MCP server + agent manifest surface
      android/  windows/  release metadata and download proxying
    robots.ts  sitemap.ts  sitemap-index/  globals.css
  components/            Shared UI — see components/landing for the page shells
  config/platforms/      Per-platform config for the four platform landings
  i18n/                  next-intl config, routing, blog-locale list
  lib/                   Supabase clients, payment/email services, helpers
  hooks/
messages/                44 locale JSON files
supabase/migrations/     Database migrations for the whole product
scripts/                 Build-time gates and utilities
```

## Getting started

Node 20 or newer.

```bash
npm install
cp .env.local.example .env.local     # then fill it in — see Environment below
npm run dev                          # http://localhost:3000
```

The app will not boot without the Supabase values. Everything else degrades gracefully:
payments, email and analytics simply no-op when their keys are absent.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build — **runs `prebuild` first** |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run check:facts` | Verifies the agent-facing fact surface is consistent |
| `npm run check:i18n` | Verifies client components only use namespaces they declare |
| `npm run indexnow` | Submits changed URLs to IndexNow |

`check:facts` and `check:i18n` run automatically as `prebuild`. **A build cannot succeed while
either fails** — that is deliberate, and `scripts/` is load-bearing.

## Environment

`.env.local.example` documents **every** variable the code reads, grouped by subsystem and
annotated with what breaks when it is missing. Copy it and fill it from the password manager or
the Vercel project; values are never committed.

The required set is Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`) plus `NEXT_PUBLIC_SITE_URL` in production. If you add a
`process.env.X`, add `X` to `.env.local.example` in the same commit.

## Things worth knowing

- **This repository is public.** No credentials, node IPs, VPS hostnames, personal addresses,
  traffic or revenue figures, or internal QA lists. Server-side ops live in the private
  `doppler-infra` repo. A Supabase `service_role` key once reached this history inside a stray
  scratch file — `.gitignore` is deliberately broad, and it is not a substitute for looking.
- **Always link to `www.dopplervpn.org`.** The apex domain redirects, and the redirect strips
  auth headers — API calls to the apex will fail in ways that look like auth bugs.
- **The blog has 21 locales, the site has 44.** Translation targets the 20 non-English blog
  locales (`src/i18n/blog-locales.ts`). Non-blog locales 308-redirect `/{locale}/blog/*` to
  `/en/blog/*`. These three numbers are different and have been confused before.
- **Blog *write* APIs are not here.** They were extracted to `doppler-admin` in April 2026. This
  repo renders the blog and owns the migrations; `doppler-admin` writes it.
- **Migrations for the whole product live in `supabase/migrations/`.** Do not start a second
  migrations directory in another repo.
- **Never run `supabase/demo-data.sql`** — it opens with `DELETE FROM` on every blog table.
- External image domains are allowlisted in `next.config.ts`. Adding a source means editing it.

## Related

`doppler-admin` (admin + blog writes) · `doppler-infra` (**private** — node config, n8n, ops) ·
`doppler-support-bot` (calls `/api/checkout/init`) ·
[`../SUBSCRIPTION-AND-ANTIFRAUD.md`](../SUBSCRIPTION-AND-ANTIFRAUD.md) · [`DESIGN.md`](DESIGN.md)
