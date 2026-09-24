'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { RevolutCheckoutInstance } from '@revolut/checkout';
import { trackCheckoutStarted } from '@/lib/track-cta';
import { readConsentFlags } from '@/components/cookie-consent';
import { AuthPanel, type AuthResult } from '@/components/account/auth-panel';
import { WelcomeModal } from '@/components/account/welcome-modal';
import { PageLoader } from '@/components/ui/page-loader';
import type { AccountDevices, AccountInfo } from '@/components/account/types';
import { AccountIdCard } from '@/components/account/dashboard/account-id-card';
import { ContactsCard } from '@/components/account/dashboard/contacts-card';
import { DashboardDialog } from '@/components/account/dashboard/dashboard-dialog';
import { DevicesCard } from '@/components/account/dashboard/devices-card';
import { EveryDeviceBand } from '@/components/account/dashboard/every-device-band';
import { RestoreCard } from '@/components/account/dashboard/restore-card';
import { SubscriptionCard } from '@/components/account/dashboard/subscription-card';
import {
  CheckIcon,
  CloseIcon,
  ShieldIcon,
  SparkleIcon,
  SpinnerIcon,
  WarningIcon,
} from '@/components/account/dashboard/icons';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, INPUT } from '@/components/account/dashboard/ui';
import { CARD_TITLE, DELETE_TILE } from '@/components/ui/card-recipes';

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

/* ── Subscribe content ───────────────────────────────────────────────── */

