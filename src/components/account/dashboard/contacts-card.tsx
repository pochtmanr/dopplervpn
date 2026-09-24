'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CONTACT } from '@/lib/facts';
import type { AccountInfo } from '../types';
import { ArrowRightIcon, MailIcon, SpinnerIcon, TelegramIcon } from './icons';
import { BTN_PRIMARY, EYEBROW, ICON_TILE, INPUT, PLAIN_CARD, ROW_LINK } from './ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StatusPill({ verified, label }: { verified: boolean; label: string }) {
  return (
    <span
      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        verified ? 'bg-accent-teal/15 text-accent-teal' : 'bg-accent-amber/15 text-accent-amber'
      }`}
    >
      {label}
    </span>
  );
}

interface ContactsCardProps {
  accountId: string;
  accountInfo: AccountInfo | null;
  /** Called after a contact is saved, so the parent can refetch and toast. */
  onSaved: () => void;
  /** Bumped by the Account card's "Connect email": open the field and bring it into view. */
  emailRequest?: number;
}

export function ContactsCard({ accountId, accountInfo, onSaved, emailRequest = 0 }: ContactsCardProps) {
  const t = useTranslations('subscribe.dashboard');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus without scrolling: autoFocus would jump the page and cut across the
  // smooth scroll below.
  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!emailRequest) return;
    setOpen(true);
    inputRef.current?.focus({ preventScroll: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cardRef.current?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }, [emailRequest]);

  const hasEmail = !!(accountInfo?.contactMethod === 'email' && accountInfo.contactValue);
  const hasTelegram = !!(accountInfo?.contactMethod === 'telegram' && accountInfo.contactValue);

  const save = async () => {
    const value = email.trim();
    if (!EMAIL_RE.test(value)) return;
    setSaving(true);
    try {
      const res = await fetch('/api/subscribe/update-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, contactMethod: 'email', contactValue: value }),
      });
      if (res.ok) {
        setOpen(false);
        setEmail('');
        onSaved();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={cardRef} id="contacts" className={`${PLAIN_CARD} scroll-mt-28 p-5`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className={EYEBROW}>{t('contacts')}</h2>
        <span className="text-xs text-text-tertiary">{t('contactsOptional')}</span>
      </div>

      <div className="space-y-2">
        {hasEmail && (
          <div className="flex items-center gap-3 rounded-xl border border-overlay/10 bg-bg-primary/40 p-3">
            <span className={ICON_TILE}>
              <MailIcon className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-tertiary">{t('email')}</p>
              <p className="truncate text-sm font-medium text-text-primary">{accountInfo!.contactValue}</p>
            </div>
            <StatusPill
              verified={accountInfo!.contactVerified}
              label={accountInfo!.contactVerified ? t('verified') : t('unverified')}
            />
          </div>
        )}

        {hasTelegram && (
          <div className="flex items-center gap-3 rounded-xl border border-overlay/10 bg-bg-primary/40 p-3">
            <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-bg-secondary/80 border border-telegram/25 text-telegram">
              <TelegramIcon className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-text-tertiary">{t('telegram')}</p>
              <p className="truncate text-sm font-medium text-text-primary">{accountInfo!.contactValue}</p>
            </div>
            <StatusPill
              verified={accountInfo!.contactVerified}
              label={accountInfo!.contactVerified ? t('verified') : t('unverified')}
            />
          </div>
        )}

        {!hasEmail && !hasTelegram && <p className="text-sm text-text-muted pb-1">{t('noContacts')}</p>}
      </div>

      {/* Connect actions: only what's missing. */}
      <div className="mt-3 space-y-2">
        {!hasEmail &&
          (open ? (
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                placeholder={t('connectEmailPlaceholder')}
                className={`${INPUT} flex-1`}
                ref={inputRef}
              />
              <button type="button" onClick={save} disabled={saving} className={BTN_PRIMARY}>
                {saving ? <SpinnerIcon className="w-4 h-4" /> : t('save')}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setOpen(true)} className={ROW_LINK}>
              <MailIcon className="w-4 h-4 text-accent-teal" />
              {t('connectEmail')}
              <ArrowRightIcon className="w-3.5 h-3.5 ms-auto text-text-tertiary transition-transform group-hover/row:translate-x-0.5 rtl:group-hover/row:-translate-x-0.5" />
            </button>
          ))}

        {!hasTelegram && (
          <a href={CONTACT.telegram.createBot} target="_blank" rel="noopener noreferrer" className={ROW_LINK}>
            <TelegramIcon className="w-4 h-4 text-telegram" />
            {t('connectTelegram')}
            <ArrowRightIcon className="w-3.5 h-3.5 ms-auto text-text-tertiary transition-transform group-hover/row:translate-x-0.5 rtl:group-hover/row:-translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}
