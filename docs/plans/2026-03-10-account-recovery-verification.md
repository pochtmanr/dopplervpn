# Account Recovery & Verification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix email account recovery on landing, add recovery commands to @DopplerVerifyBot, fix support bot email verification to use inline OTP via Supabase instead of non-existent external API, and update restore modal to point to @DopplerVerifyBot.

**Architecture:** Four independent workstreams across 3 projects (landing, verify-bot, bot). Landing gets SMTP env vars + better error logging. Verify-bot gets `/start restore`, `/lookup`, `/help` commands with SMTP email sending via nodemailer. Support bot replaces external `VERIFICATION_API_URL` with inline OTP stored in Supabase `verification_codes` table + SMTP sending. Restore modal Telegram link updated from @DopplerSupportBot to @DopplerVerifyBot.

**Tech Stack:** Next.js (landing), grammY v1.35, Supabase, nodemailer (SMTP), TypeScript

---

## Task 1: Fix Email Recovery on Landing

**Root Cause:** `.env.local` is missing `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. The code is correct but emails silently fail because the env check returns early with a fake success.

**Files:**
- Modify: `~/Developer/doppler/landing/.env.local` (add SMTP vars)
- Modify: `~/Developer/doppler/landing/src/app/api/support/restore-account/route.ts` (better logging)

### Step 1: Add SMTP environment variables to `.env.local`

Add to the end of `~/Developer/doppler/landing/.env.local`:

```
# SMTP (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=support@simnetiq.store
SMTP_PASS=<get from Hostinger panel or existing bot .env>
```

**Note:** The SMTP_PASS must be retrieved from the Hostinger email panel or from one of the bot `.env` files that already has it. Check `~/Developer/doppler/verify-bot/.env.local` or `~/Developer/doppler/bot/.env` for the password.

### Step 2: Add detailed error logging to restore-account route

In `~/Developer/doppler/landing/src/app/api/support/restore-account/route.ts`, add logging around the SMTP send:

```typescript
// After line 50 (transporter creation), before sendMail:
try {
  await transporter.sendMail({ ... });
  console.log(`[restore-account] Email sent successfully to ${normalizedEmail}`);
} catch (emailError) {
  console.error('[restore-account] SMTP send failed:', {
    host: smtpHost,
    port: smtpPort,
    user: smtpUser,
    error: emailError instanceof Error ? emailError.message : emailError,
  });
  // Still return success to not leak info
}
```

Wrap the existing `sendMail` call in a try/catch with structured logging. Log host, port, user (not password) on failure.

### Step 3: Add SMTP vars to Vercel environment

Run:
```bash
cd ~/Developer/doppler/landing
npx vercel env add SMTP_HOST production preview development  # value: smtp.hostinger.com
npx vercel env add SMTP_PORT production preview development  # value: 465
npx vercel env add SMTP_USER production preview development  # value: support@simnetiq.store
npx vercel env add SMTP_PASS production preview development  # value: <password>
```

Or add via Vercel dashboard → dopplerland → Settings → Environment Variables.

### Step 4: Test email recovery locally

```bash
cd ~/Developer/doppler/landing
npm run dev
```

Then test with curl:
```bash
curl -X POST http://localhost:3000/api/support/restore-account \
  -H 'Content-Type: application/json' \
  -d '{"email": "pochtmanrca@gmail.com"}'
