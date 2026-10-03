'use client';

import { useTranslations } from 'next-intl';
import { AppleIcon, ArrowRightIcon, PlayStoreIcon } from './icons';
import { EYEBROW, FOCUS, PLAIN_CARD, ROW_LINK } from './ui';
// Calm+ recipes for the `plus` preview branch.
import { PlusPolicyLinks } from '@/app/[locale]/design-lab/plus/policy-links';
import {
  ArrowGlyph,
  PLUS_BODY,
  PLUS_CARD,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_TITLE,
} from '@/app/[locale]/design-lab/plus-recipes';

const STORES = {
  apple: 'https://apps.apple.com/account/subscriptions',
  play: 'https://play.google.com/store/account/subscriptions',
};

const ARROW =
  'w-3.5 h-3.5 ms-auto text-text-tertiary transition-transform group-hover/row:translate-x-0.5 rtl:group-hover/row:-translate-x-0.5';

/** `plus`: the Calm+ preview, decided on the server. */
export function RestoreCard({ plus = false }: { plus?: boolean }) {
  const t = useTranslations('subscribe.dashboard');

  if (plus) {
    // Same build as ContactsCard (title, line, inset rows), so the pair reads as
    // one row of equal cards whatever the devices card above them holds.
    return (
      <div className={PLUS_CARD}>
        <h2 className={PLUS_TITLE}>{t('restorePurchases')}</h2>
        <p className={`mt-1 ${PLUS_BODY}`}>{t('restorePurchasesDesc')}</p>
        <div className="mt-4 space-y-2">
          {[
            { href: STORES.apple, label: t('restoreAppStore'), icon: <AppleIcon className="h-5 w-5" /> },
            { href: STORES.play, label: t('restorePlayStore'), icon: <PlayStoreIcon className="h-5 w-5" /> },
          ].map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex w-full items-center gap-3 rounded-2xl bg-(--c-inset) px-3.5 py-3 text-[15px] font-bold text-(--c-text) transition-colors hover:bg-(--c-accent-tint) ${FOCUS}`}
            >
              <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.neutral}`}>{s.icon}</span>
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              <ArrowGlyph className="h-4 w-4 shrink-0 text-(--c-tert) group-hover:text-(--c-accent)" />
            </a>
          ))}
        </div>
        <PlusPolicyLinks include={['restoreCancelRefund', 'webAndStore', 'refund']} className="mt-auto pt-4" />
      </div>
    );
  }

  return (
    <div className={`${PLAIN_CARD} p-5`}>
      <h2 className={`${EYEBROW} mb-2`}>{t('restorePurchases')}</h2>
      <p className="text-sm text-text-muted mb-4">{t('restorePurchasesDesc')}</p>
      <div className="space-y-2">
        <a href="https://apps.apple.com/account/subscriptions" target="_blank" rel="noopener noreferrer" className={ROW_LINK}>
          <AppleIcon className="w-4 h-4 text-text-primary" />
          {t('restoreAppStore')}
          <ArrowRightIcon className={ARROW} />
        </a>
        <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener noreferrer" className={ROW_LINK}>
          <PlayStoreIcon className="w-4 h-4 text-accent-teal" />
          {t('restorePlayStore')}
          <ArrowRightIcon className={ARROW} />
        </a>
      </div>
    </div>
  );
}
