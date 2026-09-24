/**
 * Class lists shared by the downloads and support pages, so the two stay one
 * design rather than two copies drifting apart. See DESIGN.md §4.
 *
 * Kept as constants rather than inline JSX because both pages prerender across
 * 44 locales and every class list is serialised twice per page
 * (see globals.css:356-371).
 */

/**
 * Recipe B — glass gradient card. Padding is deliberately NOT in here: Tailwind
 * resolves conflicting utilities by stylesheet order, not by where they sit in a
 * class string, so a call site that appended `p-10` to a base holding `p-6`
 * would get whichever of the two the generated sheet happens to emit last.
 */
export const CARD_SURFACE =
  "relative flex h-full flex-col overflow-hidden rounded-2xl border border-overlay/10 " +
  "bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] backdrop-blur-sm";
/** The surface plus its hover: for cards that are, or sit in, something you can act on. */
export const CARD = `group ${CARD_SURFACE} hover:border-accent-teal/30 transition-colors duration-300`;
/**
 * `inset-x-0`, not `inset-inline-start-0 inset-inline-end-0`: Tailwind v4 has no
 * such utilities, so that pair compiled to nothing and the line collapsed to 0px.
 */
export const CARD_HAIRLINE =
  "absolute top-0 inset-x-0 h-px " +
  "bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent";
/** The title a recipe B card opens with. */
export const CARD_TITLE = "font-display text-xl font-semibold leading-tight text-text-primary";

/**
 * Recipe A row card — the quiet one, for secondary links at the foot of a page:
 * four glass cards and then two more of the same weight tell the reader nothing
 * about what the page is for.
 */
export const ROW_CARD =
  "group relative flex min-h-[104px] flex-row items-center overflow-hidden rounded-xl " +
  "border border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 " +
  "hover:border-accent-teal/30 transition-colors";
/** The glass tile recipe A puts at the head of a row. */
export const ROW_TILE =
  "w-11 h-11 shrink-0 rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-accent-teal/20 " +
  "flex items-center justify-center text-accent-teal group-hover:bg-accent-teal/15 " +
  "group-hover:border-accent-teal/40 transition-colors";
/**
 * Recipe B in blue — business inquiries only (the card on /support and its
 * modal). Teal stays the site accent; blue marks "talking to us as a company".
 */
export const CARD_SURFACE_BLUE =
  "relative flex h-full flex-col overflow-hidden rounded-2xl border border-accent-blue/25 " +
  "bg-gradient-to-br from-accent-blue/[0.18] via-bg-secondary/60 to-accent-blue/[0.06] backdrop-blur-sm";
export const CARD_BLUE = `group ${CARD_SURFACE_BLUE} hover:border-accent-blue/40 transition-colors duration-300`;
export const CARD_HAIRLINE_BLUE =
  "absolute top-0 inset-x-0 h-px " +
  "bg-gradient-to-r from-transparent via-accent-blue-light/60 to-transparent";
export const ROW_TILE_BLUE =
  "w-11 h-11 shrink-0 rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-accent-blue/25 " +
  "flex items-center justify-center text-accent-blue-light group-hover:bg-accent-blue/15 " +
  "group-hover:border-accent-blue/45 transition-colors";
/** The same tile in Telegram blue — the Telegram card on /support only. */
export const ROW_TILE_TELEGRAM =
  "w-11 h-11 shrink-0 rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-telegram/30 " +
  "flex items-center justify-center text-telegram group-hover:bg-telegram/15 " +
  "group-hover:border-telegram/50 transition-colors";
/** The same tile in danger — delete account, on /support and the account dashboard. */
export const DELETE_TILE =
  "w-11 h-11 shrink-0 rounded-2xl bg-bg-secondary/80 border border-danger/20 flex items-center justify-center " +
  "text-danger group-hover:bg-danger/10 group-hover:border-danger/40 transition-colors";

/**
 * A card's foot pill. `KEY_PILL` is the one raised key a surface gets; its
 * neighbours take `cta-flat` with `CTA_PILL`, which is what makes the key read
 * as raised (DESIGN.md §4, keycap pair).
 */
export const CTA_PILL =
  "inline-flex shrink-0 items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full";
export const KEY_PILL = `cta-key text-white ${CTA_PILL}`;

export const ROW_TITLE =
  "font-display text-base md:text-lg font-semibold leading-tight text-text-primary";
export const ROW_TEXT = "mt-0.5 text-xs md:text-sm leading-snug text-text-muted";

/** Page hero (downloads, support): static, no entrance — it is the LCP element. */
export const HERO_SECTION = "pt-28 pb-10 md:pb-14 px-4 sm:px-6 lg:px-8";
export const HERO_TITLE =
  "text-5xl md:text-6xl xl:text-7xl font-semibold text-text-primary leading-[1.05]";
/** The clip-text ramp the headline's last word takes. */
export const HERO_TITLE_RAMP = "bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent";
export const HERO_SUBTITLE = "mt-6 text-text-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto";

/**
 * Splits a headline for the hero: the last word takes the clip-text ramp, the
 * rest is plain. Split rather than one span because `bg-clip-text` paints its
 * gradient across the element's whole background box, so a single span that
 * wrapped would stretch one ramp over both lines.
 */
export function splitHeadline(headline: string): { lead: string; last: string } {
  const words = headline.split(/\s+/).filter(Boolean);
  return { lead: words.slice(0, -1).join(" "), last: words[words.length - 1] ?? "" };
}