```

Expected: `{"success":true,"message":"If an account exists with this email, we've sent the Account ID."}` AND an actual email arrives at pochtmanrca@gmail.com.

### Step 5: Commit

```bash
cd ~/Developer/doppler/landing
git add src/app/api/support/restore-account/route.ts
git commit -m "fix: add SMTP error logging to restore-account route"
```

---

## Task 2: Update @DopplerVerifyBot with Recovery Commands

**Files:**
- Modify: `~/Developer/doppler/verify-bot/api/webhook.ts` (add commands)
- Modify: `~/Developer/doppler/verify-bot/package.json` (add nodemailer)
- Modify: `~/Developer/doppler/verify-bot/.env.example` (add SMTP vars)
- Modify: `~/Developer/doppler/verify-bot/.env.local` (add SMTP vars)

### Step 1: Add nodemailer dependency

```bash
cd ~/Developer/doppler/verify-bot
npm install nodemailer
npm install -D @types/nodemailer
```

### Step 2: Update .env.example

```
TELEGRAM_BOT_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=support@simnetiq.store
SMTP_PASS=
```

### Step 3: Add SMTP vars to verify-bot .env.local

Same values as landing SMTP vars.

### Step 4: Rewrite webhook.ts with recovery commands

Replace the entire `~/Developer/doppler/verify-bot/api/webhook.ts` with:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Bot, webhookCallback } from 'grammy';
import nodemailer from 'nodemailer';
import { supabase } from '../src/supabase.js';

// --- Config ---
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is required');

// --- Helpers ---
function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

const ACCOUNT_ID_RE = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskAccountId(id: string): string {
  // VPN-B4C0-C2BE-5FD8 → VPN-****-****-5FD8
  const parts = id.split('-');
  return `${parts[0]}-****-****-${parts[3]}`;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

async function sendAccountIdEmail(to: string, accountId: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.error('[verify-bot] SMTP not configured');
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"Doppler VPN" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Your Doppler VPN Account ID',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #ffffff; border-radius: 12px;">
          <h2 style="margin: 0 0 16px; color: #ffffff;">Doppler VPN</h2>
          <p style="color: #a1a1aa; margin: 0 0 24px;">You requested your Account ID. Here it is:</p>
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Account ID</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace; letter-spacing: 2px;">${accountId}</p>
          </div>
          <p style="color: #a1a1aa; margin: 0 0 16px;">Use this ID to manage your subscription and access your VPN services.</p>
          <a href="https://www.dopplervpn.org/subscribe" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Go to Doppler VPN</a>
          <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
          <p style="color: #71717a; font-size: 12px; margin: 0;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (e) {
    console.error('[verify-bot] Email send failed:', e);
    return false;
  }
}

// In-memory state for recovery flow: telegramId → { state, expiresAt }
interface RecoveryState {
  state: 'awaiting_email';
  expiresAt: number;
}
const recoveryStates = new Map<number, RecoveryState>();

// --- Bot ---
const bot = new Bot(botToken);

// Private chats only
bot.use(async (ctx, next) => {
  if (ctx.chat?.type !== 'private') return;
  await next();
});

// /start command
bot.command('start', async (ctx) => {
  const payload = ctx.match?.trim();

  // No payload — show help
  if (!payload) {
    await ctx.reply(
      '🔐 *Doppler VPN Verification Bot*\n\n'
      + 'Available commands:\n\n'
      + '`/start VPN\\-XXXX\\-XXXX\\-XXXX` — Verify account\n'
      + '`/start restore` — Recover your Account ID\n'
      + '`/lookup` — Find account by email\n'
      + '`/help` — Show this help',
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }

  // /start restore or /start recover
  if (payload.toLowerCase() === 'restore' || payload.toLowerCase() === 'recover') {
    recoveryStates.set(ctx.from!.id, {
      state: 'awaiting_email',
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    await ctx.reply(
      '📧 *Account Recovery*\n\n'
      + 'Please send the email address linked to your Doppler VPN account\\.\n\n'
      + 'We\\'ll send your Account ID to that email\\.',
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }

  // /start VPN-XXXX-XXXX-XXXX — existing verification flow
  if (!ACCOUNT_ID_RE.test(payload)) {
    await ctx.reply(
      'Invalid format\\.\n\nUse the verification link from the app, or try `/start restore` to recover your account\\.',
      { parse_mode: 'MarkdownV2' },
    );
    return;
  }

  const accountId = payload.toUpperCase();

  const { data: account, error } = await supabase
    .from('accounts')
    .select('account_id, contact_verified, contact_method, contact_value')
    .eq('account_id', accountId)
    .single();

  if (error || !account) {
    await ctx.reply('Account not found\\. Check your ID and try again\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  if (account.contact_verified) {
    await ctx.reply(`Account \`${escapeMarkdownV2(accountId)}\` is already verified\\.`, { parse_mode: 'MarkdownV2' });
    return;
  }

  const telegramId = String(ctx.from!.id);
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ contact_verified: true, contact_method: 'telegram', contact_value: telegramId })
    .eq('account_id', accountId);

  if (updateError) {
    console.error('Verify failed:', updateError);
    await ctx.reply('Something went wrong\\. Please try again later\\.', { parse_mode: 'MarkdownV2' });
    return;
  }

  await ctx.reply(`✅ Account \`${escapeMarkdownV2(accountId)}\` verified successfully\\!`, { parse_mode: 'MarkdownV2' });
});

