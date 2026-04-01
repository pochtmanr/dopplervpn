import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ogLocaleMap } from "@/lib/og-locale-map";
import { BreadcrumbSchema } from "@/components/seo/json-ld";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apps" });
  const title = t("title");
  const description = t("subtitle");
  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/downloads`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/downloads`]),
        ["x-default", `${baseUrl}/en/downloads`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}/downloads`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og-banner.jpg`,
          width: 1200,
          height: 630,
          alt: "Doppler VPN — Fast & Secure",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/og-banner.jpg`],
    },
  };
}

/* ── Download URLs ───────────────────────────────────────────────── */

const URLS = {
  ios: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  androidPlayStore: "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
  mac: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  windowsX64: "https://github.com/pochtmanr/dopplervpn/releases/download/windows-v1.0.0/DopplerVPN-1.0.0-x64-Setup.exe",
  windowsArm64: "https://github.com/pochtmanr/dopplervpn/releases/download/windows-v1.0.0/DopplerVPN-1.0.0-arm64-Setup.exe",
};

/* ── Icons ────────────────────────────────────────────────────────── */

function AppleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.61 15.15c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m-9.22 0c-.46 0-.84-.37-.84-.83s.38-.83.84-.83c.46 0 .83.37.83.83s-.37.83-.83.83m9.5-5.09l1.67-2.88a.35.35 0 00-.12-.47.35.35 0 00-.48.12l-1.69 2.93A10.1 10.1 0 0012 8.57c-1.53 0-2.98.34-4.27.95L6.04 6.59a.35.35 0 00-.48-.12.35.35 0 00-.12.47l1.67 2.88C4.44 11.36 2.62 14.09 2.3 17.3h19.4c-.32-3.21-2.14-5.94-4.81-7.24z" />
    </svg>
  );
}

function WindowsIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.67L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18l10 .08V21l-10-1.76V13.18z" />
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

/* ── Setup Steps Component ───────────────────────────────────────── */

function SetupSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2.5 mt-4">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-teal/15 text-accent-teal text-xs font-semibold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm text-text-muted leading-relaxed">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function DownloadsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("apps");

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${baseUrl}/${locale}` },
          { name: t("title"), url: `${baseUrl}/${locale}/downloads` },
        ]}
      />
      <Navbar />
      <main className="relative min-h-screen bg-bg-primary pt-28 pb-20">
        {/* Background blurs */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── iOS ──────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                  <AppleIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary">{t("ios.title")}</h2>
              </div>

              <a
                href={URLS.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all text-accent-teal font-medium text-sm"
              >
                <DownloadIcon className="w-4 h-4" />
                {t("ios.button")}
              </a>

              <SetupSteps
                steps={[t("ios.step1"), t("ios.step2"), t("ios.step3"), t("ios.step4")]}
              />

              <Link
                href="/vpn-for-ios"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-teal hover:text-accent-gold transition-colors"
              >
                {t("ios.learnMore", { defaultMessage: "Learn more about VPN for iOS" })}
                <svg className="w-3.5 h-3.5 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
              <p className="mt-2 text-xs text-text-muted/70 italic">
                {t("syncNote")}
              </p>
            </div>

            {/* ── Android ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                  <AndroidIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary">{t("android.title")}</h2>
              </div>

              <a
                href={URLS.androidPlayStore}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all text-accent-teal font-medium text-sm"
              >
                <DownloadIcon className="w-4 h-4" />
                {t("android.buttonPlayStore")}
              </a>

              <SetupSteps
                steps={[t("android.step1"), t("android.step2"), t("android.step3"), t("android.step4")]}
              />

              <Link
                href="/vpn-for-android"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-teal hover:text-accent-gold transition-colors"
              >
                {t("android.learnMore", { defaultMessage: "Learn more about VPN for Android" })}
                <svg className="w-3.5 h-3.5 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
              <p className="mt-2 text-xs text-text-muted/70 italic">
                {t("syncNote")}
              </p>
            </div>

            {/* ── macOS ────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                  <AppleIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary">{t("mac.title")}</h2>
              </div>

              <a
                href={URLS.mac}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all text-accent-teal font-medium text-sm"
              >
                <DownloadIcon className="w-4 h-4" />
                {t("mac.button")}
              </a>

              <SetupSteps
                steps={[t("mac.step1"), t("mac.step2"), t("mac.step3"), t("mac.step4")]}
              />

              <Link
                href="/vpn-for-macos"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-teal hover:text-accent-gold transition-colors"
              >
                {t("mac.learnMore")}
                <svg className="w-3.5 h-3.5 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
              <p className="mt-2 text-xs text-text-muted/70 italic">
                {t("syncNote")}
              </p>
            </div>

            {/* ── Windows ──────────────────────────────────────────── */}
            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted">
                  <WindowsIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary">{t("windows.title")}</h2>
              </div>

              <a
                href={URLS.windowsX64}
                download
                className="group flex items-center justify-center gap-2 rounded-xl bg-accent-teal/10 border border-accent-teal/20 px-4 py-3 hover:bg-accent-teal/15 hover:border-accent-teal/40 transition-all text-accent-teal font-medium text-sm"
              >
                <DownloadIcon className="w-4 h-4" />
                {t("windows.buttonX64")}
              </a>

              <a
                href={URLS.windowsArm64}
                download
                className="group flex items-center justify-center gap-2 rounded-xl border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 px-4 py-2.5 mt-2 transition-all text-text-muted hover:text-accent-teal text-sm"
              >
                <DownloadIcon className="w-4 h-4" />
                {t("windows.buttonArm64")}
              </a>

              <SetupSteps
                steps={[t("windows.step1"), t("windows.step2"), t("windows.step3"), t("windows.step4")]}
              />

              <Link
                href="/vpn-for-windows"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-teal hover:text-accent-gold transition-colors"
              >
                {t("windows.learnMore")}
                <svg className="w-3.5 h-3.5 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
              <p className="mt-2 text-xs text-text-muted/70 italic">
                {t("syncNote")}
              </p>
            </div>
          </div>

          {/* ── Bottom Cards ──────────────────────────────────── */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bypass Censorship */}
            <Link
              href="/bypass-censorship"
              className="group rounded-2xl border border-accent-teal/20 bg-accent-teal/5 p-8 sm:p-10 text-center hover:bg-accent-teal/10 hover:border-accent-teal/30 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary mb-2">
                {t("censorshipCard.title")}
              </h2>
              <p className="text-sm text-text-muted">
                {t("censorshipCard.description")}
              </p>
            </Link>

            {/* Need Help */}
            <Link
              href="/support"
              className="group rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-8 sm:p-10 text-center hover:bg-bg-secondary/70 hover:border-overlay/20 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-overlay/5 border border-overlay/10 flex items-center justify-center text-text-muted mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary mb-2">
                {t("needHelp")}
              </h2>
              <p className="text-sm text-text-muted">
                {t("visitSupport")}
              </p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
