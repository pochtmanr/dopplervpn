'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { useTranslations } from 'next-intl';
import { CARD_TITLE } from '@/components/ui/card-recipes';
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

/* The ticket form's twin for companies, in blue. Rows land in support_tickets
   with topic 'business' — see api/support/business-inquiry/route.ts. */

/* ── Constants ────────────────────────────────────────────────────── */

const BRIEFCASE_PATH =
  'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z';
const SELECT_CHEVRON_PATH = 'M19.5 8.25l-7.5 7.5-7.5-7.5';

const INQUIRY_TYPES = ['partnership', 'enterprise', 'press', 'reseller', 'other'] as const;
type InquiryType = (typeof INQUIRY_TYPES)[number];

/* Outline icons, one per type: link, office building, newspaper, shopping bag, chat bubble */
const TYPE_ICONS: Record<InquiryType, string> = {
  partnership:
    'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  enterprise:
    'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  press:
    'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z',
  reseller:
    'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  other:
    'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
};

const INDUSTRIES = [
  'tech_saas',
  'media_press',
  'finance',
  'education',
  'healthcare',
  'travel',
  'retail_ecommerce',
  'government_ngo',
  'telecom_isp',
  'other',
] as const;

/* Server limits (api/support/business-inquiry/route.ts) — mirrored so a disabled submit explains itself */
const COMPANY_MIN = 2;
const MESSAGE_MIN = 10;
const NAME_MAX = 120;
const WEBSITE_MAX = 255;
const MESSAGE_MAX = 5000;

const COPIED_MS = 2000;

/* ── Class lists ──────────────────────────────────────────────────── */

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-light';
const INPUT_BASE =
  'w-full rounded-xl border bg-bg-primary/50 px-4 py-3 text-sm text-text-primary ' +
  'placeholder:text-text-muted/50 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30 outline-none transition-colors';
const INPUT = `${INPUT_BASE} border-overlay/10`;
const LABEL = 'block text-xs font-medium mb-1.5';
const TYPE_CARD =
  `group/topic flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors ${FOCUS_RING}`;
/* Solid accent tiles with a white glyph: the icons read at a glance on the flat panel */
const TYPE_TILE =
  'w-9 h-9 shrink-0 rounded-xl bg-accent-blue flex items-center justify-center text-white ' +
  'shadow-sm group-hover/topic:brightness-110 transition-[filter]';
const HEADER_TILE =
  'w-11 h-11 shrink-0 rounded-2xl bg-accent-blue flex items-center justify-center text-white shadow-sm';
const OK_HINT = 'text-accent-blue-light';

/* ── Receipt plate ────────────────────────────────────────────────── */
// Same terminal plate as the ticket receipt, in blue.

