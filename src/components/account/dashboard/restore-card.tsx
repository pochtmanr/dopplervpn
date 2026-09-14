'use client';

import { useTranslations } from 'next-intl';
import { AppleIcon, ArrowRightIcon, PlayStoreIcon } from './icons';
import { EYEBROW, PLAIN_CARD, ROW_LINK } from './ui';

const ARROW =
  'w-3.5 h-3.5 ms-auto text-text-tertiary transition-transform group-hover/row:translate-x-0.5 rtl:group-hover/row:-translate-x-0.5';

export function RestoreCard() {
  const t = useTranslations('subscribe.dashboard');

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
