# Doppler Landing + Admin

## Overview
Next.js 15 web app serving as the public marketing site, admin panel, and blog pipeline for Doppler VPN. Deployed at `dopplervpn.org`. Includes 44-language landing, blog with AI content generation, admin dashboard, and API routes used by the Telegram bots.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + `@tailwindcss/postcss`
- **i18n:** next-intl v3 (44 languages, URL routing via `[locale]`)
- **Backend:** Supabase (ref: `fzlrhmjdjjzcgstaeblu`)
- **AI:** OpenAI `gpt-5-mini` for blog content generation
- **Deployment:** Vercel (dopplervpn.org) — GitHub: pochtmanr/dopplervpn

## Architecture

```
src/
  app/
    [locale]/             # All public pages (44 locale routes)
      page.tsx            # Landing page
      layout.tsx          # Root layout with i18n provider
      blog/               # Blog listing + post pages
      downloads/          # App download links
      support/            # Support / FAQ page
      account/, checkout/ # Account management + checkout success
      tools/              # Utility tools (IP check, leak test, …)
      # Legal: privacy/, terms/, refund/, dpa/, subprocessors/, security/,
      #        delete-account/
      # SEO landing pages (~20 dirs): bypass-censorship/, no-registration-vpn/,
      #   vless-vpn/, vless-vpn-android/, pay-with-crypto/, vpn-for-{ios,android,
      #   macos,windows}/, vpn-for-{china,iran,russia,turkey,uae,...}/, and more
    admin-dvpn/           # Admin panel (4 tabs)
      page.tsx            # Dashboard (Supabase stats)
      # Messages, VPN Users (Marzban), Posts (blog)
    api/
      admin/              # Admin API routes (auth-protected)
      blog/
        create/           # POST — AI generates article (OpenAI)
        translate/        # POST — translates to all 44 langs
        status/           # GET/POST — publish/unpublish
      vpn/                # VPN management routes
    auth/                 # Auth callback routes
    globals.css           # Global styles
    robots.ts             # robots.txt
    sitemap.ts            # Sitemap generation
  components/             # Shared UI components
  fonts/                  # Local font files
  i18n/                   # next-intl config + routing
  lib/                    # Supabase client, shared utilities
```

## Key Patterns
- **Blog pipeline:** `POST /api/blog/create` (OpenAI generates) → `POST /api/blog/translate` (44 langs) → n8n webhook → Telegram channels + live blog
- **Blog API auth:** All blog API routes require `BLOG_API_KEY` header — never expose this key
- **i18n:** 44 JSON translation files. Use `useTranslations()` hook in Client Components, `getTranslations()` in Server Components
- **Admin panel** at `/admin-dvpn` has 4 tabs: Dashboard, Messages, VPN Users, Posts — uses Supabase for data

## Backend Integration
- **Supabase tables:** `accounts` (R), `vpn_users` (R/W), `vpn_servers` (R/W), `blog_posts` (R/W), `blog_translations` (R/W)
- **External APIs:** OpenAI API (blog generation), Marzban API (`MARZBAN_*` env vars), n8n webhook (blog posting)
- **Auth model:** Supabase Auth for admin panel login; no auth for public pages

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL          # https://fzlrhmjdjjzcgstaeblu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY         # Service role key (server-only)
OPENAI_API_KEY                    # For blog generation
BLOG_API_KEY                      # Required header for /api/blog/* routes
ADMIN_EMAILS                      # Comma-separated list of allowed admin emails (e.g. pochtmanrca@gmail.com)
MARZBAN_HOST                      # Marzban panel URL
MARZBAN_USERNAME                  # Marzban admin username
MARZBAN_PASSWORD                  # Marzban admin password
```

## Commands
```bash
npm run dev        # Dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Deployment
Vercel auto-deploys on push to main branch. Domain: `dopplervpn.org` (Vercel DNS).

## Important Notes
- **Always use `www.dopplervpn.org`** in links and API calls — `dopplervpn.org` redirects strip auth headers
- `BLOG_API_KEY` must match the value in `admin-bot/.env` — both sides need the same key
- Images from Unsplash/Pixabay/Pexels are allowed in `next.config` — do not add other external image domains without updating `next.config`
- OpenAI model: `gpt-5-mini` — do not change without updating the prompt engineering

## Related Projects
- `admin-bot/` — Admin bot that triggers blog pipeline and calls these API routes
- `bot/` — Customer bot that links to this site for downloads + (planned) checkout
- `miniapp/` — Mini App that shares the same Supabase backend
