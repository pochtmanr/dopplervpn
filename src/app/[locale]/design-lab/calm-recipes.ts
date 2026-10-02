/**
 * Class lists for the Design Lab's "Calm / app-like" direction. Colours come from
 * the `.lab-calm` variables in calm.css. No gradients, hairlines, orbs, glass or
 * keycaps: a solid card on a solid ground, one flat teal button per card.
 */

/** The card: one tonal step above the ground, no border. */
export const CALM_CARD = 'relative flex h-full flex-col rounded-[22px] bg-(--c-card) p-6';
/** A card that is a link as a whole. */
export const CALM_CARD_LINK = `${CALM_CARD} transition-colors hover:bg-(--c-card-hover)`;
/** A row inside a card: one more tonal step. */
export const CALM_ROW = 'flex items-center gap-3 rounded-2xl bg-(--c-inset) px-4 py-3';

/** Small label above a card's content: sentence case, not an uppercase eyebrow. */
export const CALM_LABEL = 'text-[13px] font-medium text-(--c-tert)';
export const CALM_TITLE = 'font-display text-[22px] font-semibold leading-tight text-(--c-text)';
export const CALM_TITLE_SM = 'font-display text-lg font-semibold leading-tight text-(--c-text)';
export const CALM_BODY = 'text-[15px] leading-relaxed text-(--c-muted)';
export const CALM_META = 'text-[13px] leading-snug text-(--c-tert)';

const BTN_BASE =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-[filter,background-color] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--c-bg)';
/** The one solid action. */
export const CALM_BTN = `${BTN_BASE} bg-(--c-accent-fill) text-white hover:brightness-110`;
/** Everything else: a tonal fill, full-strength text. */
export const CALM_BTN_SECONDARY = `${BTN_BASE} bg-(--c-inset) text-(--c-text) hover:brightness-110`;
/** Text-only action, for "Learn more". */
export const CALM_LINK = 'inline-flex items-center gap-1 text-[15px] font-semibold text-(--c-accent)';

/** Round icon well, tinted. Pass a tone's text + tint. */
export const CALM_ICON = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full';
export const TONE = {
  teal: 'bg-(--c-accent-tint) text-(--c-accent)',
  telegram: 'bg-(--c-telegram-tint) text-(--c-telegram)',
  blue: 'bg-(--c-blue-tint) text-(--c-blue)',
  danger: 'bg-(--c-danger-tint) text-(--c-danger)',
  neutral: 'bg-(--c-inset) text-(--c-muted)',
} as const;

export const CALM_CHIP = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold';
