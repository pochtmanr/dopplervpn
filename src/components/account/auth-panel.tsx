'use client';

import { Fragment, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

import { trackAccountIdentified } from '@/lib/track-cta';
import type { AccountInfo } from './types';

/* ── Icons ───────────────────────────────────────────────────────────── */

function ShieldIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function SpinnerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ClockIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

function UserIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

/* ── Types ───────────────────────────────────────────────────────────── */

export interface AuthResult {
  accountId: string;
  /** True when the account was just minted, false when an existing id was used. */
  isNew: boolean;
  /** Populated only on the "existing account" path, where we already fetched it. */
  accountInfo: AccountInfo | null;
}

interface AuthPanelProps {
  title: string;
  subtitle: string;
  initialMode?: 'new' | 'existing';
  /** /login and /signup pin one mode; /account keeps the segmented toggle. */
  lockMode?: boolean;
  deletedNotice?: boolean;
  onSuccess: (result: AuthResult) => void;
}

/* ── Component ───────────────────────────────────────────────────────── */

/**
 * The account entry point — "create account" and "I have an account" — extracted
 * from step 1 of subscribe-content.tsx so /login, /signup and /account can all
 * mount the same implementation instead of duplicating the auth calls.
 *
 * It owns the network calls, the localStorage write and the analytics event;
 * everything after identification (dashboard, plans, payment) is the caller's job.
 */
export function AuthPanel({
  title,
  subtitle,
  initialMode = 'new',
  lockMode = false,
  deletedNotice = false,
  onSuccess,
}: AuthPanelProps) {
  const t = useTranslations('subscribe');
  const locale = useLocale();

  const [mode, setMode] = useState<'new' | 'existing'>(initialMode);
  const [accountId, setAccountId] = useState('');
  const [identifyError, setIdentifyError] = useState('');
  const [identifyLoading, setIdentifyLoading] = useState(false);

  /* One submit button is rendered at a time, so a single ref covers both modes. */
  const submitRef = useRef<HTMLButtonElement>(null);
  const errorId = useId();

  const titleWords = title.split(/\s+/).filter(Boolean);

  /* Disabling the button while the request is in flight drops focus to <body>.
     When the request fails the button comes back enabled, so put focus back on
     it — but only if nothing else claimed focus meanwhile (e.g. the user is
     still typing in the Account ID input after a validation error). */
  useEffect(() => {
    if (!identifyError || identifyLoading) return;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    submitRef.current?.focus();
  }, [identifyError, identifyLoading]);

  /* Create an anonymous account — no email, no password. */
  const handleCreateAccount = async () => {
    setIdentifyError('');
    setIdentifyLoading(true);
    try {
      const res = await fetch('/api/subscribe/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (!res.ok) {
        setIdentifyError(data.error || t('error'));
        return;
      }
      trackAccountIdentified('new', locale);
      localStorage.setItem('doppler_account_id', data.accountId);
      onSuccess({ accountId: data.accountId, isNew: true, accountInfo: null });
    } catch {
      setIdentifyError(t('error'));
    } finally {
      setIdentifyLoading(false);
    }
  };

  /* Continue with an existing Account ID. The lookup doubles as validation. */
  const handleContinue = async () => {
    setIdentifyError('');
    const normalized = accountId.trim().toUpperCase();
    const accountRegex = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!accountRegex.test(normalized)) {
      setIdentifyError(t('accountRequired'));
      return;
    }
    setAccountId(normalized);
    setIdentifyLoading(true);
    try {
      const res = await fetch(
        `/api/subscribe/account-info?account_id=${encodeURIComponent(normalized)}`,
      );
      if (!res.ok) {
        setIdentifyError(t('accountNotFound'));
        setIdentifyLoading(false);
        return;
      }
      const data = await res.json();
      trackAccountIdentified('existing', locale);
      localStorage.setItem('doppler_account_id', normalized);
      onSuccess({ accountId: normalized, isNew: false, accountInfo: data });
    } catch {
      setIdentifyError(t('error'));
    } finally {
      setIdentifyLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20">
      {/* Header — word-by-word blur fade, same idiom as the rest of /account */}
      <div className="text-center mb-10">
        <h1 className="text-5xl sm:text-6xl font-semibold text-text-primary leading-[1.05] mb-4">
          {titleWords.map((word, i) => (
            <Fragment key={`tw-${i}`}>
              <span
                className={
                  i === titleWords.length - 1
                    ? 'account-word bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent'
                    : 'account-word'
                }
                style={{ '--reveal-delay': `${0.05 + i * 0.06}s` } as React.CSSProperties}
              >
                {word}
              </span>{' '}
            </Fragment>
          ))}
        </h1>
        <p
          className="account-reveal text-sm sm:text-base text-text-muted"
          style={{ '--reveal-delay': '0.25s' } as React.CSSProperties}
        >
          {subtitle}
        </p>
      </div>

      <div className="space-y-5">
        {/* Account deleted confirmation */}
        {deletedNotice && (
          <div className="rounded-xl border border-accent-teal/20 bg-accent-teal/5 px-5 py-3 flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-accent-teal shrink-0" />
            <p className="text-sm font-medium text-accent-teal">{t('dashboard.deleteSuccess')}</p>
          </div>
        )}

        {/* Mode toggle — segmented pill */}
        {!lockMode && (
          <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-bg-secondary/40 border border-overlay/10">
            <button
              type="button"
              onClick={() => { setMode('new'); setIdentifyError(''); }}
              className={`rounded-full py-2.5 text-sm font-medium transition-colors ${
                mode === 'new'
                  ? 'bg-accent-teal text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t('newUser')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('existing'); setIdentifyError(''); }}
              className={`rounded-full py-2.5 text-sm font-medium transition-colors ${
                mode === 'existing'
                  ? 'bg-accent-teal text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t('existingUser')}
            </button>
          </div>
        )}

        {/* Signature gradient card — same treatment as the landing traffic cards */}
        <div className="group relative rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300">
          <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
          <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative space-y-5">
            {mode === 'new' ? (
              <>
                <p className="text-sm text-text-primary font-medium text-center">
                  {t('noRegistrationNote')}
                </p>
                <button
                  ref={submitRef}
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={identifyLoading}
                  aria-busy={identifyLoading}
                  aria-describedby={identifyError ? errorId : undefined}
                  className="cta-key w-full rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  {identifyLoading ? (
                    <>
                      <SpinnerIcon className="w-4 h-4" />
                      {t('creatingAnonymous')}
                    </>
                  ) : (
                    <>
                      <ShieldIcon className="w-4 h-4" />
                      {t('createAccount')}
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => { setAccountId(e.target.value.toUpperCase()); setIdentifyError(''); }}
                  placeholder={t('accountPlaceholder')}
                  aria-label={t('accountPlaceholder')}
                  aria-invalid={identifyError ? true : undefined}
                  aria-describedby={identifyError ? errorId : undefined}
                  className="w-full rounded-2xl border border-overlay/10 bg-bg-secondary/40 px-4 py-4 text-base font-mono tracking-widest text-center text-text-primary placeholder:text-text-muted/40 focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                />

                <button
                  ref={submitRef}
                  type="button"
                  onClick={handleContinue}
                  disabled={identifyLoading}
                  aria-busy={identifyLoading}
                  aria-describedby={identifyError ? errorId : undefined}
                  className="cta-key w-full rounded-full disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  {identifyLoading ? (
                    <>
                      <SpinnerIcon className="w-4 h-4" />
                      {t('verifyingAccount')}
                    </>
                  ) : (
                    t('continue')
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/${locale}/support#restore`;
                    }}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    {t('dashboard.forgotAccountId')}
                  </button>
                </div>
              </>
            )}

            {identifyError && (
              <div
                id={errorId}
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-start animate-[fadeIn_200ms_ease-out]"
              >
                <AlertIcon className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                <p className="text-xs text-danger">{identifyError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Reassurance — flat card, same treatment as the download cards.
            Only autoDeleteNote lives here; noRegistrationNote is already the
            explainer inside the card above and must not be repeated. */}
        {mode === 'new' && (
          <div className="flex items-center gap-3 rounded-xl border border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-accent-teal/30 transition-colors p-4">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-accent-teal/20 flex items-center justify-center text-accent-teal">
              <ClockIcon className="w-5 h-5" />
            </div>
            <p className="text-xs text-text-muted">{t('autoDeleteNote')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Acknowledges an Account ID already saved on this device, on /login and /signup.
 *
 * Deliberately NOT a redirect: this product has no password, so a second account
 * is a legitimate thing to want, and silently bouncing people to /account would
 * make that impossible. It is an offer, not a gate.
 *
 * localStorage is read in an effect (never during render) and nothing is shown
 * until that read has resolved, so the server and first client paint agree and
 * the banner never flashes.
 */
export function ExistingAccountBanner() {
  const t = useTranslations('subscribe');
  const locale = useLocale();

  const [savedId, setSavedId] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    try {
      setSavedId(localStorage.getItem('doppler_account_id'));
    } catch {
      /* Storage can throw when blocked; treat it as "no saved account". */
    }
    setResolved(true);
  }, []);

  if (!resolved || !savedId) return null;

  return (
    <div className="mx-auto max-w-md px-4 pt-10 sm:pt-16">
      <div className="rounded-2xl border border-accent-teal/20 bg-accent-teal/5 p-4 animate-[fadeIn_200ms_ease-out]">
        <div className="flex items-start gap-3 text-start">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-bg-secondary/80 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">
              {t('existingAccountTitle')}
            </p>
            <p className="font-mono text-xs tracking-widest text-text-muted mt-1 break-all">
              {savedId}
            </p>
          </div>
        </div>

        <Link
          href={`/${locale}/account`}
          className="cta-key mt-4 w-full rounded-full text-white font-semibold py-3 text-sm flex items-center justify-center"
        >
          {t('existingAccountCta')}
        </Link>

        <p className="text-xs text-text-muted mt-3 text-start">
          {t('existingAccountNote')}
        </p>
      </div>
    </div>
  );
}
