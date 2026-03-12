# Doppler VPN Landing + Admin Panel

## Overview
Next.js 15 app with Tailwind CSS v4, TypeScript, next-intl (21 languages). Includes:
- Public landing page (dopplervpn.org)
- Admin panel (/admin-dvpn)
- Blog system with AI content pipeline
- API routes for blog CRUD and VPN management

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + `@tailwindcss/postcss`
- **i18n:** next-intl v3 (21 languages)
- **Backend:** Supabase (ref: `fzlrhmjdjjzcgstaeblu`)
- **AI:** OpenAI (gpt-5-mini) for blog content generation
- **Animation:** Framer Motion
- **Deployment:** Vercel (domain: dopplervpn.org)

## Directory Structure
```
src/
  app/
    [locale]/     # i18n routes (21 languages)
    admin-dvpn/   # Admin panel (Dashboard, Messages, VPN Users, Posts)
    api/
      admin/      # Admin API routes
      blog/       # Blog CRUD (create, translate, status)
      vpn/        # VPN management routes
    auth/         # Auth routes
  components/     # Shared components
  fonts/          # Local fonts
  i18n/           # i18n configuration
  lib/            # Supabase client, utilities
```

## Key Patterns
- **API Routes:** All under `src/app/api/`. Blog routes require `BLOG_API_KEY` header.
- **i18n:** 21 language JSON files. Use next-intl `useTranslations()` hook.
- **Supabase:** Client initialized in `src/lib/`. Use SSR client for server components.
- **Admin:** Protected routes under `/admin-dvpn`. Uses Supabase for data.
- **Blog pipeline:** POST /api/blog/create (AI generates) -> POST /api/blog/translate (translates to all langs) -> n8n webhook posts to Telegram channels.

## Environment Variables (in .env.local)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `BLOG_API_KEY` — required for blog API authentication
- `MARZBAN_*` — VPN panel credentials

## Important Notes
- **Always use `www.dopplervpn.org`** for API calls — dopplervpn.org redirects strip auth headers
- Blog API key: stored in `.env.local` as `BLOG_API_KEY` (never commit this value)
- Admin panel has 4 tabs: Dashboard (Supabase stats), Messages (bot logs), VPN Users (Marzban), Posts (blog)
- OpenAI model used: `gpt-5-mini`
- Images: External URLs from Unsplash/Pixabay/Pexels are allowed in next.config

## Commands
```bash
npm run dev        # Dev server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```
