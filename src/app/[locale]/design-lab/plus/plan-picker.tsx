'use client';

import { useTranslations } from 'next-intl';
import { CheckIcon, ShieldIcon, SparkleIcon, SpinnerIcon } from '@/components/account/dashboard/icons';
import { PaymentMarks } from './payment-marks';
import { PlusPolicyLinks } from './policy-links';
import { PLUS_BTN, PLUS_BTN_SECONDARY, PLUS_CHIP, PLUS_META } from '../plus-recipes';

export interface PickerPlan {
  id: string;
  cents: number;
  months: number;
  save: number | null;
  best: boolean;
}

/** A filled inset field, no border; the ring only on focus. */
const PLUS_INPUT =
  'w-full rounded-2xl bg-(--c-inset) px-4 py-3 text-[15px] text-(--c-text) placeholder:text-(--c-tert) focus:ring-2 focus:ring-(--c-accent) outline-none transition-shadow';

/**
 * Calm+ plan picker and checkout: inset rows, a teal ring on the chosen plan,
 * serif prices, round segments, the pay pill with the payment marks under it.
 * Presentational: subscribe-content.tsx owns the state, promo and payment calls.
 */
export function PlusPlanPicker({
  plans,
  selected,
  onSelect,
  discounted,
  formatCents,
  perMonth,
  promoApplied,
  onRemovePromo,
  promoCode,
  onPromoChange,
  promoError,
  promoLoading,
  onApplyPromo,
  paymentMethod,
  onPaymentMethod,
  loading,
  onSubscribe,
  finalCents,
  error,
}: {
  plans: readonly PickerPlan[];
  selected: string;
  onSelect: (id: string) => void;
  discounted: (cents: number) => number;
  formatCents: (cents: number) => string;
  perMonth: (cents: number, months: number) => string;
  promoApplied: { code: string; discount_percent: number } | null;
  onRemovePromo: () => void;
  promoCode: string;
  onPromoChange: (code: string) => void;
  promoError: string;
  promoLoading: boolean;
  onApplyPromo: () => void;
  paymentMethod: 'card' | 'crypto';
  onPaymentMethod: (method: 'card' | 'crypto') => void;
  loading: boolean;
  onSubscribe: () => void;
  finalCents: number;
  error: string;
}) {
  const t = useTranslations('subscribe');
  return (
    <>
      <div className="rounded-2xl bg-(--c-accent-tint) p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-[15px] font-bold text-(--c-accent)">
          <SparkleIcon className="w-4 h-4" />
          {t('webBonus.title')}
        </div>
        <p className="text-[13px] leading-relaxed text-(--c-muted)">{t('webBonus.subtitle')}</p>
        <ul className="space-y-1.5 text-[13px] text-(--c-text)">
          {(['monthly', 'sixMonth', 'yearly'] as const).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <CheckIcon className="w-3.5 h-3.5 shrink-0 text-(--c-accent)" />
              {t(`webBonus.${k}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2.5" role="radiogroup">
        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          const discountedCents = discounted(plan.cents);
          const labelMap: Record<string, string> = { monthly: t('monthly'), '6month': t('sixMonth'), yearly: t('yearly') };
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(plan.id)}
              className={`relative w-full rounded-2xl p-4 text-start transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) ${
                isSelected ? 'bg-(--c-inset) ring-2 ring-(--c-accent)' : 'bg-(--c-inset) hover:ring-1 hover:ring-(--c-separator)'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isSelected ? 'bg-(--c-accent-fill)' : 'bg-(--c-card)'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[15px] font-bold text-(--c-text)">{labelMap[plan.id]}</span>
                      {plan.best && (
                        <span className={`${PLUS_CHIP} !py-0.5 bg-(--c-accent-fill) text-white`}>{t('bestValue')}</span>
                      )}
                      {plan.save && (
                        <span className={`${PLUS_CHIP} !py-0.5 bg-(--c-accent-tint) text-(--c-accent)`}>
                          {t('save')} {plan.save}%
                        </span>
                      )}
                    </div>
                    {plan.months > 1 && (
                      <span className={PLUS_META}>
                        {perMonth(discountedCents, plan.months)}
                        {t('perMonth')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline gap-2 text-end">
                  {promoApplied && discountedCents !== plan.cents && (
                    <span className="text-[13px] text-(--c-tert) line-through">{formatCents(plan.cents)}</span>
                  )}
                  <span className="plus-num text-2xl text-(--c-text)">{formatCents(discountedCents)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        {promoApplied ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-(--c-accent-tint) px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-(--c-accent)" />
              <span className="text-sm text-(--c-text)">
                <span className="font-bold">{promoApplied.code}</span> &mdash; {promoApplied.discount_percent}% {t('promoOff')}
              </span>
            </div>
            <button
              type="button"
              onClick={onRemovePromo}
              className="text-[13px] font-semibold text-(--c-muted) underline underline-offset-2 hover:text-(--c-accent) transition-colors"
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
                onChange={(e) => onPromoChange(e.target.value.toUpperCase())}
                placeholder={t('promoPlaceholder')}
                aria-invalid={promoError ? true : undefined}
                className={`${PLUS_INPUT} min-w-0 flex-1 !rounded-full`}
              />
              <button
                type="button"
                onClick={onApplyPromo}
                disabled={promoLoading || !promoCode.trim()}
                className={`${PLUS_BTN_SECONDARY} shrink-0 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {promoLoading ? <SpinnerIcon className="w-4 h-4" /> : t('promoApply')}
              </button>
            </div>
            {promoError && <p role="alert" className="ps-1 text-[13px] text-(--c-danger)">{promoError}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-full bg-(--c-inset) p-1" role="radiogroup">
        {(['card', 'crypto'] as const).map((method) => (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={paymentMethod === method}
            onClick={() => onPaymentMethod(method)}
            className={`flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) ${
              paymentMethod === method ? 'bg-(--c-card) text-(--c-text) shadow-sm' : 'text-(--c-muted) hover:text-(--c-text)'
            }`}
          >
            {method === 'card' ? t('dashboard.card') : t('dashboard.crypto')}
          </button>
        ))}
      </div>

      {paymentMethod === 'crypto' && <p className={`text-center ${PLUS_META}`}>{t('dashboard.cryptoNote')}</p>}

      <button type="button" onClick={onSubscribe} disabled={loading} className={`${PLUS_BTN} w-full !h-12 disabled:opacity-60`}>
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

      {error && <p role="alert" className="text-center text-[13px] text-(--c-danger)">{error}</p>}

      <div className="flex flex-col items-center gap-2 text-center">
        <PaymentMarks />
        <span className="flex items-center gap-1.5 text-[12px] text-(--c-tert)">
          <ShieldIcon className="w-3.5 h-3.5" />
          {paymentMethod === 'crypto' ? t('securedByCrypto') : t('securedBy')}
        </span>
        <PlusPolicyLinks include={['refund', 'terms', 'webAndStore']} className="justify-center" />
      </div>
    </>
  );
}