// /lookup command
bot.command('lookup', async (ctx) => {
  recoveryStates.set(ctx.from!.id, {
    state: 'awaiting_email',
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  await ctx.reply(
    '🔍 *Account Lookup*\n\n'
    + 'Send the email address linked to your account\\.\n'
    + 'We\\'ll show a masked Account ID and offer to send the full one to your email\\.',
    { parse_mode: 'MarkdownV2' },
  );
});

// /help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    '🔐 *Doppler VPN Verification Bot*\n\n'
    + '*Commands:*\n\n'
    + '`/start VPN\\-XXXX\\-XXXX\\-XXXX`\nVerify your account via Telegram\n\n'
    + '`/start restore`\nRecover your Account ID by email\n\n'
    + '`/lookup`\nFind your account by email \\(shows masked ID\\)\n\n'
    + '`/help`\nShow this help message\n\n'
    + '━━━━━━━━━━━━━━━\n'
    + '_Need more help? Contact @DopplerSupportBot_',
    { parse_mode: 'MarkdownV2' },
  );
});

// Text messages — handle recovery flow or show help
bot.on('message:text', async (ctx) => {
  const telegramId = ctx.from!.id;
  const text = ctx.message.text.trim();
  const recovery = recoveryStates.get(telegramId);

  // Check for expired state
  if (recovery && Date.now() > recovery.expiresAt) {
    recoveryStates.delete(telegramId);
  }

  // If user is in recovery flow and sent an email
  if (recovery && recovery.state === 'awaiting_email') {
    if (!EMAIL_RE.test(text)) {
      await ctx.reply('Please enter a valid email address\\.');
      return;
    }

    const email = text.toLowerCase();
    recoveryStates.delete(telegramId);

    // Look up account by email
    const { data: account } = await supabase
      .from('accounts')
      .select('account_id')
      .eq('contact_method', 'email')
      .eq('contact_value', email)
      .limit(1)
      .single();

    if (!account) {
      await ctx.reply(
        'No account found with that email\\.\n\n'
        + 'Make sure you entered the email you used when linking your account\\.\n'
        + 'Try `/start restore` to try again\\.',
        { parse_mode: 'MarkdownV2' },
      );
      return;
    }

    const masked = maskAccountId(account.account_id);
    await ctx.reply(
      `Found account: \`${escapeMarkdownV2(masked)}\`\n\nSending the full Account ID to \`${escapeMarkdownV2(email)}\`\\.\\.\\.`,
      { parse_mode: 'MarkdownV2' },
    );

    const sent = await sendAccountIdEmail(email, account.account_id);
    if (sent) {
      await ctx.reply(
        `✅ Account ID sent to \`${escapeMarkdownV2(email)}\`\\.\n\nCheck your inbox \\(and spam folder\\)\\.`,
        { parse_mode: 'MarkdownV2' },
      );
    } else {
      await ctx.reply(
        '❌ Failed to send email\\. Please try again later or contact @DopplerSupportBot\\.',
        { parse_mode: 'MarkdownV2' },
      );
    }
    return;
  }

  // Not in any flow — show help
  await ctx.reply(
    'Use a command to get started:\n\n'
    + '`/start restore` — Recover Account ID\n'
    + '`/lookup` — Find account by email\n'
    + '`/help` — Show all commands',
    { parse_mode: 'MarkdownV2' },
  );
});

// Error handler
bot.catch((err: unknown) => {
  console.error('Bot error:', err);
});

// --- Vercel handler ---
const callback = webhookCallback(bot, 'http');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await callback(req, res);
  } catch (e) {
    console.error('Webhook handler error:', e);
    res.status(200).json({ ok: true });
  }
}
```

### Step 5: Commit

```bash
cd ~/Developer/doppler/verify-bot
git add -A
git commit -m "feat: add account recovery commands (/start restore, /lookup, /help)"
```

### Step 6: Deploy

```bash
cd ~/Developer/doppler/verify-bot
npx vercel --prod
```

Make sure SMTP env vars are set in Vercel project settings for verify-bot.

---

## Task 3: Fix Support Bot Profile + Email Verification

**Files:**
- Modify: `~/Developer/doppler/bot/src/handlers/start.ts` (handle `?start=restore`)
- Modify: `~/Developer/doppler/bot/src/handlers/profile.ts` (remove VPN-DEMO fallback)
- Modify: `~/Developer/doppler/bot/src/handlers/email-verify.ts` (inline OTP via Supabase + SMTP)
- Modify: `~/Developer/doppler/bot/src/middleware/auth.ts` (remove VPN-DEMO fallback)
- Modify: `~/Developer/doppler/bot/src/config.ts` (add SMTP config, remove VERIFICATION_API_URL)
- Modify: `~/Developer/doppler/bot/src/bot.ts` (handle `?start=restore` payload)

### Step 1: Add nodemailer to support bot (if not already installed)

```bash
cd ~/Developer/doppler/bot
npm install nodemailer
npm install -D @types/nodemailer
```

### Step 2: Update config.ts — add SMTP, remove verificationApiUrl

In `~/Developer/doppler/bot/src/config.ts`, replace `verificationApiUrl` with SMTP config:

```typescript
// Remove this line:
verificationApiUrl: process.env.VERIFICATION_API_URL || '',

