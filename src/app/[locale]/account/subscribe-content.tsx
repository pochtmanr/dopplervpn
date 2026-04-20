'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { RevolutCheckoutInstance } from '@revolut/checkout';
import { trackGetPro } from '@/lib/track-cta';

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

function SparkleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

/* ── Feature icons (match landing pricing section) ──────────────────── */
const featureIcons: React.ReactNode[] = [
  // feat1 — premium servers
  <svg key="f1" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
  </svg>,
  // feat2 — smart route
  <svg key="f2" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>,
  // feat3 — always on
  <svg key="f3" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>,
  // feat4 — devices
  <svg key="f4" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
  </svg>,
  // feat5 — no logs
  <svg key="f5" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>,
  // feat6 — priority support
  <svg key="f6" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>,
];

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

  /* ── Plan & checkout state ─────────────────────────────────────── */
  const [selected, setSelected] = useState<PlanId>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
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
    trackGetPro('account-subscribe');
    setLoading(true);
    setError('');

    const normalizedAccountId = accountId.trim().toUpperCase();

    try {
      if (paymentMethod === 'crypto') {
        // Crypto flow — create OxaPay invoice and redirect to hosted payment page.
        // Promo codes are not yet wired through the OxaPay route; ignore silently.
        const res = await fetch('/api/oxapay/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: normalizedAccountId,
            plan_id: selected,
            email: knownEmail || undefined,
            locale,
          }),
        });
        const data = await res.json();

        if (!res.ok || !data.payment_url) {
          setError(data.error || t('error'));
          return;
        }

        window.location.href = data.payment_url;
        return;
      }

      // Card flow — Revolut
      const body = {
        account_id: normalizedAccountId,
        plan_id: selected,
        email: knownEmail || '',
        locale,
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

      if (!revolutLoaderRef.current) {
        setError('Payment system not ready. Please refresh and try again.');
        return;
      }

      const instance = await revolutLoaderRef.current(data.order_token, data.mode || 'sandbox');

      const orderId: string = data.order_id;
      const successParams = new URLSearchParams({
        order_id: orderId,
        plan: selected,
        account_id: body.account_id,
        provider: 'revolut',
      });

      instance.payWithPopup({
        onSuccess: () => {
          window.location.href = `/${locale}/checkout/success?${successParams.toString()}`;
        },
        onError: (err) => {
          const errParams = new URLSearchParams(successParams);
          errParams.set('reason', err?.message || 'card_field_error');
          window.location.href = `/${locale}/checkout/success?${errParams.toString()}`;
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

  /* ── Plans view (reused as "slide 2" inside paywall card) ─────── */
  const plansView = (
    <>
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
                      isSelected ? 'border-accent-teal bg-accent-teal' : 'border-overlay/20'
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
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
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

      {/* Payment method selector */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-bg-secondary/40 border border-overlay/10">
        <button
          type="button"
          onClick={() => { setPaymentMethod('card'); setError(''); }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
            paymentMethod === 'card'
              ? 'bg-accent-teal text-white'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
          Card
        </button>
        <button
          type="button"
          onClick={() => { setPaymentMethod('crypto'); setError(''); }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
            paymentMethod === 'crypto'
              ? 'bg-accent-teal text-white'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25h4.5a2.25 2.25 0 010 4.5H9m0 0h5a2.25 2.25 0 010 4.5H9m0-9v9m2-9V6m0 13.5V18" />
          </svg>
          Crypto
        </button>
      </div>

      {paymentMethod === 'crypto' && (
        <p className="text-xs text-text-muted text-center">
          Pay with BTC, ETH, USDT, and USDC. You&apos;ll be redirected to OxaPay.
        </p>
      )}

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
        ) : paymentMethod === 'crypto' ? (
          <>Pay with crypto &mdash; {formatCents(finalCents)}</>
        ) : (
          <>
            {t('subscribe')} &mdash; {formatCents(finalCents)}
          </>
        )}
      </button>

      {error && <p className="text-center text-xs text-red-400">{error}</p>}

      {/* Secured by ... */}
      <div className="flex items-center justify-center gap-1.5">
        <ShieldIcon className="w-3.5 h-3.5 text-text-muted/50" />
        <span className="text-[11px] text-text-muted/50">
          {paymentMethod === 'crypto' ? 'Secured by OxaPay' : t('securedBy')}
        </span>
      </div>
    </>
  );

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
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-accent-gold/15 bg-accent-gold/[0.03] px-4 py-3 text-sm font-medium text-accent-gold/75 hover:text-accent-gold hover:border-accent-gold/30 hover:bg-accent-gold/[0.07] transition-colors"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      {t('dashboard.logout')}
                    </button>

                    <a
                      href={`/${locale}/support#delete-account`}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-danger/20 bg-danger/[0.04] px-4 py-3 text-sm font-medium text-danger/75 hover:text-danger hover:border-danger/35 hover:bg-danger/[0.08] transition-colors"
                    >
                      {t('dashboard.deleteAccount')}
                    </a>

                    {isActivePro && (
                      <p className="text-xs text-text-tertiary px-1 leading-relaxed">
                        {t('dashboard.deleteProSupportNote')}
                      </p>
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
                    /* ── Paywall-style card — two-slide layout ──── */
                    <div className="relative rounded-2xl border border-accent-teal/20 bg-gradient-to-br from-accent-teal/5 via-bg-secondary/60 to-accent-gold/[0.03] overflow-hidden">
                      {/* Top accent line */}
                      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />

                      {!showPlans ? (
                        /* ── Slide 1: Features + Get Pro CTA ───── */
                        <div key="paywall-features" className="slide-in-from-left">
                          {/* Header */}
                          <div className="px-6 pt-6 pb-4">
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

                          {/* Price — left-aligned serif, matches landing pricing */}
                          <div className="px-6 pb-6">
                            <div className="flex flex-col items-start gap-1.5">
                              <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                                from
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span
                                  className="text-6xl sm:text-7xl font-semibold text-text-primary tracking-tight leading-none"
                                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'normal' }}
                                >
                                  $3.33
                                </span>
                                <span className="text-lg sm:text-xl text-text-muted">{t('perMonth')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Features list — gradient teal icon boxes */}
                          <div className="px-6 pb-6">
                            <ul className="space-y-3">
                              {features.map((feat, i) => (
                                <li key={feat} className="flex items-center gap-3 text-text-primary text-sm">
                                  <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-teal/20 to-accent-teal/5 border border-accent-teal/25 text-accent-teal flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                                    {featureIcons[i] ?? <CheckIcon className="w-4 h-4" />}
                                  </span>
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* CTA — matches landing plusCta: shine, sparkle, arrow */}
                          <div className="px-6 pb-6 space-y-3">
                            <button
                              type="button"
                              onClick={() => { trackGetPro('account-paywall'); setShowPlans(true); }}
                              className="group relative w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base sm:text-lg font-semibold bg-accent-teal text-white shadow-[0_10px_30px_-10px_rgba(0,140,140,0.45)] hover:shadow-[0_12px_36px_-10px_rgba(0,140,140,0.6)] transition-shadow duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                            >
                              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent rtl:scale-x-[-1]" />
                              <SparkleIcon className="w-5 h-5 relative" />
                              <span className="relative">
                                {isExpiredPro ? t('dashboard.renewPro') : t('dashboard.getPro')}
                              </span>
                              <ArrowRightIcon className="w-5 h-5 relative transition-transform duration-200 group-hover:translate-x-1" />
                            </button>
                            <p className="text-xs text-text-muted/60 text-center">{t('footerNote')}</p>
                          </div>
                        </div>
                      ) : (
                        /* ── Slide 2: Plans, promo, subscribe ───── */
                        <div key="paywall-plans" className="slide-in-from-right">
                          {/* Header with back arrow */}
                          <div className="flex items-center gap-3 px-6 pt-6 pb-5">
                            <button
                              type="button"
                              onClick={() => setShowPlans(false)}
                              aria-label="Back"
                              className="flex items-center justify-center w-9 h-9 rounded-full border border-overlay/10 bg-bg-secondary/40 text-text-muted hover:text-text-primary hover:border-overlay/25 transition-colors"
                            >
                              <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                              </svg>
                            </button>
                            <div className="flex items-center gap-2">
                              <ShieldIcon className="w-5 h-5 text-accent-teal" />
                              <h3 className="text-lg font-bold text-text-primary">{t('dashboard.proActive')}</h3>
                            </div>
                          </div>

                          <div className="px-6 pb-6 space-y-5">
                            {plansView}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Plan cards (Active Pro extend flow only) ─── */}
                  {showPlans && isActivePro && (
                    <div className="space-y-5 slide-in-from-right">
                      {plansView}
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
