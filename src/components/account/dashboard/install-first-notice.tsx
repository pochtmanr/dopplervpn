'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { WarningIcon } from './icons';

/**
 * Countries whose App Store has no Doppler. A buyer there who pays before
 * installing finds nothing to install and asks for a refund, so the notice
 * turns into a required checkbox for them. Elsewhere it stays a plain notice.
 */
const STRICT_COUNTRIES = new Set(['RU', 'CN', 'BY', 'IR']);

/**
 * "Install the app first, then buy inside it" — shown above the web checkout's
 * pay button. Country comes from /api/ip (Vercel's geo header), fetched on the
 * client so /account stays a static page; if the lookup fails the notice is
 * shown without the checkbox, never hidden.
 */
export function InstallFirstNotice({
  confirmed,
  onConfirmedChange,
  onStrictChange,
  plus = false,
}: {
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  /** Reports whether the checkbox is required, so the pay button can wait for it. */
  onStrictChange: (strict: boolean) => void;
  plus?: boolean;
}) {
  const t = useTranslations('subscribe');
  const [strict, setStrict] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/ip')
      .then((res) => (res.ok ? res.json() : null))
      .then((info: { country?: string | null } | null) => {
        if (cancelled) return;
        const isStrict = STRICT_COUNTRIES.has((info?.country ?? '').toUpperCase());
        setStrict(isStrict);
        onStrictChange(isStrict);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Once per mount; the callbacks are stable setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shell = plus
    ? 'rounded-[22px] bg-(--c-inset) px-5 py-4 space-y-2'
    : `rounded-xl border p-4 space-y-2 ${
        strict ? 'border-accent-amber/40 bg-accent-amber/10' : 'border-overlay/15 bg-bg-primary/40'
      }`;
  const link = plus
    ? 'font-bold text-(--c-accent)'
    : 'text-accent-teal underline underline-offset-2 hover:text-accent-teal-light';

  return (
    <div className={shell} role="note">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <WarningIcon className={`w-4 h-4 ${strict ? 'text-accent-amber' : 'text-text-tertiary'}`} />
        {t('installFirst.title')}
      </div>
      <p className="text-xs text-text-muted leading-relaxed">
        {t('installFirst.body')}{' '}
        <Link href="/install" className={link}>
          {t('installFirst.guide')}
        </Link>
        {' · '}
        <Link href="/downloads" className={link}>
          {t('installFirst.downloads')}
        </Link>
      </p>
      {strict && (
        <label className="flex items-start gap-2 pt-1 text-xs text-text-primary cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onConfirmedChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-(--color-accent-teal)"
          />
          <span>{t('installFirst.confirm')}</span>
        </label>
      )}
    </div>
  );
}
