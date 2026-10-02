import { useTranslations } from 'next-intl';
import { CARD_HAIRLINE, CARD_SURFACE } from '@/components/ui/card-recipes';
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
import { PaymentMarks } from './payment-marks';
import {
  ArrowGlyph,
  PLUS_BODY,
  PLUS_BTN,
  PLUS_BTN_SECONDARY,
  PLUS_CARD,
  PLUS_CARD_HOVER,
  PLUS_CHIP,
  PLUS_FOOTER,
  PLUS_FOOTER_BTN,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_LABEL,
  PLUS_META,
  PLUS_TITLE,
} from '../plus-recipes';

const DAY = 86_400_000;

/** Subscription cards keep Current's glass gradient surface, still, with no motion; the footer is attached. */
const SUB_CARD = `${CARD_SURFACE} !rounded-[22px] p-6`;

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** No motion: a still "active" dot and the time-left bar, on Current's surface. */
export function PlusSubscriptionActive({ locale, expiresAt, now }: { locale: string; expiresAt: string; now: number }) {
  const t = useTranslations('subscribe');
  const daysLeft = Math.max(0, Math.round((new Date(expiresAt).getTime() - now) / DAY));
  const share = Math.min(1, daysLeft / (PLANS.annual.months * 30.4));
  return (
    <div className={SUB_CARD}>
      <div className={CARD_HAIRLINE} aria-hidden="true" />
      <div className="flex items-start gap-4">
        <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
          <ShieldIcon className="h-9 w-9" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={PLUS_LABEL}>{t('dashboard.subscription')}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h3 className={PLUS_TITLE}>{t('dashboard.proActive')}</h3>
            <span className={`${PLUS_CHIP} bg-(--c-accent-tint) text-(--c-accent)`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {t('dashboard.active')}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-(--c-inset) p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="whitespace-nowrap text-(--c-text)">
            <span className="plus-num text-4xl tabular-nums">{daysLeft}</span> <span className="text-base font-semibold text-(--c-muted)">days left</span>
          </span>
          <span className={PLUS_META}>
            {t('dashboard.activeUntil')} {formatDate(expiresAt, locale)}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--c-bg)">
          <div
            className="h-full rounded-full bg-gradient-to-r from-(--c-accent-fill) to-(--c-accent)"
            style={{ width: `${Math.round(share * 100)}%` }}
          />
        </div>
      </div>

      <div className={`${PLUS_FOOTER} grid grid-cols-1 gap-px bg-(--c-bg) sm:grid-cols-2`}>
        <button type="button" className={`${PLUS_BTN} ${PLUS_FOOTER_BTN}`}>
          {t('dashboard.extend')}
          <ArrowGlyph />
        </button>
        <button type="button" className={`${PLUS_BTN_SECONDARY} ${PLUS_FOOTER_BTN}`}>{t('dashboard.expressSupport')}</button>
      </div>
    </div>
  );
}

/** No motion: the renew button is the card's attached footer, on Current's surface. */
export function PlusSubscriptionPaywall({ locale, expiredAt }: { locale: string; expiredAt: string | null }) {
  const t = useTranslations('subscribe');
  const features = [t('feat1'), t('feat2'), t('feat3'), t('feat4'), t('feat5'), t('feat6')];
  return (
    <div className={SUB_CARD}>
      <div className={CARD_HAIRLINE} aria-hidden="true" />
      <div className="flex items-center gap-3">
        <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal}`}>
          <ShieldIcon className="h-[30px] w-[30px]" />
        </span>
        <div>
          <h3 className={PLUS_TITLE}>{t('dashboard.proActive')}</h3>
          {expiredAt ? (
            <p className="text-sm font-semibold text-accent-amber">{t('dashboard.expiredPro', { date: formatDate(expiredAt, locale) })}</p>
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

      <ul className="mt-6 grid grid-cols-1 gap-2.5">
        {features.map((feat, i) => (
          <li key={feat} className="flex items-center gap-3 text-[15px] font-medium text-(--c-text)">
            <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-[22px] [&_svg]:w-[22px]`}>
              {featureIcons[i]}
            </span>
            {feat}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col items-center gap-3 border-t border-(--c-inset) pt-5 text-center">
        <PaymentMarks />
        <p className={PLUS_META}>{t('footerNote')}</p>
      </div>

      <div className={PLUS_FOOTER}>
        <button type="button" className={`${PLUS_BTN} ${PLUS_FOOTER_BTN}`}>
          {expiredAt ? t('dashboard.renewPro') : t('dashboard.getPro')}
          <ArrowGlyph />
        </button>
      </div>
    </div>
  );
}

