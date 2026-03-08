import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { Arrow } from "@/components/ui/arrow";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/* ── Download data ────────────────────────────────────────────────── */

const MOBILE = {
  ios: {
    doppler: {
      href: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
    },
    vless: {
      href: "https://apps.apple.com/app/streisand/id6450534064",
      name: "Streisand",
      store: "App Store",
    },
  },
  android: {
    doppler: {
      href: "/downloads/doppler-vpn-v1.2.0.apk",
      meta: "APK \u00b7 v1.2.0 \u00b7 95 MB",
    },
    vless: {
      href: "https://github.com/2dust/v2rayNG/releases/download/1.10.32/v2rayNG_1.10.32_universal.apk",
      name: "v2rayNG",
      meta: "APK \u00b7 Universal \u00b7 93 MB",
    },
  },
};

const DESKTOP = {
  windows: [
    {
      labelKey: "x64" as const,
      href: "https://github.com/2dust/v2rayN/releases/download/7.18.0/v2rayN-windows-64.zip",
      size: "143 MB",
      arch: "Intel / AMD 64-bit",
      ext: ".zip",
    },
    {
      labelKey: "arm64" as const,
      href: "https://github.com/2dust/v2rayN/releases/download/7.18.0/v2rayN-windows-arm64.zip",
      size: "133 MB",
      arch: "ARM64 (Snapdragon)",
      ext: ".zip",
    },
  ],
  mac: {
    doppler: {
      href: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
    },
  },
};

/* ── Icons ────────────────────────────────────────────────────────── */

function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.61 15.15c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m-9.22 0c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m9.5-5.09l1.67-2.88a.35.35 0 00-.12-.47.35.35 0 00-.48.12l-1.69 2.93A10.1 10.1 0 0012 8.57c-1.53 0-2.98.34-4.27.95L6.04 6.59a.35.35 0 00-.48-.12.35.35 0 00-.12.47l1.67 2.88C4.44 11.36 2.62 14.09 2.3 17.3h19.4c-.32-3.21-2.14-5.94-4.81-7.24z" />
    </svg>
  );
}

function WindowsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function AppsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("apps");

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-bg-primary pt-28 pb-20">
        {/* Background blurs — same as hero, full page */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -end-20 w-[32rem] h-[32rem] bg-accent-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-primary mb-4 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          <div className="space-y-14">
            {/* ── Mobile ──────────────────────────────────────────── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-5">
                {t("mobileApps")}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* iOS */}
                <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                      <AppleIcon />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{t("ios.title")}</h3>
                      <p className="text-xs text-text-muted">{t("ios.description")}</p>
                    </div>
                  </div>

                  <a
                    href={MOBILE.ios.doppler.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <DownloadIcon className="w-4 h-4 text-accent-teal shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-text-primary">{t("ios.doppler")}</div>
                        <div className="text-xs text-text-muted">{t("ios.dopplerSub")}</div>
                      </div>
                    </div>
                    <span className="text-accent-teal text-sm font-medium shrink-0">
                      {t("ios.appStore")} <Arrow />
                    </span>
                  </a>

                  {/* VLESS */}
                  <div className="rounded-xl border border-overlay/8 bg-bg-primary/40 px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-accent-gold/15 text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
                        VLESS
                      </span>
                      <span className="text-[11px] text-text-muted">{t("vlessNote")}</span>
                    </div>
                    <a
                      href={MOBILE.ios.vless.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-overlay/5 transition-colors"
                    >
                      <div>
                        <div className="text-sm text-text-primary">{MOBILE.ios.vless.name}</div>
                        <div className="text-[11px] text-text-muted">{MOBILE.ios.vless.store}</div>
                      </div>
                      <span className="text-text-muted text-xs group-hover:text-accent-teal transition-colors">
                        {t("download")} <Arrow />
                      </span>
                    </a>
                  </div>
                </div>

                {/* Android */}
                <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                      <AndroidIcon />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{t("android.title")}</h3>
                      <p className="text-xs text-text-muted">{t("android.description")}</p>
                    </div>
                  </div>

                  {/* Doppler Android — APK download */}
                  <a
                    href={MOBILE.android.doppler.href}
                    download
                    className="group flex items-center justify-between rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <DownloadIcon className="w-4 h-4 text-accent-teal shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-text-primary">{t("android.doppler")}</div>
                        <div className="text-xs text-text-muted">{MOBILE.android.doppler.meta}</div>
                      </div>
                    </div>
                    <span className="text-accent-teal text-sm font-medium shrink-0">
                      {t("download")} APK <Arrow />
                    </span>
                  </a>

                  {/* VLESS — direct GitHub APK download */}
                  <div className="rounded-xl border border-overlay/8 bg-bg-primary/40 px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-accent-gold/15 text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
                        VLESS
                      </span>
                      <span className="text-[11px] text-text-muted">{t("vlessNote")}</span>
                    </div>
                    <a
                      href={MOBILE.android.vless.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-overlay/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <DownloadIcon className="w-4 h-4 text-accent-teal shrink-0" />
                        <div>
                          <div className="text-sm text-text-primary">{MOBILE.android.vless.name}</div>
                          <div className="text-[11px] text-text-muted">{MOBILE.android.vless.meta}</div>
                        </div>
                      </div>
                      <span className="text-text-muted text-xs group-hover:text-accent-teal transition-colors shrink-0">
                        GitHub APK <Arrow />
                      </span>
                    </a>
                  </div>

                  <Link
                    href="/guide/android"
                    className="inline-block text-xs text-text-muted hover:text-accent-teal transition-colors"
                  >
                    {t("viewSetupGuide")} <Arrow />
                  </Link>
                </div>
              </div>
            </section>

            {/* ── Desktop ─────────────────────────────────────────── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-5">
                {t("desktopApps")}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Windows */}
                <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                      <WindowsIcon />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{t("windows.title")}</h3>
                      <p className="text-xs text-text-muted">{t("windows.description")}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {DESKTOP.windows.map((v) => (
                      <a
                        key={v.labelKey}
                        href={v.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-xl px-4 py-3 border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <DownloadIcon className="w-4 h-4 text-text-muted group-hover:text-accent-teal transition-colors shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-text-primary">{t(`windows.${v.labelKey}`)}</div>
                            <div className="text-[11px] text-text-muted">{v.arch}</div>
                          </div>
                        </div>
                        <span className="text-xs text-text-muted shrink-0">{v.ext} &middot; {v.size}</span>
                      </a>
                    ))}
                  </div>

                  <Link
                    href="/guide/windows"
                    className="inline-block text-xs text-text-muted hover:text-accent-teal transition-colors"
                  >
                    {t("viewSetupGuide")} <Arrow />
                  </Link>
                </div>

                {/* macOS */}
                <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                      <AppleIcon />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{t("mac.title")}</h3>
                      <p className="text-xs text-text-muted">{t("mac.description")}</p>
                    </div>
                  </div>

                  <a
                    href={DESKTOP.mac.doppler.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <DownloadIcon className="w-4 h-4 text-accent-teal shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-text-primary">{t("mac.doppler")}</div>
                        <div className="text-xs text-text-muted">{t("mac.dopplerSub")}</div>
                      </div>
                    </div>
                    <span className="text-accent-teal text-sm font-medium shrink-0">
                      {t("mac.macAppStore")} <Arrow />
                    </span>
                  </a>
                </div>
              </div>
            </section>

            {/* ── Telegram Bot — Prominent CTA ───────────────────── */}
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-5">
                {t("telegramWeb")}
              </h2>

              <a
                href="https://t.me/dopplercreatebot"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-2xl border border-[#2AABEE]/30 bg-[#2AABEE]/5 p-6 sm:p-8 hover:border-[#2AABEE]/50 hover:bg-[#2AABEE]/10 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#2AABEE]/15 border border-[#2AABEE]/25 flex items-center justify-center text-[#2AABEE] shrink-0">
                  <TelegramIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary mb-0.5">{t("telegram.title")}</h3>
                  <p className="text-sm text-text-muted">{t("telegram.description")}</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2AABEE]/15 text-[#2AABEE] text-sm font-medium shrink-0 group-hover:bg-[#2AABEE]/25 transition-colors">
                  @dopplercreatebot <Arrow />
                </span>
              </a>

              {/* Coming soon items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="rounded-xl border border-overlay/10 bg-bg-secondary/50 p-5 opacity-60">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{t("miniApp.title")}</h3>
                  <p className="text-xs text-text-muted mb-2">{t("miniApp.description")}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
                    {t("comingSoon")}
                  </span>
                </div>
                <div className="rounded-xl border border-overlay/10 bg-bg-secondary/50 p-5 opacity-60">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{t("extension.title")}</h3>
                  <p className="text-xs text-text-muted mb-2">{t("extension.description")}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-muted/50" />
                    {t("comingSoon")}
                  </span>
                </div>
              </div>
            </section>

            {/* ── Bottom CTA ──────────────────────────────────────── */}
            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-3">
                {t("needHelp")}
              </h2>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-accent-teal hover:text-accent-teal-light font-medium transition-colors"
              >
                {t("viewGuides")} <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
