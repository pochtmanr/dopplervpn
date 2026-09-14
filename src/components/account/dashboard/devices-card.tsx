'use client';

import { useTranslations } from 'next-intl';
import type { AccountDevices } from '../types';
import { DeviceTypeIcon, WarningIcon } from './icons';
import { EYEBROW, ICON_TILE, PLAIN_CARD } from './ui';

const TYPE_LABELS: Record<string, string> = {
  ios: 'iOS',
  android: 'Android',
  macos: 'macOS',
  windows: 'Windows',
  chrome: 'Chrome',
  firefox: 'Firefox',
  web: 'Web',
};

/** "3 hours ago" in the page locale, no message keys needed. */
function relativeTime(iso: string, locale: string): string {
  const diffSec = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, sec] of steps) {
    if (Math.abs(diffSec) >= sec) return rtf.format(Math.round(diffSec / sec), unit);
  }
  return rtf.format(0, 'minute');
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface DevicesCardProps {
  locale: string;
  data: AccountDevices | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

/**
 * Read-only on purpose. A remove button here would act on the Account ID alone
 * and would not revoke the device's token, so removal stays in the apps.
 */
export function DevicesCard({ locale, data, loading, error, onRetry }: DevicesCardProps) {
  const t = useTranslations('subscribe');

  return (
    <div className={`${PLAIN_CARD} p-5`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className={EYEBROW}>{t('dashboard.devices')}</h2>
        {data && (
          <span className="rounded-full border border-accent-teal/25 bg-accent-teal/10 px-2.5 py-0.5 text-xs font-semibold text-accent-teal tabular-nums">
            {t('dashboard.devicesCount', { count: data.devices.length, max: data.maxDevices })}
          </span>
        )}
      </div>

      {loading && !data && (
        <div className="space-y-2 animate-pulse" role="status" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-overlay/5 bg-bg-primary/40 p-3">
              <div className="h-9 w-9 rounded-xl bg-overlay/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 rounded-md bg-overlay/10" />
                <div className="h-3 w-20 rounded-md bg-overlay/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !data && (
        <div className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/[0.06] px-3.5 py-3">
          <WarningIcon className="w-4 h-4 shrink-0 text-danger" />
          <p className="flex-1 text-sm text-text-primary">{t('dashboard.devicesError')}</p>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {data && data.devices.length === 0 && (
        <p className="text-sm text-text-muted">{t('dashboard.noDevices')}</p>
      )}

      {data && data.devices.length > 0 && (
        <ul className="space-y-2">
          {data.devices.map((d, i) => {
            const typeLabel = TYPE_LABELS[(d.type ?? '').toLowerCase()] ?? d.type ?? '';
            const name = d.name?.trim() || typeLabel || '—';
            return (
              <li
                key={`${d.createdAt}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-overlay/10 bg-bg-primary/40 p-3"
              >
                <span className={ICON_TILE}>
                  <DeviceTypeIcon type={d.type} className="w-[18px] h-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
                    {d.isMain && (
                      <span className="shrink-0 rounded-full border border-overlay/20 px-2 py-px text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        {t('dashboard.mainDevice')}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-text-tertiary">
                    {typeLabel && name !== typeLabel ? `${typeLabel} · ` : ''}
                    {d.lastActiveAt
                      ? t('dashboard.lastActive', { time: relativeTime(d.lastActiveAt, locale) })
                      : t('dashboard.addedOn', { date: formatDate(d.createdAt, locale) })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data && <p className="mt-3 text-xs text-text-tertiary">{t('dashboard.manageInApp')}</p>}
    </div>
  );
}
