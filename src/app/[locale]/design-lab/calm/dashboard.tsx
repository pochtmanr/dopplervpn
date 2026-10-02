import { useTranslations } from 'next-intl';
import type { AccountDevices } from '@/components/account/types';
import {
  AppleIcon,
  CopyIcon,
  DeviceTypeIcon,
  LogOutIcon,
  PlayStoreIcon,
  ShareIcon,
  ShieldIcon,
  TelegramIcon,
  featureIcons,
} from '@/components/account/dashboard/icons';
import { PLANS } from '@/lib/facts';
import {
  CALM_BODY,
  CALM_BTN,
  CALM_BTN_SECONDARY,
  CALM_CARD,
  CALM_CHIP,
  CALM_ICON,
  CALM_LABEL,
  CALM_META,
  CALM_ROW,
  CALM_TITLE,
  TONE,
} from '../calm-recipes';

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function Chevron() {
  return (
    <svg className="h-4 w-4 shrink-0 text-(--c-tert) rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

/** Active Pro: the status is the headline, the date under it, two buttons. */
export function CalmSubscriptionActive({ locale, expiresAt }: { locale: string; expiresAt: string }) {
  const t = useTranslations('subscribe');
  return (
    <div className={CALM_CARD}>
      <div className="flex items-start gap-4">
        <span className={`${CALM_ICON} !h-12 !w-12 ${TONE.teal}`}>
          <ShieldIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={CALM_LABEL}>{t('dashboard.subscription')}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h3 className={CALM_TITLE}>{t('dashboard.proActive')}</h3>
            <span className={`${CALM_CHIP} ${TONE.teal}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {t('dashboard.active')}
            </span>
          </div>
          <p className={`mt-1 ${CALM_BODY}`}>
            {t('dashboard.activeUntil')} {formatDate(expiresAt, locale)}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button type="button" className={CALM_BTN}>{t('dashboard.extend')}</button>
        <button type="button" className={CALM_BTN_SECONDARY}>{t('dashboard.expressSupport')}</button>
      </div>
    </div>
  );
}

/** Free / expired paywall: price in the display face, features as a plain list. */
export function CalmSubscriptionPaywall({ locale, expiredAt }: { locale: string; expiredAt: string | null }) {
  const t = useTranslations('subscribe');
  const features = [t('feat1'), t('feat2'), t('feat3'), t('feat4'), t('feat5'), t('feat6')];
  return (
    <div className={CALM_CARD}>
      <p className={CALM_LABEL}>{t('dashboard.subscription')}</p>
      <h3 className={`mt-0.5 ${CALM_TITLE}`}>{t('dashboard.proActive')}</h3>
      {expiredAt ? (
        <p className="mt-1 text-[15px] font-medium text-accent-amber">{t('dashboard.expiredPro', { date: formatDate(expiredAt, locale) })}</p>
      ) : (
        <p className={`mt-1 ${CALM_BODY}`}>{t('dashboard.freeTier')}</p>
      )}

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className={CALM_META}>{t('dashboard.from')}</span>
        <span className="font-display text-5xl font-semibold tracking-tight text-(--c-text)">${PLANS.annual.monthly.toFixed(2)}</span>
        <span className="text-lg text-(--c-muted)">{t('perMonth')}</span>
      </div>

      <ul className="mt-6 space-y-3">
        {features.map((feat, i) => (
          <li key={feat} className="flex items-center gap-3 text-[15px] text-(--c-text)">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-(--c-accent) [&_svg]:h-5 [&_svg]:w-5">
              {featureIcons[i]}
            </span>
            {feat}
          </li>
        ))}
      </ul>

      <button type="button" className={`mt-7 w-full ${CALM_BTN} !h-12`}>
        {expiredAt ? t('dashboard.renewPro') : t('dashboard.getPro')}
      </button>
      <p className={`mt-3 text-center ${CALM_META}`}>{t('footerNote')}</p>
    </div>
  );
}

/** The ID is the hero, set large in mono on an inset; actions as a quiet row under it. */
export function CalmAccountId({ accountId, telegram }: { accountId: string; telegram: string | null }) {
  const t = useTranslations('subscribe');
  return (
    <div className={CALM_CARD}>
      <p className={CALM_LABEL}>{t('accountLabel')}</p>
      <p className={`mt-1 ${CALM_BODY}`}>{t('dashboard.accountIdHint')}</p>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-(--c-inset) px-4 py-3.5">
        <span dir="ltr" className="flex-1 select-all font-mono text-lg font-semibold tracking-wide text-(--c-text)">
          {accountId}
        </span>
        <button type="button" className={`${CALM_BTN_SECONDARY} !h-9 !px-3.5 !text-sm !bg-(--c-card)`}>
          <CopyIcon className="h-4 w-4" />
          {t('dashboard.copyId')}
        </button>
      </div>

      <button type="button" className={`mt-4 w-full ${CALM_BTN}`}>
        <ShareIcon className="h-4 w-4" />
        {t('dashboard.sendToDevices')}
      </button>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-(--c-separator) pt-4 text-sm">
        {telegram && (
          <span className="inline-flex items-center gap-2 text-(--c-muted)">
            <TelegramIcon className="h-4 w-4 text-(--c-telegram)" />
            <span dir="ltr">{telegram}</span>
          </span>
        )}
        <button type="button" className="ms-auto inline-flex items-center gap-2 font-semibold text-(--c-muted) hover:text-(--c-text)">
          <LogOutIcon className="h-4 w-4 rtl:-scale-x-100" />
          {t('dashboard.logout')}
        </button>
      </div>
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = { ios: 'iOS', android: 'Android', macos: 'macOS', windows: 'Windows' };

function relativeTime(iso: string, now: number, locale: string): string {
  const diffSec = (new Date(iso).getTime() - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [['day', 86_400], ['hour', 3_600], ['minute', 60]];
  for (const [unit, sec] of steps) if (Math.abs(diffSec) >= sec) return rtf.format(Math.round(diffSec / sec), unit);
  return rtf.format(0, 'minute');
}

/** Devices as an inset grouped list: one card, rows split by separators. */
export function CalmDevices({ data, now, locale }: { data: AccountDevices; now: number; locale: string }) {
  const t = useTranslations('subscribe');
  return (
    <div className={CALM_CARD}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className={CALM_TITLE}>{t('dashboard.devices')}</h3>
        <span className={`${CALM_META} tabular-nums`}>
          {t('dashboard.devicesCount', { count: data.devices.length, max: data.maxDevices })}
        </span>
      </div>
      <ul className="overflow-hidden rounded-2xl bg-(--c-inset)">
        {data.devices.map((d, i) => {
          const typeLabel = TYPE_LABELS[d.type ?? ''] ?? d.type ?? '';
          const name = d.name?.trim() || typeLabel;
          return (
            <li key={d.createdAt} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-(--c-separator)' : ''}`}>
              <DeviceTypeIcon type={d.type} className="h-5 w-5 shrink-0 text-(--c-muted)" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-(--c-text)">
                  {name}
                  {d.isMain && <span className={`ms-2 ${CALM_CHIP} !py-0.5 ${TONE.neutral}`}>{t('dashboard.mainDevice')}</span>}
                </p>
                <p className={`truncate ${CALM_META}`}>
                  {d.lastActiveAt
                    ? t('dashboard.lastActive', { time: relativeTime(d.lastActiveAt, now, locale) })
                    : t('dashboard.addedOn', { date: formatDate(d.createdAt, locale) })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className={`mt-3 ${CALM_META}`}>{t('dashboard.manageInApp')}</p>
    </div>
  );
}

export function CalmRestore() {
  const t = useTranslations('subscribe.dashboard');
  return (
    <div className={CALM_CARD}>
      <h3 className={CALM_TITLE}>{t('restorePurchases')}</h3>
      <p className={`mt-1 ${CALM_BODY}`}>{t('restorePurchasesDesc')}</p>
      <div className="mt-4 space-y-2">
        <a href="#" className={`${CALM_ROW} transition-[filter] hover:brightness-110`}>
          <AppleIcon className="h-5 w-5 text-(--c-text)" />
          <span className="flex-1 text-[15px] font-semibold text-(--c-text)">{t('restoreAppStore')}</span>
          <Chevron />
        </a>
        <a href="#" className={`${CALM_ROW} transition-[filter] hover:brightness-110`}>
          <PlayStoreIcon className="h-5 w-5 text-(--c-text)" />
          <span className="flex-1 text-[15px] font-semibold text-(--c-text)">{t('restorePlayStore')}</span>
          <Chevron />
        </a>
      </div>
    </div>
  );
}
