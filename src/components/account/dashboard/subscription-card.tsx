'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { trackGetPro } from '@/lib/track-cta';
import { ArrowRightIcon, CheckIcon, ChevronBackIcon, ShieldIcon, SparkleIcon, featureIcons } from './icons';
import { CARD, CARD_HAIRLINE } from '@/components/ui/card-recipes';
import { publishedRefundPolicyLabel } from '@/lib/support/published-policy';
import { BTN_PRIMARY, BTN_SECONDARY, EYEBROW, ORB } from './ui';
// Calm+ recipes for the `plus` preview branch.
import { CARD_SURFACE } from '@/components/ui/card-recipes';
import { PLANS } from '@/lib/facts';
import { PaymentMarks } from '@/app/[locale]/design-lab/plus/payment-marks';
import { PlusPolicyLinks } from '@/app/[locale]/design-lab/plus/policy-links';
import {
  ArrowGlyph,
  PLUS_BTN,
  PLUS_BTN_SECONDARY,
  PLUS_CHIP,
  PLUS_FOOTER,
  PLUS_FOOTER_BTN,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_LABEL,
  PLUS_META,
  PLUS_TITLE,
} from '@/app/[locale]/design-lab/plus-recipes';

/** Calm+: Current's glass surface, still, with the CTA as a footer attached to the bottom edge. */
const PLUS_SUB_CARD = `${CARD_SURFACE} !rounded-[22px] p-6`;
const DAY_MS = 86_400_000;

/** "214" + "days" in the page locale (Intl plural rules), so the figure needs no message key. */
function dayParts(days: number, locale: string): { value: string; unit: string } {
  const parts = new Intl.NumberFormat(locale, { style: 'unit', unit: 'day', unitDisplay: 'long' }).formatToParts(days);
  return {
    value: parts.filter((p) => p.type === 'integer' || p.type === 'group').map((p) => p.value).join(''),
    unit: parts.find((p) => p.type === 'unit')?.value ?? '',
  };
}

/** The paywall's one big action: DESIGN.md standalone CTA, sized up, pulsing once. */
const PAYWALL_CTA =
  'cta-key group/cta w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary';

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface SubscriptionCardProps {
  locale: string;
  isActivePro: boolean;
  isExpiredPro: boolean;
  expiresAt: string | null;
  showPlans: boolean;
  onShowPlans: (show: boolean) => void;
  onExpressSupport: () => void;
  /** Plan picker, promo and pay button — owned by the page, which owns checkout. */
  plansView: ReactNode;
  /** Calm+ preview, decided on the server (CALM_PLUS_PREVIEW is not a client env). */
  plus?: boolean;
}

