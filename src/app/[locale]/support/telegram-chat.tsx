'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GlyphField } from '@/components/glyph/glyph-field';
import type { Scene } from '@/components/glyph/glyph-scene';
import { useMountOnView } from '@/components/glyph/use-mount-on-view';

/**
 * The Telegram card's artwork: a short conversation with the support bot that
 * plays and starts over — the question, the bot typing, the answer. The words
 * are the page's own translated troubleshooting entry, so every locale gets a
 * real exchange with no new strings.
 *
 * Runs only while on screen and the tab is visible; under reduced motion it
 * paints the finished conversation and never ticks. Messages stack from the
 * bottom of a fixed-height well, as a chat does, so nothing below it moves.
 */

/** Step → when it starts (ms into the cycle). 0 empty · 1 question · 2 typing · 3 answer · 4 fading out. */
const STEPS = [0, 500, 1400, 3200, 8400] as const;
const CYCLE_MS = 9000;

/**
 * The ground under the bubbles: bare grain with nothing stamped, in Telegram
 * blue. Sized for ~11px glyphs across a one-column card; the field cover-crops.
 */
const GROUND: Scene = {
  cols: 44,
  rows: 16,
  paint() {},
  order(r, c) {
    return Math.min(1, Math.hypot(r / 15 - 0.5, c / 43 - 0.5) * 1.4);
  },
};

export function TelegramChat() {
  const t = useTranslations('support.troubleshooting.items.wontConnect');
  const hostRef = useRef<HTMLDivElement>(null);
  const [groundRef, groundMounted] = useMountOnView<HTMLDivElement>();
  const [step, setStep] = useState(3);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    let onScreen = false;

    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const play = () => {
      clear();
      STEPS.forEach((at, i) => timers.push(setTimeout(() => setStep(i), at)));
      timers.push(setTimeout(play, CYCLE_MS));
    };
    const sync = () => {
      if (onScreen && !document.hidden) play();
      else clear();
    };

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clear();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // Each bubble mounts when its step arrives, so `.chat-bubble`'s entrance
  // plays every cycle; the well is fixed-height and bottom-anchored, so a new
  // message pushes the earlier ones up, as in a chat.
  return (
    <div ref={groundRef} className="relative h-44">
      <div
        className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
          groundMounted ? 'opacity-70' : 'opacity-0'
        }`}
      >
        {groundMounted && <GlyphField scene={GROUND} loop={false} hover tone="telegram" />}
      </div>
      <div
        ref={hostRef}
        aria-hidden="true"
        className={`pointer-events-none relative flex h-full flex-col justify-end gap-2 overflow-hidden px-5 pb-5 pt-3 transition-opacity duration-500 ${
          step === 4 ? 'opacity-0' : 'opacity-100'
        }`}
      >
      {step >= 1 && (
        <div className="chat-bubble ms-auto rounded-2xl rounded-ee-md bg-telegram text-white shadow-sm">
          {t('question')}
          <span className="ms-2 text-[10px] text-white/70">✓✓</span>
        </div>
      )}

      {step === 2 && (
        <div className="chat-bubble chat-typing me-auto flex gap-1 rounded-2xl rounded-es-md border border-overlay/10 bg-bg-elevated shadow-sm">
          <span className="chat-dot" />
          <span className="chat-dot [animation-delay:150ms]" />
          <span className="chat-dot [animation-delay:300ms]" />
        </div>
      )}

      {step >= 3 && (
        <div className="chat-bubble me-auto rounded-2xl rounded-es-md border border-overlay/10 bg-bg-elevated text-text-primary shadow-sm">
          {t('answer')}
        </div>
      )}
      </div>
    </div>
  );
}
