'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { RevolutCheckoutInstance } from '@revolut/checkout';

/* ── Plan data ──────────────────────────────────────────────────────── */

const PLANS = [
  { id: 'monthly', cents: 699, months: 1, save: null, best: false },
  { id: '6month', cents: 2999, months: 6, save: 28, best: false },
  { id: 'yearly', cents: 3999, months: 12, save: 52, best: true },
] as const;

type PlanId = (typeof PLANS)[number]['id'];

/* ── Helpers ─────────────────────────────────────────────────────────── */

function formatCents(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

function perMonth(cents: number, months: number): string {
  const pm = cents / 100 / months;
  return `$${pm.toFixed(2)}`;
}

function formatDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ── Icons ───────────────────────────────────────────────────────────── */

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

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

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function UserIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function MailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`rtl:-scale-x-100 ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function AppleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function PlayStoreIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.163 12l2.535-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
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

/* ── Account info type ──────────────────────────────────────────────── */

interface AccountInfo {
  accountId: string;
  tier: string;
  rawTier: string | null;
  expiresAt: string | null;
  contactMethod: string | null;
  contactValue: string | null;
  contactVerified: boolean;
  createdAt: string;
  linkedAccountsCount?: number;
}

/* ── Subscribe content ───────────────────────────────────────────────── */

function SubscribeInner() {
  const t = useTranslations('subscribe');
  const locale = useLocale();

  /* ── Revolut checkout ref ──────────────────────────────────────── */
  const revolutLoaderRef = useRef<((token: string, mode?: 'prod' | 'sandbox') => Promise<RevolutCheckoutInstance>) | null>(null);

  useEffect(() => {
    import('@revolut/checkout').then((mod) => {
      revolutLoaderRef.current = mod.default;
    });
  }, []);

  /* ── Step state ────────────────────────────────────────────────── */
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [accountId, setAccountId] = useState('');
  const [identifyError, setIdentifyError] = useState('');
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const [existingAccount, setExistingAccount] = useState(false);

  /* ── Dashboard state ─────────────────────────────────────────── */
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectEmailInput, setConnectEmailInput] = useState('');
  const [connectEmailOpen, setConnectEmailOpen] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);

  /* ── Premium support state ────────────────────────────────────── */
  const [premiumTicketOpen, setPremiumTicketOpen] = useState(false);
  const [premiumTicketForm, setPremiumTicketForm] = useState({ subject: '', description: '', contactEmail: '' });
  const [premiumTicketLoading, setPremiumTicketLoading] = useState(false);
  const [premiumTicketSuccess, setPremiumTicketSuccess] = useState<string | null>(null);
  const [premiumTicketError, setPremiumTicketError] = useState('');

  /* ── Delete account state ────────────────────────────────────── */
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  /* ── Plan & checkout state ─────────────────────────────────────── */
  const [selected, setSelected] = useState<PlanId>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── Promo state ───────────────────────────────────────────────── */
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount_percent: number;
    promo_id: string;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  /* ── Auto-restore session from localStorage ─────────────────── */
  useEffect(() => {
    const savedId = localStorage.getItem('doppler_account_id');
    if (savedId) {
      setAccountId(savedId);
      setMode('existing');
      setStep(2);
      fetchAccountInfo(savedId);
    }
  }, []);

  /* ── Derived: what email does this user have? ────────────────── */
  const knownEmail = accountInfo?.contactMethod === 'email' ? accountInfo.contactValue : null;

  const hasEmailContact = !!(accountInfo?.contactMethod === 'email' && accountInfo?.contactValue);
  const hasTelegramContact = !!(accountInfo?.contactMethod === 'telegram' && accountInfo?.contactValue);

  /* ── Promo helpers ─────────────────────────────────────────────── */
  const getDiscountedCents = (cents: number) => {
    if (!promoApplied) return cents;
    return Math.round(cents * (1 - promoApplied.discount_percent / 100));
  };

  const planMap: Record<string, string> = {
    monthly: 'monthly',
    '6month': 'semiannual',
    yearly: 'annual',
  };

  const applyPromo = async () => {
    const code = promoCode.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          account_id: accountId,
          plan: planMap[selected] || 'monthly',
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied({
          code: data.code,
          discount_percent: data.discount_percent,
          promo_id: data.promo_id,
        });
        setPromoError('');
      } else {
        setPromoError(data.error || t('promoInvalid'));
        setPromoApplied(null);
      }
    } catch {
      setPromoError(t('promoFailed'));
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoApplied(null);
    setPromoCode('');
    setPromoError('');
  };

  /* ── Fetch account info ──────────────────────────────────────── */
  const fetchAccountInfo = async (accId: string) => {
    setDashboardLoading(true);
    try {
      const res = await fetch(`/api/subscribe/account-info?account_id=${encodeURIComponent(accId)}`);
      if (res.ok) {
        const data = await res.json();
        setAccountInfo(data);
      }
    } catch {
      // silently fail — dashboard will show without extra info
    } finally {
      setDashboardLoading(false);
    }
  };

  /* ── Step 1: Create anonymous account ─────────────────────────── */
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
      setAccountId(data.accountId);
      localStorage.setItem('doppler_account_id', data.accountId);
      setExistingAccount(false);
      setStep(2);
      fetchAccountInfo(data.accountId);
    } catch {
      setIdentifyError(t('error'));
    } finally {
      setIdentifyLoading(false);
    }
  };

  /* ── Step 1: Continue with existing account ─────────────────── */
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
      const res = await fetch(`/api/subscribe/account-info?account_id=${encodeURIComponent(normalized)}`);
      if (!res.ok) {
        setIdentifyError(t('accountNotFound'));
        setIdentifyLoading(false);
        return;
      }
      const data = await res.json();
      setAccountInfo(data);
      localStorage.setItem('doppler_account_id', normalized);
      setStep(2);
    } catch {
      setIdentifyError(t('error'));
    } finally {
      setIdentifyLoading(false);
    }
  };

  /* ── Save contact ────────────────────────────────────────────── */
  const handleSaveContact = async () => {
    const emailVal = connectEmailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) return;

    setContactSaving(true);
    try {
      const res = await fetch('/api/subscribe/update-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          contactMethod: 'email',
          contactValue: emailVal,
        }),
      });
      if (res.ok) {
        setContactSaved(true);
        setConnectEmailOpen(false);
        setConnectEmailInput('');
        fetchAccountInfo(accountId);
        setTimeout(() => setContactSaved(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setContactSaving(false);
    }
  };

  /* ── Copy account ID ─────────────────────────────────────────── */
  const copyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Logout ──────────────────────────────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem('doppler_account_id');
    setStep(1);
    setAccountId('');
    setAccountInfo(null);
    setShowPlans(false);
    setExistingAccount(false);
    setPromoApplied(null);
    setPromoCode('');
    setConnectEmailOpen(false);
    setConnectEmailInput('');
    setContactSaved(false);
  };

  /* ── Submit premium ticket ────────────────────────────────────── */
  const resolvedTicketEmail = knownEmail || (accountInfo?.contactMethod === 'email' ? accountInfo?.contactValue : null) || '';

  const handlePremiumTicket = async () => {
    const { subject, description, contactEmail: formEmail } = premiumTicketForm;
    if (!subject.trim() || !description.trim()) return;

    const contactEmail = resolvedTicketEmail || formEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      setPremiumTicketError(t('dashboard.ticketEmailRequired'));
      return;
    }

    setPremiumTicketLoading(true);
    setPremiumTicketError('');
    try {
      const res = await fetch('/api/support/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'subscription_billing',
          subject: subject.trim(),
          description: description.trim(),
          contact_email: contactEmail.toLowerCase(),
          account_id: accountId,
          priority: 'premium',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPremiumTicketError(data.error || t('error'));
        return;
      }
      setPremiumTicketSuccess(data.ticket_number);
      setPremiumTicketForm({ subject: '', description: '', contactEmail: '' });
    } catch {
      setPremiumTicketError(t('error'));
    } finally {
      setPremiumTicketLoading(false);
    }
  };

  /* ── Step 2: Subscribe ─────────────────────────────────────────── */
  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Validate account and create Revolut order
      const body = {
        account_id: accountId.trim().toUpperCase(),
        plan_id: selected,
        email: knownEmail || '',
        ...(promoApplied ? { promo_code: promoApplied.code, promo_id: promoApplied.promo_id } : {}),
      };

      const res = await fetch('/api/revolut/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.order_token) {
        setError(data.error || t('error'));
        return;
      }

      // 2. Open Revolut checkout
      if (!revolutLoaderRef.current) {
        setError('Payment system not ready. Please refresh and try again.');
        return;
      }

      const instance = await revolutLoaderRef.current(data.order_token, data.mode || 'sandbox');

      instance.payWithPopup({
        onSuccess: () => {
          // Revolut webhook will update Supabase
          setTimeout(() => {
            const savedId = localStorage.getItem('doppler_account_id');
            if (savedId) fetchAccountInfo(savedId);
          }, 3000);
          window.location.href = `/${locale}/account?payment=success`;
        },
        onError: (err) => {
          setError(err?.message || t('error'));
        },
      });
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.id === selected)!;
  const finalCents = getDiscountedCents(selectedPlan.cents);

  const features = [
    t('feat1'), t('feat2'), t('feat3'),
    t('feat4'), t('feat5'), t('feat6'),
  ];

  const isPro = accountInfo?.tier === 'pro';
  const isActivePro = isPro;
  // Expired pro: rawTier was pro/premium but effective tier is free (server already computed)
  const isExpiredPro = !isPro && accountInfo?.rawTier === 'pro';

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary pt-24">

      {/* ── Step 1: Identify ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/20">
              <ShieldIcon className="w-4 h-4 text-accent-teal" />
              <span className="text-xs font-semibold tracking-wider uppercase text-accent-teal">
                Doppler VPN
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-3">
              {t('title')}
            </h1>
            <p className="text-sm text-text-muted">{t('subtitle')}</p>
          </div>

          <div className="space-y-5">
            {/* Toggle buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMode('new'); setIdentifyError(''); }}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                  mode === 'new'
                    ? 'border-accent-teal bg-accent-teal/5 text-accent-teal ring-1 ring-accent-teal/30'
                    : 'border-overlay/10 bg-bg-secondary/50 text-text-muted hover:border-overlay/20'
                }`}
              >
                {t('newUser')}
              </button>
              <button
                type="button"
                onClick={() => { setMode('existing'); setIdentifyError(''); }}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                  mode === 'existing'
                    ? 'border-accent-teal bg-accent-teal/5 text-accent-teal ring-1 ring-accent-teal/30'
                    : 'border-overlay/10 bg-bg-secondary/50 text-text-muted hover:border-overlay/20'
                }`}
              >
                {t('existingUser')}
              </button>
            </div>

            {mode === 'new' ? (
              <>
                {/* No registration explanation */}
                <div className="rounded-xl border border-overlay/10 bg-bg-secondary/30 p-4 space-y-2">
                  <p className="text-sm text-text-primary font-medium">{t('noRegistrationNote')}</p>
                  <p className="text-xs text-text-muted">{t('autoDeleteNote')}</p>
                </div>

                {/* Create account button */}
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  disabled={identifyLoading}
                  className="w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm transition-colors flex items-center justify-center gap-2"
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
                  className="w-full rounded-xl border border-overlay/10 bg-bg-secondary/50 px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                />
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/${locale}/support#restore`;
                  }}
                  className="text-xs text-accent-teal hover:text-accent-teal-light transition-colors mt-1"
                >
                  {t("dashboard.forgotAccountId")}
                </button>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={identifyLoading}
                  className="w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm transition-colors flex items-center justify-center gap-2"
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
              </>
            )}

            {identifyError && (
              <p className="text-xs text-red-400 ps-1">{identifyError}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Account Dashboard ────────────────────────────── */}
      {step === 2 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {dashboardLoading ? (
            <div className="flex items-center justify-center py-20">
              <SpinnerIcon className="w-7 h-7 text-accent-teal" />
            </div>
          ) : (
            <>
              {/* ── Dashboard header ─────────────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-accent-teal/10 border border-accent-teal/20">
                    <UserIcon className="w-5 h-5 text-accent-teal" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                      {t('dashboard.title')}
                    </h1>
                    {accountInfo?.createdAt && (
                      <p className="text-sm text-text-muted mt-0.5">
                        {t('dashboard.memberSince')} {formatDate(accountInfo.createdAt, locale)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Save your ID warning for new accounts ──────── */}
              {!existingAccount && mode === 'new' && (
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-3.5 flex items-start gap-3">
                  <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-300">{t('saveWarning')}</p>
                    <p className="text-xs text-text-muted mt-0.5">{t('saveWarningDetail')}</p>
                  </div>
                </div>
              )}

              {/* ── Existing account notice ───────────────────────── */}
              {existingAccount && (
                <div className="mb-6 rounded-xl border border-accent-teal/20 bg-accent-teal/5 px-5 py-3.5 flex items-start gap-3">
                  <CheckIcon className="w-4 h-4 text-accent-teal mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-accent-teal">{t('accountFound')}</p>
                    <p className="text-xs text-text-muted mt-0.5">{t('accountFoundNote')}</p>
                  </div>
                </div>
              )}

              {/* ── Contact saved toast ───────────────────────────── */}
              {contactSaved && (
                <div className="mb-6 rounded-xl border border-accent-teal/20 bg-accent-teal/5 px-5 py-3 flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-accent-teal" />
                  <p className="text-sm font-medium text-accent-teal">{t('dashboard.contactSaved')}</p>
                </div>
              )}

              {/* ── 2-column grid ─────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── Left column: Account info ────────────────── */}
                <div className="lg:col-span-2 space-y-5">

                  {/* Account ID card */}
                  <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                        {t('accountLabel')}
                      </span>
                      <div className={`w-2.5 h-2.5 rounded-full ${isActivePro ? 'bg-green-400' : 'bg-text-muted/30'}`} />
                    </div>
                    <button
                      type="button"
                      onClick={copyAccountId}
                      className="group flex items-center gap-3 w-full"
                    >
                      <span className="font-mono text-lg sm:text-xl font-bold text-text-primary tracking-wide">
                        {accountId}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-text-muted group-hover:text-accent-teal transition-colors">
                        <CopyIcon className="w-3.5 h-3.5" />
                        {copied ? t('dashboard.copied') : ''}
                      </span>
                    </button>
                  </div>

                  {/* Linked contacts card */}
                  <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                        {t('dashboard.contacts')}
                      </h3>
                      <span className="text-xs text-text-muted/60">{t('dashboard.contactsOptional')}</span>
                    </div>

                    <div className="space-y-3">
                      {/* Email row */}
                      {(hasEmailContact || knownEmail) && (
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-primary/40 border border-overlay/5">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-teal/10">
                            <MailIcon className="w-4 h-4 text-accent-teal" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-muted">{t('dashboard.email')}</p>
                            <p className="text-base text-text-primary truncate">
                              {hasEmailContact ? accountInfo!.contactValue : knownEmail}
                            </p>
                          </div>
                          {hasEmailContact && (
                            <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              accountInfo!.contactVerified
                                ? 'bg-green-500/15 text-green-400'
                                : 'bg-yellow-500/15 text-yellow-400'
                            }`}>
                              {accountInfo!.contactVerified ? t('dashboard.verified') : t('dashboard.unverified')}
                            </span>
                          )}
                          {!hasEmailContact && knownEmail && (
                            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-overlay/5 text-text-muted">
                              {t('dashboard.unverified')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Telegram row */}
                      {hasTelegramContact && (
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-primary/40 border border-overlay/5">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#229ED9]/10">
                            <TelegramIcon className="w-4 h-4 text-[#229ED9]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text-muted">{t('dashboard.telegram')}</p>
                            <p className="text-base text-text-primary truncate">{accountInfo!.contactValue}</p>
                          </div>
                          <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            accountInfo!.contactVerified
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-yellow-500/15 text-yellow-400'
                          }`}>
                            {accountInfo!.contactVerified ? t('dashboard.verified') : t('dashboard.unverified')}
                          </span>
                        </div>
                      )}

                      {/* No contacts at all */}
                      {!hasEmailContact && !hasTelegramContact && !knownEmail && (
                        <p className="text-base text-text-muted py-1">{t('dashboard.noContacts')}</p>
                      )}
                    </div>

                    {/* Connect actions — only show what's missing */}
                    <div className="mt-4 space-y-2">
                      {/* Connect Email — only if NO email contact at all */}
                      {!hasEmailContact && !knownEmail && (
                        <>
                          {connectEmailOpen ? (
                            <div className="flex gap-2">
                              <input
                                type="email"
                                value={connectEmailInput}
                                onChange={(e) => setConnectEmailInput(e.target.value)}
                                placeholder={t('dashboard.connectEmailPlaceholder')}
                                className="flex-1 rounded-lg border border-overlay/10 bg-bg-primary/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveContact()}
                              />
                              <button
                                type="button"
                                onClick={handleSaveContact}
                                disabled={contactSaving}
                                className="rounded-lg bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 text-white font-medium px-3 py-2 text-sm transition-colors"
                              >
                                {contactSaving ? <SpinnerIcon className="w-4 h-4" /> : t('dashboard.save')}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConnectEmailOpen(true)}
                              className="flex items-center gap-2 w-full rounded-lg border border-dashed border-overlay/15 px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:border-overlay/25 transition-colors"
                            >
                              <MailIcon className="w-3.5 h-3.5" />
                              {t('dashboard.connectEmail')}
                            </button>
                          )}
                        </>
                      )}

                      {/* Connect Telegram — always available */}
                      {!hasTelegramContact && (
                        <a
                          href="https://t.me/DopplerVerifyBot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full rounded-lg border border-dashed border-overlay/15 px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:border-overlay/25 transition-colors"
                        >
                          <TelegramIcon className="w-3.5 h-3.5" />
                          {t('dashboard.connectTelegram')}
                          <ArrowRightIcon className="w-3 h-3 ms-auto opacity-40" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Restore purchases card */}
                  <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                      {t('dashboard.restorePurchases')}
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                      {t('dashboard.restorePurchasesDesc')}
                    </p>
                    <div className="space-y-2">
                      <a
                        href="https://apps.apple.com/account/subscriptions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full rounded-lg border border-overlay/10 px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:border-overlay/20 transition-colors"
                      >
                        <AppleIcon className="w-4 h-4" />
                        {t('dashboard.restoreAppStore')}
                        <ArrowRightIcon className="w-3 h-3 ms-auto opacity-40" />
                      </a>
                      <a
                        href="https://play.google.com/store/account/subscriptions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full rounded-lg border border-overlay/10 px-3 py-2.5 text-sm text-text-muted hover:text-text-primary hover:border-overlay/20 transition-colors"
                      >
                        <PlayStoreIcon className="w-4 h-4" />
                        {t('dashboard.restorePlayStore')}
                        <ArrowRightIcon className="w-3 h-3 ms-auto opacity-40" />
                      </a>
                    </div>
                  </div>

                  {/* Account actions — same-size stacked CTAs */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-overlay/15 bg-bg-secondary/40 px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary hover:border-overlay/25 transition-colors"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      {t('dashboard.logout')}
                    </button>

                    {isActivePro ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmOpen(!deleteConfirmOpen)}
                          className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-500/15 px-4 py-3 text-sm font-medium text-red-400/70 hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/5 transition-colors"
                        >
                          {t('dashboard.deleteAccount')}
                        </button>
                        {deleteConfirmOpen && (
                          <div className="rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3 space-y-2">
                            <p className="text-sm text-red-300">{t('dashboard.deleteWarningPro')}</p>
                            <a
                              href={`/${locale}/support#delete-account`}
                              className="inline-flex text-sm text-red-400 underline underline-offset-2 hover:text-red-300 transition-colors"
                            >
                              {t('dashboard.deleteConfirm')}
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <a
                        href={`/${locale}/support#delete-account`}
                        className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-500/15 px-4 py-3 text-sm font-medium text-red-400/70 hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/5 transition-colors"
                      >
                        {t('dashboard.deleteAccount')}
                      </a>
                    )}
                  </div>
                </div>

                {/* ── Right column: Subscription ───────────────── */}
                <div className="lg:col-span-3 space-y-5">

                  {/* Subscription status card */}
                  {isActivePro ? (
                    <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/40 p-6">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-5">
                        {t('dashboard.subscription')}
                      </h3>
                      <div className="space-y-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl font-bold text-text-primary">
                                {t('dashboard.proActive')}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-xs font-bold uppercase tracking-wider">
                                Active
                              </span>
                            </div>
                            {accountInfo?.expiresAt && (
                              <p className="text-sm text-text-muted mt-1.5">
                                {t('dashboard.activeUntil')} {formatDate(accountInfo.expiresAt, locale)}
                              </p>
                            )}
                          </div>
                          <ShieldIcon className="w-8 h-8 text-accent-teal/30" />
                        </div>

                        <div className="h-px bg-overlay/5" />

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setShowPlans(!showPlans)}
                            className="rounded-xl border border-accent-teal/20 bg-accent-teal/5 px-4 py-3 text-sm font-medium text-accent-teal hover:bg-accent-teal/10 transition-colors"
                          >
                            {t('dashboard.extend')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPremiumTicketOpen(true); setPremiumTicketSuccess(null); setPremiumTicketError(''); }}
                            className="rounded-xl border border-accent-teal/20 bg-accent-teal/5 px-4 py-3 text-sm font-medium text-accent-teal hover:bg-accent-teal/10 transition-colors"
                          >
                            {t('dashboard.expressSupport')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Paywall-style card for non-subscribers ──── */
                    <div className="rounded-2xl border border-accent-teal/20 bg-gradient-to-b from-accent-teal/5 via-bg-secondary/60 to-bg-secondary/40 overflow-hidden">
                      {/* Header with gradient accent */}
                      <div className="relative px-6 pt-6 pb-5">
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-teal/40 to-transparent" />
                        <div className="flex items-center gap-3 mb-2">
                          <ShieldIcon className="w-7 h-7 text-accent-teal" />
                          <h3 className="text-xl font-bold text-text-primary">{t('dashboard.proActive')}</h3>
                        </div>
                        {isExpiredPro && accountInfo?.expiresAt && (
                          <p className="text-sm text-yellow-400">
                            {t('dashboard.expiredPro', { date: formatDate(accountInfo.expiresAt, locale) })}
                          </p>
                        )}
                        {!isExpiredPro && (
                          <p className="text-sm text-text-muted">{t('dashboard.freeTier')}</p>
                        )}
                      </div>

                      {/* Features list — paywall style */}
                      <div className="px-6 pb-5">
                        <ul className="space-y-3">
                          {features.map((feat) => (
                            <li key={feat} className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-teal/15">
                                <CheckIcon className="w-3 h-3 text-accent-teal" />
                              </div>
                              <span className="text-sm text-text-primary">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price preview + CTA */}
                      <div className="px-6 pb-6 space-y-4">
                        <div className="flex items-baseline gap-1.5 justify-center">
                          <span className="text-3xl font-bold text-text-primary">$2.99</span>
                          <span className="text-sm text-text-muted">{t('perMonth')}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPlans(!showPlans)}
                          className="w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light text-white font-semibold py-3.5 text-base transition-colors flex items-center justify-center gap-2"
                        >
                          {isExpiredPro ? t('dashboard.renewPro') : t('dashboard.getPro')}
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-text-muted/60 text-center">{t('footerNote')}</p>
                      </div>
                    </div>
                  )}

                  {/* ── Plan cards (inline, toggle) ──────────────── */}
                  {showPlans && (
                    <div className="space-y-5">
                      {/* Plan cards */}
                      <div className="space-y-3">
                        {PLANS.map((plan) => {
                          const isSelected = selected === plan.id;
                          const discountedCents = getDiscountedCents(plan.cents);
                          const originalPrice = formatCents(plan.cents);
                          const finalPrice = formatCents(discountedCents);
                          const monthly = perMonth(discountedCents, plan.months);

                          const labelMap: Record<string, string> = {
                            monthly: t('monthly'),
                            '6month': t('sixMonth'),
                            yearly: t('yearly'),
                          };

                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => setSelected(plan.id as PlanId)}
                              className={`relative w-full rounded-xl border p-4 text-left transition-all ${
                                isSelected
                                  ? 'border-accent-teal bg-accent-teal/5 ring-1 ring-accent-teal/30'
                                  : 'border-overlay/10 bg-bg-secondary/40 hover:border-overlay/20'
                              }`}
                            >
                              {plan.best && (
                                <span className="absolute -top-2.5 end-4 inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent-teal text-[10px] font-bold uppercase tracking-wider text-white">
                                  {t('bestValue')}
                                </span>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'border-accent-teal bg-accent-teal'
                                        : 'border-overlay/20'
                                    }`}
                                  >
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                  </div>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-text-primary">
                                        {labelMap[plan.id]}
                                      </span>
                                      {plan.save && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-accent-teal/15 text-accent-teal text-[10px] font-bold">
                                          {t('save')} {plan.save}%
                                        </span>
                                      )}
                                    </div>
                                    {plan.months > 1 && (
                                      <span className="text-xs text-text-muted">
                                        {monthly}{t('perMonth')}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-end">
                                  {promoApplied && discountedCents !== plan.cents ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-text-muted line-through">{originalPrice}</span>
                                      <span className="text-lg font-bold text-text-primary">{finalPrice}</span>
                                    </div>
                                  ) : (
                                    <span className="text-lg font-bold text-text-primary">{originalPrice}</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Promo code */}
                      <div>
                        {promoApplied ? (
                          <div className="flex items-center justify-between rounded-xl border border-accent-teal/20 bg-accent-teal/5 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CheckIcon className="w-4 h-4 text-accent-teal" />
                              <span className="text-sm text-text-primary">
                                <span className="font-semibold">{promoApplied.code}</span>
                                {' '}&mdash; {promoApplied.discount_percent}% {t('promoOff')}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={removePromo}
                              className="text-xs text-text-muted hover:text-text-primary transition-colors"
                            >
                              {t('promoRemove')}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => {
                                  setPromoCode(e.target.value.toUpperCase());
                                  setPromoError('');
                                }}
                                placeholder={t('promoPlaceholder')}
                                className="flex-1 rounded-xl border border-overlay/10 bg-bg-secondary/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                              />
                              <button
                                type="button"
                                onClick={applyPromo}
                                disabled={promoLoading || !promoCode.trim()}
                                className="rounded-xl border border-overlay/10 bg-bg-secondary/40 px-4 py-2.5 text-sm font-medium text-text-primary hover:border-overlay/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              >
                                {promoLoading ? <SpinnerIcon className="w-4 h-4" /> : t('promoApply')}
                              </button>
                            </div>
                            {promoError && <p className="text-xs text-red-400 ps-1">{promoError}</p>}
                          </div>
                        )}
                      </div>

                      {/* Subscribe button */}
                      <button
                        type="button"
                        onClick={handleSubscribe}
                        disabled={loading}
                        className="w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <SpinnerIcon className="w-4 h-4" />
                            {t('processing')}
                          </>
                        ) : (
                          <>
                            {t('subscribe')} &mdash; {formatCents(finalCents)}
                          </>
                        )}
                      </button>

                      {error && <p className="text-center text-xs text-red-400">{error}</p>}

                      {/* Secured by Revolut */}
                      <div className="flex items-center justify-center gap-1.5">
                        <ShieldIcon className="w-3.5 h-3.5 text-text-muted/50" />
                        <span className="text-[11px] text-text-muted/50">{t('securedBy')}</span>
                      </div>

                      {/* Features */}
                      <div className="rounded-xl border border-overlay/10 bg-bg-secondary/40 p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                          {t('features')}
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {features.map((feat) => (
                            <li key={feat} className="flex items-center gap-2.5">
                              <CheckIcon className="w-4 h-4 text-accent-teal shrink-0" />
                              <span className="text-sm text-text-primary">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Footer links */}
                  <div className="text-center space-y-2 pt-2">
                    <p className="text-[11px] text-text-muted/60">{t('footerNote')}</p>
                    <div className="flex items-center justify-center gap-3 text-[11px] text-text-muted/50">
                      <a
                        href={`/${locale}/terms`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-text-muted transition-colors underline underline-offset-2"
                      >
                        {t('terms')}
                      </a>
                      <span>&middot;</span>
                      <a
                        href={`/${locale}/privacy`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-text-muted transition-colors underline underline-offset-2"
                      >
                        {t('privacy')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* ── Premium Support Modal ──────────────────────────────── */}
      {premiumTicketOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setPremiumTicketOpen(false); } }}
        >
          <div className="w-full sm:max-w-lg bg-bg-secondary border border-overlay/10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-display font-bold text-text-primary">
                    {t('dashboard.expressSupport')}
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent-teal/15 text-accent-teal text-[10px] font-bold uppercase tracking-wider">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">{t('dashboard.premiumSupportDesc')}</p>
              </div>
              <button
                type="button"
                onClick={() => setPremiumTicketOpen(false)}
                className="p-2 rounded-lg hover:bg-overlay/5 text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {premiumTicketSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <CheckIcon className="w-12 h-12 text-green-400 mx-auto" />
                  <h3 className="text-lg font-display font-bold text-text-primary">
                    {t('dashboard.ticketCreated')}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {t('dashboard.ticketCreatedDesc', { ticketNumber: premiumTicketSuccess })}
                  </p>
                  <button
                    type="button"
                    onClick={() => setPremiumTicketOpen(false)}
                    className="mt-4 w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light text-white font-semibold py-3 text-sm transition-colors"
                  >
                    {t('dashboard.close')}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      {t('dashboard.ticketSubject')}
                    </label>
                    <input
                      type="text"
                      value={premiumTicketForm.subject}
                      onChange={(e) => setPremiumTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={t('dashboard.ticketSubjectPlaceholder')}
                      className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">
                      {t('dashboard.ticketDescription')}
                    </label>
                    <textarea
                      rows={4}
                      value={premiumTicketForm.description}
                      onChange={(e) => setPremiumTicketForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('dashboard.ticketDescPlaceholder')}
                      className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all resize-none"
                    />
                  </div>
                  {/* Contact email — only show if we don't already know it */}
                  {!resolvedTicketEmail && (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        {t('dashboard.ticketEmailLabel')}
                      </label>
                      <input
                        type="email"
                        value={premiumTicketForm.contactEmail}
                        onChange={(e) => setPremiumTicketForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder={t('dashboard.connectEmailPlaceholder')}
                        className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                      />
                    </div>
                  )}
                  {premiumTicketError && (
                    <p className="text-xs text-red-400 ps-1">{premiumTicketError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handlePremiumTicket}
                    disabled={premiumTicketLoading || !premiumTicketForm.subject.trim() || !premiumTicketForm.description.trim() || (!resolvedTicketEmail && !premiumTicketForm.contactEmail.trim())}
                    className="w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {premiumTicketLoading ? (
                      <>
                        <SpinnerIcon className="w-4 h-4" />
                        {t('dashboard.submitting')}
                      </>
                    ) : (
                      t('dashboard.submitTicket')
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ── Export with Suspense boundary ────────────────────────────────────── */

export function SubscribeContent() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg-primary flex items-center justify-center">
          <SpinnerIcon className="w-8 h-8 text-accent-teal" />
        </main>
      }
    >
      <SubscribeInner />
    </Suspense>
  );
}
