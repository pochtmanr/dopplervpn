'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

/* ── Plan data ──────────────────────────────────────────────────────── */

const PLANS = [
  { id: 'monthly', cents: 400, months: 1, save: null, best: false },
  { id: '6month', cents: 2000, months: 6, save: 17, best: false },
  { id: 'yearly', cents: 3500, months: 12, save: 27, best: true },
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

/* ── Checkout content ────────────────────────────────────────────────── */

function CheckoutContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('checkout');

  const accountId = searchParams.get('account_id') || '';
  const initialPlan = (searchParams.get('plan') || 'yearly') as PlanId;

  const [selected, setSelected] = useState<PlanId>(
    PLANS.some((p) => p.id === initialPlan) ? initialPlan : 'yearly'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── Promo state ─────────────────────────────────────────────────── */
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount_percent: number;
    promo_id: string;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  /* ── Promo helpers ───────────────────────────────────────────────── */
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

  /* ── Subscribe ───────────────────────────────────────────────────── */
  const handleSubscribe = async () => {
    if (!accountId) {
      setError(t('invalidAccount'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selected,
          accountId,
          promoId: promoApplied?.promo_id || null,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t('error'));
      }
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = PLANS.find((p) => p.id === selected)!;
  const finalCents = getDiscountedCents(selectedPlan.cents);

  const features = [
    t('feat1'),
    t('feat2'),
    t('feat3'),
    t('feat4'),
    t('feat5'),
  ];

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShieldIcon className="w-6 h-6 text-accent-teal" />
            <span className="text-sm font-semibold tracking-wider uppercase text-accent-teal">
              Doppler VPN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-sm text-text-muted">{t('subtitle')}</p>
        </div>

        {/* ── Account badge ──────────────────────────────────────── */}
        {accountId && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-xs text-text-muted">{t('accountLabel')}:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-overlay/5 border border-overlay/10 text-xs font-mono font-medium text-text-primary">
              {accountId}
            </span>
          </div>
        )}

        {/* ── Plan cards ─────────────────────────────────────────── */}
        <div className="space-y-3 mb-6">
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
                    : 'border-overlay/10 bg-bg-secondary/50 hover:border-overlay/20'
                }`}
              >
                {plan.best && (
                  <span className="absolute -top-2.5 end-4 inline-flex items-center px-2.5 py-0.5 rounded-full bg-accent-teal text-[10px] font-bold uppercase tracking-wider text-white">
                    {t('bestValue')}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Radio indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-accent-teal bg-accent-teal'
                          : 'border-overlay/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
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
                        <span className="text-xs text-text-muted line-through">
                          {originalPrice}
                        </span>
                        <span className="text-lg font-bold text-text-primary">
                          {finalPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-text-primary">
                        {originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Promo code ─────────────────────────────────────────── */}
        <div className="mb-6">
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
                  className="flex-1 rounded-xl border border-overlay/10 bg-bg-secondary/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promoLoading || !promoCode.trim()}
                  className="rounded-xl border border-overlay/10 bg-bg-secondary/50 px-4 py-2.5 text-sm font-medium text-text-primary hover:border-overlay/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {promoLoading ? (
                    <SpinnerIcon className="w-4 h-4" />
                  ) : (
                    t('promoApply')
                  )}
                </button>
              </div>
              {promoError && (
                <p className="text-xs text-red-400 ps-1">{promoError}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Subscribe button ───────────────────────────────────── */}
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={loading || !accountId}
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

        {error && (
          <p className="text-center text-xs text-red-400 mt-3">{error}</p>
        )}

        {/* ── Features ───────────────────────────────────────────── */}
        <div className="mt-8 rounded-xl border border-overlay/10 bg-bg-secondary/50 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            {t('features')}
          </h3>
          <ul className="space-y-2.5">
            {features.map((feat) => (
              <li key={feat} className="flex items-center gap-2.5">
                <CheckIcon className="w-4 h-4 text-accent-teal shrink-0" />
                <span className="text-sm text-text-primary">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Footer links ───────────────────────────────────────── */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-[11px] text-text-muted/60">
            {t('footerNote')}
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-text-muted/50">
            <a
              href="/en/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-muted transition-colors underline underline-offset-2"
            >
              {t('terms')}
            </a>
            <span>&middot;</span>
            <a
              href="/en/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-muted transition-colors underline underline-offset-2"
            >
              {t('privacy')}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Page export (Suspense boundary for useSearchParams) ─────────────── */

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-bg-primary flex items-center justify-center">
          <SpinnerIcon className="w-8 h-8 text-accent-teal" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
