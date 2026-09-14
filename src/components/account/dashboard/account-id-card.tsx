'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AccountPlate } from '@/components/glyph/account-plate';
import { CheckIcon, CopyIcon, ShareIcon } from './icons';
import { SendToDevices } from './send-to-devices';
import { BTN_PRIMARY, BTN_SECONDARY, EYEBROW, GLASS_CARD, HAIRLINE, ORB } from './ui';

interface AccountIdCardProps {
  accountId: string;
  locale: string;
}

/** Card recipe B: the ID, copy and send-to-devices, with the account plate at its foot. */
export function AccountIdCard({ accountId, locale }: AccountIdCardProps) {
  const t = useTranslations('subscribe');
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the ID is selectable text right above the button.
    }
  };

  return (
    <div className={`${GLASS_CARD} flex flex-col p-6`}>
      <div className={HAIRLINE} />
      <div className={ORB} />

      <div className="relative space-y-4">
        <span className={EYEBROW}>{t('accountLabel')}</span>

        <div>
          <p className="font-mono text-2xl sm:text-[1.7rem] font-bold tracking-wide text-text-primary break-all select-all" dir="ltr">
            {accountId}
          </p>
          <p className="mt-1.5 text-sm text-text-muted">{t('dashboard.accountIdHint')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button type="button" onClick={copyId} className={BTN_PRIMARY} aria-live="polite">
            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            {copied ? t('dashboard.copied') : t('dashboard.copyId')}
          </button>
          <button
            type="button"
            onClick={() => setShareOpen((o) => !o)}
            aria-expanded={shareOpen}
            aria-controls="send-to-devices"
            className={`${BTN_SECONDARY} ${shareOpen ? 'border-accent-teal/50 bg-accent-teal/10' : ''}`}
          >
            <ShareIcon className="w-4 h-4 text-accent-teal" />
            {t('dashboard.sendToDevices')}
          </button>
        </div>

        {shareOpen && (
          <div id="send-to-devices">
            <SendToDevices accountId={accountId} locale={locale} />
          </div>
        )}
      </div>

      {/* The plate runs border to border at the card's foot (DESIGN.md recipe B). */}
      <div className="relative mt-auto -mx-6 -mb-6 pt-5">
        <AccountPlate />
      </div>
    </div>
  );
}
