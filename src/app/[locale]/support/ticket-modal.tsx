'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { useTranslations } from 'next-intl';
import { CARD_TITLE } from '@/components/ui/card-recipes';
import type { AccountData } from './support-content';
import {
  Icon,
  SpinnerIcon,
  StepPanel,
  MinHint,
  useModalDialog,
  useVisualViewportFit,
  isCoarsePointer,
  DIALOG_PANEL,
  CLOSE_PATH,
  CHECK_PATH,
  CHEVRON_PATH,
  BACK_PATH,
  COPY_PATH,
  EMAIL_REGEX,
  MONO,
  ROW_DELAYS,
} from './modal-parts';

const TICKET_PATH =
  'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z';

/* ── Constants ────────────────────────────────────────────────────── */

const TOPICS = [
  'connection_issues',
  'subscription_billing',
  'account',
  'feature_request',
  'other',
] as const;

type Topic = (typeof TOPICS)[number];

/* Outline icons, one per topic: wifi, credit card, user, light bulb, chat bubble */
const TOPIC_ICONS: Record<Topic, string> = {
  connection_issues:
    'M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z',
  subscription_billing:
    'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  account:
    'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
  feature_request:
    'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
  other:
    'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
};

/* Server minimums (api/support/create-ticket/route.ts) — mirrored so a disabled submit explains itself */
const SUBJECT_MIN = 3;
const DESCRIPTION_MIN = 10;

const COPIED_MS = 2000;

/* ── Class lists ──────────────────────────────────────────────────── */

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light';
const INPUT =
  'w-full rounded-xl border bg-bg-primary/50 px-4 py-3 text-sm text-text-primary ' +
  'placeholder:text-text-muted/50 focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-colors';
const LABEL = 'block text-xs font-medium mb-1.5';
const TOPIC_CARD =
  `group/topic flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors ${FOCUS_RING}`;
/* Solid accent tiles with a white glyph: the icons read at a glance on the flat panel */
const TOPIC_TILE =
  'w-9 h-9 shrink-0 rounded-xl bg-accent-teal flex items-center justify-center text-white ' +
  'shadow-sm group-hover/topic:brightness-110 transition-[filter]';
const HEADER_TILE =
  'w-11 h-11 shrink-0 rounded-2xl bg-accent-teal flex items-center justify-center text-white shadow-sm';

/* ── Props ────────────────────────────────────────────────────────── */

interface TicketModalProps {
  account: AccountData | null;
  onClose: () => void;
}

/* ── Receipt plate ────────────────────────────────────────────────── */
// The success state's terminal plate. Borders are CSS rather than box-drawing
// characters, so a long email or a long translated label cannot break the art.
// Labels follow the page direction; only the mono values are forced to ltr.

