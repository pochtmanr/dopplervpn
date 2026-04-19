"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { trackCta, type CtaPlatform, type CtaVariant } from "@/lib/track-cta";

const APP_STORE_URL = "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=org.dopplervpn.android";
const WINDOWS_X64_URL = "/api/windows/download/DopplerVPN-1.0.0-x64-Setup.exe";

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z" />
    </svg>
  );
}

export function CTA() {
  const t = useTranslations("cta");
  const tHero = useTranslations("hero");

  const platforms: ReadonlyArray<{
    id: string;
    platform: CtaPlatform;
    variant?: CtaVariant;
    href: string;
    label: string;
    icon: React.ReactNode;
    external: boolean;
    download: boolean;
  }> = [
    { id: "ios", platform: "ios", href: APP_STORE_URL, label: tHero("downloadIos"), icon: <AppleIcon />, external: true, download: false },
    { id: "android", platform: "android", variant: "android-play", href: GOOGLE_PLAY_URL, label: tHero("downloadAndroid"), icon: <PlayIcon />, external: true, download: false },
    { id: "mac", platform: "mac", href: APP_STORE_URL, label: tHero("downloadMac"), icon: <AppleIcon />, external: true, download: false },
    { id: "windows", platform: "windows", variant: "windows-x64", href: WINDOWS_X64_URL, label: tHero("downloadWindows"), icon: <WindowsIcon />, external: false, download: true },
  ];

  const btnClass =
    "group relative inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] backdrop-blur-sm text-text-primary hover:border-accent-teal/30 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary";
  const iconWrap =
    "w-9 h-9 rounded-lg bg-gradient-to-br from-accent-teal/20 to-accent-teal/5 border border-accent-teal/25 text-accent-teal flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-1/4 end-1/4 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Column */}
          <Reveal className="space-y-6 text-center lg:text-start">
            {/* App Icon + Headline */}
            <div className="flex flex-row items-center justify-center lg:justify-start gap-4">


              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-text-primary leading-tight">
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

            {/* Platform Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              {platforms.map((p) => {
                const onClick = () => trackCta("landing-cta", p.platform, p.variant);
                return p.external ? (
                  <a
                    key={p.id}
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClick}
                    className={btnClass}
                  >
                    <span className={iconWrap}>{p.icon}</span>
                    <span className="text-sm font-medium leading-tight">{p.label}</span>
                  </a>
                ) : (
                  <a key={p.id} href={p.href} download onClick={onClick} className={btnClass}>
                    <span className={iconWrap}>{p.icon}</span>
                    <span className="text-sm font-medium leading-tight">{p.label}</span>
                  </a>
                );
              })}
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
