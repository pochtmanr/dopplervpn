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
  app/
    [locale]/            44 locale routes — landing, blog, downloads, support,
                         account, checkout, tools, legal pages, ~20 SEO pages
    admin-dvpn/          Legacy admin surface (the live admin is doppler-admin)
    api/
      vpn/               VPN management routes
      checkout/  revolut/  oxapay/  promo/     payments
      account/  subscribe/  support/  doppler/  accounts + support
      agents/            MCP server + agent manifest surface
    auth/                Supabase auth callbacks
    robots.ts  sitemap.ts
  components/            Shared UI
  i18n/                  next-intl config, routing, blog-locale list
  lib/                   Supabase client, shared helpers
  fonts/
messages/                44 locale JSON files
infrastructure/          VPN node ops tooling — xray, relay, node-sync, monitoring
supabase/migrations/     Database migrations for the whole product
scripts/                 Build-time gates and utilities
```

## Getting started

```bash
npm install
cp .env.local.example .env.local     # fill in the values
npm run dev                          # http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build — **runs `prebuild` first** |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run check:facts` | Verifies the agent-facing fact surface is consistent |
| `npm run check:i18n` | Verifies client components only use namespaces they declare |
| `npm run indexnow` | Submits changed URLs to IndexNow |

`check:facts` and `check:i18n` run automatically as `prebuild`. **A build cannot succeed while
either fails** — that is deliberate, and `scripts/` is load-bearing.

## Environment

Copy `.env.local.example`. Required names only — values are never committed:

```
NEXT_PUBLIC_SUPABASE_URL          NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         BLOG_API_KEY
OPENAI_API_KEY                    ADMIN_EMAILS
MARZBAN_HOST                      MARZBAN_USERNAME / MARZBAN_PASSWORD
```

## Things worth knowing

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

`doppler-admin` (admin + blog writes) · `doppler-support-bot` (calls `/api/checkout/init`) ·
[`../SUBSCRIPTION-AND-ANTIFRAUD.md`](../SUBSCRIPTION-AND-ANTIFRAUD.md) · [`DESIGN.md`](DESIGN.md)
