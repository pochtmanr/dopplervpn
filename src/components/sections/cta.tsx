"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { PricingBackdrop } from "@/components/glyph/pricing-glyphs";
import { HeroCTAsWrapper } from "@/components/hero/hero-ctas-wrapper";

function Stars() {
  return (
    <span className="flex items-center gap-px text-accent-gold" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.445a1 1 0 0 0-1.175 0l-3.367 2.445c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958Z" />
        </svg>
      ))}
    </span>
  );
}

export function CTA() {
  const t = useTranslations("cta");
  const tHero = useTranslations("hero");

  return (
    <section className="section relative overflow-hidden bg-bg-secondary/30">
      <PricingBackdrop />

      <div className="relative mx-auto max-w-site">
        <Reveal>
          {/* One glass card over the glyph backdrop (pricing's shell), bottom-end corner notched */}
          <div className="notch-card relative overflow-hidden rounded-2xl border border-accent-teal/20 bg-gradient-to-br from-accent-teal/[0.08] via-bg-primary/60 to-bg-primary/75 backdrop-blur-md">
            <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-[6fr_5fr]">
              {/* Content column */}
              <div className="space-y-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-center text-center lg:text-start">
                <h2 className="text-3xl sm:text-4xl lg:text-[clamp(2.25rem,3.3vw,3rem)] font-semibold text-text-primary leading-tight">
                  {t("doppler.titleMiddle")}{" "}
                  <span className="text-text-muted whitespace-nowrap">{t("doppler.titlePlayful")}</span>
                </h2>

                <p className="text-text-muted text-lg max-w-md mx-auto lg:mx-0">
                  {t("doppler.subtitle")}
                </p>

                {/* Social proof — same real numbers as the hero */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2">
                  <span className="flex items-center gap-1.5">
                    <Stars />
                    <span className="text-sm font-semibold text-text-primary">{tHero("socialProof.rating")}</span>
                    <span className="text-xs text-text-muted">{tHero("socialProof.appStore")}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Stars />
                    <span className="text-sm font-semibold text-text-primary">{tHero("socialProof.ratingGooglePlay")}</span>
                    <span className="text-xs text-text-muted">{tHero("socialProof.googlePlay")}</span>
                  </span>
                  <span className="hidden sm:inline text-text-tertiary" aria-hidden="true">·</span>
                  <span className="text-xs text-text-muted">{tHero("socialProof.users")}</span>
                </div>

                {/* The hero's pair: this device's download as the key, every other
                    platform one flat step away on /downloads. */}
                <div className="pt-2">
                  <HeroCTAsWrapper
                    location="landing-cta"
                    secondaryHref="/downloads"
                    secondaryLabel={tHero("downloadDesktop")}
                  />
                </div>
              </div>

              {/* Image column — bleeds to the card edges; the notch cuts its bottom-end corner.
                  The spacer holds the image's own aspect, so it only crops sideways when the
                  copy column is taller. */}
              <div className="relative overflow-hidden border-t lg:border-t-0 lg:border-s border-overlay/5">
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

            <span className="notch-edge" aria-hidden="true" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