export function SubscriptionCard({
  locale,
  isActivePro,
  isExpiredPro,
  expiresAt,
  showPlans,
  onShowPlans,
  onExpressSupport,
  plansView,
  plus = false,
}: SubscriptionCardProps) {
  const t = useTranslations('subscribe');

  if (plus) {
    return (
      <PlusSubscription
        {...{ locale, isActivePro, isExpiredPro, expiresAt, showPlans, onShowPlans, onExpressSupport, plansView }}
      />
    );
  }

  /* ── Active Pro: status + extend / express support ─────────────── */
  if (isActivePro) {
    return (
      <div className="space-y-5">
        <div className={`${CARD} p-6`}>
          <div className={CARD_HAIRLINE} aria-hidden="true" />
          <div className={ORB} />
          <div className="relative space-y-5">
            <h2 className={EYEBROW}>{t('dashboard.subscription')}</h2>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-2xl font-semibold text-text-primary">{t('dashboard.proActive')}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-teal">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-teal-light" aria-hidden="true" />
                    {t('dashboard.active')}
                  </span>
                </div>
                {expiresAt && (
                  <p className="mt-1.5 text-sm text-text-muted">
                    {t('dashboard.activeUntil')} {formatDate(expiresAt, locale)}
                  </p>
                )}
              </div>
              <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-2xl bg-bg-secondary/80 border border-accent-teal/20 text-accent-teal">
                <ShieldIcon className="w-6 h-6" />
              </span>
            </div>

            <div className="h-px bg-overlay/10" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onShowPlans(!showPlans)}
                aria-expanded={showPlans}
                className={BTN_PRIMARY}
              >
                {t('dashboard.extend')}
              </button>
              <button type="button" onClick={onExpressSupport} className={BTN_SECONDARY}>
                {t('dashboard.expressSupport')}
              </button>
            </div>
          </div>
        </div>

        {showPlans && <div className="space-y-5 slide-in-from-right">{plansView}</div>}
      </div>
    );
  }

  /* ── Free / expired: two-slide paywall ──────────────────────────── */
  const features = [t('feat1'), t('feat2'), t('feat3'), t('feat4'), t('feat5'), t('feat6')];

  return (
    // Auto-height wrapper so CARD's h-full doesn't take the whole grid column (see AccountIdCard).
    <div>
      <div className={CARD}>
        <div className={CARD_HAIRLINE} aria-hidden="true" />

        {!showPlans ? (
          <div key="paywall-features" className="relative slide-in-from-left">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-bg-secondary/80 border border-accent-teal/20 text-accent-teal">
                  <ShieldIcon className="w-5 h-5" />
                </span>
                <h2 className="text-2xl font-semibold text-text-primary">{t('dashboard.proActive')}</h2>
              </div>
              {isExpiredPro && expiresAt ? (
                <p className="text-sm font-medium text-accent-amber">
                  {t('dashboard.expiredPro', { date: formatDate(expiresAt, locale) })}
                </p>
              ) : (
                <p className="text-sm text-text-muted">{t('dashboard.freeTier')}</p>
              )}
            </div>

            {/* Serif price — DESIGN.md allows Instrument Serif for price figures. */}
            <div className="px-6 pb-6">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                {t('dashboard.from')}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="text-6xl sm:text-7xl font-semibold text-text-primary tracking-tight leading-none"
                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'normal' }}
                >
                  $3.33
                </span>
                <span className="text-lg sm:text-xl text-text-muted">{t('perMonth')}</span>
              </div>
            </div>

            <ul className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {features.map((feat, i) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-text-primary">
                  <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-bg-secondary/80 border border-accent-teal/20 text-accent-teal">
                    {featureIcons[i] ?? <CheckIcon className="w-4 h-4" />}
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="px-6 pb-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  trackGetPro('account-paywall');
                  onShowPlans(true);
                }}
                className={PAYWALL_CTA}
              >
                <SparkleIcon className="w-5 h-5" />
                {isExpiredPro ? t('dashboard.renewPro') : t('dashboard.getPro')}
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover/cta:translate-x-0.5 rtl:group-hover/cta:-translate-x-0.5" />
              </button>
              <p className="text-xs text-text-tertiary text-center">{t('footerNote')}</p>
              <p className="text-xs text-text-tertiary text-center">{publishedRefundPolicyLabel()}</p>
            </div>
          </div>
        ) : (
          <div key="paywall-plans" className="relative slide-in-from-right">
            <div className="flex items-center gap-3 px-6 pt-6 pb-5">
              <button
                type="button"
                onClick={() => onShowPlans(false)}
                aria-label={t('dashboard.back')}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-overlay/20 bg-bg-primary/40 text-text-primary hover:border-accent-teal/40 hover:bg-accent-teal/10 transition-colors"
              >
                <ChevronBackIcon className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <ShieldIcon className="w-5 h-5 text-accent-teal" />
                <h2 className="text-lg font-semibold text-text-primary">{t('dashboard.proActive')}</h2>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-5">{plansView}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Calm+ preview of both states. Nothing moves inside the card; the days-left bar
 * is still. The paywall slides to the page's plan picker exactly as the shipped one.
 */
function PlusSubscription({
  locale,
  isActivePro,
  isExpiredPro,
  expiresAt,
  showPlans,
  onShowPlans,
  onExpressSupport,
  plansView,
}: Omit<SubscriptionCardProps, 'plus'>) {
  const t = useTranslations('subscribe');

  if (isActivePro) {
    const msLeft = expiresAt ? new Date(expiresAt).getTime() - Date.now() : null;
    const daysLeft = msLeft === null ? null : Math.max(0, Math.round(msLeft / DAY_MS));
    const share = daysLeft === null ? 0 : Math.min(1, daysLeft / (PLANS.annual.months * 30.4));
    const days = daysLeft === null ? null : dayParts(daysLeft, locale);
    return (
      <div className="space-y-5">
        <div className={`${PLUS_SUB_CARD} overflow-hidden`}>
          <div className={CARD_HAIRLINE} aria-hidden="true" />
          <div className="flex items-start gap-4">
            <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
              <ShieldIcon className="h-9 w-9" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className={PLUS_LABEL}>{t('dashboard.subscription')}</h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <p className={PLUS_TITLE}>{t('dashboard.proActive')}</p>
                <span className={`${PLUS_CHIP} bg-(--c-accent-tint) text-(--c-accent)`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {t('dashboard.active')}
                </span>
              </div>
            </div>
          </div>

          {expiresAt && days && (
            <div className="mt-6 rounded-2xl bg-(--c-inset) p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="whitespace-nowrap text-(--c-text)">
                  <span className="plus-num text-4xl tabular-nums">{days.value}</span>
                  <span className="ms-1 text-base font-semibold text-(--c-muted)">{days.unit}</span>
                </span>
                <span className={PLUS_META}>
                  {t('dashboard.activeUntil')} {formatDate(expiresAt, locale)}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--c-bg)" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-(--c-accent-fill) to-(--c-accent)"
                  style={{ width: `${Math.round(share * 100)}%` }}
                />
              </div>
            </div>
          )}

          <PlusPolicyLinks include={['refund', 'restoreCancelRefund', 'webAndStore']} className="mt-5" />

          <div className={`${PLUS_FOOTER} grid grid-cols-1 gap-px bg-(--c-bg) sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2`}>
            <button
              type="button"
              onClick={() => onShowPlans(!showPlans)}
              aria-expanded={showPlans}
              className={`${PLUS_BTN} ${PLUS_FOOTER_BTN}`}
            >
              {t('dashboard.extend')}
              <ArrowGlyph />
            </button>
            <button type="button" onClick={onExpressSupport} className={`${PLUS_BTN_SECONDARY} ${PLUS_FOOTER_BTN}`}>
              {t('dashboard.expressSupport')}
            </button>
          </div>
        </div>

        {showPlans && <div className="space-y-5 slide-in-from-right">{plansView}</div>}
      </div>
    );
  }

  const features = [t('feat1'), t('feat2'), t('feat3'), t('feat4'), t('feat5'), t('feat6')];
  // Flex all the way down: when the dashboard grid stretches this card to the left
  // column's height, the spare room opens above the payment block, not under the CTA.
  return (
    <div className="flex flex-col">
      <div className={`${PLUS_SUB_CARD} flex flex-1 flex-col overflow-hidden`}>
        <div className={CARD_HAIRLINE} aria-hidden="true" />
        {!showPlans ? (
          <div key="paywall-features" className="relative flex flex-1 flex-col slide-in-from-left">
            <div className="flex items-center gap-3">
              <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
                <ShieldIcon className="h-[30px] w-[30px]" />
              </span>
              <div>
                <h2 className={PLUS_TITLE}>{t('dashboard.proActive')}</h2>
                {isExpiredPro && expiresAt ? (
                  <p className="text-sm font-semibold text-(--c-warn)">
                    {t('dashboard.expiredPro', { date: formatDate(expiresAt, locale) })}
                  </p>
                ) : (
                  <p className={PLUS_META}>{t('dashboard.freeTier')}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className={PLUS_META}>{t('dashboard.from')}</span>
              <span className="plus-num text-6xl text-(--c-text)">${PLANS.annual.monthly.toFixed(2)}</span>
              <span className="text-lg font-medium text-(--c-muted)">{t('perMonth')}</span>
            </div>

            <ul className="mt-6 mb-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {features.map((feat, i) => (
                <li key={feat} className="flex items-center gap-3 text-[15px] font-medium text-(--c-text)">
                  <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-[22px] [&_svg]:w-[22px]`}>
                    {featureIcons[i] ?? <CheckIcon className="w-4 h-4" />}
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col items-center gap-2 border-t border-(--c-inset) pt-5 text-center">
              <PaymentMarks />
              <p className={PLUS_META}>{t('footerNote')}</p>
              <p className={PLUS_META}>{publishedRefundPolicyLabel()}</p>
              <PlusPolicyLinks include={['refund', 'webAndStore', 'terms']} className="mt-1 justify-center" />
            </div>

            <div className={PLUS_FOOTER}>
              <button
                type="button"
                onClick={() => {
                  trackGetPro('account-paywall');
                  onShowPlans(true);
                }}
                className={`${PLUS_BTN} ${PLUS_FOOTER_BTN}`}
              >
                <SparkleIcon className="h-5 w-5" />
                {isExpiredPro ? t('dashboard.renewPro') : t('dashboard.getPro')}
                <ArrowGlyph />
              </button>
            </div>
          </div>
        ) : (
          <div key="paywall-plans" className="relative slide-in-from-right">
            <div className="flex items-center gap-3 pb-5">
              <button
                type="button"
                onClick={() => onShowPlans(false)}
                aria-label={t('dashboard.back')}
                className="plus-btn flex h-10 w-10 items-center justify-center rounded-full bg-(--c-inset) text-(--c-text) hover:bg-(--c-accent-tint) hover:text-(--c-accent)"
              >
                <ChevronBackIcon className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
                  <ShieldIcon className="h-6 w-6" />
                </span>
                <h2 className={PLUS_TITLE}>{t('dashboard.proActive')}</h2>
              </div>
            </div>
            <div className="space-y-5">{plansView}</div>
          </div>
        )}
      </div>
    </div>
  );
}
