"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-accent-teal/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Column */}
          <Reveal className="space-y-6 text-center lg:text-start">
            {/* App Icon + Headline */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-4">
              <Image
                src="/images/iosdopplerlogo.png"
                alt="Doppler VPN"
                width={80}
                height={80}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] shadow-lg shrink-0"
              />

              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-text-primary leading-tight">
                <span
                  className="italic"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {t("doppler.titleItalic")}
                </span>{" "}
                <span style={{ fontFamily: "var(--font-serif)" }}>
                  {t("doppler.titleMiddle")}
                </span>{" "}
                <span
                  className="bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent"
                  style={{ fontFamily: "var(--font-raster)" }}
                >
                  {t("doppler.titlePlayful")}
                </span>
              </h2>
            </div>

            {/* Subheadline */}
            <p className="text-text-muted text-lg max-w-md mx-auto lg:mx-0">
              {t("doppler.subtitle")}
            </p>

            {/* Subscribe Button */}
            <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/account"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30"
              >
                {t("doppler.cta")}
              </Link>
            </div>
          </Reveal>

          {/* Image Column */}
          <Reveal delay={100} className="w-full">
            <Card
              padding="none"
              className="relative w-full aspect-[4/3] overflow-hidden border-accent-teal/20 bg-gradient-to-br from-accent-teal/10 via-transparent to-accent-gold/5"
            >
              <div className="absolute inset-0">
                <Image
                  src="/images/dopplerdownload.avif"
                  alt="Doppler VPN app interface"
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
