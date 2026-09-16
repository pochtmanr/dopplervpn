'use client';

import { useState, useEffect, type RefObject } from 'react';

/* Pieces shared by every step dialog: the support ticket form (teal), the
   business inquiry form (blue) and the account dashboard dialogs. */

/* ── Icons ────────────────────────────────────────────────────────── */

export function Icon({ d, className = 'w-5 h-5', strokeWidth = 1.75 }: { d: string; className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={strokeWidth} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export const CLOSE_PATH = 'M6 18L18 6M6 6l12 12';
export const CHECK_PATH = 'M4.5 12.75l6 6 9-13.5';
export const CHEVRON_PATH = 'M8.25 4.5l7.5 7.5-7.5 7.5';
export const BACK_PATH = 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18';
export const COPY_PATH =
  'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75';

export function SpinnerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* The dialog panel: a flat solid surface — no gradient, glass or hairline, so
   the form is the only thing on it. Accent colour lives in the tile and CTA. */
export const DIALOG_PANEL =
  'relative flex h-full flex-col overflow-hidden rounded-2xl border border-overlay/10 bg-bg-secondary';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MONO = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' };

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/* Receipt rows print in 60ms steps. Literal class names so Tailwind sees them;
   motion-reduce drops the delay (the global rule only zeroes durations). */
export const ROW_DELAYS = ['delay-0', 'delay-60', 'delay-120', 'delay-180', 'delay-240'] as const;

/* ── Dialog behaviour ─────────────────────────────────────────────── */
// Call before any effect that moves focus into the dialog: the first effect
// captures the opener so focus can return to it on close.

export function useModalDialog(panelRef: RefObject<HTMLDivElement | null>, onClose: () => void) {
  /* Restore focus to the opener on close */
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => opener?.focus();
  }, []);

  /* Escape to close, Tab trapped inside the dialog */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, panelRef]);

  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
}

/* ── Step panel ───────────────────────────────────────────────────── */
// Opacity + a small slide in the direction of travel, 200ms. The global
// reduced-motion rule (globals.css) collapses the transition to ~0.

export function StepPanel({ direction, children }: { direction: 'none' | 'forward' | 'back'; children: React.ReactNode }) {
  const [shown, setShown] = useState(direction === 'none');

  useEffect(() => {
    if (shown) return;
    // Two frames so the hidden state is painted before the transition starts.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [shown]);

  const hidden =
    direction === 'back' ? '-translate-x-2 rtl:translate-x-2' : 'translate-x-2 rtl:-translate-x-2';

  return (
    <div
      className={`transition-[opacity,translate] duration-200 ease-out ${
        shown ? 'opacity-100 translate-x-0' : `opacity-0 ${hidden}`
      }`}
    >
      {children}
    </div>
  );
}

/* ── Min-length hint ──────────────────────────────────────────────── */

export function MinHint({
  id,
  text,
  count,
  min,
  okClass = 'text-accent-teal',
}: {
  id: string;
  text: string;
  count: number;
  min: number;
  /** Colour once the minimum is met — the dialog's accent. */
  okClass?: string;
}) {
  const ok = count >= min;
  const tone = ok ? okClass : 'text-text-tertiary';
  return (
    <div id={id} className="mt-1.5 flex items-center justify-between gap-3 text-xs">
      <span className={`transition-colors ${tone}`}>{text}</span>
      <span
        aria-hidden="true"
        dir="ltr"
        className={`inline-flex shrink-0 items-center gap-1 font-mono tabular-nums transition-colors ${tone}`}
      >
        {ok ? <Icon d={CHECK_PATH} className="w-3.5 h-3.5" strokeWidth={2.5} /> : `${count}/${min}`}
      </span>
    </div>
  );
}
