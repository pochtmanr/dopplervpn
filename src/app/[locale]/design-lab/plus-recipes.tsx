/**
 * Class lists for the Design Lab's "Calm+" direction: Calm's recipes plus the
 * lift hover, duotone glyphs (no tile) and an inset well for the live element.
 * Colours from calm.css; motion from plus.css.
 */
export const PLUS_CARD = 'relative flex h-full flex-col rounded-[22px] bg-(--c-card) p-6';
/** A card you act on: light shadow on hover, nothing else. `group` drives the plate's teal warm-up and the arrow. */
export const PLUS_CARD_HOVER = `group plus-lift ${PLUS_CARD}`;
/** Where a card's live element sits: an inset tray, never edge to edge. */
export const PLUS_WELL = 'relative overflow-hidden rounded-2xl bg-(--c-bg)';

export const PLUS_LABEL = 'text-[13px] font-semibold text-(--c-tert)';
export const PLUS_TITLE = 'font-display text-[22px] font-bold leading-tight text-(--c-text)';
export const PLUS_TITLE_SM = 'font-display text-lg font-bold leading-tight text-(--c-text)';
export const PLUS_BODY = 'text-[15px] leading-relaxed text-(--c-muted)';
export const PLUS_META = 'text-[13px] leading-snug text-(--c-tert)';

const BTN =
  'plus-btn inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg)';
export const PLUS_BTN = `${BTN} bg-(--c-accent-fill) text-white hover:bg-(--c-accent)`;
export const PLUS_BTN_SECONDARY = `${BTN} bg-(--c-inset) text-(--c-text) hover:bg-(--c-accent-tint) hover:text-(--c-accent)`;
/** Small pill for a CTA inside a card that is itself the link: it brightens on the card's hover. */
/** A footer attached to the card's bottom edge: cancels PLUS_CARD's padding (the card needs overflow-hidden). */
export const PLUS_FOOTER = '-mx-6 -mb-6 mt-6';
/** A button filling that footer: square, taller, ring drawn inside so the clip can't cut it. */
export const PLUS_FOOTER_BTN = 'w-full !h-14 !rounded-none focus-visible:!ring-inset focus-visible:!ring-offset-0';
export const PLUS_BTN_SM =
  'plus-btn inline-flex h-8 items-center gap-1.5 rounded-full bg-(--c-accent-fill) px-3.5 text-[13px] font-bold text-white group-hover:bg-(--c-accent)';

/** Duotone glyph, no container: the stroke icon's body takes a faint wash of its colour (plus.css). Size per call site. */
export const PLUS_ICON = 'plus-duo inline-flex shrink-0';
export const PLUS_ICON_TONE = {
  teal: 'text-(--c-accent)',
  telegram: 'text-(--c-telegram)',
  blue: 'text-(--c-blue)',
  danger: 'text-(--c-danger)',
  neutral: 'text-(--c-muted)',
} as const;

export const PLUS_CHIP = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold';

export function ArrowGlyph({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`plus-arrow ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