/** Live element: the ID printed on a dashed plate with a blinking terminal cursor. */
export function PlusAccountId({ accountId, telegram }: { accountId: string; telegram: string | null }) {
  const t = useTranslations('subscribe');
  return (
    <div className={PLUS_CARD}>
      <div className="flex items-center justify-between gap-3">
        <p className={PLUS_LABEL}>{t('accountLabel')}</p>
        <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--c-muted) hover:text-(--c-text)">
          <LogOutIcon className="h-4 w-4 rtl:-scale-x-100" />
          {t('dashboard.logout')}
        </button>
      </div>

      <div className="mt-3 rounded-2xl border border-dashed border-(--c-accent-ring) bg-(--c-bg) px-4 py-4">
        <p className="font-mono text-[11px] text-(--c-tert)" dir="ltr">$ doppler account --id</p>
        <div className="mt-1 flex items-center gap-3">
          <span dir="ltr" className="flex-1 select-all font-mono text-xl font-bold tracking-wide text-(--c-text)">
            {accountId}
            <span className="terminal-cursor ms-1 text-(--c-accent)" aria-hidden="true">▌</span>
          </span>
          <button type="button" aria-label={t('dashboard.copyId')} className="plus-btn flex h-10 w-10 items-center justify-center rounded-full bg-(--c-inset) text-(--c-text) hover:bg-(--c-accent-tint) hover:text-(--c-accent)">
            <CopyIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className={`mt-2 ${PLUS_META}`}>{t('dashboard.accountIdHint')}</p>

      <button type="button" className={`mt-5 w-full ${PLUS_BTN}`}>
        <ShareIcon className="h-4 w-4" />
        {t('dashboard.sendToDevices')}
      </button>

      {telegram && (
        <div className="mt-4 flex items-center gap-2 border-t border-(--c-separator) pt-4 text-sm text-(--c-muted)">
          <TelegramIcon className="h-4 w-4 text-(--c-telegram)" />
          {t('dashboard.telegramLinked')} · <span dir="ltr" className="font-semibold text-(--c-text)">{telegram}</span>
        </div>
      )}
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

/** Live element: a breathing dot on any device seen in the last day. */
export function PlusDevices({ data, now, locale }: { data: AccountDevices; now: number; locale: string }) {
  const t = useTranslations('subscribe');
  return (
    <div className={PLUS_CARD}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className={PLUS_TITLE}>{t('dashboard.devices')}</h3>
        <span className={`${PLUS_CHIP} bg-(--c-inset) text-(--c-muted) tabular-nums`}>
          {t('dashboard.devicesCount', { count: data.devices.length, max: data.maxDevices })}
        </span>
      </div>
      <ul className="space-y-2">
        {data.devices.map((d) => {
          const typeLabel = TYPE_LABELS[d.type ?? ''] ?? d.type ?? '';
          const name = d.name?.trim() || typeLabel;
          const recent = d.lastActiveAt && now - new Date(d.lastActiveAt).getTime() < DAY;
          return (
            <li key={d.createdAt} className="group plus-lift flex items-center gap-3 rounded-2xl bg-(--c-inset) px-3 py-3">
              <span className={`${PLUS_ICON} ${recent ? PLUS_ICON_TONE.teal : PLUS_ICON_TONE.neutral} relative ms-1`}>
                <DeviceTypeIcon type={d.type} className="h-6 w-6" />
                {recent && (
                  <span className="absolute -end-1.5 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-(--c-inset)">
                    <span className="plus-pulse h-2 w-2 rounded-full bg-(--c-accent) text-(--c-accent)" />
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-(--c-text)">
                  {name}
                  {d.isMain && <span className={`ms-2 ${PLUS_CHIP} !py-0.5 bg-(--c-card) text-(--c-muted)`}>{t('dashboard.mainDevice')}</span>}
                </p>
                <p className={`truncate ${PLUS_META}`}>
                  {d.lastActiveAt
                    ? t('dashboard.lastActive', { time: relativeTime(d.lastActiveAt, now, locale) })
                    : t('dashboard.addedOn', { date: formatDate(d.createdAt, locale) })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className={`mt-3 ${PLUS_META}`}>{t('dashboard.manageInApp')}</p>
    </div>
  );
}

export function PlusRestore() {
  const t = useTranslations('subscribe.dashboard');
  return (
    <div className={PLUS_CARD}>
      <h3 className={PLUS_TITLE}>{t('restorePurchases')}</h3>
      <p className={`mt-1 ${PLUS_BODY}`}>{t('restorePurchasesDesc')}</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { label: t('restoreAppStore'), icon: <AppleIcon className="h-5 w-5" /> },
          { label: t('restorePlayStore'), icon: <PlayStoreIcon className="h-5 w-5" /> },
        ].map((s) => (
          <a key={s.label} href="#" className={`${PLUS_CARD_HOVER} !bg-(--c-inset) !p-4`}>
            <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.neutral} [&_svg]:h-6 [&_svg]:w-6`}>{s.icon}</span>
            <span className="mt-3 flex items-center justify-between gap-2 text-[15px] font-bold text-(--c-text)">
              {s.label}
              <ArrowGlyph className="h-4 w-4 text-(--c-tert) group-hover:text-(--c-accent)" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