function InquiryReceipt({ ticketNumber, company, email }: { ticketNumber: string; company: string; email: string }) {
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

  const copyReference = async () => {
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
    <div style={MONO} className="rounded-xl border border-accent-blue/20 bg-bg-primary/60 text-start text-sm">
      <div aria-hidden="true" dir="ltr" className={`flex items-center gap-2 px-4 pt-3 pb-2 text-[11px] text-text-tertiary select-none ${row(0)}`}>
        <span className="text-accent-blue-light">●</span>
        <span>inquiry</span>
        <span className="h-px flex-1 border-t border-dashed border-overlay/20" />
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
        <div className={`${pair} ${row(1)}`}>
          <dt className={label}>{t('businessForm.receiptReference')}</dt>
          <dd className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <span dir="ltr" className="break-all text-base font-semibold text-accent-blue-light">
              {ticketNumber}
            </span>
            <button
              type="button"
              onClick={copyReference}
              className={`cta-flat inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${FOCUS_RING}`}
            >
              <Icon
                d={copied ? CHECK_PATH : COPY_PATH}
                className={`w-3.5 h-3.5 ${copied ? 'text-accent-blue-light' : ''}`}
                strokeWidth={copied ? 2.5 : 1.75}
              />
              {copied ? t('ticket.copied') : t('ticket.copy')}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? t('ticket.copied') : ''}
            </span>
          </dd>
        </div>

        <div className={`${pair} border-t border-dashed border-overlay/10 ${row(2)}`}>
          <dt className={label}>{t('businessForm.receiptCompany')}</dt>
          <dd className="min-w-0 break-words text-text-primary">{company}</dd>
        </div>

        <div className={`${pair} border-t border-dashed border-overlay/10 ${row(3)}`}>
          <dt className={label}>{t('ticket.receiptReplyTo')}</dt>
          <dd className="min-w-0 text-text-muted">
            <span dir="ltr" className="break-all">{email}</span>
          </dd>
        </div>
      </dl>

      <p className={`flex items-baseline gap-2 border-t border-overlay/10 px-4 py-3 text-xs text-text-muted ${row(4)}`}>
        <span aria-hidden="true" className="text-accent-blue-light">✓</span>
        <span className="min-w-0">
          {t('businessForm.receiptStatus')}
          <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-blue-light">
            ▌
          </span>
        </span>
      </p>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export function BusinessModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations('support');
  const tSubscribe = useTranslations('subscribe');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  /* Step state */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<'none' | 'forward' | 'back'>('none');

  /* Form state */
  const [inquiryType, setInquiryType] = useState<InquiryType | null>(null);
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [website, setWebsite] = useState('');
  const [message, setMessage] = useState('');
  const [fax, setFax] = useState(''); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [success, setSuccess] = useState<{ ticketNumber: string; company: string; email: string } | null>(null);

  const companyLen = company.trim().length;
  const messageLen = message.trim().length;
  const emailValid = EMAIL_REGEX.test(email.trim());
  const companyValid = companyLen >= COMPANY_MIN;
  const canSubmit = !!inquiryType && companyValid && messageLen >= MESSAGE_MIN && emailValid;
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
      companyRef.current?.focus();
    } else if (step === 3) {
      emailRef.current?.focus();
    } else {
      const target =
        panel.querySelector<HTMLElement>('[data-type][aria-pressed="true"]') ??
        panel.querySelector<HTMLElement>('[data-type]');
      target?.focus();
    }
  }, [step]);

  /* The form unmounts on success: land on the heading so it is read out */
  useEffect(() => {
    if (success) successHeadingRef.current?.focus({ preventScroll: true });
  }, [success]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const chooseType = (key: InquiryType) => {
    setInquiryType(key);
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
    if (!companyValid) return;
    setDirection('forward');
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading || !inquiryType) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/support/business-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_type: inquiryType,
          company_name: company.trim(),
          industry: industry || null,
          contact_name: name.trim() || null,
          company_website: website.trim() || null,
          message: message.trim(),
          contact_email: email.trim().toLowerCase(),
          fax,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('businessForm.errorGeneric'));
        return;
      }

      setSuccess({
        ticketNumber: data.ticket_number,
        company: company.trim(),
        email: email.trim().toLowerCase(),
      });
    } catch {
      setError(t('businessForm.errorGeneric'));
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
      {/* Sizing wrapper: its height is indefinite, so the surface's h-full resolves to auto.
          Capped by the scrim, which useVisualViewportFit keeps equal to the visible area. */}
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
              <Icon d={BRIEFCASE_PATH} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className={CARD_TITLE}>
                {t('businessForm.title')}
              </h2>
              <p className="mt-1 text-sm text-text-muted">{t('businessForm.subtitle')}</p>
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
                      n <= step ? 'bg-accent-blue' : 'bg-overlay/10'
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
              /* ── Success state ── */
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 shrink-0 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue-light animate-[scaleIn_300ms_ease-out]">
                    <Icon d={CHECK_PATH} className="w-5 h-5" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      ref={successHeadingRef}
                      tabIndex={-1}
                      className="font-display text-lg font-semibold leading-tight text-text-primary focus:outline-none"
                    >
                      {t('businessForm.successTitle')}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted break-words">
                      {t('businessForm.successMessage', {
                        ticketNumber: success.ticketNumber,
                        email: success.email,
                      })}
                    </p>
                  </div>
                </div>

                <InquiryReceipt
                  ticketNumber={success.ticketNumber}
                  company={success.company}
                  email={success.email}
                />

                <button
                  type="button"
                  onClick={onClose}
                  className="cta-key cta-key-blue w-full rounded-xl text-white font-semibold py-3 text-sm transition-colors"
                >
                  {t('ticket.close')}
                </button>
              </div>
            ) : step === 1 ? (
              /* ── Step 1: inquiry type ── */
              <StepPanel key="step-1" direction={direction}>
                <p id={`${titleId}-types`} className="mb-3 text-sm font-medium text-text-primary">
                  {t('businessForm.typePrompt')}
                </p>
                <div
                  role="group"
                  aria-labelledby={`${titleId}-types`}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  {INQUIRY_TYPES.map((key) => {
                    const selected = inquiryType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        data-type={key}
                        aria-pressed={selected}
                        onClick={() => chooseType(key)}
                        className={`${TYPE_CARD} ${key === 'other' ? 'sm:col-span-2' : ''} ${
                          selected
                            ? 'border-accent-blue/50 bg-accent-blue/10'
                            : 'border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-accent-blue/35'
                        }`}
                      >
                        <span className={TYPE_TILE}>
                          <Icon d={TYPE_ICONS[key]} />
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-text-primary">
                          {t(`businessForm.types.${key}`)}
                        </span>
                        <span className={selected ? 'text-accent-blue-light' : 'text-text-tertiary group-hover/topic:text-accent-blue-light transition-colors'}>
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
              /* ── Step 2: company ── */
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
                    {inquiryType && (
                      <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-accent-blue/25 bg-accent-blue/10 px-3 py-1.5 text-xs font-medium text-accent-blue-light">
                        <Icon d={TYPE_ICONS[inquiryType]} className="w-4 h-4 shrink-0" />
                        <span className="sr-only">{t('businessForm.typeLabel')}: </span>
                        <span className="truncate">{t(`businessForm.types.${inquiryType}`)}</span>
                      </span>
                    )}
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="biz-company" className={`${LABEL} text-text-muted`}>
                      {t('businessForm.companyLabel')}
                    </label>
                    <input
                      ref={companyRef}
                      id="biz-company"
                      type="text"
                      autoComplete="organization"
                      maxLength={NAME_MAX}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={t('businessForm.companyPlaceholder')}
                      required
                      aria-describedby="biz-company-hint"
                      className={INPUT}
                    />
                    <MinHint
                      id="biz-company-hint"
                      text={t('ticket.subjectHint', { min: COMPANY_MIN })}
                      count={companyLen}
                      min={COMPANY_MIN}
                      okClass={OK_HINT}
                    />
                  </div>

                  {/* Industry (optional) */}
                  <div>
                    <label htmlFor="biz-industry" className={`${LABEL} text-text-tertiary`}>
                      {t('businessForm.industryLabel')}
                    </label>
                    <div className="relative">
                      <select
                        id="biz-industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={`${INPUT} appearance-none pe-10 cursor-pointer [&>option]:bg-bg-secondary ${
                          industry ? '' : 'text-text-muted/70'
                        }`}
                      >
                        <option value="">{t('businessForm.industryPlaceholder')}</option>
                        {INDUSTRIES.map((key) => (
                          <option key={key} value={key}>
                            {t(`businessForm.industries.${key}`)}
                          </option>
                        ))}
                      </select>
                      <Icon
                        d={SELECT_CHEVRON_PATH}
                        className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
                        strokeWidth={2}
                      />
                    </div>
                  </div>

                  {/* Name + website (optional), side by side from sm up */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-3">
                    <div>
                      <label htmlFor="biz-name" className={`${LABEL} text-text-tertiary`}>
                        {t('businessForm.nameLabel')}
                      </label>
                      <input
                        id="biz-name"
                        type="text"
                        autoComplete="name"
                        maxLength={NAME_MAX}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('businessForm.namePlaceholder')}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label htmlFor="biz-website" className={`${LABEL} text-text-tertiary`}>
                        {t('businessForm.websiteLabel')}
                      </label>
                      <input
                        id="biz-website"
                        type="text"
                        inputMode="url"
                        autoComplete="url"
                        dir="ltr"
                        maxLength={WEBSITE_MAX}
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="company.com"
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!companyValid}
                    className="cta-key cta-key-blue w-full rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm flex items-center justify-center gap-2"
                  >
                    {tSubscribe('continue')}
                  </button>
                </form>
              </StepPanel>
            ) : (
              /* ── Step 3: contact + message ── */
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
                    {inquiryType && (
                      <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-accent-blue/25 bg-accent-blue/10 px-3 py-1.5 text-xs font-medium text-accent-blue-light">
                        <Icon d={TYPE_ICONS[inquiryType]} className="w-4 h-4 shrink-0" />
                        <span className="sr-only">{t('businessForm.typeLabel')}: </span>
                        <span className="truncate">{t(`businessForm.types.${inquiryType}`)}</span>
                      </span>
                    )}
                  </div>

                  {/* Honeypot: off-screen and out of the tab order; humans never fill it */}
                  <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="biz-fax">Fax</label>
                    <input
                      id="biz-fax"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={fax}
                      onChange={(e) => setFax(e.target.value)}
                    />
                  </div>

                  {/* Work email */}
                  <div>
                    <label htmlFor="biz-email" className={`${LABEL} text-text-muted`}>
                      {t('businessForm.emailLabel')}
                    </label>
                    <input
                      ref={emailRef}
                      id="biz-email"
                      type="email"
                      autoComplete="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setEmailTouched(true)}
                      placeholder={t('businessForm.emailPlaceholder')}
                      required
                      aria-invalid={showEmailError}
                      aria-describedby={showEmailError ? 'biz-email-hint' : undefined}
                      className={`${INPUT_BASE} ${showEmailError ? 'border-danger/60' : 'border-overlay/10'}`}
                    />
                    {showEmailError && (
                      <p id="biz-email-hint" className="mt-1.5 text-xs text-danger">
                        {t('ticket.emailInvalid')}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="biz-message" className={`${LABEL} text-text-muted`}>
                      {t('businessForm.messageLabel')}
                    </label>
                    <textarea
                      id="biz-message"
                      rows={4}
                      maxLength={MESSAGE_MAX}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('businessForm.messagePlaceholder')}
                      required
                      aria-describedby="biz-message-hint"
                      className={`${INPUT} resize-none`}
                    />
                    <MinHint
                      id="biz-message-hint"
                      text={t('ticket.descriptionHint', { min: MESSAGE_MIN })}
                      count={messageLen}
                      min={MESSAGE_MIN}
                      okClass={OK_HINT}
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-xs text-danger ps-1">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="cta-key cta-key-blue w-full rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <SpinnerIcon className="w-4 h-4" />
                        {t('businessForm.submitting')}
                      </>
                    ) : (
                      t('businessForm.submit')
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
