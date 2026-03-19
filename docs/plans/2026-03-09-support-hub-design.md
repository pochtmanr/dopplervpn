# Support Hub Design

## Overview
Transform the existing support page into a full self-service hub with ticket system, account management, subscription management, account restore, and business contact.

## Support Page Layout (6 zones)
1. **Hero** — "How can we help?" (existing)
2. **FAQ + Troubleshooting** — existing accordion sections (unchanged)
3. **Account Management Card** — sign in → mini-dashboard
4. **Action Buttons Row** — Submit Request | Restore Account | Business Inquiries
5. **Contact Footer** — Telegram bot + email (existing)
6. **Delete Account** — existing (unchanged)

## Account Management Card

### Not authenticated
- "Manage Your Account" heading
- Two input options: Account ID or Email
- Submit → fetch from Supabase
- "Don't have an account?" → /subscribe

### Authenticated (4 sub-sections)

**Status Overview:**
- Account ID (VPN-XXXX-XXXX-XXXX)
- Subscription tier badge (Free/Pro Monthly/Pro 6M/Pro Yearly)
- Expiry date with countdown
- Status indicator (green=active, amber=<7 days, red=expired)

**Contact Info:**
- Current contact method + value
- "Change" button → inline edit
- "Add another" to link both email + Telegram
- Verified badge if contact_verified=true

**Subscription Management:**
- Stripe subscribers → Stripe Customer Portal
- App Store → apps.apple.com/account/subscriptions
- Google Play → play.google.com/store/account/subscriptions
- Detection via `subscription_source` column on accounts table

**Invoices (Stripe only):**
- List past payments: date, amount, plan
- "Download PDF" per invoice via Stripe Invoice API

## Ticket Modal
- Trigger: "Submit a Request" button
- Full-screen on mobile, slide-up modal on desktop

Fields:
1. Topic — 5 pill buttons: Connection Issues, Subscription & Billing, Account, Feature Request, Other
2. Subject — short text, placeholder varies by topic
3. Description — textarea (4-5 rows)
4. Contact email — pre-filled if authenticated, required
5. Account ID — pre-filled if authenticated, optional

After submit: success state with ticket number (TKT-XXXX) and "We'll respond within 24 hours"

## Restore Account Modal
- Trigger: "Restore Account" on support page + "Forgot Account ID?" on subscribe page

Two-tab toggle: Email | Telegram

**Email tab:**
- Email input → lookup accounts by contact_value
- If found → send account ID via SMTP (support@simnetiq.store)
- Success/not found messaging

**Telegram tab:**
- "Open Telegram Bot" → t.me/DopplerSupportBot?start=restore
- Bot handles lookup via telegram_id

**App subscribers:**
- Subtle link below tabs: "Purchased via App Store or Google Play?"
- Redirects to platform subscription management

## Business Contact
- Third card in action row
- "Business Inquiries" — Partnerships, press, enterprise
- mailto:support@simnetiq.store
- Briefcase icon

## Supabase Changes

### New table: support_tickets
```
id (uuid, PK)
ticket_number (text, unique, "TKT-0001" auto-increment)
account_id (text, nullable)
topic (text — connection_issues|subscription_billing|account|feature_request|other)
subject (text)
description (text)
contact_email (text)
admin_notes (text, nullable)
status (text, default 'open' — open|in_progress|resolved|closed)
created_at (timestamptz)
```

### Alter accounts table
- Add `subscription_source` column (text — stripe|app_store|play_store|manual)
- Update `claim_subscription()` RPC to accept source parameter

## API Routes
- `POST /api/support/create-ticket` — insert ticket, return ticket number
- `POST /api/support/restore-account` — lookup by email, send via SMTP
- `GET /api/support/account` — fetch account info for management card
- `POST /api/support/update-contact` — change contact method/value

## Admin Panel — Tickets Tab

### List view
- Table: Ticket #, Topic, Subject, Account ID, Email, Status, Created
- Color-coded status badges (open=blue, in_progress=amber, resolved=green, closed=gray)
- Filter by status + topic, sort newest first

### Detail view
- Full ticket info, linked account if exists
- Status dropdown
- Internal notes textarea (admin-only)
- "Reply via Email" button → mailto with context

## i18n
New keys under `support.ticket.*`, `support.restore.*`, `support.account.*`, `support.business.*` across all 21 languages.
