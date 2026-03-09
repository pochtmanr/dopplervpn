# Support Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the support page into a full self-service hub with ticket system, account management dashboard, account restore, and admin ticket management.

**Architecture:** The support page becomes a client component with modals for tickets and account restore. Account state is stored in localStorage (account_id) and fetched from Supabase. New API routes handle tickets, restore, and account management. Admin gets a new Tickets tab following the existing Escalations pattern. Supabase gets a `support_tickets` table and `subscription_source` column on `accounts`.

**Tech Stack:** Next.js 15, Tailwind CSS v4, next-intl, Supabase (untyped admin client), Framer Motion, nodemailer (SMTP)

---

### Task 1: Supabase Migration — support_tickets table + subscription_source column

**Files:**
- Create: `src/app/api/admin/setup-tickets/route.ts` (one-time migration endpoint)

**Step 1: Create the migration API route**

This route runs the SQL to create the table and alter accounts. We use the untyped admin client to run raw SQL via `.rpc()` or direct insert.

```typescript
// src/app/api/admin/setup-tickets/route.ts
import { NextResponse } from "next/server";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = createUntypedAdminClient();

  // Create support_tickets table
  const { error: tableError } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS support_tickets (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket_number text UNIQUE NOT NULL,
        account_id text,
        topic text NOT NULL CHECK (topic IN ('connection_issues', 'subscription_billing', 'account', 'feature_request', 'other')),
        subject text NOT NULL,
        description text NOT NULL,
        contact_email text NOT NULL,
        admin_notes text,
        status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        created_at timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);
    `,
  });

  // Add subscription_source to accounts
  const { error: colError } = await supabase.rpc("exec_sql", {
    sql: `
      ALTER TABLE accounts
      ADD COLUMN IF NOT EXISTS subscription_source text
      CHECK (subscription_source IN ('stripe', 'app_store', 'play_store', 'manual'));
    `,
  });

  if (tableError || colError) {
    return NextResponse.json({ error: tableError?.message || colError?.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Note:** If `exec_sql` RPC doesn't exist, run this SQL directly in Supabase Dashboard SQL Editor instead:

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number text UNIQUE NOT NULL,
  account_id text,
  topic text NOT NULL CHECK (topic IN ('connection_issues', 'subscription_billing', 'account', 'feature_request', 'other')),
  subject text NOT NULL,
  description text NOT NULL,
  contact_email text NOT NULL,
  admin_notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);

ALTER TABLE accounts
ADD COLUMN IF NOT EXISTS subscription_source text
CHECK (subscription_source IN ('stripe', 'app_store', 'play_store', 'manual'));

-- Backfill existing accounts as app_store (per Roman: all existing subs are App Store)
UPDATE accounts SET subscription_source = 'app_store' WHERE subscription_tier IS NOT NULL AND subscription_tier != 'free' AND subscription_source IS NULL;
```

**Step 2: Run migration via Supabase MCP or Dashboard**

Use `mcp__supabase__execute_sql` or Supabase Dashboard to run the SQL above.

**Step 3: Verify table exists**

Run: `SELECT * FROM support_tickets LIMIT 1;` — should return empty result, no error.
Run: `SELECT subscription_source FROM accounts LIMIT 1;` — should return column.

**Step 4: Commit**

```bash
git add src/app/api/admin/setup-tickets/route.ts
git commit -m "feat: add support_tickets table migration and subscription_source column"
```

---

### Task 2: API Routes — Ticket Creation

**Files:**
- Create: `src/app/api/support/create-ticket/route.ts`

**Step 1: Create the ticket creation endpoint**

```typescript
// src/app/api/support/create-ticket/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TOPICS = ["connection_issues", "subscription_billing", "account", "feature_request", "other"] as const;

async function generateTicketNumber(supabase: ReturnType<typeof createUntypedAdminClient>): Promise<string> {
  const { count } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true });
  const num = (count || 0) + 1;
  return `TKT-${String(num).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, subject, description, contact_email, account_id } = body;

    // Validate required fields
    if (!topic || !VALID_TOPICS.includes(topic)) {
      return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
    }
    if (!subject || subject.trim().length < 3) {
      return NextResponse.json({ error: "Subject too short" }, { status: 400 });
    }
    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: "Description too short" }, { status: 400 });
    }
    if (!contact_email || !EMAIL_REGEX.test(contact_email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();
    const ticket_number = await generateTicketNumber(supabase);

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        ticket_number,
        account_id: account_id || null,
        topic,
        subject: subject.trim(),
        description: description.trim(),
        contact_email: contact_email.toLowerCase().trim(),
        status: "open",
      })
      .select("ticket_number")
      .single();

    if (error) {
      console.error("Ticket creation error:", error);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    return NextResponse.json({ ticket_number: data.ticket_number });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 2: Test endpoint**

```bash
curl -X POST http://localhost:3000/api/support/create-ticket \
  -H "Content-Type: application/json" \
  -d '{"topic":"connection_issues","subject":"VPN not connecting","description":"My VPN has not been connecting for 2 days on iPhone 15","contact_email":"test@example.com"}'
```

Expected: `{"ticket_number":"TKT-0001"}`

**Step 3: Commit**

```bash
git add src/app/api/support/create-ticket/route.ts
git commit -m "feat: add support ticket creation API route"
```

---

### Task 3: API Routes — Account Restore

**Files:**
- Create: `src/app/api/support/restore-account/route.ts`

**Step 1: Create restore endpoint**

```typescript
// src/app/api/support/restore-account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUntypedAdminClient } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createUntypedAdminClient();

    // Look up account by contact email
    const { data: account, error } = await supabase
      .from("accounts")
      .select("account_id, contact_method, contact_value")
      .eq("contact_value", normalizedEmail)
      .eq("contact_method", "email")
      .single();

    if (error || !account) {
      // Don't reveal whether account exists for security
      return NextResponse.json({ success: true, message: "If an account exists with this email, we've sent the Account ID." });
    }

    // Send email via SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Doppler VPN" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: "Your Doppler VPN Account ID",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #008C8C;">Doppler VPN Account Recovery</h2>
          <p>You requested your Account ID. Here it is:</p>
          <div style="background: #f0f0f0; padding: 16px; border-radius: 8px; text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 1px; margin: 24px 0;">
            ${account.account_id}
          </div>
          <p style="color: #666; font-size: 14px;">Use this ID to log in at <a href="https://www.dopplervpn.org/subscribe">dopplervpn.org/subscribe</a> or in the app.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "If an account exists with this email, we've sent the Account ID." });
  } catch (error) {
    console.error("Restore account error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 2: Verify SMTP env vars exist in .env.local**

Check that these exist: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. They should already be set (used for welcome emails).

**Step 3: Commit**

```bash
git add src/app/api/support/restore-account/route.ts
git commit -m "feat: add account restore API with email lookup and SMTP"
```

---

### Task 4: API Routes — Account Info & Contact Update

**Files:**
- Create: `src/app/api/support/account/route.ts`
- Create: `src/app/api/support/update-contact/route.ts`

**Step 1: Account info endpoint**

```typescript
// src/app/api/support/account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const accountId = req.nextUrl.searchParams.get("account_id");
    const email = req.nextUrl.searchParams.get("email");

    if (!accountId && !email) {
      return NextResponse.json({ error: "Provide account_id or email" }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    let query = supabase
      .from("accounts")
      .select("account_id, subscription_tier, subscription_expires_at, contact_method, contact_value, contact_verified, subscription_source, created_at");

    if (accountId) {
      query = query.eq("account_id", accountId.toUpperCase().trim());
    } else if (email) {
      query = query.eq("contact_value", email.toLowerCase().trim()).eq("contact_method", "email");
    }

    const { data: account, error } = await query.single();

    if (error || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Account fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 2: Contact update endpoint**

```typescript
// src/app/api/support/update-contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { account_id, contact_method, contact_value } = await req.json();

    if (!account_id) {
      return NextResponse.json({ error: "Account ID required" }, { status: 400 });
    }
    if (!contact_method || !["email", "telegram"].includes(contact_method)) {
      return NextResponse.json({ error: "Invalid contact method" }, { status: 400 });
    }
    if (!contact_value) {
      return NextResponse.json({ error: "Contact value required" }, { status: 400 });
    }
    if (contact_method === "email" && !EMAIL_REGEX.test(contact_value)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    const { error } = await supabase
      .from("accounts")
      .update({
        contact_method,
        contact_value: contact_method === "email" ? contact_value.toLowerCase().trim() : contact_value.trim(),
        contact_verified: false,
      })
      .eq("account_id", account_id.toUpperCase().trim());

    if (error) {
      console.error("Contact update error:", error);
      return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/support/account/route.ts src/app/api/support/update-contact/route.ts
git commit -m "feat: add account info and contact update API routes"
```

---

### Task 5: i18n — Add English Support Hub Keys

**Files:**
- Modify: `messages/en.json` — add new keys under `support`

**Step 1: Add new i18n keys to English**

Add these keys inside the existing `"support"` object in `messages/en.json`, after the existing `contact` section:

```json
"account": {
  "title": "Manage Your Account",
  "signInTitle": "Sign in to manage your account",
  "enterAccountId": "Enter Account ID",
  "enterEmail": "Enter Email",
  "accountIdPlaceholder": "VPN-XXXX-XXXX-XXXX",
  "emailPlaceholder": "your@email.com",
  "signIn": "Sign In",
  "noAccount": "Don't have an account?",
  "getStarted": "Get Started",
  "signOut": "Sign Out",
  "statusTitle": "Account Status",
  "memberSince": "Member since",
  "tier": "Plan",
  "tierFree": "Free",
  "tierMonthly": "Pro Monthly",
  "tierSixMonth": "Pro 6-Month",
  "tierYearly": "Pro Yearly",
  "expires": "Expires",
  "expiresIn": "in {days} days",
  "expired": "Expired",
  "active": "Active",
  "expiringSoon": "Expiring Soon",
  "contactTitle": "Contact Information",
  "contactMethod": "Contact Method",
  "contactValue": "Contact",
  "verified": "Verified",
  "unverified": "Unverified",
  "changeContact": "Change",
  "saveContact": "Save",
  "cancelEdit": "Cancel",
  "subscriptionTitle": "Manage Subscription",
  "manageStripe": "Manage via Stripe",
  "manageAppStore": "Manage in App Store",
  "managePlayStore": "Manage in Google Play",
  "invoicesTitle": "Invoices",
  "downloadInvoice": "Download PDF",
  "noInvoices": "No invoices available",
  "notFound": "Account not found",
  "fetchError": "Failed to load account"
},
"ticket": {
  "title": "Submit a Request",
  "subtitle": "We'll get back to you within 24 hours",
  "topicLabel": "Topic",
  "topics": {
    "connection_issues": "Connection Issues",
    "subscription_billing": "Subscription & Billing",
    "account": "Account",
    "feature_request": "Feature Request",
    "other": "Other"
  },
  "subjectLabel": "Subject",
  "subjectPlaceholder": "Brief description of your issue",
  "descriptionLabel": "Description",
  "descriptionPlaceholder": "Tell us what happened...",
  "emailLabel": "Contact Email",
  "emailPlaceholder": "your@email.com",
  "accountIdLabel": "Account ID (optional)",
  "submit": "Submit Request",
  "submitting": "Submitting...",
  "successTitle": "Request Submitted",
  "successMessage": "Ticket {ticketNumber} created. We'll respond to {email} within 24 hours.",
  "errorGeneric": "Failed to submit request. Please try again.",
  "close": "Close"
},
"restore": {
  "title": "Restore Your Account",
  "subtitle": "Enter the email or Telegram you linked to your account",
  "emailTab": "Email",
  "telegramTab": "Telegram",
  "emailPlaceholder": "your@email.com",
  "sendAccountId": "Send Account ID",
  "sending": "Sending...",
  "emailSuccess": "If an account exists with this email, we've sent the Account ID. Check your inbox.",
  "emailNotFound": "No account found. Need help?",
  "submitTicket": "Submit a ticket",
  "telegramMessage": "We'll look up your account through our Telegram bot",
  "openTelegramBot": "Open Telegram Bot",
  "appSubscribers": "Purchased via App Store or Google Play?",
  "appStoreLink": "Manage App Store Subscriptions",
  "playStoreLink": "Manage Google Play Subscriptions",
  "close": "Close"
},
"business": {
  "title": "Business Inquiries",
  "subtitle": "Partnerships, press, enterprise"
},
"actions": {
  "submitRequest": "Submit a Request",
  "submitRequestDesc": "Get help from our team",
  "restoreAccount": "Restore Account",
  "restoreAccountDesc": "Recover your Account ID",
  "businessContact": "Business Inquiries",
  "businessContactDesc": "Partnerships, press, enterprise"
}
```

**Step 2: Verify no JSON syntax errors**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/en.json'))" && echo "Valid JSON"`

**Step 3: Commit**

```bash
git add messages/en.json
git commit -m "feat: add English i18n keys for support hub"
```

---

### Task 6: Support Page — Client Components (Account Card + Action Buttons)

**Files:**
- Modify: `src/app/[locale]/support/page.tsx` — convert to use new client components
- Create: `src/app/[locale]/support/support-content.tsx` — main client component
- Create: `src/app/[locale]/support/account-card.tsx` — account management card
- Create: `src/app/[locale]/support/ticket-modal.tsx` — ticket submission modal
- Create: `src/app/[locale]/support/restore-modal.tsx` — account restore modal
- Create: `src/app/[locale]/support/action-buttons.tsx` — three action cards

**Implementation approach:** Follow the same pattern as `subscribe-content.tsx` — the page.tsx stays as a server component that passes translations, while the interactive parts are client components.

**Step 1: Create action-buttons.tsx**

Three cards in a row: Submit Request, Restore Account, Business Inquiries. Each card has an icon, title, subtitle. First two open modals, third is a mailto link. Use the existing Card component styling pattern from the site (rounded-2xl, border-overlay/10, hover effects with accent-teal).

**Step 2: Create ticket-modal.tsx**

Modal overlay with backdrop blur. Full-screen on mobile (slide up from bottom). Contains: topic pill selector (5 options), subject input, description textarea, email input (pre-filled from account), optional account ID. Submit calls POST `/api/support/create-ticket`. Success state shows ticket number with checkmark animation.

**Step 3: Create restore-modal.tsx**

Modal with two-tab toggle (Email | Telegram). Email tab: input + send button, calls POST `/api/support/restore-account`. Telegram tab: message + "Open Telegram Bot" button linking to `t.me/DopplerSupportBot?start=restore`. Bottom section: "Purchased via App Store or Google Play?" with redirect links.

**Step 4: Create account-card.tsx**

When not authenticated: compact sign-in form (Account ID or Email input). When authenticated (account in state): 4-section dashboard — Status Overview (tier badge, expiry countdown, status indicator), Contact Info (display + edit), Subscription Management (Stripe portal / App Store / Play Store based on subscription_source), Invoices (Stripe only, with PDF download links).

Account state: stored in localStorage as `doppler_account_id`, fetched from `/api/support/account` on mount.

**Step 5: Create support-content.tsx**

Client component that wraps everything. Manages state for: account data, modal visibility (ticket, restore). Passes account down to child components. Renders: Account Card → Action Buttons → Ticket Modal → Restore Modal.

**Step 6: Update page.tsx**

Keep as server component. Pass translation strings to SupportContent. Keep FAQ, Troubleshooting, Delete Account, Contact sections as-is. Insert Account Card and Action Buttons between the header and FAQ sections.

Layout order:
1. Header (existing)
2. Account Management Card (new)
3. Action Buttons Row (new)
4. FAQ (existing)
5. Troubleshooting (existing)
6. Delete Account (existing)
7. Contact Us (existing)

**Step 7: Verify**

Run: `npm run dev` → visit `localhost:3000/en/support`
- Account card shows sign-in prompt
- Three action buttons visible
- "Submit a Request" opens ticket modal
- "Restore Account" opens restore modal
- "Business Inquiries" opens mailto
- Sign in with an account ID → dashboard appears
- Submit a test ticket → success with TKT number

**Step 8: Commit**

```bash
git add src/app/[locale]/support/
git commit -m "feat: add support hub with account card, ticket modal, restore modal"
```

---

### Task 7: Admin Panel — Tickets Tab (List View)

**Files:**
- Create: `src/app/admin-dvpn/(dashboard)/tickets/page.tsx`
- Create: `src/app/api/admin/tickets/route.ts`
- Modify: `src/components/admin/admin-sidebar.tsx` — add Tickets nav item

**Step 1: Add Tickets to admin sidebar**

In `admin-sidebar.tsx`, add a new nav item after Escalations:
```typescript
{ name: "Tickets", href: "/admin-dvpn/tickets", icon: /* ticket icon SVG */ }
```

**Step 2: Create admin tickets API route**

```typescript
// src/app/api/admin/tickets/route.ts
// GET: list tickets with pagination, filter by status/topic, sort by created_at DESC
// PATCH: update ticket status or admin_notes
// Pattern: same as /api/admin/messages/route.ts
// Auth: requireAdmin() check
```

**Step 3: Create tickets list page**

Follow the Escalations page pattern (`messages/page.tsx`):
- Fetch from `/api/admin/tickets?page=1&limit=50&status=open&topic=all`
- Table columns: Ticket #, Topic, Subject, Account ID, Email, Status, Created
- Status badges: open (blue), in_progress (amber), resolved (green), closed (gray)
- Filter dropdowns: status (all/open/in_progress/resolved/closed) + topic (all/5 topics)
- Click row → navigate to detail page
- Status dropdown on each row for quick updates (PATCH)
- Responsive: card layout on mobile, table on desktop

**Step 4: Verify**

Run: `npm run dev` → visit `localhost:3000/admin-dvpn/tickets`
- Tickets tab visible in sidebar
- List shows test ticket from Task 2
- Filter by status works
- Status change via dropdown works

**Step 5: Commit**

```bash
git add src/app/admin-dvpn/(dashboard)/tickets/ src/app/api/admin/tickets/ src/components/admin/admin-sidebar.tsx
git commit -m "feat: add admin tickets tab with list view and status management"
```

---

### Task 8: Admin Panel — Ticket Detail View

**Files:**
- Create: `src/app/admin-dvpn/(dashboard)/tickets/[ticketId]/page.tsx`
- Modify: `src/app/api/admin/tickets/route.ts` — add single ticket fetch

**Step 1: Create detail API**

Add to the tickets API: `GET /api/admin/tickets/[ticketId]` returns full ticket data + linked account info if account_id exists.

Or create `src/app/api/admin/tickets/[ticketId]/route.ts` following the `messages/[telegramId]` pattern.

**Step 2: Create detail page**

Two-column layout (single on mobile), following Escalations detail pattern:
- **Left column:** Full ticket info — ticket number, topic badge, subject, description (full text), timestamps
- **Right column (lg:w-80):**
  - Status selector (4 status buttons in grid)
  - Contact info (email, account ID if linked — click to view account)
  - Admin Notes textarea (auto-saves on blur via PATCH)
  - "Reply via Email" button → `mailto:${contact_email}?subject=Re: ${subject} [${ticket_number}]`

**Step 3: Verify**

Click a ticket in the list → detail page loads with all info.
Change status → persists on refresh.
Add admin note → persists on refresh.
"Reply via Email" → opens email client with pre-filled subject.

**Step 4: Commit**

```bash
git add src/app/admin-dvpn/(dashboard)/tickets/
git commit -m "feat: add admin ticket detail view with notes and status management"
```

---

### Task 9: Subscribe Page — "Forgot Account ID?" Link

**Files:**
- Modify: `src/app/[locale]/subscribe/subscribe-content.tsx` — add restore link

**Step 1: Add link near account ID input**

In the "I have an account" section where users enter their VPN-XXXX-XXXX-XXXX, add a small link below the input:

```tsx
<button
  type="button"
  onClick={() => window.location.href = `/${locale}/support#restore`}
  className="text-xs text-accent-teal hover:text-accent-teal-light transition-colors"
>
  {t("dashboard.forgotAccountId")}
</button>
```

**Step 2: Add i18n key**

Add to `subscribe.dashboard` in `messages/en.json`:
```json
"forgotAccountId": "Forgot your Account ID?"
```

**Step 3: Handle #restore hash on support page**

In `support-content.tsx`, check `window.location.hash === '#restore'` on mount and auto-open the restore modal.

**Step 4: Verify**

Go to `/subscribe` → "I have an account" → see "Forgot your Account ID?" link → click → redirected to support page with restore modal open.

**Step 5: Commit**

```bash
git add src/app/[locale]/subscribe/subscribe-content.tsx messages/en.json
git commit -m "feat: add forgot account ID link on subscribe page"
```

---

### Task 10: Translate i18n Keys to All 20 Languages

**Files:**
- Modify: all 20 non-English JSON files in `messages/` (ar, de, es, fa, fr, he, hi, id, it, ja, ko, pl, pt, ru, th, tr, uk, vi, zh, zh-TW)

**Step 1: Use parallel-translator agent**

Translate all new support hub keys (support.account, support.ticket, support.restore, support.business, support.actions, subscribe.dashboard.forgotAccountId) from English to all 20 target languages.

**Step 2: Verify JSON validity**

Run for each file: `node -e "JSON.parse(require('fs').readFileSync('messages/{lang}.json'))"`

**Step 3: Commit**

```bash
git add messages/
git commit -m "feat: translate support hub keys to all 20 languages"
```

---

### Task 11: Build Verification & Polish

**Step 1: Run typecheck**

```bash
npm run typecheck
```

Fix any TypeScript errors.

**Step 2: Run lint**

```bash
npm run lint
```

Fix any linting issues.

**Step 3: Run production build**

```bash
npm run build
```

Verify no build errors.

**Step 4: Manual testing checklist**

- [ ] Support page loads with account card, action buttons, FAQ, troubleshooting, delete, contact
- [ ] Account card: sign in with Account ID works
- [ ] Account card: sign in with Email works
- [ ] Account card: shows status, contact, subscription management, invoices
- [ ] Account card: change contact info works
- [ ] Ticket modal: opens, topic selection works, all fields validate
- [ ] Ticket modal: submit creates ticket with TKT number
- [ ] Restore modal: email tab sends email
- [ ] Restore modal: Telegram tab links to bot
- [ ] Restore modal: app subscriber links work
- [ ] Business inquiries opens mailto
- [ ] Subscribe page "Forgot Account ID?" link works
- [ ] Admin tickets tab: shows in sidebar
- [ ] Admin tickets: list, filter, status change
- [ ] Admin tickets: detail view with notes
- [ ] Mobile responsive: all modals full-screen, cards stack
- [ ] Dark mode + light mode both look good

**Step 5: Final commit**

```bash
git add .
git commit -m "fix: polish support hub build errors and styling"
```
