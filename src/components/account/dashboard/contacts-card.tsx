'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CONTACT } from '@/lib/facts';
import type { AccountInfo } from '../types';
import { ArrowRightIcon, MailIcon, SpinnerIcon, TelegramIcon } from './icons';
import { BTN_PRIMARY, EYEBROW, FOCUS, ICON_TILE, INPUT, PLAIN_CARD, ROW_LINK } from './ui';
// Calm+ recipes for the `plus` preview branch.
import { PLUS_BTN, PLUS_ICON, PLUS_ICON_TONE, PLUS_META, PLUS_TITLE } from '@/app/[locale]/design-lab/plus-recipes';

/** Shipped classes, and the Calm+ preview's (inset rows on the card, filled field, duotone glyphs). */
const SHIPPED = {
  card: `${PLAIN_CARD} scroll-mt-28 p-5`,
  header: 'flex items-center justify-between gap-3 mb-4',
  title: EYEBROW,
  optional: 'text-xs text-text-tertiary',
  row: 'flex items-center gap-3 rounded-xl border border-overlay/10 bg-bg-primary/40 p-3',
  mailTile: ICON_TILE,
  tgTile: 'flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-bg-secondary/80 border border-telegram/25 text-telegram',
  rowLabel: 'text-xs text-text-tertiary',
  rowValue: 'truncate text-sm font-medium text-text-primary',
  none: 'text-sm text-text-muted pb-1',
  input: `${INPUT} flex-1`,
  save: BTN_PRIMARY,
  link: ROW_LINK,
};
const PLUS: typeof SHIPPED = {
  card: 'relative flex h-full flex-col rounded-[22px] bg-(--c-card) scroll-mt-28 p-6',
  // Title over its note: side by side, a half-width card squeezed both into two lines.
  header: 'mb-4 flex flex-col items-start gap-0.5',
  title: PLUS_TITLE,
  optional: PLUS_META,
  row: 'flex items-center gap-3 rounded-2xl bg-(--c-inset) px-3.5 py-3',
  mailTile: `${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:!h-6 [&_svg]:!w-6`,
  tgTile: `${PLUS_ICON} ${PLUS_ICON_TONE.telegram} [&_svg]:!h-6 [&_svg]:!w-6`,
  rowLabel: PLUS_META,
  rowValue: 'truncate text-[15px] font-bold text-(--c-text)',
  none: 'text-[15px] text-(--c-muted) pb-1',
  input: 'min-w-0 flex-1 rounded-full bg-(--c-inset) px-4 text-[15px] text-(--c-text) placeholder:text-(--c-tert) focus:ring-2 focus:ring-(--c-accent) outline-none',
  save: `${PLUS_BTN} disabled:opacity-50`,
  link: `group/row flex items-center gap-3 w-full rounded-2xl bg-(--c-inset) px-3.5 py-3 text-[15px] font-bold text-(--c-text) hover:bg-(--c-accent-tint) transition-colors ${FOCUS}`,
};

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
  /** Calm+ preview, decided on the server. */
  plus?: boolean;
}

export function ContactsCard({ accountId, accountInfo, onSaved, emailRequest = 0, plus = false }: ContactsCardProps) {
  const c = plus ? PLUS : SHIPPED;
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
    <div ref={cardRef} id="contacts" className={c.card}>
      <div className={c.header}>
        <h2 className={c.title}>{t('contacts')}</h2>
        <span className={c.optional}>{t('contactsOptional')}</span>
      </div>

      <div className="space-y-2">
        {hasEmail && (
          <div className={c.row}>
            <span className={c.mailTile}>
              <MailIcon className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={c.rowLabel}>{t('email')}</p>
              <p className={c.rowValue}>{accountInfo!.contactValue}</p>
            </div>
            <StatusPill
              verified={accountInfo!.contactVerified}
              label={accountInfo!.contactVerified ? t('verified') : t('unverified')}
            />
          </div>
        )}

        {hasTelegram && (
          <div className={c.row}>
            <span className={c.tgTile}>
              <TelegramIcon className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={c.rowLabel}>{t('telegram')}</p>
              <p className={c.rowValue}>{accountInfo!.contactValue}</p>
            </div>
            <StatusPill
              verified={accountInfo!.contactVerified}
              label={accountInfo!.contactVerified ? t('verified') : t('unverified')}
            />
          </div>
        )}

        {!hasEmail && !hasTelegram && <p className={c.none}>{t('noContacts')}</p>}
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
                className={c.input}
                ref={inputRef}
              />
              <button type="button" onClick={save} disabled={saving} className={c.save}>
                {saving ? <SpinnerIcon className="w-4 h-4" /> : t('save')}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setOpen(true)} className={c.link}>
              <MailIcon className="w-4 h-4 text-accent-teal" />
              {t('connectEmail')}
              <ArrowRightIcon className="w-3.5 h-3.5 ms-auto text-text-tertiary transition-transform group-hover/row:translate-x-0.5 rtl:group-hover/row:-translate-x-0.5" />
            </button>
          ))}

        {!hasTelegram && (
          <a href={CONTACT.telegram.createBot} target="_blank" rel="noopener noreferrer" className={c.link}>
            <TelegramIcon className="w-4 h-4 text-telegram" />
            {t('connectTelegram')}
            <ArrowRightIcon className="w-3.5 h-3.5 ms-auto text-text-tertiary transition-transform group-hover/row:translate-x-0.5 rtl:group-hover/row:-translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}