// Add these:
smtpHost: process.env.SMTP_HOST || '',
smtpPort: Number(process.env.SMTP_PORT || 465),
smtpUser: process.env.SMTP_USER || '',
smtpPass: process.env.SMTP_PASS || '',
```

### Step 3: Remove VPN-DEMO-0000-0000 from auth.ts

In `~/Developer/doppler/bot/src/middleware/auth.ts`, change the catch block (line 39-44):

```typescript
// Change from:
ctx.userSession = {
  telegramId: from.id,
  accountCode: 'VPN-DEMO-0000-0000',
  language: from.language_code || 'ru',
  isNew: false,
};

// Change to:
ctx.userSession = {
  telegramId: from.id,
  accountCode: '',
  language: from.language_code || 'ru',
  isNew: false,
};
```

### Step 4: Update profile.ts — handle empty account code

In `~/Developer/doppler/bot/src/handlers/profile.ts`, change line 8:

```typescript
// Change from:
const accountCode = ctx.userSession?.accountCode || 'VPN-DEMO-0000-0000';

// Change to:
const accountCode = ctx.userSession?.accountCode;
```

Then update the text array (line 33-39) to handle no account:

```typescript
const text = accountCode ? [
  t(lang, 'profile.title'),
  '',
  t(lang, 'profile.account', { account_code: accountCode }),
  t(lang, 'profile.plan', { plan: planText }),
  t(lang, 'profile.expires', { expires_at: expiresText }),
].join('\n') : [
  t(lang, 'profile.title'),
  '',
  t(lang, 'profile.no_account') || 'No account linked. Use /start to create one.',
].join('\n');
```

### Step 5: Update start.ts — handle `?start=restore` and remove VPN-DEMO

In `~/Developer/doppler/bot/src/handlers/start.ts`, modify `handleStart`:

```typescript
export async function handleStart(ctx: Context) {
  const lang = ctx.userSession?.language || 'ru';
  const accountCode = ctx.userSession?.accountCode;

  // Handle ?start=restore — redirect to verify bot
  const payload = (ctx as any).match?.trim?.();
  if (payload === 'restore') {
    await ctx.reply(
      '🔄 To recover your Account ID, please use our verification bot:\n\n'
      + '👉 @DopplerVerifyBot\n\n'
      + 'Send /start restore there to begin recovery.',
    );
    return;
  }

  let planText = t(lang, 'subscription.none');
  // ... rest stays the same but use accountCode || 'Not linked' instead of VPN-DEMO
```

Change line 19:
```typescript
// From:
const accountCode = ctx.userSession?.accountCode || 'VPN-DEMO-0000-0000';
// To:
const accountCode = ctx.userSession?.accountCode || t(lang, 'profile.not_linked') || 'Not linked';
```

### Step 6: Rewrite email-verify.ts — inline OTP via Supabase + SMTP

Replace the external API calls with direct Supabase `verification_codes` table operations and SMTP sending.

Key changes:
- Remove `config.verificationApiUrl` dependency
- Import `nodemailer` and `config` for SMTP
- `handleEmailInput`: Generate 6-digit code, store in `verification_codes` table, send via SMTP
- `handleOtpInput`: Verify code against `verification_codes` table directly

```typescript
// In handleEmailInput, replace the fetch call with:

// Generate 6-digit OTP
const code = String(Math.floor(100000 + Math.random() * 900000));
const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

// Check rate limit (max 3 codes in 10 minutes)
const { count } = await supabase
  .from('verification_codes')
  .select('id', { count: 'exact', head: true })
  .eq('account_id', accountId)
  .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

if (count && count >= 3) {
  await ctx.reply(t(lang, 'email.too_many_attempts'));
  emailFlowStates.delete(telegramId);
  return;
}

// Store code in Supabase
const { error: insertError } = await supabase
  .from('verification_codes')
  .insert({
    account_id: accountId,
    method: 'email',
    contact_value: email,
    code,
    expires_at: expiresAt,
  });

if (insertError) {
  console.error('[email-verify] Failed to store code:', insertError);
  await ctx.reply(t(lang, 'errors.generic'));
  emailFlowStates.delete(telegramId);
  return;
}

// Send code via SMTP
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: { user: config.smtpUser, pass: config.smtpPass },
});

