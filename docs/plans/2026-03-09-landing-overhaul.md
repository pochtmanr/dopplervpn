# Landing Site Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Doppler VPN landing site with a direct web subscription flow, consolidated downloads/guides page, support page, and Pro-only pricing — removing all free-tier messaging and Telegram bot references (except Windows).

**Architecture:** Reuse the existing checkout page logic (plan cards, promo codes, Stripe integration) but add a Step 1 for email/account-ID entry. Consolidate 6 guide pages into a single tabbed `/downloads` page. New `/support` page absorbs FAQ + delete-account + troubleshooting. Webhook sends confirmation email via SMTP after payment.

**Tech Stack:** Next.js 15, Tailwind CSS v4, next-intl (21 languages), Supabase, Stripe, nodemailer (for SMTP)

**Design doc:** `docs/plans/2026-03-09-landing-overhaul-design.md`

---

## Task 1: Create `/api/subscribe/create-account` API Route

**Files:**
- Create: `src/app/api/subscribe/create-account/route.ts`

**Step 1: Create the API route**

```typescript
// src/app/api/subscribe/create-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

function generateAccountId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 for clarity
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VPN-${seg()}-${seg()}-${seg()}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Check if email already linked to an account
    const { data: existing } = await supabase
      .from('account_contacts')
      .select('account_id, accounts!inner(account_id)')
      .eq('contact_type', 'email')
      .eq('contact_value', email.toLowerCase())
      .single();

    if (existing) {
      // Return existing account
      const accountId = (existing as any).accounts?.account_id;
      if (accountId) {
        return NextResponse.json({ accountId, existing: true });
      }
    }

    // Create new account
    let accountId: string;
    let attempts = 0;
    while (true) {
      accountId = generateAccountId();
      const { error: insertError } = await supabase
        .from('accounts')
        .insert({
          account_id: accountId,
          subscription_tier: 'free',
        });
      if (!insertError) break;
      attempts++;
      if (attempts > 5) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }
    }

    // Get the UUID of the created account
    const { data: newAccount } = await supabase
      .from('accounts')
      .select('id')
      .eq('account_id', accountId)
      .single();

    if (!newAccount) {
      return NextResponse.json({ error: 'Account creation failed' }, { status: 500 });
    }

    // Link email as contact
    await supabase.from('account_contacts').insert({
      account_id: newAccount.id,
      contact_type: 'email',
      contact_value: email.toLowerCase(),
      verified: false,
    });

    return NextResponse.json({ accountId, existing: false });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Step 2: Verify the account_contacts table exists**

Before implementing, check Supabase for the `account_contacts` table. If it doesn't exist, use a simpler approach: store email in account metadata or a new column. Read the Supabase schema:
```
Run: npx supabase db dump --schema public (or check admin panel)
```

If `account_contacts` doesn't exist, store email directly:
```typescript
// Alternative: store email in accounts table
await supabase.from('accounts').update({ email: email.toLowerCase() }).eq('id', newAccount.id);
```

**Step 3: Commit**
```
git add src/app/api/subscribe/create-account/route.ts
git commit -m "feat: add create-account API for web subscribe flow"
```

---

## Task 2: Update Stripe Checkout API to Support Email-Based Flow

**Files:**
- Modify: `src/app/api/checkout/stripe/route.ts`

**Step 1: Enhance the route to accept email OR accountId**

Update the POST handler to:
1. Accept `{ planId, accountId?, email?, promoId? }`
2. If `email` provided and no `accountId`: call create-account logic inline
3. Pass `customer_email` to Stripe session so user gets Stripe receipt
4. Update `success_url` and `cancel_url` to point to `/subscribe/success` and `/subscribe`

```typescript
// Key changes to existing route:

