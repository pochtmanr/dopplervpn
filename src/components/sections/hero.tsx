import { Fragment } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroCTAsWrapper } from "@/components/hero/hero-ctas-wrapper";
import { DotGlobe } from "@/components/hero/dot-globe";

// Locales where decorative Latin-only fonts break (no Cyrillic/CJK/Arabic glyphs)
const FALLBACK_FONT_LOCALES = new Set(["ru", "uk", "zh", "ja", "ko", "ar", "fa", "he", "hi", "ur", "th"]);

// Store links for the social-proof row (also defined in hero-ctas.tsx — that
// module is "use client", so its exports can't be imported here)
const APP_STORE_URL = "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=org.dopplervpn.android";

function Stars() {
  return (
    <span className="flex items-center gap-px text-accent-amber" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.445a1 1 0 0 0-1.175 0l-3.367 2.445c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958Z" />
        </svg>
      ))}
    </span>
  );
}

// servers.locations keys matching the NODES order in dot-globe.tsx (Warsaw hub first)
const NODE_LOCATION_KEYS = [
  "poland", "netherlands", "sweden", "israel", "us", "canada", "singapore", "australia",
] as const;

export function Hero() {
  const t = useTranslations("hero");
  const tServers = useTranslations("servers");
  const locale = useLocale();
  const useFallbackFont = FALLBACK_FONT_LOCALES.has(locale);
  const nodeLabels = NODE_LOCATION_KEYS.map((key) => tServers(`locations.${key}.city`));

  // Word-by-word blur-up cascade timing (seconds), matched to the reference hero.
  const WORD_BASE_DELAY = 0.1;
  const WORD_STAGGER = 0.07;

  const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);

  // Line 1: part1a (italic in serif mode) + part1b. Line 2: gradient part2 (optional).
  const line1Words = [
    ...splitWords(t("headlinePart1a")).map((word) => ({ word, italic: !useFallbackFont })),
    ...splitWords(t("headlinePart1b")).map((word) => ({ word, italic: false })),
  ];
  const line2Words = splitWords(t("headlinePart2"));
  const headlineFontStyle = useFallbackFont
    ? { fontFamily: "var(--font-body)", fontWeight: 300 }
    : { fontFamily: "var(--font-serif)" };

  const socialProof = (
    <div className="hero-animate hero-animate-delay-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-1">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-1.5"
      >
        <Stars />
        <span className="text-sm font-semibold text-text-primary">{t("socialProof.rating")}</span>
        <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">
          {t("socialProof.appStore")}
        </span>
      </a>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-1.5"
      >
        <Stars />
        <span className="text-sm font-semibold text-text-primary">{t("socialProof.rating")}</span>
        <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">
          {t("socialProof.googlePlay")}
        </span>
      </a>
      <span className="hidden sm:inline text-text-tertiary" aria-hidden="true">·</span>
      <span className="text-xs text-text-muted">{t("socialProof.users")}</span>
    </div>
  );

  return (
    <section className="relative min-h-screen flex items-center pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -end-20 w-[32rem] h-[32rem] bg-accent-gold/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="relative z-10 mx-auto max-w-site w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 text-center lg:text-start">
            {/* Giveaway CTA chip — replaces the old tagline. Remove when the giveaway ends. */}
            <div className="hero-animate">
              <Link
                href="/giveaway"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20 hover:bg-accent-teal/20 hover:border-accent-teal/40 hover:text-accent-gold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                {t("giveawayChip")}
                <span className="inline-block rtl:-scale-x-100" aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Headline — server-rendered (no hydration delay); words cascade via pure-CSS blur-up */}
            <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl text-text-primary leading-[1.05]">
              <span className="sr-only">Doppler VPN — </span>
              <span className="block" style={headlineFontStyle}>
                {line1Words.map(({ word, italic }, i) => (
                  <Fragment key={`l1-${i}`}>
                    <span
                      className={italic ? "hero-word italic" : "hero-word"}
                      style={{ animationDelay: `${WORD_BASE_DELAY + i * WORD_STAGGER}s` }}
                    >
                      {word}
                    </span>{" "}
                  </Fragment>
                ))}
              </span>
              {line2Words.length > 0 && (
                <span className="block mt-0" style={headlineFontStyle}>
                  {line2Words.map((word, j) => (
                    <Fragment key={`l2-${j}`}>
                      <span
                        className="hero-word bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent"
                        style={{ animationDelay: `${WORD_BASE_DELAY + (line1Words.length + j) * WORD_STAGGER}s` }}
                      >
                        {word}
                      </span>{" "}
                    </Fragment>
                  ))}
                </span>
              )}
            </h1>

            {/* Subheadline */}
            <p
              className="hero-animate hero-animate-delay-2 text-text-muted text-sm sm:text-base md:text-lg xl:text-xl max-w-md sm:max-w-xl lg:max-w-lg mx-auto lg:mx-0"
            >
              {t("subheadline")}
            </p>

            {/* Platform-Aware CTAs — client component for UA detection */}
            <div className="hero-animate hero-animate-delay-3 pt-4">
              <HeroCTAsWrapper />
            </div>

            {/* Social Proof — real store ratings + user count */}
            {socialProof}

            {/* Trust Badges */}
            <ul
              className="hero-animate hero-animate-delay-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-xs text-text-muted"
            >
              <li className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t("trustBadges.noData")}
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t("trustBadges.noLogs")}
              </li>
              <li className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t("trustBadges.vless")}
              </li>
            </ul>

            {/* Mobile globe — desktop gets the full-size one in the right column */}
            <div className="lg:hidden pt-6">
              <DotGlobe
                className="w-full max-w-[340px] aspect-square mx-auto"
                pointCount={450}
                label={t("globeAlt")}
                nodeLabels={nodeLabels}
              />
            </div>
          </div>

          {/* Right Column - Server network dot globe */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div
              className="absolute w-[26rem] h-[26rem] bg-accent-teal/15 rounded-full blur-3xl"
              aria-hidden="true"
            />
            <DotGlobe
              className="hero-animate hero-animate-delay-3 relative w-full max-w-[620px] aspect-square"
              label={t("globeAlt")}
              nodeLabels={nodeLabels}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
