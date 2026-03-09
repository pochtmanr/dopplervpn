# Doppler VPN Landing Site Overhaul — Design Document

**Date:** 2026-03-09
**Status:** Approved

## Goal

Rebuild the Doppler VPN landing site to support direct web subscription purchase, consolidate guides/downloads into unified pages, add a support page, and remove all references to free tiers or Telegram bot (except for Windows users).

## Site Structure (Final)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing — hero, features, pricing (Pro only), FAQ, blog | Rework |
| `/subscribe` | Email or existing account ID → plan select → Stripe | New |
| `/subscribe/success` | Account ID + download links + setup per platform + email sent | New |
| `/downloads` | Combined downloads + per-platform setup guides | Rework (absorbs `/guide/*`) |
| `/support` | FAQ, troubleshooting, contact, account deletion | New |
| `/blog`, `/blog/[slug]` | Unchanged | — |
| `/privacy`, `/terms` | Unchanged | — |

**Removed pages:** `/checkout`, `/checkout/success`, `/guide/android`, `/guide/ios`, `/guide/windows`, `/guide/mac`, `/guide/protocols`, `/guide/subscription`, `/delete-account`

## Key Decisions

1. **No free tier** — Doppler Pro required for all users
2. **Account creation on web** — user enters email, account auto-created, VPN-XXXX-XXXX-XXXX generated
3. **One-time payments** — no recurring billing, no auto-renew
4. **No Telegram bot references** except for Windows (v2rayN + VLESS config flow)
5. **Trial included with subscription** — 7-day trial starts with purchase (future iOS release)
6. **Email confirmation** after payment with account ID + download links

## `/subscribe` Page

### Two-step flow on a single page

**Step 1 — Identify:**
- Toggle: "I'm new" / "I have an account"
- New: email input field
- Existing: account ID input (VPN-XXXX-XXXX-XXXX format)
- [Continue] button

**Step 2 — Plan & Pay:**
- Three plan cards: Monthly ($4), 6 Months ($20, save 17%), Yearly ($35, save 27%)
- Yearly pre-selected as best value
- Optional promo code input
- [Subscribe Now] → creates Stripe checkout session → redirects to Stripe

### Backend: `/api/subscribe/create-account`

POST with `{ email }`:
1. Create account in Supabase `accounts` table — generates VPN-XXXX-XXXX-XXXX
2. Link email via `link_contact()` RPC or direct insert
3. Return `{ accountId, accountUuid }`

### Backend: `/api/checkout/stripe` (existing, enhanced)

- Accept either `accountId` (existing) or `email` (new — creates account first)
- Pass `customer_email` to Stripe session for email receipt
- Metadata: account_id, plan_id, days, source: "web_subscribe"

## `/subscribe/success` Page

After Stripe redirects back:
- Verify session via `/api/checkout/status`
- Display:
  - "You're all set!" heading
  - Account ID in prominent copy-able box
  - "Save this — it's your account key across all devices"
  - Platform download cards:
    - **iOS:** App Store link → "Open app, your Pro is already active"
    - **Android:** APK download → "Open app, your Pro is already active"
    - **macOS:** Mac App Store link → "Open app, your Pro is already active"
    - **Windows:** "Use @dopplercreatebot Telegram bot for setup"
  - "We've sent a confirmation email with these details"

### Webhook enhancement

After `checkout.session.completed`:
1. Activate subscription (existing logic)
2. Send confirmation email via SMTP (smtp.hostinger.com:465, support@simnetiq.store):
   - Subject: "Welcome to Doppler Pro"
   - Body: Account ID, download links, quick setup, support contact

## Homepage Changes

### Pricing Section

Remove Free plan card. Single Pro card with duration toggle:
- [Monthly] [6 Months] [Yearly] toggle
- Dynamic price display with savings badge
- Feature list: Premium servers, Smart Route, Always-On, 10 devices, No logs, Priority support
- CTA: "Get Doppler Pro" → `/subscribe`
- Footer text: "One-time payment. No auto-renew. 30-day money-back guarantee."

### Hero Section

- Primary CTA: "Get Doppler Pro" → `/subscribe` (all platforms)
- Secondary CTA: "See Pricing" → `#pricing`
- Remove platform-specific download buttons from hero

### CTA Section

- Remove Simnetiq cross-promotion
- Single Doppler VPN CTA → `/subscribe`

### How It Works Section

Update steps:
1. Choose a plan on our website
2. Download the app for your device
3. Open and connect — Pro is already active

## `/downloads` Page (Consolidated)

Four platform sections, each with download link + inline setup steps.

### iOS / Android / macOS (same pattern):

```
[Platform icon + title]
[Download button — App Store / APK / Mac App Store]

How to get started:
1. Download Doppler VPN
2. Open the app — your account is created automatically
3. Tap Connect — choose a plan and subscribe
4. You're protected!

Already subscribed? Your Pro status syncs across all devices.
```

### Windows (different — Telegram bot flow):

```
[Windows icon + title]
[Download v2rayN x64] [Download v2rayN ARM64]

How to get started:
1. Download and install v2rayN
2. Open @dopplercreatebot on Telegram
3. Tap "Connect VPN" → choose a server → receive VLESS config
4. In v2rayN: import config from clipboard
5. Connect!

Requires Doppler Pro subscription (purchase on website or via Telegram bot).
```

## `/support` Page

Sections:
1. **Frequently Asked Questions** — 8-10 top questions about plans, accounts, platforms
2. **Troubleshooting** — common issues per platform (connection fails, battery drain, etc.)
3. **Delete Your Account** — step-by-step instructions (moved from `/delete-account`)
4. **Contact Us** — @DopplerSupportBot on Telegram, support@simnetiq.store email

## Navigation Updates

### Navbar
- Downloads → `/downloads`
- Support → `/support`
- Pricing → `/#pricing`
- [Get Pro] button → `/subscribe`

### Footer
- **Product:** Pricing, Downloads, Blog
- **Support:** Help Center (/support), Privacy, Terms
- **Connect:** Telegram (@dopplercreatebot), GitHub

## Email System

SMTP config (already available):
- Host: smtp.hostinger.com
- Port: 465 (SSL)
- From: support@simnetiq.store
- Credentials: from env vars `SMTP_USER` / `SMTP_PASS`

Email template — plain HTML:
- Welcome to Doppler Pro
- Your account: VPN-XXXX-XXXX-XXXX
- Download links (iOS App Store, Android APK, macOS Mac App Store)
- Quick setup: "Open app → your Pro is active → tap Connect"
- Windows: "Use @dopplercreatebot on Telegram"
- Support: @DopplerSupportBot or support@simnetiq.store

## i18n Strategy

All new strings added to all 21 locale files. English first, then batch-translate using the parallel-translator agent.

## Constraints

- No hardcoded API keys, URLs, or credentials
- All Stripe keys from env vars
- Account IDs generated server-side only
- SMTP credentials from env vars
- Keep existing `/api/checkout/webhook` working
- Don't break blog, privacy, terms pages
- Always use `www.dopplervpn.org` for API calls
