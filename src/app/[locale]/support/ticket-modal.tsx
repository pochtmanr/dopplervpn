'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { AccountData } from './support-content';

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

function CheckCircleIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ── Constants ────────────────────────────────────────────────────── */

const TOPICS = [
  'connection_issues',
  'subscription_billing',
  'account',
  'feature_request',
  'other',
] as const;

type Topic = (typeof TOPICS)[number];

/* ── Props ────────────────────────────────────────────────────────── */

interface TicketModalProps {
  account: AccountData | null;
  onClose: () => void;
}

/* ── Component ────────────────────────────────────────────────────── */

export function TicketModal({ account, onClose }: TicketModalProps) {
  const t = useTranslations('support');
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Form state */
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(
    account?.contact_method === 'email' && account?.contact_value
      ? account.contact_value
      : ''
  );
  const [accountIdField, setAccountIdField] = useState(account?.account_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Success state */
  const [success, setSuccess] = useState<{ ticketNumber: string; email: string } | null>(null);

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

  /* Submit */
  const handleSubmit = async () => {
    if (!topic || !subject.trim() || !description.trim() || !email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/support/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject: subject.trim(),
          description: description.trim(),
          contact_email: email.trim().toLowerCase(),
          account_id: accountIdField.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('ticket.errorGeneric'));
        return;
      }

      setSuccess({
        ticketNumber: data.ticket_number,
        email: email.trim().toLowerCase(),
      });
    } catch {
      setError(t('ticket.errorGeneric'));
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
      aria-label={t('ticket.title')}
    >
      <div className="w-full sm:max-w-lg bg-bg-secondary border border-overlay/10 rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto animate-[slideUp_200ms_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary">
              {t('ticket.title')}
            </h2>
            <p className="text-xs text-text-muted mt-1">{t('ticket.subtitle')}</p>
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

        <div className="p-6">
          {success ? (
            /* ── Success state ──────────────────────────────── */
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex animate-[scaleIn_300ms_ease-out]">
                <CheckCircleIcon className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-text-primary">
                {t('ticket.successTitle')}
              </h3>
              <p className="text-sm text-text-muted">
                {t('ticket.successMessage', {
                  ticketNumber: success.ticketNumber,
                  email: success.email,
                })}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light text-white font-semibold py-3 text-sm transition-colors"
              >
                {t('ticket.close')}
              </button>
            </div>
          ) : (
            /* ── Form ────────────────────────────────────────── */
            <div className="space-y-5">
              {/* Topic selector */}
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">
                  {t('ticket.topicLabel')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t_key) => (
                    <button
                      key={t_key}
                      type="button"
                      onClick={() => setTopic(t_key)}
                      className={`rounded-full px-4 py-2 text-xs font-medium border transition-all ${
                        topic === t_key
                          ? 'bg-accent-teal text-white border-accent-teal'
                          : 'border-overlay/20 text-text-muted hover:border-accent-teal/50'
                      }`}
                    >
                      {t(`ticket.topics.${t_key}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="ticket-subject" className="block text-xs font-medium text-text-muted mb-1.5">
                  {t('ticket.subjectLabel')}
                </label>
                <input
                  id="ticket-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('ticket.subjectPlaceholder')}
                  required
                  className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="ticket-desc" className="block text-xs font-medium text-text-muted mb-1.5">
                  {t('ticket.descriptionLabel')}
                </label>
                <textarea
                  id="ticket-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('ticket.descriptionPlaceholder')}
                  required
                  className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all resize-none"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="ticket-email" className="block text-xs font-medium text-text-muted mb-1.5">
                  {t('ticket.emailLabel')}
                </label>
                <input
                  id="ticket-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('ticket.emailPlaceholder')}
                  required
                  className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                />
              </div>

              {/* Account ID (optional) */}
              <div>
                <label htmlFor="ticket-account" className="block text-xs font-medium text-text-muted/70 mb-1.5">
                  {t('ticket.accountIdLabel')}
                </label>
                <input
                  id="ticket-account"
                  type="text"
                  value={accountIdField}
                  onChange={(e) => setAccountIdField(e.target.value.toUpperCase())}
                  placeholder="VPN-XXXX-XXXX-XXXX"
                  className="w-full rounded-xl border border-overlay/10 bg-bg-primary/50 px-4 py-3 text-sm font-mono text-text-primary placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 ps-1">{error}</p>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !topic || !subject.trim() || !description.trim() || !email.trim()}
                className="w-full rounded-xl bg-accent-teal hover:bg-accent-teal-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="w-4 h-4" />
                    {t('ticket.submitting')}
                  </>
                ) : (
                  t('ticket.submit')
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
