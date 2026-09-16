/**
 * Class recipes for the account dashboard, from DESIGN.md §4. Kept in one place
 * because every card repeats them, and long repeated class lists are what
 * DESIGN.md §7 asks to keep out of JSX.
 */

/** Card recipe B shell. Pair with HAIRLINE (and ORB for hover-able cards). */
export const GLASS_CARD =
  'group relative overflow-hidden rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300';

/** Quieter card for secondary content: flat fill, same border behaviour. */
export const PLAIN_CARD =
  'relative rounded-2xl border border-overlay/10 bg-bg-secondary/50 hover:border-overlay/20 transition-colors';

export const HAIRLINE =
  'pointer-events-none absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent';

export const ORB =
  'pointer-events-none absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500';

/** Band-title eyebrow, used as every card's label. */
export const EYEBROW = 'text-xs font-semibold uppercase tracking-wider text-text-tertiary';

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary';

/** Solid teal — the one action per card. */
export const BTN_PRIMARY = `cta-key inline-flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 text-sm font-semibold text-white ${FOCUS}`;

/** Bordered neutral — full-strength text, so it reads as a button, not a hint. */
export const BTN_SECONDARY = `inline-flex items-center justify-center gap-2 rounded-xl border border-overlay/20 bg-bg-primary/40 hover:border-accent-teal/40 hover:bg-accent-teal/10 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-3 text-sm font-semibold text-text-primary transition-colors ${FOCUS}`;

export const BTN_DANGER = `inline-flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/[0.06] hover:bg-danger/15 hover:border-danger/60 px-5 py-3 text-sm font-semibold text-danger transition-colors ${FOCUS}`;

/** Full-width link row (restore purchases, connect Telegram). */
export const ROW_LINK = `group/row flex items-center gap-3 w-full rounded-xl border border-overlay/15 bg-bg-primary/40 px-3.5 py-3 text-sm font-medium text-text-primary hover:border-accent-teal/40 hover:bg-accent-teal/[0.06] transition-colors ${FOCUS}`;

/** Teal icon tile inside rows. */
export const ICON_TILE =
  'flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-bg-secondary/80 border border-accent-teal/20 text-accent-teal';

export const INPUT =
  'w-full rounded-xl border border-overlay/15 bg-bg-primary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/30 outline-none transition-colors';

/** Modal scrim + panel (recipe B, no orb). */
export const SCRIM =
  'overlay-dim fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-bg-primary/70';
export const MODAL_PANEL =
  'relative w-full overflow-hidden rounded-t-2xl sm:rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary to-bg-secondary';
