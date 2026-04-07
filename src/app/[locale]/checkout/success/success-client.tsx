'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

const IOS_URL = 'https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773';
const ANDROID_PLAY_URL = 'https://play.google.com/store/apps/details?id=org.dopplervpn.android';
const MAC_URL = 'https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773';
const WINDOWS_URL = '/api/windows/download/DopplerVPN-1.0.0-x64-Setup.exe';
const SUPPORT_EMAIL = 'support@dopplervpn.org';

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
  const t = useTranslations('success');

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
        title={t('errors.missingTitle')}
        body={t('errors.missingBody')}
        orderId={null}
        accountId={accountId}
        reason={t('errors.missingReason')}
      />
    );
  }

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

  if (data?.status === 'failed') {
    return (
      <ErrorShell
        title={t('errors.failedTitle')}
        body={t('errors.failedBody')}
        orderId={orderId}
        accountId={accountId}
        reason={data.reason || data.revolut_state || t('errors.failedReasonUnknown')}
      />
    );
  }

  if (timedOut) {
    return (
      <ErrorShell
        title={t('errors.timeoutTitle')}
        body={t('errors.timeoutBody')}
        orderId={orderId}
        accountId={accountId}
        reason={data?.reason || t('errors.timeoutReason')}
        variant="warn"
      />
    );
  }

  return <PendingShell orderId={orderId} elapsed={elapsed} />;
}

/* ─────────── shells ─────────── */