function TicketReceipt({ ticketNumber, topic, email }: { ticketNumber: string; topic: Topic; email: string }) {
  const t = useTranslations('support');
  const [printed, setPrinted] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  /* Two frames so the hidden rows are painted before they transition in */
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPrinted(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, []);

  /* Clear the "Copied" timer on unmount (the dialog can close inside the 2s) */
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const copyTicket = async () => {
    try {
      await navigator.clipboard.writeText(ticketNumber);
    } catch {
      return; // No clipboard (insecure context, denied): keep the label as is.
    }
    if (!alive.current) return;
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  const row = (i: number) =>
    `transition-[opacity,translate] duration-200 ease-out motion-reduce:delay-0 ${ROW_DELAYS[i]} ${
      printed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
    }`;
  const pair = 'col-span-2 grid grid-cols-subgrid items-baseline gap-y-1 px-4 py-2.5';
  const label = 'text-[11px] uppercase tracking-wider text-text-tertiary';

  return (
    <div style={MONO} className="rounded-xl border border-overlay/10 bg-bg-primary/60 text-start text-sm">
      {/* Receipt header: decorative, a dashed rule like the comparison plate's */}
      <div aria-hidden="true" dir="ltr" className={`flex items-center gap-2 px-4 pt-3 pb-2 text-[11px] text-text-tertiary select-none ${row(0)}`}>
        <span className="text-accent-teal-light">●</span>
        <span>receipt</span>
        <span className="h-px flex-1 border-t border-dashed border-overlay/20" />
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
        {/* Ticket number + copy */}
        <div className={`${pair} ${row(1)}`}>
          <dt className={label}>{t('ticket.receiptTicket')}</dt>
          <dd className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <span dir="ltr" className="break-all text-base font-semibold text-accent-teal-light">
              {ticketNumber}
            </span>
            <button
              type="button"
              onClick={copyTicket}
              className={`cta-flat inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${FOCUS_RING}`}
            >
              <Icon
                d={copied ? CHECK_PATH : COPY_PATH}
                className={`w-3.5 h-3.5 ${copied ? 'text-accent-teal' : ''}`}
                strokeWidth={copied ? 2.5 : 1.75}
              />
              {copied ? t('ticket.copied') : t('ticket.copy')}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? t('ticket.copied') : ''}
            </span>
          </dd>
        </div>

        {/* Topic */}
        <div className={`${pair} border-t border-dashed border-overlay/10 ${row(2)}`}>
          <dt className={label}>{t('ticket.topicLabel')}</dt>
          <dd className="min-w-0 break-words text-text-primary">{t(`ticket.topics.${topic}`)}</dd>
        </div>

        {/* Reply-to */}
        <div className={`${pair} border-t border-dashed border-overlay/10 ${row(3)}`}>
          <dt className={label}>{t('ticket.receiptReplyTo')}</dt>
          <dd className="min-w-0 text-text-muted">
            <span dir="ltr" className="break-all">{email}</span>
          </dd>
        </div>
      </dl>

      {/* Status */}
      <p className={`flex items-baseline gap-2 border-t border-overlay/10 px-4 py-3 text-xs text-text-muted ${row(4)}`}>
        <span aria-hidden="true" className="text-accent-teal-light">✓</span>
        <span className="min-w-0">
          {t('ticket.receiptStatus')}
          <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-teal-light">
            ▌
          </span>
        </span>
      </p>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export function TicketModal({ account, onClose }: TicketModalProps) {
  const t = useTranslations('support');
  const tSubscribe = useTranslations('subscribe');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  /* Step state */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<'none' | 'forward' | 'back'>('none');

  /* Form state */
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(
    account?.contact_method === 'email' && account?.contact_value
      ? account.contact_value
      : ''
  );
  const [emailTouched, setEmailTouched] = useState(false);
  const [accountIdField, setAccountIdField] = useState(account?.account_id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Success state */
  const [success, setSuccess] = useState<{ ticketNumber: string; email: string; topic: Topic } | null>(null);

  const subjectLen = subject.trim().length;
  const descriptionLen = description.trim().length;
  const emailValid = EMAIL_REGEX.test(email.trim());
  const detailsValid = subjectLen >= SUBJECT_MIN && descriptionLen >= DESCRIPTION_MIN;
  const canSubmit = !!topic && detailsValid && emailValid;
  const showEmailError = emailTouched && !emailValid;

  /* Declared first so it captures the opener before focus moves into the dialog */
  useModalDialog(panelRef, onClose);
  useVisualViewportFit(overlayRef);

  /* Move focus into the current step (the panel itself on touch — see isCoarsePointer) */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (isCoarsePointer()) {
      panel.focus({ preventScroll: true });
    } else if (step === 2) {
      subjectRef.current?.focus();
    } else if (step === 3) {
      emailRef.current?.focus();
    } else {
      const target =
        panel.querySelector<HTMLElement>('[data-topic][aria-pressed="true"]') ??
        panel.querySelector<HTMLElement>('[data-topic]');
      target?.focus();
    }
  }, [step]);

  /* The form unmounts on success, taking focus with it: land on the heading so
     it is read out and the Tab trap has a starting point inside the dialog. */
  useEffect(() => {
    if (success) successHeadingRef.current?.focus({ preventScroll: true });
  }, [success]);

  /* Click outside (desktop) */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const chooseTopic = (key: Topic) => {
    setTopic(key);
    setDirection('forward');
    setStep(2);
  };

  const goBack = () => {
    setError('');
    setDirection('back');
    setStep(step === 3 ? 2 : 1);
  };

  const goToContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsValid) return;
    setDirection('forward');
    setStep(3);
  };

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading || !topic) return;

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
        topic,
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
      className="overlay-dim fixed inset-0 z-50 flex items-end sm:items-center justify-center max-sm:pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-4 overscroll-contain bg-bg-primary/70 animate-[fadeIn_200ms_ease-out]"
    >
      {/* Sizing wrapper: its height is indefinite, so the panel's h-full resolves to
          auto instead of stretching the panel to the viewport. Capped by the scrim,
          which useVisualViewportFit keeps equal to the visible area on phones. */}
      <div className="flex w-full sm:max-w-lg max-h-full sm:max-h-[90vh] flex-col animate-[slideUp_200ms_ease-out]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`${DIALOG_PANEL} min-h-0 outline-none max-sm:rounded-b-none max-sm:border-b-0`}
        >
          {/* ── Header ── */}
          <div className="relative flex items-start gap-4 p-6 pb-4">
            <span className={HEADER_TILE}>
              <Icon d={TICKET_PATH} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className={CARD_TITLE}>
                {t('ticket.title')}
              </h2>
              <p className="mt-1 text-sm text-text-muted">{t('ticket.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`-me-2 -mt-2 p-2 rounded-lg hover:bg-overlay/5 text-text-muted hover:text-text-primary transition-colors ${FOCUS_RING}`}
              aria-label={t('ticket.close')}
            >
              <Icon d={CLOSE_PATH} strokeWidth={2} />
            </button>
          </div>

          {/* ── Progress ── */}
          {!success && (
            <div className="relative px-6 pb-4 border-b border-overlay/5">
              <div className="flex gap-1.5" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-200 ${
                      n <= step ? 'bg-accent-teal' : 'bg-overlay/10'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-text-tertiary" aria-live="polite">
                {t('ticket.stepOf', { current: step, total: 3 })}
              </p>
            </div>
          )}

          <div className="relative min-h-0 overflow-y-auto overscroll-contain p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {success ? (
              /* ── Success state ──────────────────────────────── */
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center text-accent-teal animate-[scaleIn_300ms_ease-out]">
                    <Icon d={CHECK_PATH} className="w-5 h-5" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      ref={successHeadingRef}
                      tabIndex={-1}
                      className="font-display text-lg font-semibold leading-tight text-text-primary focus:outline-none"
                    >
                      {t('ticket.successTitle')}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted break-words">
                      {t('ticket.successMessage', {
                        ticketNumber: success.ticketNumber,
                        email: success.email,
                      })}
                    </p>
                  </div>
                </div>

                <TicketReceipt
                  ticketNumber={success.ticketNumber}
                  topic={success.topic}
                  email={success.email}
                />

                <button
                  type="button"
                  onClick={onClose}
                  className="cta-key w-full rounded-xl text-white font-semibold py-3 text-sm transition-colors"
                >
                  {t('ticket.close')}
                </button>
              </div>
            ) : step === 1 ? (
              /* ── Step 1: topic ── */
              <StepPanel key="step-1" direction={direction}>
                <p id={`${titleId}-topics`} className="mb-3 text-sm font-medium text-text-primary">
                  {t('ticket.topicPrompt')}
                </p>
                <div
                  role="group"
                  aria-labelledby={`${titleId}-topics`}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  {TOPICS.map((key) => {
                    const selected = topic === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        data-topic={key}
                        aria-pressed={selected}
                        onClick={() => chooseTopic(key)}
                        className={`${TOPIC_CARD} ${key === 'other' ? 'sm:col-span-2' : ''} ${
                          selected
                            ? 'border-accent-teal/50 bg-accent-teal/10'
                            : 'border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-accent-teal/30'
                        }`}
                      >
                        <span className={TOPIC_TILE}>
                          <Icon d={TOPIC_ICONS[key]} />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-text-primary">
                          {t(`ticket.topics.${key}`)}
                        </span>
                        <span className={selected ? 'text-accent-teal' : 'text-text-tertiary group-hover/topic:text-accent-teal transition-colors'}>
                          <Icon
                            d={selected ? CHECK_PATH : CHEVRON_PATH}
                            className={`w-4 h-4 ${selected ? '' : 'rtl:-scale-x-100'}`}
                            strokeWidth={2}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </StepPanel>
            ) : step === 2 ? (
              /* ── Step 2: what happened ── */
              <StepPanel key="step-2" direction={direction}>
                <form onSubmit={goToContact} noValidate className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className={`-ms-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors ${FOCUS_RING}`}
                    >
                      <Icon d={BACK_PATH} className="w-4 h-4 rtl:-scale-x-100" strokeWidth={2} />
                      {t('ticket.back')}
                    </button>
                    {topic && (
                      <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-accent-teal/20 bg-accent-teal/10 px-3 py-1.5 text-xs font-medium text-accent-teal">
                        <Icon d={TOPIC_ICONS[topic]} className="w-4 h-4 shrink-0" />
                        <span className="sr-only">{t('ticket.topicLabel')}: </span>
                        <span className="truncate">{t(`ticket.topics.${topic}`)}</span>
                      </span>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="ticket-subject" className={`${LABEL} text-text-muted`}>
                      {t('ticket.subjectLabel')}
                    </label>
                    <input
                      ref={subjectRef}
                      id="ticket-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t('ticket.subjectPlaceholder')}
                      required
                      aria-describedby="ticket-subject-hint"
                      className={`${INPUT} border-overlay/10`}
                    />
                    <MinHint
                      id="ticket-subject-hint"
                      text={t('ticket.subjectHint', { min: SUBJECT_MIN })}
                      count={subjectLen}
                      min={SUBJECT_MIN}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="ticket-desc" className={`${LABEL} text-text-muted`}>
                      {t('ticket.descriptionLabel')}
                    </label>
                    <textarea
                      id="ticket-desc"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('ticket.descriptionPlaceholder')}
                      required
                      aria-describedby="ticket-desc-hint"
                      className={`${INPUT} border-overlay/10 resize-none`}
                    />
                    <MinHint
                      id="ticket-desc-hint"
                      text={t('ticket.descriptionHint', { min: DESCRIPTION_MIN })}
                      count={descriptionLen}
                      min={DESCRIPTION_MIN}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!detailsValid}
                    className="cta-key w-full rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm flex items-center justify-center gap-2"
                  >
                    {tSubscribe('continue')}
                  </button>
                </form>
              </StepPanel>
            ) : (
              /* ── Step 3: where to reply ── */
              <StepPanel key="step-3" direction={direction}>
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className={`-ms-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors ${FOCUS_RING}`}
                    >
                      <Icon d={BACK_PATH} className="w-4 h-4 rtl:-scale-x-100" strokeWidth={2} />
                      {t('ticket.back')}
                    </button>
                    {topic && (
                      <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-accent-teal/20 bg-accent-teal/10 px-3 py-1.5 text-xs font-medium text-accent-teal">
                        <Icon d={TOPIC_ICONS[topic]} className="w-4 h-4 shrink-0" />
                        <span className="sr-only">{t('ticket.topicLabel')}: </span>
                        <span className="truncate">{t(`ticket.topics.${topic}`)}</span>
                      </span>
                    )}
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label htmlFor="ticket-email" className={`${LABEL} text-text-muted`}>
                      {t('ticket.emailLabel')}
                    </label>
                    <input
                      ref={emailRef}
                      id="ticket-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder={t('ticket.emailPlaceholder')}
                      required
                      aria-invalid={showEmailError}
                      aria-describedby={showEmailError ? 'ticket-email-hint' : undefined}
                      className={`${INPUT} ${showEmailError ? 'border-danger/60' : 'border-overlay/10'}`}
                    />
                    {showEmailError && (
                      <p id="ticket-email-hint" className="mt-1.5 text-xs text-danger">
                        {t('ticket.emailInvalid')}
                      </p>
                    )}
                  </div>

                  {/* Account ID (optional) */}
                  <div>
                    <label htmlFor="ticket-account" className={`${LABEL} text-text-tertiary`}>
                      {t('ticket.accountIdLabel')}
                    </label>
                    <input
                      id="ticket-account"
                      type="text"
                      dir="ltr"
                      value={accountIdField}
                      onChange={(e) => setAccountIdField(e.target.value.toUpperCase())}
                      placeholder="VPN-XXXX-XXXX-XXXX"
                      className={`${INPUT} border-overlay/10 font-mono`}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p role="alert" className="text-xs text-danger ps-1">
                      {error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="cta-key w-full rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm flex items-center justify-center gap-2"
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
                </form>
              </StepPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
