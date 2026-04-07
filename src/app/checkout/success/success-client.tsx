'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const IOS_URL = 'https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773';
const ANDROID_PLAY_URL = 'https://play.google.com/store/apps/details?id=org.dopplervpn.android';
const ANDROID_APK_URL = '/downloads/doppler-vpn-v1.2.0.apk';
const SUPPORT_EMAIL = 'support@dopplervpn.org';

const PLAN_LABELS: Record<string, string> = {
  monthly: '1 Month',
  '6month': '6 Months',
  yearly: '1 Year',
};

type Status = 'pending' | 'paid' | 'failed' | 'unknown';

interface VerifyResponse {
  status: Status;
  tier?: string | null;
  expires_at?: string | null;
  amount?: number;
  currency?: string;
  reason?: string;
  revolut_state?: string;
}

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 90_000;

export function SuccessClient() {
  const params = useSearchParams();
  const orderId = params.get('order_id');
  const accountId = params.get('account_id');
  const plan = params.get('plan');

  const [data, setData] = useState<VerifyResponse | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const url = new URL('/api/revolut/verify-order', window.location.origin);
        url.searchParams.set('order_id', orderId);
        if (accountId) url.searchParams.set('account_id', accountId);

        const res = await fetch(url.toString(), { cache: 'no-store' });
        const body: VerifyResponse = await res.json();
        if (cancelled) return;

        setData(body);
        setElapsed(Date.now() - startedAt.current);

        if (body.status === 'paid' || body.status === 'failed') return;

        if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) {
          setTimedOut(true);
          return;
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        console.error('verify-order poll error', err);
        if (Date.now() - startedAt.current > POLL_TIMEOUT_MS) {
          setTimedOut(true);
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, accountId]);

  if (!orderId) {
    return (
      <ErrorShell
        title="Missing order reference"
        body="We can't find an order ID in this link. If you just paid, please contact support and include the email you used so we can confirm your purchase."
        orderId={null}
        accountId={accountId}
        reason="No order_id parameter in URL"
      />
    );
  }

  // Resolved success
  if (data?.status === 'paid') {
    return (
      <SuccessShell
        accountId={accountId}
        plan={plan}
        expiresAt={data.expires_at ?? null}
        amount={data.amount}
        currency={data.currency}
      />
    );
  }

  // Hard failure
  if (data?.status === 'failed') {
    return (
      <ErrorShell
        title="Payment didn't go through"
        body="Revolut reported the payment as failed. You have not been charged. Please return to checkout and try again, or contact support if the problem persists."
        orderId={orderId}
        accountId={accountId}
        reason={data.reason || data.revolut_state || 'Unknown failure'}
      />
    );
  }

  // Polled past timeout but still pending — show recoverable error UI
  if (timedOut) {
    return (
      <ErrorShell
        title="We're still confirming your payment"
        body="Revolut took the payment but our system hasn't received confirmation yet. This is almost always temporary — your account will be upgraded automatically within a few minutes. If it doesn't, send us your order ID below and we'll fix it immediately."
        orderId={orderId}
        accountId={accountId}
        reason={data?.reason || 'Webhook delivery delayed'}
        variant="warn"
      />
    );
  }

  // Still polling
  return <PendingShell orderId={orderId} elapsed={elapsed} />;
}

/* ─────────── shells ─────────── */

function PendingShell({ orderId, elapsed }: { orderId: string; elapsed: number }) {
  const seconds = Math.floor(elapsed / 1000);
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600/15 ring-1 ring-blue-500/30 mb-6">
          <Spinner />
        </div>
        <h1 className="text-2xl font-bold mb-2">Confirming your payment…</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Revolut has accepted the charge. We&apos;re activating your Doppler VPN Pro subscription now.
        </p>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 py-3 mb-4 text-left">
          <div className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Order ID</div>
          <div className="font-mono text-zinc-200 text-xs break-all">{orderId}</div>
        </div>
        <p className="text-zinc-600 text-xs">Elapsed: {seconds}s · do not close this window</p>
      </div>
    </div>
  );
}

