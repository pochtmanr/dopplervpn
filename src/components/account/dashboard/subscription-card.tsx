'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { trackGetPro } from '@/lib/track-cta';
import { ArrowRightIcon, CheckIcon, ChevronBackIcon, ShieldIcon, SparkleIcon, featureIcons } from './icons';
import { CARD, CARD_HAIRLINE } from '@/components/ui/card-recipes';
import { BTN_PRIMARY, BTN_SECONDARY, EYEBROW, ORB } from './ui';

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
}: SubscriptionCardProps) {
  const t = useTranslations('subscribe');

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
