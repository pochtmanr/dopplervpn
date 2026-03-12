import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { HeroCTAsWrapper } from "@/components/hero/hero-ctas-wrapper";
import { HeroParallax } from "@/components/hero/hero-parallax";

// Locales where decorative Latin-only fonts break (no Cyrillic/CJK/Arabic glyphs)
const FALLBACK_FONT_LOCALES = new Set(["ru", "uk", "zh", "ja", "ko", "ar", "fa", "he", "hi", "ur", "th"]);

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const useFallbackFont = FALLBACK_FONT_LOCALES.has(locale);

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            {/* Tagline Badge */}
            <div className="hero-animate">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20">
                {t("tagline")}
              </span>
            </div>

            {/* Headline — server-rendered, no hydration delay */}
            <h1
              className="hero-animate hero-animate-delay-1 text-5xl sm:text-6xl md:text-6xl lg:text-7xl text-text-primary leading-tight"
            >
              <span
                className="block"
                style={useFallbackFont ? { fontFamily: "var(--font-body)", fontWeight: 300 } : { fontFamily: "var(--font-serif)" }}
              >
                {useFallbackFont ? (
                  <>{t("headlinePart1a")} {t("headlinePart1b")}</>
                ) : (
                  <><span className="italic">{t("headlinePart1a")}</span>{" "}<span>{t("headlinePart1b")}</span></>
                )}
              </span>
              {t("headlinePart2") && (
                <span
                  className="block mt-0 bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent"
                  style={useFallbackFont ? { fontFamily: "var(--font-body)", fontWeight: 300 } : { fontFamily: "var(--font-serif)" }}
                >
                  {t("headlinePart2")}
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