function PendingShell({ orderId, elapsed }: { orderId: string; elapsed: number }) {
  const t = useTranslations('success');
  const seconds = Math.floor(elapsed / 1000);
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-teal/15 ring-1 ring-accent-teal/30 mb-6">
          <Spinner />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t('pending.title')}</h1>
        <p className="text-text-muted text-sm mb-6">{t('pending.body')}</p>
        <div className="bg-bg-secondary/60 border border-overlay/10 rounded-xl px-4 py-3 mb-4 text-start">
          <div className="text-text-muted/70 text-xs uppercase tracking-wide mb-1">{t('pending.orderId')}</div>
          <div className="font-mono text-text-primary text-xs break-all">{orderId}</div>
        </div>
        <p className="text-text-muted/60 text-xs">{t('pending.elapsed', { seconds })}</p>
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
  const t = useTranslations('success');
  const locale = useLocale();
  const planLabel = plan ? t(`planLabels.${plan}` as 'planLabels.monthly') : null;
  const expiresFormatted = expiresAt
    ? new Date(expiresAt).toLocaleDateString(locale, {
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
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/30 to-emerald-600/20 ring-1 ring-emerald-400/40 mb-6">
            <CheckBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {t('success.title')}
          </h1>
          <p className="text-text-muted text-base max-w-md mx-auto">{t('success.body')}</p>
        </div>

        {/* Receipt card */}
        <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/60 backdrop-blur-sm p-6 mb-8">
          <div className="text-text-muted/70 text-xs uppercase tracking-wide mb-4">
            {t('success.subscription')}
          </div>
          <dl className="space-y-3 text-sm">
            {planLabel && (
              <Row label={t('success.plan')} value={t('success.planName', { label: planLabel })} />
            )}
            {priceFormatted && <Row label={t('success.charged')} value={priceFormatted} />}
            {accountId && (
              <AccountIdRow label={t('success.accountId')} value={accountId} />
            )}
            {expiresFormatted && <Row label={t('success.renews')} value={expiresFormatted} />}
          </dl>
        </div>

        {/* Download buttons */}
        <h2 className="text-lg font-semibold mb-4">{t('success.downloadHeading')}</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-8">
          <DownloadButton
            href={IOS_URL}
            label={t('success.iosLabel')}
            sub={t('success.iosSub')}
            icon={<AppleIcon />}
            external
          />
          <DownloadButton
            href={ANDROID_PLAY_URL}
            label={t('success.androidLabel')}
            sub={t('success.androidSub')}
            icon={<PlayIcon />}
            external
          />
          <DownloadButton
            href={WINDOWS_URL}
            label={t('success.windowsLabel')}
            sub={t('success.windowsSub')}
            icon={<WindowsIcon />}
            download
          />
          <DownloadButton
            href={MAC_URL}
            label={t('success.macLabel')}
            sub={t('success.macSub')}
            icon={<AppleIcon />}
            external
          />
        </div>

        {/* Footer support */}
        <div className="rounded-xl border border-overlay/10 bg-bg-secondary/40 px-5 py-4 text-sm text-text-muted flex items-start gap-3 mb-6">
          <InfoIcon />
          <div>
            {t.rich('success.supportLine', {
              email: (chunks) => (
                <a className="text-accent-teal hover:text-accent-gold underline" href={`mailto:${SUPPORT_EMAIL}`}>
                  {chunks}
                </a>
              ),
            })}
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Link
            href={`/${locale}`}
            className="inline-block px-5 py-3 rounded-xl border border-overlay/10 bg-bg-secondary/60 hover:bg-bg-secondary text-text-primary font-semibold text-sm transition-colors"
          >
            {t('back_home')}
          </Link>
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
  const t = useTranslations('success');
  const locale = useLocale();
  const isWarn = variant === 'warn';
  const ringColor = isWarn ? 'ring-amber-500/40' : 'ring-red-500/40';
  const bgColor = isWarn ? 'bg-amber-500/10' : 'bg-red-500/10';
  const iconColor = isWarn ? 'text-amber-500' : 'text-red-500';
  const supportSubject = encodeURIComponent(
    t('errors.supportSubject', { orderId: orderId || 'unknown' }),
  );
  const supportBody = encodeURIComponent(
    t('errors.supportBody', {
      orderId: orderId || 'n/a',
      accountId: accountId || 'n/a',
      reason,
    }),
  );

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-xl px-4 py-12 sm:py-20">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${bgColor} ring-1 ${ringColor} ${iconColor} mb-6`}>
            <AlertIcon />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{title}</h1>
          <p className="text-text-muted text-base">{body}</p>
        </div>

        <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/60 p-5 mb-6">
          <div className="text-text-muted/70 text-xs uppercase tracking-wide mb-3">
            {t('errors.diagnosticHeading')}
          </div>
          <dl className="space-y-2 text-sm">
            {orderId && <Row label={t('pending.orderId')} value={orderId} mono />}
            {accountId && <Row label={t('success.accountId')} value={accountId} mono />}
            <Row label={t('errors.statusLabel')} value={reason} />
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${supportSubject}&body=${supportBody}`}
            className="flex-1 text-center px-5 py-3 rounded-xl bg-accent-teal hover:bg-accent-teal/90 active:bg-accent-teal/80 font-semibold text-white transition-colors"
          >
            {t('errors.contactSupport')}
          </a>
          <Link
            href={`/${locale}/checkout`}
            className="flex-1 text-center px-5 py-3 rounded-xl bg-bg-secondary border border-overlay/10 hover:bg-bg-secondary/80 font-semibold text-text-primary transition-colors"
          >
            {t('errors.backCheckout')}
          </Link>
        </div>

        <div className="text-center mb-6">
          <Link
            href={`/${locale}`}
            className="inline-block px-5 py-3 rounded-xl border border-overlay/10 bg-bg-secondary/60 hover:bg-bg-secondary text-text-primary font-semibold text-sm transition-colors"
          >
            {t('back_home')}
          </Link>
        </div>

        <p className="text-center text-text-muted/60 text-xs">{t('errors.saveHint')}</p>
      </div>
    </div>
  );
}

/* ─────────── primitives ─────────── */

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-text-muted/70 shrink-0">{label}</dt>
      <dd className={`text-text-primary text-end ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function AccountIdRow({ label, value }: { label: string; value: string }) {
  const t = useTranslations('success');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-text-muted/70 shrink-0">{label}</dt>
      <dd className="flex items-center gap-2 text-text-primary text-end">
        <span className="font-mono text-xs break-all">{value}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={t('success.copyAccountId')}
          className="shrink-0 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-overlay/10 transition-colors"
        >
          {copied ? <CheckIconSmall /> : <ClipboardIcon />}
        </button>
        {copied && (
          <span className="text-emerald-500 text-xs font-medium">{t('success.copied')}</span>
        )}
      </dd>
    </div>
  );
}

function DownloadButton({
  href,
  label,
  sub,
  icon,
  external = false,
  download = false,
}: {
  href: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  external?: boolean;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(download ? { download: true } : {})}
      className="group flex items-center gap-3 rounded-xl border border-overlay/10 bg-bg-secondary/60 hover:bg-bg-secondary hover:border-overlay/20 px-4 py-3.5 transition-all"
    >
      <div className="text-text-muted group-hover:text-text-primary transition-colors">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text-primary text-sm">{label}</div>
        <div className="text-text-muted/70 text-xs">{sub}</div>
      </div>
      <ArrowIcon />
    </a>
  );
}

/* ─────────── icons ─────────── */

function Spinner() {
  return (
    <svg className="w-8 h-8 animate-spin text-accent-teal" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CheckBadge() {
  return (
    <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function CheckIconSmall() {
  return (
    <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12 3.84 21.85c-.5-.25-.84-.76-.84-1.35zM14.81 13.12L17.4 15.7l-12.15 7.02 9.56-9.6zm3.84-2.39l-2.85 1.65-2.78-2.78 2.78-2.78 2.85 1.65c.93.54.93 1.72 0 2.26zM5.25 1.28l12.15 7.02-2.59 2.59L5.25 1.28z" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 text-text-muted/70 group-hover:text-text-primary rtl:-scale-x-100 transition-colors" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 text-text-muted/70 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}
