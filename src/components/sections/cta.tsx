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
            

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
                {t("doppler.titleItalic")}{" "}
                {t("doppler.titleMiddle")}{" "}
                <span className="bg-gradient-to-t from-text-muted to-text-primary bg-clip-text text-transparent">
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
              <Link
                href="/downloads"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary text-text-muted hover:text-text-primary border border-overlay/10 hover:border-overlay/20"
              >
                {t("doppler.downloads")}
                <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Platform-specific SEO links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-1">
              <Link
                href="/vpn-for-ios"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                {t("doppler.learnIos")}
                <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/vpn-for-android"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                {t("doppler.learnAndroid")}
                <svg className="w-3.5 h-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
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
