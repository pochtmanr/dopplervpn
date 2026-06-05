import { Fragment } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HeroCTAsWrapper } from "@/components/hero/hero-ctas-wrapper";
import { HeroParallax } from "@/components/hero/hero-parallax";

// Locales where decorative Latin-only fonts break (no Cyrillic/CJK/Arabic glyphs)
const FALLBACK_FONT_LOCALES = new Set(["ru", "uk", "zh", "ja", "ko", "ar", "fa", "he", "hi", "ur", "th"]);

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const useFallbackFont = FALLBACK_FONT_LOCALES.has(locale);

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

  return (
    <section className="relative min-h-screen flex items-center pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -end-20 w-[32rem] h-[32rem] bg-accent-gold/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="relative z-10 mx-auto max-w-7xl w-full">
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
            <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl text-text-primary leading-tight">
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
              className="hero-animate hero-animate-delay-2 text-text-muted text-sm sm:text-base md:text-lg max-w-md sm:max-w-xl mx-auto lg:mx-0"
            >
              {t("subheadline")}
            </p>

            {/* Platform-Aware CTAs — client component for UA detection */}
            <div className="hero-animate hero-animate-delay-3 pt-4">
              <HeroCTAsWrapper />
            </div>

            {/* Trust Badges */}
            <div
              className="hero-animate hero-animate-delay-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-4 text-xs text-text-muted"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t("trustBadges.noData")}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t("trustBadges.noLogs")}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t("trustBadges.unlimited")}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                {t("trustBadges.vless")}
              </span>
            </div>
          </div>

          {/* Right Column - Devices with parallax */}
          <HeroParallax>
            {/* Background frame with hero.avif */}
            <div className="relative w-full max-w-xl mx-auto h-full rounded-3xl overflow-hidden border border-white/[0.06]">
              <Image
                src="/images/hero.avif"
                alt="Doppler VPN — secure private VPN for iOS, Android, Mac and Windows"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 0px, (max-width: 1280px) 50vw, 576px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/10 via-transparent to-accent-gold/5" />
            </div>
          </HeroParallax>
        </div>
      </div>
    </section>
  );
}