function SuccessShell({
  accountId,
  plan,
  expiresAt,
  amount,
  currency,
}: {
  accountId: string | null;
  plan: string | null;
  expiresAt: string | null;
  amount?: number;
  currency?: string;
}) {
  const planLabel = plan ? PLAN_LABELS[plan] || plan : null;
  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
  const priceFormatted =
    typeof amount === 'number' && currency
      ? `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`
      : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-600/20 ring-1 ring-green-400/40 mb-6">
            <CheckBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            You&apos;re a Doppler Pro
          </h1>
          <p className="text-zinc-400 text-base max-w-md mx-auto">
            Payment confirmed. Your subscription is active across every device signed into this account.
          </p>
        </div>

        {/* Receipt card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6 mb-8">
          <div className="text-zinc-500 text-xs uppercase tracking-wide mb-4">Subscription</div>
          <dl className="space-y-3 text-sm">
            {planLabel && (
              <Row label="Plan" value={`Doppler VPN Pro — ${planLabel}`} />
            )}
            {priceFormatted && <Row label="Charged" value={priceFormatted} />}
            {accountId && <Row label="Account ID" value={accountId} mono />}
            {expiresFormatted && <Row label="Renews" value={expiresFormatted} />}
          </dl>
        </div>

        {/* Next steps */}
        <h2 className="text-lg font-semibold mb-4">Get set up in 60 seconds</h2>
        <ol className="space-y-3 mb-8">
          <Step n={1} title="Open the Doppler VPN app" body="Use the same account ID shown above. Pro unlocks instantly." />
          <Step n={2} title="Pick any server location" body="All locations and the VLESS-Reality protocol are now unlocked." />
          <Step n={3} title="Connect" body="One tap. Unlimited bandwidth, all your devices." />
        </ol>

        {/* Download buttons */}
        <h2 className="text-lg font-semibold mb-4">Download for your device</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <DownloadButton
            href={IOS_URL}
            label="iOS / iPadOS"
            sub="App Store"
            icon={<AppleIcon />}
          />
          <DownloadButton
            href={ANDROID_PLAY_URL}
            label="Android"
            sub="Google Play"
            icon={<PlayIcon />}
          />
          <DownloadButton
            href={ANDROID_APK_URL}
            label="Android APK"
            sub="Direct download"
            icon={<DownloadIcon />}
          />
          <DownloadButton
            href="https://t.me/dopplercreatebot"
            label="Telegram bot"
            sub="Manage subscription"
            icon={<ChatIcon />}
          />
        </div>

        {/* Footer support */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 text-sm text-zinc-400 flex items-start gap-3">
          <InfoIcon />
          <div>
            Need help? Email{' '}
            <a className="text-blue-400 hover:text-blue-300 underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>{' '}
            with your account ID and we&apos;ll get back within a few hours.
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorShell({
  title,
  body,
  orderId,
  accountId,
  reason,
  variant = 'error',
}: {
  title: string;
  body: string;
  orderId: string | null;
  accountId: string | null;
  reason: string;
  variant?: 'error' | 'warn';
}) {
  const isWarn = variant === 'warn';
  const ringColor = isWarn ? 'ring-amber-500/40' : 'ring-red-500/40';
  const bgColor = isWarn ? 'bg-amber-500/10' : 'bg-red-500/10';
  const iconColor = isWarn ? 'text-amber-400' : 'text-red-400';
  const supportSubject = encodeURIComponent(
    `Doppler VPN — checkout issue (order ${orderId || 'unknown'})`,
  );
  const supportBody = encodeURIComponent(
    `Hi Doppler team,\n\nMy payment didn't activate Pro.\n\nOrder ID: ${orderId || 'n/a'}\nAccount ID: ${accountId || 'n/a'}\nReason shown: ${reason}\n\nThanks!`,
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${bgColor} ring-1 ${ringColor} ${iconColor} mb-6`}>
            <AlertIcon />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h1>
          <p className="text-zinc-400 text-base">{body}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 mb-6">
          <div className="text-zinc-500 text-xs uppercase tracking-wide mb-3">Diagnostic info</div>
          <dl className="space-y-2 text-sm">
            {orderId && <Row label="Order ID" value={orderId} mono />}
            {accountId && <Row label="Account ID" value={accountId} mono />}
            <Row label="Status" value={reason} />
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${supportSubject}&body=${supportBody}`}
            className="flex-1 text-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-semibold text-white transition-colors"
          >
            Contact support
          </a>
          <a
            href="/checkout"
            className="flex-1 text-center px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 font-semibold text-white transition-colors"
          >
            Back to checkout
          </a>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Save this page or take a screenshot — the order ID is the fastest way for us to locate your transaction.
        </p>
      </div>
    </div>
  );
}

/* ─────────── primitives ─────────── */

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-zinc-500 shrink-0">{label}</dt>
      <dd className={`text-zinc-100 text-right ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-300 text-sm font-semibold shrink-0">
        {n}
      </div>
      <div>
        <div className="font-medium text-white">{title}</div>
        <div className="text-zinc-400 text-sm mt-0.5">{body}</div>
      </div>
    </li>
  );
}

function DownloadButton({
  href,
  label,
  sub,
  icon,
}: {
  href: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/70 hover:border-zinc-700 px-4 py-3.5 transition-all"
    >
      <div className="text-zinc-300 group-hover:text-white transition-colors">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm">{label}</div>
        <div className="text-zinc-500 text-xs">{sub}</div>
      </div>
      <ArrowIcon />
    </a>
  );
}

/* ─────────── icons ─────────── */

function Spinner() {
  return (
    <svg className="w-8 h-8 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CheckBadge() {
  return (
    <svg className="w-10 h-10 text-green-300" viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 12.04c-.03-3.16 2.58-4.68 2.7-4.75-1.47-2.15-3.77-2.45-4.58-2.48-1.95-.2-3.81 1.15-4.8 1.15-1 0-2.52-1.12-4.15-1.09-2.13.03-4.1 1.24-5.2 3.15-2.22 3.85-.57 9.55 1.6 12.68 1.06 1.53 2.32 3.25 3.97 3.19 1.6-.06 2.21-1.03 4.14-1.03 1.93 0 2.48 1.03 4.17 1 1.72-.03 2.81-1.55 3.86-3.09 1.22-1.77 1.72-3.49 1.75-3.58-.04-.02-3.36-1.29-3.39-5.13zM13.94 3.69c.88-1.07 1.47-2.55 1.31-4.04-1.27.05-2.81.85-3.72 1.91-.81.94-1.52 2.45-1.33 3.9 1.42.11 2.86-.72 3.74-1.77z"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12 3.84 21.85c-.5-.25-.84-.76-.84-1.35zM14.81 13.12L17.4 15.7l-12.15 7.02 9.56-9.6zm3.84-2.39l-2.85 1.65-2.78-2.78 2.78-2.78 2.85 1.65c.93.54.93 1.72 0 2.26zM5.25 1.28l12.15 7.02-2.59 2.59L5.25 1.28z"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}
