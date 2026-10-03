import type { ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ComparisonAccordion } from '@/components/sections/comparison-accordion';
import { PrivacyVoidBand } from '@/components/glyph/privacy-void-band';
import { PricingBackdrop } from '@/components/glyph/pricing-glyphs';
import { HeroCTAsWrapper } from '@/components/hero/hero-ctas-wrapper';
import { CARD_HAIRLINE } from '@/components/ui/card-recipes';
import { getRectFlagUrl } from '@/lib/languages';
import { PRICING_GLASS } from './landing';
import { PlusBlogCard, type PlusPost } from './blog';

export type { PlusPost };
import {
  ArrowGlyph,
  PLUS_BODY,
  PLUS_BTN_SECONDARY,
  PLUS_BTN_SM,
  PLUS_CARD,
  PLUS_CARD_HOVER,
  PLUS_CHIP,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_META,
  PLUS_TITLE_SM,
  PLUS_WELL,
  PlusContainer,
  PlusHeading,
} from '../plus-recipes';

/* ── Comparison table ─────────────────────────────────────────────── */

const cmpKeys = ['account', 'fingerprint', 'protocol', 'dns', 'censorship', 'logs'] as const;

/** Live element: the open row's diff plate, now in an inset tray (ComparisonAccordion `plus`). */
export function PlusComparison({ live = false }: { live?: boolean }) {
  const t = useTranslations('comparisonTable');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <ComparisonAccordion
        plus
        headers={{ feature: t('headers.feature'), traditional: t('headers.traditional'), doppler: t('headers.doppler') }}
        panel={{ means: t('panel.means'), keeps: t('panel.keeps'), why: t('panel.why') }}
        rows={cmpKeys.map((key) => ({
          key,
          feature: t(`rows.${key}.feature`),
          traditional: t(`rows.${key}.traditional`),
          doppler: t(`rows.${key}.doppler`),
          means: t(`rows.${key}.means`),
          keeps: t(`rows.${key}.keeps`),
          why: t(`rows.${key}.why`),
        }))}
      />
    </PlusContainer>
  );
}

/* ── Use cases ────────────────────────────────────────────────────── */

/** sections/use-cases.tsx's glyphs, unsized so the call site sets them. */
const useCaseIcons: Record<'restricted' | 'travelers' | 'journalists' | 'developers', ReactNode> = {
  restricted: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  travelers: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
    </svg>
  ),
  journalists: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  ),
  developers: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  ),
};

