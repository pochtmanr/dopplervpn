"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { HeroCTAs } from "@/components/hero/hero-ctas";
import type { Platform } from "@/components/hero/hero-ctas";

// Locales where decorative Latin-only fonts break (no Cyrillic/CJK/Arabic glyphs)
const FALLBACK_FONT_LOCALES = new Set(["ru", "uk", "zh", "ja", "ko", "ar", "fa", "he", "hi", "ur", "th"]);

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

export function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const useFallbackFont = FALLBACK_FONT_LOCALES.has(locale);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const sectionRef = useRef<HTMLElement>(null);
  const androidRef = useRef<HTMLDivElement>(null);
  const iphoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionHeight = rect.height;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));

    // Both go down, iPhone faster — creates depth/3D parallax
    const iphoneDrift = progress * sectionHeight * 0.2;
    const androidDrift = progress * sectionHeight * 0.12;

    if (iphoneRef.current) {
      iphoneRef.current.style.transform = `translateY(${iphoneDrift}px)`;
    }
    if (androidRef.current) {
      androidRef.current.style.transform = `translateY(${androidDrift}px)`;
    }
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");

    const toggle = () => {
      if (mql.matches) {
        window.addEventListener("scroll", handleScroll, { passive: true });
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };

    toggle();
    mql.addEventListener("change", toggle);

    return () => {
      mql.removeEventListener("change", toggle);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects - no overflow-hidden so blurs bleed into next section */}
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

            {/* Headline */}
            <h1
              className="hero-animate hero-animate-delay-1 text-5xl sm:text-6xl md:text-6xl lg:text-7xl text-text-primary leading-tight"
            >
              <span
                className="block"
                style={useFallbackFont ? { fontFamily: "var(--font-body)", fontWeight: 700 } : { fontFamily: "var(--font-serif)" }}
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
                  style={useFallbackFont ? { fontFamily: "var(--font-body)", fontWeight: 700 } : { fontFamily: "var(--font-serif)" }}
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

            {/* Platform-Aware CTAs */}
            <div className="hero-animate hero-animate-delay-3 pt-4">
              <HeroCTAs platform={platform} />
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

          {/* Right Column - Frame with devices escaping */}
          <div className="hero-animate hero-animate-delay-3 hidden lg:block relative h-[600px] overflow-hidden">
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
              {/* Overlay gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-teal/10 via-transparent to-accent-gold/5" />
            </div>

            {/* Android device — behind frame, drifts down slower */}
            <div
              ref={androidRef}
              className="absolute will-change-transform"
              style={{ zIndex: 1, bottom: "30px", left: "50%", marginLeft: "-40px" }}
            >
              <div className="relative w-[240px] h-[480px] drop-shadow-2xl">
                <Image
                  src="/images/android-hero.png"
                  alt="Doppler VPN on Android"
                  fill
                  className="object-contain"
                  sizes="240px"
                />
              </div>
            </div>

            {/* iPhone device — in front of frame, drifts down faster */}
            <div
              ref={iphoneRef}
              className="absolute will-change-transform"
              style={{ zIndex: 2, bottom: "50px", left: "50%", marginLeft: "-210px" }}
            >
              <div className="relative w-[260px] h-[520px] drop-shadow-2xl">
                <Image
                  src="/images/iphone1.png"
                  alt="Doppler VPN on iPhone — Protected"
                  fill
                  className="object-contain"
                  sizes="260px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
