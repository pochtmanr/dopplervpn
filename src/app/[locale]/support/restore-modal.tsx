'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

/* ── Icons ────────────────────────────────────────────────────────── */

function CloseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SpinnerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function TelegramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */

interface RestoreModalProps {
  locale: string;
  onClose: () => void;
  onOpenTicket: () => void;
}

/* ── Component ────────────────────────────────────────────────────── */

export function RestoreModal({ onClose, onOpenTicket }: RestoreModalProps) {
  const t = useTranslations('support');
  const overlayRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<'email' | 'telegram'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  /* Escape to close */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Click outside (desktop) */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* Send restore email */
  const handleSend = async () => {
    const val = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return;

    setLoading(true);
    try {
      await fetch('/api/support/restore-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: val.toLowerCase() }),
      });
      setSent(true);
    } catch {
      // still show success to not leak info
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label={t('restore.title')}
    >
      <div className="w-full sm:max-w-lg bg-bg-secondary border border-overlay/10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-[slideUp_200ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary">
              {t('restore.title')}
            </h2>
            <p className="text-xs text-text-muted mt-1">{t('restore.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-overlay/5 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tab toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setTab('email'); setSent(false); }}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                tab === 'email'
                  ? 'bg-accent-teal text-white'
                  : 'bg-bg-primary/30 border border-overlay/10 text-text-muted hover:border-overlay/20'
              }`}
            >
              {t('restore.emailTab')}
            </button>
            <button
              type="button"
              onClick={() => { setTab('telegram'); setSent(false); }}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
                tab === 'telegram'
                  ? 'bg-accent-teal text-white'
                  : 'bg-bg-primary/30 border border-overlay/10 text-text-muted hover:border-overlay/20'
              }`}
            >
              {t('restore.telegramTab')}
            </button>
          </div>

          {/* Tab content */}
          {tab === 'email' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="restore-email" className="sr-only">
                  {t('restore.emailTab')}
                </label>
                <input
                  id="restore-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSent(false); }}
                  placeholder={t('restore.emailPlaceholder')}
                  className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !email.trim()}
                className="w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="w-4 h-4" />
                    {t('restore.sending')}
                  </>
                ) : (
                  t('restore.sendAccountId')
                )}
              </button>

              {sent && (
                <p className="text-sm text-green-400 text-center">
                  {t('restore.emailSuccess')}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-overlay/10 bg-bg-primary/30">
                <TelegramIcon className="w-8 h-8 text-[#2AABEE] shrink-0" />
                <p className="text-sm text-text-muted">
                  {t('restore.telegramMessage')}
                </p>
              </div>

              <a
                href="https://t.me/DopplerSupportBot?start=restore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-xl bg-[#2AABEE] hover:bg-[#2AABEE]/90 text-white font-semibold py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <TelegramIcon className="w-4 h-4" />
                {t('restore.openTelegramBot')}
              </a>
            </div>
          )}

          {/* Need more help? */}
          <div className="text-center">
            <button
              type="button"
              onClick={onOpenTicket}
              className="text-xs text-accent-teal hover:text-accent-teal-light transition-colors font-medium"
            >
              {t('restore.submitTicket')}
            </button>
          </div>

          {/* Divider + App store links */}
          <div className="border-t border-overlay/10 pt-5 space-y-3">
            <p className="text-xs text-text-muted text-center">
              {t('restore.appSubscribers')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://apps.apple.com/account/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-3 py-2 text-xs text-text-muted hover:text-text-primary transition-all"
              >
                {t('restore.appStoreLink')}
              </a>
              <a
                href="https://play.google.com/store/account/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center rounded-lg border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-3 py-2 text-xs text-text-muted hover:text-text-primary transition-all"
              >
                {t('restore.playStoreLink')}
              </a>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-overlay/10 hover:border-overlay/20 text-text-muted hover:text-text-primary font-medium py-2.5 text-sm transition-colors"
          >
            {t('restore.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