/** Read-only cards (nothing to act on, so no hover): duotone glyph, title, body. */
export function PlusUseCases({ live = false }: { live?: boolean }) {
  const t = useTranslations('useCases');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(useCaseIcons) as (keyof typeof useCaseIcons)[]).map((k) => (
          <div key={k} className={PLUS_CARD}>
            <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-8 [&_svg]:w-8`}>{useCaseIcons[k]}</span>
            <h3 className={`mt-5 ${PLUS_TITLE_SM}`}>{t(`items.${k}.title`)}</h3>
            <p className={`mt-1.5 ${PLUS_BODY}`}>{t(`items.${k}.description`)}</p>
          </div>
        ))}
      </div>
    </PlusContainer>
  );
}

/* ── Servers ──────────────────────────────────────────────────────── */

/** sections/servers.tsx's list (from Supabase vpn_servers, 2026-07-23). */
const serverLocations = [
  { key: 'canada', count: 1, cc: 'ca' },
  { key: 'hongkong', count: 1, cc: 'hk' },
  { key: 'japan', count: 1, cc: 'jp' },
  { key: 'poland', count: 2, cc: 'pl' },
  { key: 'russia', count: 1, cc: 'ru' },
  { key: 'sweden', count: 1, cc: 'se' },
  { key: 'uae', count: 1, cc: 'ae' },
  { key: 'us', count: 1, cc: 'us' },
] as const;

/** Live element: the online pulse beside the city. The flag fills a tray at the end. */
export function PlusServers({ live = false }: { live?: boolean }) {
  const t = useTranslations('servers');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {serverLocations.map(({ key, count, cc }) => (
          <div key={key} className={`${PLUS_CARD} !flex-row items-stretch gap-4 !p-3`}>
            <div className="min-w-0 flex-1 py-1 ps-2">
              <div className="flex items-center gap-2">
                <span className="plus-pulse h-2 w-2 shrink-0 rounded-full bg-(--c-accent) text-(--c-accent)" aria-hidden="true" />
                <h3 className={`truncate ${PLUS_TITLE_SM}`}>{t(`locations.${key}.city`)}</h3>
              </div>
              <p className={`mt-0.5 ${PLUS_META}`}>{t(`locations.${key}.country`)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={`${PLUS_CHIP} bg-(--c-accent-tint) text-(--c-accent)`}>VLESS-Reality</span>
                <span className={`${PLUS_CHIP} bg-(--c-inset) text-(--c-muted)`}>
                  {count} {count > 1 ? t('servers') : t('server')}
                </span>
              </div>
            </div>
            <span className={`${PLUS_WELL} w-28 shrink-0`} aria-hidden="true">
              {/* The real 4:3 flag (the round set's art is only finished inside its circle mask),
                  filling the whole tray; a w-28 tray on this card's height stays close to 4:3, so the crop is light. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, as the shipped card */}
              <img
                src={getRectFlagUrl(cc)}
                alt=""
                width={112}
                height={84}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_var(--c-separator)]" />
            </span>
          </div>
        ))}
      </div>
    </PlusContainer>
  );
}

/* ── Privacy model ────────────────────────────────────────────────── */

const privacyKeys = ['browsing', 'ip', 'dns', 'account'] as const;

/** Live element: each row's query plate, in a tray at the start. The tagline keeps its cursor. */
export function PlusPrivacyModel({ live = false }: { live?: boolean }) {
  const t = useTranslations('privacyModel');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {privacyKeys.map((k, i) => (
          <div key={k} className={`${PLUS_CARD} gap-4 !p-3 sm:!flex-row sm:items-stretch`}>
            <div className={`${PLUS_WELL} shrink-0 sm:min-h-[120px] sm:w-[44%]`}>
              <PrivacyVoidBand index={i} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center px-2 pb-2 sm:px-1 sm:py-2 sm:pe-3">
              <h3 className={PLUS_TITLE_SM}>{t(`items.${k}.title`)}</h3>
              <p className={`mt-1 ${PLUS_BODY}`}>{t(`items.${k}.description`)}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-lg font-semibold text-(--c-text)">
        {t('tagline')}
        <span aria-hidden="true" className="terminal-cursor ms-1 text-(--c-accent)">▌</span>
      </p>
    </PlusContainer>
  );
}

/* ── Get started in three steps ───────────────────────────────────── */

const startSteps = [
  { key: 'choose', href: '/account' },
  { key: 'download', href: '/downloads' },
  { key: 'connect', href: '/#faq' },
] as const;

/** The traffic-step card without a plate: the whole card is the link, the pill sits at the end. */
export function PlusGetStarted({ live = false }: { live?: boolean }) {
  const t = useTranslations('howItWorks');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {startSteps.map(({ key, href }, i) => {
          const body = (
            <>
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-bold tabular-nums text-(--c-accent)">{String(i + 1).padStart(2, '0')}</span>
                <h3 className={PLUS_TITLE_SM}>{t(`steps.${key}.title`)}</h3>
              </div>
              <p className={`mt-3 ${PLUS_BODY}`}>{t(`steps.${key}.description`)}</p>
              {/* No label: the shipped steps have no CTA copy, and the title already says where it goes. */}
              <div className="mt-auto flex justify-end pt-5">
                <span className={PLUS_BTN_SM} aria-hidden="true">
                  <ArrowGlyph className="h-3.5 w-3.5" />
                </span>
              </div>
            </>
          );
          // The FAQ anchor stays a plain <a>, as in the shipped section.
          return href.startsWith('/#') ? (
            <a key={key} href={live ? href : '#'} className={PLUS_CARD_HOVER}>{body}</a>
          ) : (
            <Link key={key} href={live ? href : '#'} className={PLUS_CARD_HOVER}>{body}</Link>
          );
        })}
      </div>
    </PlusContainer>
  );
}

/* ── Closing CTA ──────────────────────────────────────────────────── */

function Stars() {
  return (
    <span className="flex items-center gap-px text-accent-gold" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.445a1 1 0 0 0-1.175 0l-3.367 2.445c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958Z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Pricing's glass over the glyph backdrop, as the shipped CTA; the picture moves
 * into a tray instead of bleeding to the notched edge. HeroCTAs keeps its tracking;
 * plus.css turns its keycap into the flat Calm+ pill.
 */
export function PlusCta() {
  const t = useTranslations('cta');
  const tHero = useTranslations('hero');
  return (
    <div className="relative overflow-hidden">
      <PricingBackdrop />
      <PlusContainer className="relative py-10">
        <div className={`${PRICING_GLASS} grid grid-cols-1 gap-2 p-3 lg:grid-cols-[6fr_5fr]`}>
          <div className={CARD_HAIRLINE} aria-hidden="true" />
          <div className="flex flex-col justify-center gap-6 p-4 text-center sm:p-6 lg:p-10 lg:text-start">
            <h2 className="font-display text-3xl font-bold leading-tight text-(--c-text) sm:text-4xl lg:text-[clamp(2.25rem,3.3vw,3rem)]">
              {t('doppler.titleMiddle')} <span className="whitespace-nowrap text-(--c-muted)">{t('doppler.titlePlayful')}</span>
            </h2>
            <p className={`mx-auto max-w-md text-lg text-(--c-muted) lg:mx-0`}>{t('doppler.subtitle')}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <Stars />
                <span className="text-sm font-bold text-(--c-text)">{tHero('socialProof.rating')}</span>
                <span className={PLUS_META}>{tHero('socialProof.appStore')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Stars />
                <span className="text-sm font-bold text-(--c-text)">{tHero('socialProof.ratingGooglePlay')}</span>
                <span className={PLUS_META}>{tHero('socialProof.googlePlay')}</span>
              </span>
              <span className={`hidden sm:inline ${PLUS_META}`} aria-hidden="true">·</span>
              <span className={PLUS_META}>{tHero('socialProof.users')}</span>
            </div>
            <div className="pt-1">
              <HeroCTAsWrapper location="landing-cta" secondaryHref="/downloads" secondaryLabel={tHero('downloadDesktop')} />
            </div>
          </div>
          <div className={`${PLUS_WELL} min-h-56`}>
            <div className="aspect-[1009/794]" aria-hidden="true" />
            <Image
              src="/images/dopplerdownload.avif"
              alt="Doppler VPN app interface"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </PlusContainer>
    </div>
  );
}

/* ── Latest posts ─────────────────────────────────────────────────── */

/** Live element: the post's picture in a tray (still: no zoom on hover). */
export function PlusBlog({ posts, locale, live = false }: { posts: PlusPost[]; locale: string; live?: boolean }) {
  const t = useTranslations('blog');
  if (posts.length === 0) return null;
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('latestPosts')} subtitle={t('latestPostsSubtitle')} live={live} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <PlusBlogCard key={post.slug} post={post} locale={locale} readMoreText={t('readMore')} href={live ? `/blog/${post.slug}` : '#'} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href={live ? '/blog' : '#'} className={PLUS_BTN_SECONDARY}>
          {t('viewAllPosts')}
          <ArrowGlyph />
        </Link>
      </div>
    </PlusContainer>
  );
}
