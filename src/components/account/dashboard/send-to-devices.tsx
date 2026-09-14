'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckIcon, CopyIcon, MailIcon, ShareIcon, TelegramIcon, WarningIcon, WhatsAppIcon } from './icons';

/**
 * Send the Account ID to yourself, so it can be opened on another device.
 *
 * The ID only ever travels in the message body, never in a URL we own: a link
 * like /account?id=… would land the credential in server logs, analytics and
 * browser history. The one link in the message is the plain downloads page.
 */

const CHIP =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-overlay/15 bg-bg-primary/40 px-3 py-2.5 text-sm font-medium text-text-primary hover:border-accent-teal/40 hover:bg-accent-teal/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal';

interface SendToDevicesProps {
  accountId: string;
  locale: string;
}

export function SendToDevices({ accountId, locale }: SendToDevicesProps) {
  const t = useTranslations('subscribe.dashboard');
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // navigator.share exists only after mount, and only on some browsers.
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const downloadUrl = `https://www.dopplervpn.org/${locale}/downloads`;
  const message = t('shareMessage', { id: accountId, url: downloadUrl });
  const subject = t('shareSubject');
  // Telegram's share page prints `url` above `text`, which would split the link
  // from its label. It accepts any string as `url`, so the whole message goes there.
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

  const nativeShare = async () => {
    try {
      await navigator.share({ title: subject, text: message });
    } catch {
      // Dismissing the sheet rejects with AbortError — nothing to report.
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the other targets still work.
    }
  };

  return (
    <div className="space-y-3 slide-in-from-bottom">
      <p className="text-sm text-text-muted">{t('sendToDevicesDesc')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={CHIP}>
            <ShareIcon className="w-4 h-4 text-accent-teal" />
            {t('shareNative')}
          </button>
        )}
        <a href={telegramHref} target="_blank" rel="noopener noreferrer" className={CHIP}>
          <TelegramIcon className="w-4 h-4 text-telegram" />
          Telegram
        </a>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={CHIP}>
          <WhatsAppIcon className="w-4 h-4 text-accent-teal" />
          WhatsApp
        </a>
        <a href={mailHref} className={CHIP}>
          <MailIcon className="w-4 h-4 text-accent-teal" />
          {t('shareEmail')}
        </a>
        <button type="button" onClick={copyMessage} className={CHIP} aria-live="polite">
          {copied ? (
            <CheckIcon className="w-4 h-4 text-accent-teal" />
          ) : (
            <CopyIcon className="w-4 h-4 text-accent-teal" />
          )}
          {copied ? t('messageCopied') : t('copyMessage')}
        </button>
      </div>

      <p className="text-xs text-text-tertiary">{t('shareTelegramHint')}</p>

      <div className="flex items-start gap-2.5 rounded-xl border border-accent-amber/30 bg-accent-amber/10 px-3.5 py-3">
        <WarningIcon className="w-4 h-4 mt-0.5 shrink-0 text-accent-amber" />
        <p className="text-xs font-medium text-text-primary">{t('shareWarning')}</p>
      </div>
    </div>
  );
}
