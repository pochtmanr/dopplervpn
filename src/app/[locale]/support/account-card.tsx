'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { AccountData } from './support-content';

/* ── Icons ────────────────────────────────────────────────────────── */

function SpinnerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
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

function LogOutIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */

interface AccountCardProps {
  account: AccountData | null;
  locale: string;
  onSignIn: (accountId: string) => void;
  onSignOut: () => void;
  onAccountUpdate: (accountId: string) => void;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function getTierLabel(t: ReturnType<typeof useTranslations>, tier: string): string {
  switch (tier) {
    case 'free': return t('account.tierFree');
    case 'pro_monthly': return t('account.tierMonthly');
    case 'pro_6month': return t('account.tierSixMonth');
    case 'pro_yearly': return t('account.tierYearly');
    case 'pro': return t('account.tierMonthly');
    default: return t('account.tierFree');
  }
}

function getTierBadgeClasses(tier: string): string {
  switch (tier) {
    case 'pro_monthly':
    case 'pro':
      return 'bg-accent-teal/15 text-accent-teal border-accent-teal/25';
    case 'pro_6month':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
    case 'pro_yearly':
      return 'bg-accent-gold/15 text-accent-gold border-accent-gold/25';
    default:
      return 'bg-overlay/5 text-text-muted border-overlay/10';
  }
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/* ── Component ────────────────────────────────────────────────────── */

export function AccountCard({ account, locale, onSignIn, onSignOut, onAccountUpdate }: AccountCardProps) {
  const t = useTranslations('support');

  /* Sign-in state */
  const [tab, setTab] = useState<'id' | 'email'>('id');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Contact edit state */
  const [editingContact, setEditingContact] = useState(false);
  const [contactInput, setContactInput] = useState('');
  const [contactSaving, setContactSaving] = useState(false);

  /* Copy state */
  const [copied, setCopied] = useState(false);

  /* ── Sign in handler ──────────────────────────────────────── */
  const handleSignIn = async () => {
    const val = inputValue.trim();
    if (!val) return;

    setError('');
    setLoading(true);

    try {
      let url: string;
      if (tab === 'id') {
        const normalized = val.toUpperCase();
        const accountRegex = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
        if (!accountRegex.test(normalized)) {
          setError(t('account.notFound'));
          setLoading(false);
          return;
        }
        url = `/api/support/account?account_id=${encodeURIComponent(normalized)}`;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          setError(t('account.notFound'));
          setLoading(false);
          return;
        }
        url = `/api/support/account?email=${encodeURIComponent(val.toLowerCase())}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        setError(t('account.notFound'));
        return;
      }
      const data = await res.json();
      if (data.account) {
        onSignIn(data.account.account_id);
      } else {
        setError(t('account.notFound'));
      }
    } catch {
      setError(t('account.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  /* ── Copy account ID ───────────────────────────────────────── */
  const copyAccountId = () => {
    if (!account) return;
    navigator.clipboard.writeText(account.account_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Save contact ─────────────────────────────────────────── */
  const handleSaveContact = async () => {
    if (!account) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInput.trim())) return;

    setContactSaving(true);
    try {
      const res = await fetch('/api/support/update-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: account.account_id,
          contact_method: 'email',
          contact_value: contactInput.trim(),
        }),
      });
      if (res.ok) {
        setEditingContact(false);
        setContactInput('');
        onAccountUpdate(account.account_id);
      }
    } catch {
      // ignore
    } finally {
      setContactSaving(false);
    }
  };

  /* ── Not authenticated ──────────────────────────────────────── */
  if (!account) {
    return (
      <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 backdrop-blur-sm p-6 sm:p-8">
        <h2 className="text-xl font-display font-bold text-text-primary mb-6">
          {t('account.title')}
        </h2>

        {/* Tab toggle */}
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => { setTab('id'); setError(''); }}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
              tab === 'id'
                ? 'bg-accent-teal text-white'
                : 'bg-bg-secondary/50 border border-overlay/10 text-text-muted hover:border-overlay/20'
            }`}
          >
            {t('account.enterAccountId')}
          </button>
          <button
            type="button"
            onClick={() => { setTab('email'); setError(''); }}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
              tab === 'email'
                ? 'bg-accent-teal text-white'
                : 'bg-bg-secondary/50 border border-overlay/10 text-text-muted hover:border-overlay/20'
            }`}
          >
            {t('account.enterEmail')}
          </button>
        </div>

        {/* Input */}
        <label className="sr-only" htmlFor="support-sign-in-input">
          {tab === 'id' ? t('account.enterAccountId') : t('account.enterEmail')}
        </label>
        <input
          id="support-sign-in-input"
          type={tab === 'email' ? 'email' : 'text'}
          value={inputValue}
          onChange={(e) => { setInputValue(tab === 'id' ? e.target.value.toUpperCase() : e.target.value); setError(''); }}
          placeholder={tab === 'id' ? t('account.accountIdPlaceholder') : t('account.emailPlaceholder')}
          className={`w-full rounded-xl border border-overlay/10 bg-bg-secondary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all ${
            tab === 'id' ? 'font-mono' : ''
          }`}
          onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
        />

        {error && (
          <p className="text-xs text-red-400 mt-2 ps-1">{error}</p>
        )}

        {/* Sign in button */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full mt-4 rounded-xl bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <SpinnerIcon className="w-4 h-4" />
          ) : (
            t('account.signIn')
          )}
        </button>

        {/* Get started link */}
        <p className="text-center text-sm text-text-muted mt-4">
          {t('account.noAccount')}{' '}
          <Link href="/subscribe" className="text-accent-teal hover:text-accent-teal-light transition-colors font-medium">
            {t('account.getStarted')}
          </Link>
        </p>
      </div>
    );
  }

  /* ── Authenticated ──────────────────────────────────────────── */
  const daysLeft = account.subscription_expires_at
    ? getDaysUntil(account.subscription_expires_at)
    : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  return (
    <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 backdrop-blur-sm p-6 sm:p-8 space-y-6">

      {/* ── Status Overview (full width) ──────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-text-primary">
          {t('account.statusTitle')}
        </h2>

        {/* Account ID + Copy */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm sm:text-base text-text-primary tracking-wider">
            {account.account_id}
          </span>
          <button
            type="button"
            onClick={copyAccountId}
            className="p-1.5 rounded-lg hover:bg-overlay/5 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Copy Account ID"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <CopyIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tier badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getTierBadgeClasses(account.subscription_tier)}`}>
            {getTierLabel(t, account.subscription_tier)}
          </span>

          {/* Expiry */}
          {account.subscription_expires_at && (
            <span className="text-xs text-text-muted">
              {t('account.expires')}: {new Date(account.subscription_expires_at).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
              {daysLeft !== null && daysLeft > 0 && (
                <span className="ms-1 text-text-muted/70">
                  ({t('account.expiresIn', { days: daysLeft })})
                </span>
              )}
            </span>
          )}

          {/* Status dot */}
          {account.subscription_tier !== 'free' && (
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isExpired
                    ? 'bg-red-500'
                    : isExpiringSoon
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                }`}
              />
              <span className={
                isExpired
                  ? 'text-red-400'
                  : isExpiringSoon
                    ? 'text-amber-400'
                    : 'text-green-400'
              }>
                {isExpired
                  ? t('account.expired')
                  : isExpiringSoon
                    ? t('account.expiringSoon')
                    : t('account.active')}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact Info */}
        <div className="rounded-xl border border-overlay/10 bg-bg-primary/30 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">
            {t('account.contactTitle')}
          </h3>

          {!editingContact ? (
            <>
              {account.contact_method && account.contact_value ? (
                <div className="space-y-2">
                  <p className="text-xs text-text-muted">
                    {account.contact_method === 'email' ? 'Email' : 'Telegram'}
                  </p>
                  <p className="text-sm text-text-primary break-all">
                    {account.contact_value}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      account.contact_verified
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-overlay/5 text-text-muted'
                    }`}
                  >
                    {account.contact_verified ? (
                      <><CheckIcon className="w-3 h-3" />{t('account.verified')}</>
                    ) : (
                      t('account.unverified')
                    )}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-text-muted/70">No contact linked</p>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditingContact(true);
                  setContactInput(account.contact_value || '');
                }}
                className="text-xs text-accent-teal hover:text-accent-teal-light transition-colors font-medium"
              >
                {t('account.changeContact')}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <label className="sr-only" htmlFor="contact-edit-input">
                {t('account.contactValue')}
              </label>
              <input
                id="contact-edit-input"
                type="email"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                placeholder={t('account.emailPlaceholder')}
                className="w-full rounded-lg border border-overlay/10 bg-bg-secondary/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveContact}
                  disabled={contactSaving}
                  className="rounded-lg bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                >
                  {contactSaving ? <SpinnerIcon className="w-3 h-3" /> : t('account.saveContact')}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingContact(false); setContactInput(''); }}
                  className="rounded-lg border border-overlay/10 text-text-muted text-xs font-medium px-3 py-1.5 hover:border-overlay/20 transition-colors"
                >
                  {t('account.cancelEdit')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Management */}
        <div className="rounded-xl border border-overlay/10 bg-bg-primary/30 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">
            {t('account.subscriptionTitle')}
          </h3>

          <div className="space-y-2">
            {account.subscription_source === 'stripe' ? (
              <a
                href="mailto:support@simnetiq.store?subject=Manage Subscription"
                className="inline-flex items-center gap-2 rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-4 py-2.5 text-sm text-text-primary transition-all w-full justify-center"
              >
                {t('account.manageStripe')}
              </a>
            ) : account.subscription_source === 'app_store' ? (
              <a
                href="https://apps.apple.com/account/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-4 py-2.5 text-sm text-text-primary transition-all w-full justify-center"
              >
                {t('account.manageAppStore')}
              </a>
            ) : account.subscription_source === 'play_store' ? (
              <a
                href="https://play.google.com/store/account/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-4 py-2.5 text-sm text-text-primary transition-all w-full justify-center"
              >
                {t('account.managePlayStore')}
              </a>
            ) : (
              /* Unknown source — show all three */
              <>
                <a
                  href="mailto:support@simnetiq.store?subject=Manage Subscription"
                  className="inline-flex items-center gap-2 rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-3 py-2 text-xs text-text-primary transition-all w-full justify-center"
                >
                  {t('account.manageStripe')}
                </a>
                <a
                  href="https://apps.apple.com/account/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-3 py-2 text-xs text-text-primary transition-all w-full justify-center"
                >
                  {t('account.manageAppStore')}
                </a>
                <a
                  href="https://play.google.com/store/account/subscriptions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-3 py-2 text-xs text-text-primary transition-all w-full justify-center"
                >
                  {t('account.managePlayStore')}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Sign Out ──────────────────────────────────────────── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-red-400 transition-colors"
        >
          <LogOutIcon className="w-4 h-4" />
          {t('account.signOut')}
        </button>
      </div>
    </div>
  );
}
