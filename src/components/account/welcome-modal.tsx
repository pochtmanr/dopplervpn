'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/* ── Icons ───────────────────────────────────────────────────────────── */

function CloseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function TagIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

function SparkleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

function WarningIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

/* ── Types ───────────────────────────────────────────────────────────── */

interface PromoData {
  code: string;
  discount_percent: number;
}

interface WelcomeModalProps {
  accountId: string;
  onClose: () => void;
}

/* ── Component ───────────────────────────────────────────────────────── */

/**
 * Shown once, immediately after an account is created.
 *
 * The Account ID is the only credential this product has — there is no email and
 * no password — so the primary job of this modal is to make copying it
 * unmissable. The promo code is the secondary reward, and is optional: the
 * /api/promo/active endpoint returns null when no code is live, in which case
 * the modal still renders with just the ID.
 */
export function WelcomeModal({ accountId, onClose }: WelcomeModalProps) {
  const t = useTranslations('subscribe');
  const tHero = useTranslations('hero');

  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const idCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promoCopyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [promo, setPromo] = useState<PromoData | null>(null);
  /* 'loading' holds the promo slot open; 'none' collapses it. */
  const [promoState, setPromoState] = useState<'loading' | 'ready' | 'none'>('loading');
  const [idCopied, setIdCopied] = useState(false);
  const [promoCopied, setPromoCopied] = useState(false);

  /* Escape to close, and a real focus trap: Tab and Shift+Tab cycle inside the
     dialog instead of walking out into the page behind it. */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? panel.contains(active) : false;

      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  /* The "copied" flags reset on a timer; drop pending timers on unmount. */
  useEffect(() => () => {
    if (idCopyTimer.current) clearTimeout(idCopyTimer.current);
    if (promoCopyTimer.current) clearTimeout(promoCopyTimer.current);
  }, []);

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Focus the copy button — it is the action that matters here */
  useEffect(() => {
    copyButtonRef.current?.focus();
  }, []);

  /* The newest active, unexpired code. An absent promo is a NORMAL state — the
     endpoint legitimately returns null when nothing is live — so a miss and a
     failure are both silent and leave the modal rendering just the Account ID. */
  useEffect(() => {
    let cancelled = false;
    fetch('/api/promo/active')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PromoData | null) => {
        if (cancelled) return;
        if (data?.code) {
          setPromo(data);
          setPromoState('ready');
        } else {
          setPromoState('none');
        }
      })
      .catch(() => {
        if (!cancelled) setPromoState('none');
      });
    return () => { cancelled = true; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* navigator.clipboard throws on insecure origins — stay silent if it does. */
  const copyAccountId = async () => {
    try {
      await navigator.clipboard.writeText(accountId);
      setIdCopied(true);
      if (idCopyTimer.current) clearTimeout(idCopyTimer.current);
      idCopyTimer.current = setTimeout(() => setIdCopied(false), 2000);
    } catch {}
  };

  const copyPromo = async () => {
    if (!promo) return;
    try {
      await navigator.clipboard.writeText(promo.code);
      setPromoCopied(true);
      if (promoCopyTimer.current) clearTimeout(promoCopyTimer.current);
      promoCopyTimer.current = setTimeout(() => setPromoCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="overlay-dim fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-[fadeIn_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label={t('welcomeTitle')}
    >
      <div ref={panelRef} className="overlay-surface-muted relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-overlay/10 bg-bg-secondary p-6 shadow-2xl animate-[scaleIn_200ms_ease-out]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('welcomeDismiss')}
          className="absolute top-4 end-4 p-2 rounded-lg hover:bg-overlay/5 text-text-muted hover:text-text-primary transition-colors"
        >
          <CloseIcon />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 text-accent-teal mb-4">
            <SparkleIcon className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            {t('welcomeTitle')}
          </h2>
          <p className="text-sm text-text-muted mt-1.5">{t('welcomeBody')}</p>
        </div>

        {/* Account ID — the credential */}
        <div className="rounded-2xl border border-overlay/10 bg-bg-primary/50 p-5">
          <span className="block text-xs font-semibold uppercase tracking-widest text-text-muted mb-3 text-center">
            {t('welcomeIdLabel')}
          </span>
          <p className="font-mono text-lg sm:text-xl tracking-widest text-text-primary text-center break-all mb-4">
            {accountId}
          </p>
          <button
            ref={copyButtonRef}
            type="button"
            onClick={copyAccountId}
            className={`w-full rounded-xl border font-semibold py-3 text-sm transition-colors flex items-center justify-center gap-2 ${
              idCopied
                ? 'bg-accent-teal/20 border-accent-teal/40 text-accent-teal'
                : 'bg-accent-teal border-accent-teal text-white hover:bg-accent-teal-light'
            }`}
          >
            {idCopied ? (
              <>
                <CheckIcon className="w-4 h-4" />
                {t('welcomeCopied')}
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                {t('welcomeCopy')}
              </>
            )}
          </button>
        </div>

        {/* Save warning */}
        <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/10 px-5 py-3.5 flex items-start gap-3">
          <WarningIcon className="w-4 h-4 text-accent-amber mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-accent-amber">{t('saveWarning')}</p>
            <p className="text-xs text-text-muted mt-0.5">{t('saveWarningDetail')}</p>
          </div>
        </div>

        {/* Promo — optional, absent when no code is live.

            The slot is held open at the pill's height while the request is in
            flight, so a slow response fades the pill into space that was already
            reserved instead of shoving the dismiss button down. When there is no
            code the slot collapses on a transition rather than snapping shut;
            the global prefers-reduced-motion guard flattens both. */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
            promoState === 'none' ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-4 min-h-[60px] text-center">
              {promo && (
                <div className="animate-[fadeIn_200ms_ease-out]">
                  <p className="text-xs text-text-muted mb-2">{t('welcomePromoIntro')}</p>
                  <button
                    type="button"
                    onClick={copyPromo}
                    aria-label={tHero('promoCopyLabel', { code: promo.code })}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-all duration-200 ${
                      promoCopied
                        ? 'bg-accent-gold/20 border-accent-gold/40 text-accent-gold'
                        : 'bg-accent-gold/10 border-accent-gold/20 text-accent-gold hover:bg-accent-gold/15'
                    }`}
                  >
                    <TagIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">{promo.code}</span>
                    <span>&mdash;</span>
                    <span>{tHero('promoDiscount', { percent: promo.discount_percent })}</span>
                    {promoCopied ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <CopyIcon className="w-4 h-4 opacity-60" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-overlay/10 hover:border-overlay/20 text-text-muted hover:text-text-primary font-medium py-3 text-sm transition-colors"
        >
          {t('welcomeCta')}
        </button>
      </div>
    </div>
  );
}