function SubscribeInner() {
  const t = useTranslations('subscribe');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ── Revolut checkout ref ──────────────────────────────────────── */
  const revolutLoaderRef = useRef<((token: string, mode?: 'prod' | 'sandbox') => Promise<RevolutCheckoutInstance>) | null>(null);

  useEffect(() => {
    import('@revolut/checkout').then((mod) => {
      revolutLoaderRef.current = mod.default;
    });
  }, []);

  /* ── Hydration gate ────────────────────────────────────────────── */
  // The saved account id lives in localStorage, which only exists after mount.
  // Deciding between the auth panel and the dashboard before we have read it
  // flashes the signup UI at people who are already logged in, so until this
  // flips we render a skeleton and commit to neither. It must be set from an
  // effect — reading localStorage during render would mismatch the server HTML.
  const [hydrated, setHydrated] = useState(false);

  /* ── Step state ────────────────────────────────────────────────── */
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [accountId, setAccountId] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [existingAccount, setExistingAccount] = useState(false);

  /* ── Dashboard state ─────────────────────────────────────────── */
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [accountError, setAccountError] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  // Bumped by the Account card's "Connect email"; ContactsCard opens its field on change.
  const [emailRequest, setEmailRequest] = useState(0);

  /* ── Devices state ────────────────────────────────────────────── */
  const [devices, setDevices] = useState<AccountDevices | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState(false);

  /* ── Delete account state ─────────────────────────────────────── */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletedNotice, setDeletedNotice] = useState(false);

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
    // Both branches are decided now — release the gate.
    setHydrated(true);
  }, []);

  /* ── Welcome modal, once, when arriving from /signup ─────────── */
  useEffect(() => {
    if (searchParams.get('welcome') !== '1') return;
    if (!localStorage.getItem('doppler_account_id')) return;
    // The restore effect above marks every saved id as "existing", which would
    // hide the save-your-ID banner behind the modal for a brand-new account.
    setMode('new');
    setExistingAccount(false);
    setShowWelcome(true);
    // Drop the flag so a refresh does not reopen the modal.
    router.replace(`/${locale}/account`);
  }, [searchParams, router, locale]);

  /* ── Devices: load whenever the dashboard has an account ─────── */
  useEffect(() => {
    if (step === 2 && accountId) fetchDevices(accountId);
  }, [step, accountId]);

  /* ── Derived: what email does this user have? ────────────────── */
  const knownEmail = accountInfo?.contactMethod === 'email' ? accountInfo.contactValue : null;

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
    setAccountError(false);
    try {
      const res = await fetch(`/api/subscribe/account-info?account_id=${encodeURIComponent(accId)}`);
      if (!res.ok) throw new Error(`account-info responded ${res.status}`);
      const data = await res.json();
      setAccountInfo(data);
    } catch {
      // Say so. A dashboard with no data and no explanation reads as broken,
      // and the visitor has no way to know a retry is all it needs.
      setAccountError(true);
    } finally {
      setDashboardLoading(false);
    }
  };

  /* ── Fetch devices ───────────────────────────────────────────── */
  // Separate from account-info so a failure here costs one card, not the page.
  const fetchDevices = async (accId: string) => {
    setDevicesLoading(true);
    setDevicesError(false);
    try {
      const res = await fetch(`/api/account/devices?account_id=${encodeURIComponent(accId)}`);
      if (!res.ok) throw new Error(`devices responded ${res.status}`);
      setDevices(await res.json());
    } catch {
      setDevicesError(true);
    } finally {
      setDevicesLoading(false);
    }
  };

  /* ── Step 1 complete: AuthPanel identified the user ───────────── */
  const handleAuthSuccess = (result: AuthResult) => {
    setDeletedNotice(false);
    setAccountId(result.accountId);
    setMode(result.isNew ? 'new' : 'existing');
    setExistingAccount(false);
    setStep(2);
    // The "existing account" path already fetched the account during lookup;
    // a freshly minted one has nothing to show yet.
    if (result.accountInfo) {
      setAccountInfo(result.accountInfo);
    } else {
      fetchAccountInfo(result.accountId);
    }
    if (result.isNew) setShowWelcome(true);
  };

  /* ── Contact saved (from ContactsCard) ───────────────────────── */
  const handleContactSaved = () => {
    setContactSaved(true);
    fetchAccountInfo(accountId);
    setTimeout(() => setContactSaved(false), 3000);
  };

  /* ── Logout ──────────────────────────────────────────────────── */
  const handleLogout = () => {
    localStorage.removeItem('doppler_account_id');
    setStep(1);
    setAccountId('');
    setAccountInfo(null);
    setDevices(null);
    setShowPlans(false);
    setExistingAccount(false);
    setPromoApplied(null);
    setPromoCode('');
    setContactSaved(false);
  };

  /* ── Delete account (free accounts only — pro goes via support) ── */
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(
          data.error === 'active_subscription'
            ? t('dashboard.deleteProSupportNote')
            : t('error'),
        );
        return;
      }
      setDeleteModalOpen(false);
      handleLogout();
      setDeletedNotice(true);
    } catch {
      setDeleteError(t('error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ── Submit premium ticket ────────────────────────────────────── */
  const resolvedTicketEmail = knownEmail || '';

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
    // Report what the visitor is actually about to be charged — the promo
    // discount applies here, so the list price would overstate the funnel.
    const startedCents = getDiscountedCents(
      PLANS.find((p) => p.id === selected)?.cents ?? 0,
    );
    trackCheckoutStarted(
      selected,
      paymentMethod,
      !!promoApplied,
      locale,
      startedCents / 100,
    );
    setLoading(true);
    setError('');

    const normalizedAccountId = accountId.trim().toUpperCase();

    try {
      if (paymentMethod === 'crypto') {
        const res = await fetch('/api/oxapay/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: normalizedAccountId,
            plan_id: selected,
            email: knownEmail || undefined,
            locale,
            consent: readConsentFlags(),
            ...(promoApplied ? { promo_code: promoApplied.code, promo_id: promoApplied.promo_id } : {}),
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
        consent: readConsentFlags(),
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

  const isActivePro = accountInfo?.tier === 'pro';
  // Expired pro: rawTier was pro/premium but effective tier is free (server already computed)
  const isExpiredPro = !isActivePro && accountInfo?.rawTier === 'pro';

  /* ── Plans view (slide 2 of the paywall, and the Pro extend flow) ─ */
  const plansView = (
    <>
      {/* Web bonus notice — be honest: no 3-day trial on web, bonus days instead. */}
      <div className="rounded-xl border border-accent-teal/25 bg-accent-teal/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent-teal">
          <SparkleIcon className="w-4 h-4" />
          {t('webBonus.title')}
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          {t('webBonus.subtitle')}
        </p>
        <ul className="text-xs text-text-primary space-y-1.5">
          {(['monthly', 'sixMonth', 'yearly'] as const).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <CheckIcon className="w-3.5 h-3.5 text-accent-teal shrink-0" />
              {t(`webBonus.${k}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* Plan cards */}
      <div className="space-y-3" role="radiogroup">
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
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(plan.id as PlanId)}
              className={`relative w-full rounded-xl border p-4 text-start transition-colors ${
                isSelected
                  ? 'border-accent-teal bg-accent-teal/10 ring-1 ring-accent-teal/40'
                  : 'border-overlay/15 bg-bg-primary/40 hover:border-accent-teal/40'
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
                      isSelected ? 'border-accent-teal bg-accent-teal' : 'border-overlay/30'
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
          <div className="flex items-center justify-between rounded-xl border border-accent-teal/25 bg-accent-teal/10 px-4 py-3">
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
              className="text-xs font-medium text-text-primary underline underline-offset-2 hover:text-accent-teal transition-colors"
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
                className={`${INPUT} flex-1`}
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoLoading || !promoCode.trim()}
                className={BTN_SECONDARY}
              >
                {promoLoading ? <SpinnerIcon className="w-4 h-4" /> : t('promoApply')}
              </button>
            </div>
            {promoError && <p className="text-xs text-danger ps-1">{promoError}</p>}
          </div>
        )}
      </div>

      {/* Payment method selector */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-bg-primary/40 border border-overlay/15" role="radiogroup">
        {(['card', 'crypto'] as const).map((method) => (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={paymentMethod === method}
            onClick={() => { setPaymentMethod(method); setError(''); }}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              paymentMethod === method
                ? 'bg-accent-teal text-white'
                : 'text-text-primary hover:bg-overlay/5'
            }`}
          >
            {method === 'card' ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25h4.5a2.25 2.25 0 010 4.5H9m0 0h5a2.25 2.25 0 010 4.5H9m0-9v9m2-9V6m0 13.5V18" />
              </svg>
            )}
            {method === 'card' ? t('dashboard.card') : t('dashboard.crypto')}
          </button>
        ))}
      </div>

      {paymentMethod === 'crypto' && (
        <p className="text-xs text-text-muted text-center">{t('dashboard.cryptoNote')}</p>
      )}

      {/* Subscribe button */}
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className={`${BTN_PRIMARY} w-full`}
      >
        {loading ? (
          <>
            <SpinnerIcon className="w-4 h-4" />
            {t('processing')}
          </>
        ) : paymentMethod === 'crypto' ? (
          t('dashboard.payWithCrypto', { price: formatCents(finalCents) })
        ) : (
          <>
            {t('subscribe')} &mdash; {formatCents(finalCents)}
          </>
        )}
      </button>

      {error && <p className="text-center text-xs text-danger">{error}</p>}

      {/* Secured by ... */}
      <div className="flex items-center justify-center gap-1.5 text-text-tertiary">
        <ShieldIcon className="w-3.5 h-3.5" />
        <span className="text-[11px]">
          {paymentMethod === 'crypto' ? t('securedByCrypto') : t('securedBy')}
        </span>
      </div>
    </>
  );

  // The free paywall is the tallest card, so devices balance the account column
  // there; with Pro the status card is short, so devices sit under it instead.
  const devicesCard = (
    <DevicesCard
      locale={locale}
      data={devices}
      loading={devicesLoading}
      error={devicesError}
      onRetry={() => fetchDevices(accountId)}
    />
  );

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary pt-24">

      {/* ── Loading: before hydration, then while the dashboard fetches.
           One element in one place, so the orb keeps turning across the
           hand-off instead of restarting. ─────────────────────────────── */}
      {(!hydrated || (step === 2 && dashboardLoading)) && <PageLoader />}

      {/* ── Step 1: Identify ─────────────────────────────────────── */}
      {hydrated && step === 1 && (
        <AuthPanel
          title={t('title')}
          subtitle={t('subtitle')}
          deletedNotice={deletedNotice}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* ── Step 2: Account Dashboard ────────────────────────────── */}
      {hydrated && step === 2 && !dashboardLoading && (
        <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {(
            <>
              {/* ── Dashboard header ─────────────────────────────── */}
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">
                {t('dashboard.title')}
              </h1>

              {/* ── Save your ID warning for new accounts ──────── */}
              {!existingAccount && mode === 'new' && (
                <div className="mb-5 rounded-2xl border border-accent-amber/30 bg-accent-amber/10 px-5 py-4 flex items-start gap-3">
                  <WarningIcon className="w-5 h-5 text-accent-amber mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t('saveWarning')}</p>
                    <p className="text-sm text-text-muted mt-0.5">{t('saveWarningDetail')}</p>
                  </div>
                </div>
              )}

              {/* ── Existing account notice ───────────────────────── */}
              {existingAccount && (
                <div className="mb-5 rounded-2xl border border-accent-teal/25 bg-accent-teal/10 px-5 py-4 flex items-start gap-3">
                  <CheckIcon className="w-5 h-5 text-accent-teal mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t('accountFound')}</p>
                    <p className="text-sm text-text-muted mt-0.5">{t('accountFoundNote')}</p>
                  </div>
                </div>
              )}

              {/* ── Contact saved toast ───────────────────────────── */}
              {contactSaved && (
                <div className="mb-5 rounded-2xl border border-accent-teal/25 bg-accent-teal/10 px-5 py-3 flex items-center gap-2" role="status">
                  <CheckIcon className="w-4 h-4 text-accent-teal" />
                  <p className="text-sm font-semibold text-text-primary">{t('dashboard.contactSaved')}</p>
                </div>
              )}

              {/* ── Account info failed to load ───────────────────── */}
              {accountError && (
                <div className="mb-5 rounded-2xl border border-danger/30 bg-danger/[0.08] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <WarningIcon className="w-5 h-5 text-danger shrink-0" />
                  <p className="flex-1 text-sm text-text-primary text-start">{t('error')}</p>
                  <button type="button" onClick={() => fetchAccountInfo(accountId)} className={BTN_DANGER}>
                    {t('retry')}
                  </button>
                </div>
              )}

              {/* ── 2-column grid ─────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* ── Left column: account ─────────────────────── */}
                <div className="lg:col-span-3 space-y-5">
                  <AccountIdCard
                    accountId={accountId}
                    locale={locale}
                    accountInfo={accountInfo}
                    isActivePro={isActivePro}
                    unsavedId={!existingAccount && mode === 'new'}
                    onLogout={handleLogout}
                    onDeleteRequest={() => { setDeleteModalOpen(true); setDeleteError(''); }}
                    onConnectEmail={() => setEmailRequest((n) => n + 1)}
                    onShowContacts={() => {
                      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                      document.getElementById('contacts')?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
                    }}
                  />

                  {!isActivePro && devicesCard}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                    <ContactsCard accountId={accountId} accountInfo={accountInfo} onSaved={handleContactSaved} emailRequest={emailRequest} />
                    <RestoreCard />
                  </div>

                </div>

                {/* ── Right column: subscription ───────────────── */}
                <div className="lg:col-span-2 space-y-5">
                  <SubscriptionCard
                    locale={locale}
                    isActivePro={isActivePro}
                    isExpiredPro={isExpiredPro}
                    expiresAt={accountInfo?.expiresAt ?? null}
                    showPlans={showPlans}
                    onShowPlans={setShowPlans}
                    onExpressSupport={() => {
                      setPremiumTicketOpen(true);
                      setPremiumTicketSuccess(null);
                      setPremiumTicketError('');
                    }}
                    plansView={plansView}
                  />

                  {isActivePro && devicesCard}
                </div>
              </div>

              {/* ── Doppler VPN on every device ───────────────────── */}
              <EveryDeviceBand maxDevices={devices?.maxDevices ?? 10} />

              {/* Footer links */}
              <div className="text-center space-y-2 pt-6">
                <p className="text-xs text-text-tertiary">{t('footerNote')}</p>
                <div className="flex items-center justify-center gap-3 text-xs text-text-tertiary">
                  <a
                    href={`/${locale}/terms`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-text-primary transition-colors underline underline-offset-2"
                  >
                    {t('terms')}
                  </a>
                  <span aria-hidden="true">&middot;</span>
                  <a
                    href={`/${locale}/privacy`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-text-primary transition-colors underline underline-offset-2"
                  >
                    {t('privacy')}
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Delete Account Confirmation Modal ──────────────────── */}
      {deleteModalOpen && (
        <DashboardDialog
          labelledBy="delete-title"
          onClose={() => setDeleteModalOpen(false)}
          locked={deleteLoading}
          width="sm:max-w-md"
          className="p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className={DELETE_TILE}>
              <WarningIcon className="w-5 h-5" />
            </div>
            <h2 id="delete-title" className={CARD_TITLE}>
              {t('dashboard.deleteConfirmTitle')}
            </h2>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            {t('dashboard.deleteConfirmBody')}
          </p>
          <p className="font-mono text-sm font-bold text-text-primary tracking-wide" dir="ltr">{accountId}</p>
          {deleteError && (
            <p className="text-xs text-danger">{deleteError}</p>
          )}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="w-full rounded-xl bg-danger hover:bg-danger/85 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {deleteLoading ? <SpinnerIcon className="w-4 h-4" /> : t('dashboard.deleteConfirm')}
            </button>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteLoading}
              className={`${BTN_SECONDARY} w-full`}
              // The safe choice takes focus, so Enter on open never deletes.
              autoFocus
            >
              {t('dashboard.deleteCancel')}
            </button>
          </div>
        </DashboardDialog>
      )}

      {/* ── Premium Support Modal ──────────────────────────────── */}
      {premiumTicketOpen && (
        <DashboardDialog
          labelledBy="ticket-title"
          onClose={() => setPremiumTicketOpen(false)}
          width="sm:max-w-lg"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="ticket-title" className="text-lg font-semibold text-text-primary">
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
              aria-label={t('dashboard.close')}
              className="p-2 rounded-lg hover:bg-overlay/10 text-text-muted hover:text-text-primary transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {premiumTicketSuccess ? (
              <div className="text-center py-8 space-y-4">
                <CheckIcon className="w-12 h-12 text-accent-teal mx-auto" />
                <h3 className="text-lg font-semibold text-text-primary">
                  {t('dashboard.ticketCreated')}
                </h3>
                <p className="text-sm text-text-muted">
                  {t('dashboard.ticketCreatedDesc', { ticketNumber: premiumTicketSuccess })}
                </p>
                <button
                  type="button"
                  onClick={() => setPremiumTicketOpen(false)}
                  className={`${BTN_PRIMARY} mt-4 w-full`}
                >
                  {t('dashboard.close')}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label htmlFor="ticket-subject" className="block text-xs font-medium text-text-muted mb-1.5">
                    {t('dashboard.ticketSubject')}
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    value={premiumTicketForm.subject}
                    onChange={(e) => setPremiumTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder={t('dashboard.ticketSubjectPlaceholder')}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="ticket-description" className="block text-xs font-medium text-text-muted mb-1.5">
                    {t('dashboard.ticketDescription')}
                  </label>
                  <textarea
                    id="ticket-description"
                    rows={4}
                    value={premiumTicketForm.description}
                    onChange={(e) => setPremiumTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('dashboard.ticketDescPlaceholder')}
                    className={`${INPUT} resize-none`}
                  />
                </div>
                {/* Contact email — only show if we don't already know it */}
                {!resolvedTicketEmail && (
                  <div>
                    <label htmlFor="ticket-email" className="block text-xs font-medium text-text-muted mb-1.5">
                      {t('dashboard.ticketEmailLabel')}
                    </label>
                    <input
                      id="ticket-email"
                      type="email"
                      value={premiumTicketForm.contactEmail}
                      onChange={(e) => setPremiumTicketForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder={t('dashboard.connectEmailPlaceholder')}
                      className={INPUT}
                    />
                  </div>
                )}
                {premiumTicketError && (
                  <p className="text-xs text-danger ps-1">{premiumTicketError}</p>
                )}
                <button
                  type="button"
                  onClick={handlePremiumTicket}
                  disabled={premiumTicketLoading || !premiumTicketForm.subject.trim() || !premiumTicketForm.description.trim() || (!resolvedTicketEmail && !premiumTicketForm.contactEmail.trim())}
                  className={`${BTN_PRIMARY} w-full`}
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
        </DashboardDialog>
      )}
      {showWelcome && accountId && (
        <WelcomeModal
          accountId={accountId}
          onClose={() => setShowWelcome(false)}
        />
      )}
    </main>
  );
}

/* ── Export with Suspense boundary ────────────────────────────────────── */

export function SubscribeContent() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg-primary text-text-primary pt-24">
          <PageLoader />
        </main>
      }
    >
      <SubscribeInner />
    </Suspense>
  );
}
