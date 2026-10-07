import type { ReactNode } from 'react';

/**
 * Class lists for the Design Lab's "Calm+" direction: Calm's recipes plus the
 * lift hover, duotone glyphs (no tile) and an inset well for the live element.
 * Colours from calm.css; motion from plus.css.
 */
/**
 * Site-width wrapper in the shipped `.section` order: gutter padding outside,
 * the 1600px `max-w-site` box inside, so Calm+ edges match the rest of the landing.
 */
export function PlusContainer({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-site">{children}</div>
    </div>
  );
}

/**
 * A landing section's title + subtitle. `live` (the homepage preview): the title is the
 * section's h2, sized like the shipped headers; in the lab it stays a pane-sized h3.
 */
export function PlusHeading({ title, subtitle, live = false }: { title: string; subtitle: string; live?: boolean }) {
  const Title = live ? 'h2' : 'h3';
  return (
    <div className="mb-8 text-center">
      <Title className={`${PLUS_TITLE} ${live ? 'md:text-3xl' : ''}`}>{title}</Title>
      <p className={`mx-auto mt-2 max-w-2xl ${PLUS_BODY}`}>{subtitle}</p>
    </div>
  );
}

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

/**
 * Article prose on the tonal ramp (muted body, teal links and markers, card-tone code and quotes),
 * after `prose prose-lg …`. Shared by the blog (BlogContent) and the long-form guides (ArticleBody).
 */
export const PLUS_PROSE_TOKENS = [
  'prose-headings:font-display prose-headings:font-bold prose-headings:text-(--c-text) prose-headings:tracking-tight',
  'prose-h2:text-3xl sm:prose-h2:text-[34px] prose-h2:mt-16 prose-h2:mb-5',
  'prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-4',
  'prose-h4:text-xl prose-h4:mt-8 prose-h4:mb-3',
  'prose-p:text-(--c-muted) prose-p:text-[18px] prose-p:leading-[1.75] prose-p:mb-6',
  'prose-a:text-(--c-accent) prose-a:font-semibold prose-a:underline prose-a:underline-offset-4',
  'prose-a:decoration-(--c-accent)/40 hover:prose-a:decoration-(--c-accent) prose-a:transition-colors',
  'prose-strong:text-(--c-text) prose-strong:font-bold prose-em:text-(--c-muted)',
  'prose-ul:my-6 prose-ol:my-6 prose-li:text-(--c-muted) prose-li:text-[18px] prose-li:leading-[1.7] prose-li:mb-2 prose-li:marker:text-(--c-accent)',
  'prose-blockquote:border-s-[3px] prose-blockquote:border-(--c-accent) prose-blockquote:bg-(--c-card)',
  'prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-e-2xl prose-blockquote:not-italic prose-blockquote:font-normal',
  'prose-blockquote:text-(--c-muted) prose-blockquote:my-8',
  'prose-code:text-(--c-accent) prose-code:bg-(--c-inset) prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md',
  'prose-code:text-[0.9em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none',
  'prose-pre:bg-(--c-card) prose-pre:text-(--c-text) prose-pre:rounded-2xl prose-pre:my-8',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-(--c-text)',
  'prose-img:rounded-[22px] prose-img:my-10',
  'prose-hr:border-(--c-separator) prose-hr:my-12',
].join(' ');

export function ArrowGlyph({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`plus-arrow ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