export async function POST(req: NextRequest) {
  try {
    const { planId, accountId: rawAccountId, email, promoId } = await req.json();

    // ... plan validation (existing) ...

    let accountId = rawAccountId;

    // If email provided, create or find account
    if (!accountId && email) {
      const createRes = await fetch(new URL('/api/subscribe/create-account', req.url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        return NextResponse.json({ error: createData.error }, { status: createRes.status });
      }
      accountId = createData.accountId;
    }

    // ... existing account validation + promo logic ...

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email || undefined,  // Pre-fill Stripe with email
      line_items: [/* existing */],
      metadata: {
        account_id: accountId,
        plan_id: planId,
        days: String(plan.days),
        source: 'web_subscribe',
        email: email || '',
        // ... existing metadata ...
      },
      success_url: `${baseUrl}/en/subscribe/success?session_id={CHECKOUT_SESSION_ID}&account_id=${accountId}`,
      cancel_url: `${baseUrl}/en/subscribe`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    // ... existing error handling ...
  }
}
```

**Step 2: Commit**
```
git add src/app/api/checkout/stripe/route.ts
git commit -m "feat: support email-based account creation in checkout API"
```

---

## Task 3: Create `/subscribe` Page

**Files:**
- Create: `src/app/[locale]/subscribe/page.tsx`

**Step 1: Build the two-step subscribe page**

This page combines Step 1 (identify) and Step 2 (plan selection + payment). Reuse all the plan card UI and promo code logic from the existing checkout page.

Key differences from old `/checkout`:
- No `account_id` query param required
- Step 1: toggle between "I'm new" (email) and "I have an account" (VPN-XXXX code)
- Step 2: plan selection + promo + subscribe button (same as current checkout)
- Send `email` instead of `accountId` to the API when creating new

Structure:
```
'use client';
// State: step (1 or 2), mode ('new' | 'existing'), email, accountId, selectedPlan, promo...

// Step 1 UI:
//   Two toggle buttons: "New to Doppler" / "I have an account"
//   New: email input + Continue
//   Existing: VPN-XXXX-XXXX-XXXX input + Continue (validates format)

// Step 2 UI:
//   Account badge showing email or account ID
//   Plan cards (reuse from checkout)
//   Promo code (reuse from checkout)
//   Subscribe button → POST /api/checkout/stripe with { email } or { accountId }
```

Copy plan cards, promo logic, formatting helpers, and icons from `src/app/[locale]/checkout/page.tsx`. The checkout page is ~425 lines — the subscribe page will be similar but with Step 1 prepended.

**Step 2: Add i18n keys to `messages/en.json`**

Add a `"subscribe"` section:
```json
{
  "subscribe": {
    "title": "Get Doppler Pro",
    "subtitle": "Fast, private, undetectable VPN. Choose your plan.",
    "newUser": "New to Doppler",
    "existingUser": "I have an account",
    "emailPlaceholder": "Enter your email",
    "emailRequired": "Please enter a valid email",
    "accountPlaceholder": "VPN-XXXX-XXXX-XXXX",
    "accountRequired": "Enter your account ID (VPN-XXXX-XXXX-XXXX)",
    "continue": "Continue",
    "back": "Back",
    "accountLabel": "Account",
    // ... reuse checkout.* keys for plan cards, promo, subscribe button, features
    "monthly": "Monthly",
    "sixMonth": "6 Months",
    "yearly": "Yearly",
    "perMonth": "/mo",
    "save": "Save",
    "bestValue": "Best Value",
    "subscribe": "Subscribe Now",
    "processing": "Processing...",
    "features": "What's Included",
    "feat1": "Premium servers in 12+ countries",
    "feat2": "Smart Route — fastest server auto-selected",
    "feat3": "Always-On VPN — stays connected",
    "feat4": "Up to 10 devices on one account",
    "feat5": "No logs, no personal data collected",
    "feat6": "Priority support",
    "promoPlaceholder": "Promo code",
    "promoApply": "Apply",
    "promoRemove": "Remove",
    "promoOff": "off",
    "promoInvalid": "Invalid promo code",
    "promoFailed": "Failed to validate code",
    "footerNote": "One-time payment via Stripe. No auto-renewal. 30-day money-back guarantee.",
    "terms": "Terms of Service",
    "privacy": "Privacy Policy",
    "error": "Something went wrong. Please try again.",
    "securedBy": "Secured by Stripe"
  }
}
```

**Step 3: Commit**
```
git add src/app/[locale]/subscribe/page.tsx messages/en.json
git commit -m "feat: add /subscribe page with email/account two-step flow"
```

---

## Task 4: Create `/subscribe/success` Page

**Files:**
- Create: `src/app/[locale]/subscribe/success/page.tsx`

**Step 1: Build the success page**

After Stripe payment, user is redirected here with `?session_id=...&account_id=VPN-XXXX`.

Shows:
1. Success checkmark + "You're all set!"
2. Account ID in a prominent copyable box
3. Platform download cards:
   - iOS: App Store link + "Open app, your Pro is already active"
   - Android: APK download link + same
   - macOS: Mac App Store link + same
   - Windows: "Use @dopplercreatebot on Telegram for Windows setup"
4. "We've sent a confirmation email with these details"
5. Navbar + Footer (unlike old success page which was bare)

Verifies payment via `/api/checkout/status?session_id=...` (existing API).

**Step 2: Add i18n keys**

```json
{
  "subscribeSuccess": {
    "title": "You're All Set!",
    "subtitle": "Your Doppler Pro subscription is now active.",
    "accountTitle": "Your Account ID",
    "accountNote": "Save this — it's your key across all devices.",
    "copied": "Copied!",
    "copy": "Copy",
    "downloadTitle": "Download Doppler VPN",
    "iosTitle": "iOS",
    "iosDesc": "Download from App Store. Open the app — your Pro is already active.",
    "androidTitle": "Android",
    "androidDesc": "Download the APK. Open the app — your Pro is already active.",
    "macTitle": "macOS",
    "macDesc": "Download from Mac App Store. Open the app — your Pro is already active.",
    "windowsTitle": "Windows",
    "windowsDesc": "Download v2rayN, then get your config from @dopplercreatebot on Telegram.",
    "emailSent": "We've sent a confirmation email with your account details and download links.",
    "appStore": "App Store",
    "downloadApk": "Download APK",
    "macAppStore": "Mac App Store",
    "downloadV2rayN": "Download v2rayN",
    "verifying": "Verifying payment...",
    "errorTitle": "Payment Issue",
    "errorDesc": "If you were charged, your subscription will activate shortly. Contact support if it doesn't."
  }
}
```

**Step 3: Commit**
```
git add src/app/[locale]/subscribe/success/page.tsx messages/en.json
git commit -m "feat: add /subscribe/success page with download links and account ID"
```

---

## Task 5: Add Email Confirmation via SMTP in Webhook

**Files:**
- Modify: `src/app/api/checkout/webhook/route.ts`
- Create: `src/lib/email.ts`

**Step 1: Install nodemailer**
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

**Step 2: Create email utility**

```typescript
// src/lib/email.ts
import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface WelcomeEmailParams {
  to: string;
  accountId: string;
  planName: string;
  expiresAt: string;
}

export async function sendWelcomeEmail({ to, accountId, planName, expiresAt }: WelcomeEmailParams) {
  const transporter = getTransporter();

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #1a1a2e; font-size: 24px;">Welcome to Doppler Pro!</h1>
      <p style="color: #555; font-size: 16px;">Your subscription is now active.</p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #555; font-size: 14px;">Your Account ID:</p>
        <p style="margin: 0; font-size: 20px; font-weight: bold; font-family: monospace; color: #1a1a2e;">${accountId}</p>
        <p style="margin: 8px 0 0; color: #888; font-size: 12px;">Save this — it works across all your devices.</p>
      </div>

      <p style="color: #555; font-size: 14px;"><strong>Plan:</strong> ${planName}</p>
      <p style="color: #555; font-size: 14px;"><strong>Active until:</strong> ${expiresAt}</p>

      <h2 style="color: #1a1a2e; font-size: 18px; margin-top: 32px;">Download Doppler VPN</h2>
      <ul style="color: #555; font-size: 14px; line-height: 2;">
        <li><a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773">iOS — App Store</a></li>
        <li><a href="https://www.dopplervpn.org/downloads/doppler-vpn-v1.2.0.apk">Android — Download APK</a></li>
        <li><a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773">macOS — Mac App Store</a></li>
      </ul>
      <p style="color: #555; font-size: 14px;">Open the app and your Pro subscription will be active automatically.</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="color: #999; font-size: 12px;">
        Need help? Contact us at <a href="https://t.me/DopplerSupportBot">@DopplerSupportBot</a> on Telegram
        or email support@simnetiq.store.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Doppler VPN" <support@simnetiq.store>',
    to,
    subject: 'Welcome to Doppler Pro',
    html,
  });
}
```

**Step 3: Add email sending to webhook**

In `src/app/api/checkout/webhook/route.ts`, after the subscription is activated:

```typescript
// After updating account subscription...
// Send welcome email if we have the customer's email
const customerEmail = session.metadata?.email || session.customer_details?.email;
if (customerEmail) {
  try {
    const { sendWelcomeEmail } = await import('@/lib/email');
    await sendWelcomeEmail({
      to: customerEmail,
      accountId,
      planName: `Doppler Pro — ${planId}`,
      expiresAt: newExpiry.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
  } catch (emailErr) {
    console.error('Welcome email failed:', emailErr);
    // Don't fail the webhook for email errors
  }
}
```

**Step 4: Add SMTP env vars to Vercel**
```bash
npx vercel env add SMTP_HOST production    # smtp.hostinger.com
npx vercel env add SMTP_PORT production    # 465
npx vercel env add SMTP_USER production    # support@simnetiq.store
npx vercel env add SMTP_PASS production    # [get from Roman]
```

**Step 5: Commit**
```
git add src/lib/email.ts src/app/api/checkout/webhook/route.ts package.json package-lock.json
git commit -m "feat: send welcome email with account ID after Stripe payment"
```

---

## Task 6: Rework Homepage Pricing Section (Pro-Only)

**Files:**
- Modify: `src/components/sections/pricing.tsx`
- Modify: `messages/en.json` (pricing section)

**Step 1: Rewrite pricing component**

Remove the Free plan card. Single card with duration toggle and "Get Doppler Pro" CTA → `/subscribe`.

Key changes:
- Remove the two-column grid (Free vs Plus)
- Single centered card with plan duration toggle (Monthly / 6 Months / Yearly)
- Dynamic price display with per-month calculation and savings badge
- Feature list: Premium servers, Smart Route, Always-On, 10 devices, No logs, Priority support
- CTA button: "Get Doppler Pro" → Link to `/subscribe`
- Footer: "One-time payment. No auto-renewal. 30-day money-back guarantee."

**Step 2: Update i18n keys**

Update the `pricing` section in `messages/en.json` — remove all `free.*` keys, update CTA text.

**Step 3: Commit**
```
git add src/components/sections/pricing.tsx messages/en.json
git commit -m "feat: rework pricing section to Pro-only with subscribe CTA"
```

---

## Task 7: Update Hero Section and CTAs

**Files:**
- Modify: `src/components/hero/hero-ctas.tsx`
- Modify: `src/components/sections/cta.tsx`
- Modify: `src/components/sections/how-it-works.tsx`
- Modify: `messages/en.json`

**Step 1: Update Hero CTAs**

Replace platform-specific download buttons with:
- Primary: "Get Doppler Pro" → `/subscribe`
- Secondary: "See Pricing" → `#pricing` (keep)

**Step 2: Update CTA section**

Remove Simnetiq cross-promo. Single Doppler CTA → `/subscribe`.

**Step 3: Update How It Works**

New steps:
1. Choose a plan on our website
2. Download the app for your device
3. Open and connect — Pro is already active

**Step 4: Commit**
```
git add src/components/hero/hero-ctas.tsx src/components/sections/cta.tsx src/components/sections/how-it-works.tsx messages/en.json
git commit -m "feat: update hero, CTA, how-it-works for Pro-only subscribe flow"
```

---

## Task 8: Rebuild `/downloads` Page (Consolidated)

**Files:**
- Modify: `src/app/[locale]/downloads/page.tsx`
- Modify: `messages/en.json` (apps section)

**Step 1: Rewrite downloads page**

Four platform sections, each with download button + inline setup steps:

**iOS / Android / macOS** (same pattern):
- Download button (App Store / APK / Mac App Store)
- Steps: Download → Open (account auto-created) → Tap Connect → Subscribe → Protected
- Note: "Already subscribed? Your Pro syncs across all devices."

**Windows** (different):
- v2rayN download buttons (x64 + ARM64)
- Steps: Download v2rayN → Open @dopplercreatebot on Telegram → Get VLESS config → Import → Connect
- Note: "Requires Doppler Pro subscription (via website or Telegram bot)"

Remove all VLESS/Streisand references from iOS/Android/macOS. Remove guide links (guides are now inline).

**Step 2: Update i18n**

Rewrite the `apps` section to match new content. Remove `vlessNote`, macOS VLESS entries, etc.

**Step 3: Commit**
```
git add src/app/[locale]/downloads/page.tsx messages/en.json
git commit -m "feat: consolidate downloads page with inline setup guides"
```

---

## Task 9: Create `/support` Page

**Files:**
- Create: `src/app/[locale]/support/page.tsx`
- Modify: `messages/en.json`

**Step 1: Build support page with 4 sections**

1. **FAQ** — 8-10 questions about purchasing, accounts, platforms, multi-device
2. **Troubleshooting** — per-platform common issues (connection fails, battery, permissions)
3. **Delete Account** — moved from `/delete-account` page content
4. **Contact** — @DopplerSupportBot on Telegram + support@simnetiq.store

Use accordion/expandable for FAQ items. Clean sections with anchor links.

**Step 2: Add i18n keys**

Add `"support"` section to `messages/en.json` with all FAQ/troubleshooting/delete content.

**Step 3: Commit**
```
git add src/app/[locale]/support/page.tsx messages/en.json
git commit -m "feat: add /support page with FAQ, troubleshooting, delete account, contact"
```

---

## Task 10: Update Navigation (Navbar + Footer)

**Files:**
- Modify: `src/components/layout/navbar.tsx` (or `desktop-nav.tsx` / `mobile-nav.tsx`)
- Modify: `src/components/layout/footer.tsx`
- Modify: `messages/en.json` (nav/footer sections)

**Step 1: Update navbar**

- Downloads → `/downloads`
- Support → `/support`
- Pricing → `/#pricing`
- Add "Get Pro" button → `/subscribe` (accent-teal, stands out)
- Remove the downloads dropdown (now a single link)

**Step 2: Update footer**

- **Product:** Pricing (#pricing), Downloads (/downloads), Blog (/blog)
- **Support:** Help Center (/support), Privacy (/privacy), Terms (/terms)
- **Connect:** Telegram (@dopplercreatebot), support@simnetiq.store

**Step 3: Commit**
```
git add src/components/layout/navbar.tsx src/components/layout/desktop-nav.tsx src/components/layout/mobile-nav.tsx src/components/layout/footer.tsx messages/en.json
git commit -m "feat: update navbar and footer for new site structure"
```

---

## Task 11: Add Redirects for Old URLs

**Files:**
- Modify: `next.config.ts`

**Step 1: Add redirects**

```typescript
// Add to existing redirects array:
{ source: '/checkout', destination: '/subscribe', permanent: true },
{ source: '/:locale/checkout', destination: '/:locale/subscribe', permanent: true },
{ source: '/:locale/checkout/success', destination: '/:locale/subscribe/success', permanent: true },
{ source: '/:locale/guide/:device', destination: '/:locale/downloads', permanent: true },
{ source: '/:locale/guide', destination: '/:locale/downloads', permanent: true },
{ source: '/:locale/delete-account', destination: '/:locale/support', permanent: true },
```

**Step 2: Commit**
```
git add next.config.ts
git commit -m "feat: add redirects from old URLs to new pages"
```

---

## Task 12: Remove Old Pages

**Files:**
- Delete: `src/app/[locale]/checkout/` (entire directory)
- Delete: `src/app/[locale]/guide/` (entire directory)
- Delete: `src/app/[locale]/delete-account/` (entire directory)

**Step 1: Remove old page files**
```bash
rm -rf src/app/[locale]/checkout
rm -rf src/app/[locale]/guide
rm -rf src/app/[locale]/delete-account
```

**Step 2: Verify build**
```bash
npm run build
```
Fix any broken imports or references.

**Step 3: Commit**
```
git add -A
git commit -m "chore: remove old checkout, guide, and delete-account pages"
```

---

## Task 13: Translate New Strings to All 21 Languages

**Step 1: Use parallel-translator agent**

Run the parallel-translator agent to translate all new `subscribe`, `subscribeSuccess`, `support`, and updated `pricing`/`apps`/`nav` strings from `messages/en.json` to all 20 other locale files.

**Step 2: Commit**
```
git add messages/
git commit -m "feat: translate new subscribe/support/downloads strings to 21 languages"
```

---

## Task 14: Build, Test, and Deploy

**Step 1: Full build**
```bash
npm run build
```

**Step 2: Local test**
```bash
npm run dev
```
Test:
- Visit `/subscribe` — enter email → continue → select plan → click Subscribe (verify Stripe opens)
- Visit `/subscribe` — enter existing VPN-XXXX → continue → select plan → verify
- Visit `/downloads` — verify all 4 platforms show correctly
- Visit `/support` — verify FAQ, troubleshooting, delete, contact sections
- Visit old URLs (`/checkout`, `/guide/android`, `/delete-account`) — verify redirects
- Check navbar and footer links
- Check pricing section on homepage — single Pro card, CTA goes to /subscribe

**Step 3: Deploy**
```bash
git push origin main
```
Vercel auto-deploys.

**Step 4: Add SMTP env vars to Vercel** (if not done in Task 5)

**Step 5: Verify production**
- Open https://www.dopplervpn.org/en/subscribe
- Complete a test purchase
- Verify email received with account ID + download links
- Verify old URLs redirect correctly
