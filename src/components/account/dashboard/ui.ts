/**
 * Class recipes for the account dashboard. Card shells, tiles and pills come
 * from `ui/card-recipes.ts`, the same set /support and /downloads use; only what
 * is dashboard-specific lives here. Kept in one place because every card repeats
 * them, and long repeated class lists are what DESIGN.md §7 asks to keep out of JSX.
 */

/** Quieter card for secondary content: flat fill, same border behaviour. */
export const PLAIN_CARD =
  'relative rounded-2xl border border-overlay/10 bg-bg-secondary/50 hover:border-overlay/20 transition-colors';

/** Recipe B's hover orb. Cards take CARD + CARD_HAIRLINE from ui/card-recipes. */
export const ORB =
  'pointer-events-none absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500';

/** Band-title eyebrow, used as every card's label. */
export const EYEBROW = 'text-xs font-semibold uppercase tracking-wider text-text-tertiary';

/** The support page's focus ring. */
export const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary';

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

/** Modal scrim, as the support dialogs have it. Pair with DIALOG_PANEL from ui/modal-parts. */
export const SCRIM =
  'overlay-dim fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-bg-primary/70 animate-[fadeIn_200ms_ease-out]';

/* ── Icon buttons, tooltips, popovers ──────────────────────────────────── */

/**
 * Icon-only control: the support copy pill's `cta-flat` shape without the label.
 * 40px to the eye, 44px to the finger (the `before:` inset widens the hit area).
 */
export const ICON_BTN = `cta-flat relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full before:absolute before:-inset-0.5 before:content-[''] ${FOCUS}`;

/**
 * The tooltip under an icon button, end-aligned: the toolbar sits at the card's
 * end edge and the card clips (overflow-hidden, for the plate and orb), so a
 * centred tooltip would be cut off. It appears after 300ms on hover or keyboard
 * focus and leaves at once; opacity + a 4px drop (StepPanel's
 * `transition-[opacity,translate]` idiom).
 */
export const TOOLTIP =
  'pointer-events-none absolute top-full mt-2 z-30 end-0 max-w-56 truncate whitespace-nowrap rounded-lg border bg-bg-elevated px-2.5 py-1.5 text-xs font-medium shadow-lg ' +
  'transition-[opacity,translate] duration-150 ease-out';

/**
 * Tooltip state, one or the other — never both on one element, since Tailwind
 * settles conflicting utilities by stylesheet order, not class order.
 */
export const TOOLTIP_IDLE =
  'border-overlay/10 text-text-primary opacity-0 -translate-y-1 ' +
  'group-hover/tip:opacity-100 group-hover/tip:translate-y-0 group-hover/tip:delay-300 ' +
  'group-has-[:focus-visible]/tip:opacity-100 group-has-[:focus-visible]/tip:translate-y-0';
/** Pinned open, e.g. the "Copied" confirmation — shows on touch, where there is no hover. */
export const TOOLTIP_SHOWN = 'border-accent-teal/30 text-accent-teal opacity-100 translate-y-0';

/** Popover / menu surface: flat, like the support dialogs — no gradient, no hairline. Width and padding go on the call site (see card-recipes.ts on conflicting utilities). */
export const MENU_PANEL =
  'absolute top-full end-0 mt-2 z-40 rounded-xl border border-overlay/10 bg-bg-elevated shadow-2xl ' +
  'transition-[opacity,translate] duration-200 ease-out';

/** Menu rows ring inset: an offset ring would sit on the panel, not the page. */
export const MENU_ITEM =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-text-primary hover:bg-overlay/5 focus-visible:bg-overlay/5 transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-teal-light';

/** Destructive menu item: the support page's DELETE_TILE colours. */
export const MENU_ITEM_DANGER =
  'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-start text-sm font-medium text-danger hover:bg-danger/10 focus-visible:bg-danger/10 transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger/60';