await transporter.sendMail({
  from: `"Doppler VPN" <${config.smtpUser}>`,
  to: email,
  subject: 'Doppler VPN — Verification Code',
  html: `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #fff; border-radius: 12px;">
      <h2 style="margin: 0 0 16px;">Doppler VPN</h2>
      <p style="color: #a1a1aa; margin: 0 0 24px;">Your verification code:</p>
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
        <p style="color: #fff; font-size: 32px; font-weight: 700; margin: 0; font-family: monospace; letter-spacing: 8px;">${code}</p>
      </div>
      <p style="color: #a1a1aa; margin: 0;">This code expires in 10 minutes.</p>
      <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
      <p style="color: #71717a; font-size: 12px; margin: 0;">If you didn't request this, ignore this email.</p>
    </div>
  `,
});
```

```typescript
// In handleOtpInput, replace the fetch call with:

// Look up valid code
const { data: codeRecord, error: lookupError } = await supabase
  .from('verification_codes')
  .select('*')
  .eq('account_id', account.account_id)
  .eq('code', code)
  .is('verified_at', null)
  .gt('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (lookupError || !codeRecord) {
  // Check if expired
  const { data: expired } = await supabase
    .from('verification_codes')
    .select('id')
    .eq('account_id', account.account_id)
    .eq('code', code)
    .lte('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (expired) {
    await ctx.reply(t(lang, 'email.code_expired'));
    emailFlowStates.delete(telegramId);
  } else {
    // Increment attempts
    if (codeRecord) {
      await supabase
        .from('verification_codes')
        .update({ attempts: (codeRecord.attempts || 0) + 1 })
        .eq('id', codeRecord.id);
    }
    await ctx.reply(t(lang, 'email.verification_failed'));
  }
  return;
}

// Mark code as verified
await supabase
  .from('verification_codes')
  .update({ verified_at: new Date().toISOString() })
  .eq('id', codeRecord.id);

// Update account contact
await supabase
  .from('accounts')
  .update({
    contact_method: 'email',
    contact_value: flow.email,
    contact_verified: true,
    updated_at: new Date().toISOString(),
  })
  .eq('id', account.id);
```

### Step 7: Add SMTP env vars to bot's .env

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=support@simnetiq.store
SMTP_PASS=<same password>
```

Remove `VERIFICATION_API_URL` from .env.

### Step 8: Commit

```bash
cd ~/Developer/doppler/bot
git add src/config.ts src/middleware/auth.ts src/handlers/profile.ts src/handlers/start.ts src/handlers/email-verify.ts
git commit -m "fix: replace external verification API with inline OTP, remove VPN-DEMO placeholder"
```

---

## Task 4: Update Restore Modal Telegram Link

**Files:**
- Modify: `~/Developer/doppler/landing/src/app/[locale]/support/restore-modal.tsx` (line 199)

### Step 1: Change Telegram bot link

In `~/Developer/doppler/landing/src/app/[locale]/support/restore-modal.tsx`, change line 199:

```typescript
// From:
href="https://t.me/DopplerSupportBot?start=restore"

// To:
href="https://t.me/DopplerVerifyBot?start=restore"
```

### Step 2: Commit

```bash
cd ~/Developer/doppler/landing
git add src/app/[locale]/support/restore-modal.tsx
git commit -m "fix: point restore modal Telegram link to @DopplerVerifyBot"
```

---

## Dependency Graph

```
Task 1 (Landing SMTP)     — Independent, do first
Task 2 (Verify Bot)       — Independent, can parallel with Task 1
Task 3 (Support Bot)      — Independent, can parallel with Tasks 1-2
Task 4 (Restore Modal)    — Independent, trivial one-liner
```

All 4 tasks are independent and can be executed in parallel.

## Verification Checklist

- [ ] Email arrives at pochtmanrca@gmail.com from restore-account API
- [ ] @DopplerVerifyBot responds to `/start restore` and sends recovery email
- [ ] @DopplerVerifyBot responds to `/lookup` with masked ID + email
- [ ] @DopplerVerifyBot responds to `/help` with command list
- [ ] @DopplerVerifyBot still handles `/start VPN-XXXX-XXXX-XXXX` verification
- [ ] Support bot profile shows "Not linked" instead of VPN-DEMO-0000-0000
- [ ] Support bot email verification sends OTP via SMTP (not external API)
- [ ] Support bot handles `?start=restore` by redirecting to @DopplerVerifyBot
- [ ] Restore modal links to @DopplerVerifyBot (not @DopplerSupportBot)
