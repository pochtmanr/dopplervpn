import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

const URLS = {
  ios: "https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773",
  androidPlayStore: "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
  telegramBot: "https://t.me/dopplercreatebot",
  telegramChannelRu: "https://t.me/dopplervpn",
  telegramChannelEn: "https://t.me/dopplervpnen",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bypassCensorship.metadata" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${baseUrl}/${locale}/bypass-censorship`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/bypass-censorship`]),
        ["x-default", `${baseUrl}/en/bypass-censorship`],
      ]),
    },
  };
}

const protocolRows = ["openvpn", "wireguard", "vless"] as const;
const comparisonCols = ["detectability", "speed", "censorship", "fingerprint"] as const;

const detectionMethods = ["method1", "method2", "method3", "method4"] as const;
const defenseKeys = ["signatures", "fingerprinting", "entropy", "probing", "blacklisting"] as const;
const prepareSteps = ["step1", "step2", "step3", "step4", "step5"] as const;
const futureStages = ["stage1", "stage2", "stage3"] as const;

/* ── Icons ────────────────────────────────────────────────────────── */

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-accent-teal shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function BypassCensorshipPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("bypassCensorship");

  const stageColors = [
    "border-accent-teal/30 bg-accent-teal/5",
    "border-accent-gold/30 bg-accent-gold/5",
    "border-red-500/30 bg-red-500/5",
  ];
  const stageLabelColors = [
    "bg-accent-teal/15 text-accent-teal",
    "bg-accent-gold/15 text-accent-gold",
    "bg-red-500/15 text-red-400",
  ];

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -end-20 w-[24rem] h-[24rem] bg-accent-gold/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* ── How Governments Detect VPNs ──────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4 text-center">
              {t("detection.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("detection.intro")}
            </p>

            {/* TSPU Overview */}
            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <EyeIcon />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">
                  {t("detection.tspu.title")}
                </h3>
              </div>
              <div className="space-y-3">
                <p className="text-text-muted leading-relaxed">{t("detection.tspu.p1")}</p>
                <p className="text-text-muted leading-relaxed">{t("detection.tspu.p2")}</p>
                <p className="text-text-muted leading-relaxed">{t("detection.tspu.p3")}</p>
              </div>
            </div>

            {/* 4 Detection Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {detectionMethods.map((method, i) => (
                <div key={method} className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 text-sm font-semibold">
                      {i + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {t(`detection.${method}.title`)}
                    </h3>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`detection.${method}.description`)}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-center text-text-muted font-medium italic">
              {t("detection.conclusion")}
            </p>
          </div>
        </section>

        {/* ── How Doppler Defeats Each Method ─────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("defeats.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("defeats.subtitle")}
            </p>

            <div className="space-y-4">
              {defenseKeys.map((key) => (
                <div key={key} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                  <div className="flex items-center gap-3 md:w-56 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-red-400">{t(`defeats.${key}.attack`)}</span>
                  </div>
                  <div className="hidden md:flex items-center">
                    <ArrowIcon />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-accent-teal/15 flex items-center justify-center">
                        <CheckIcon />
                      </div>
                      <span className="text-sm font-semibold text-accent-teal">{t(`defeats.${key}.defense`)}</span>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`defeats.${key}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blocked in Russia ────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-accent-teal/20 bg-accent-teal/[0.03] p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal">
                  <ShieldIcon />
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary">
                    {t("blocked.title")}
                  </h2>
                  <span className="text-xs font-medium text-accent-teal bg-accent-teal/10 px-2 py-0.5 rounded-full">
                    {t("blocked.badge")}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-text-muted leading-relaxed">{t("blocked.p1")}</p>
                <p className="text-text-muted leading-relaxed">{t("blocked.p2")}</p>
                <p className="text-text-primary font-medium">{t("blocked.p3")}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(["stat1", "stat2", "stat3"] as const).map((stat) => (
                  <div key={stat} className="text-center">
                    <div className="text-lg font-semibold text-accent-teal">{t(`blocked.${stat}value`)}</div>
                    <div className="text-xs text-text-muted mt-0.5">{t(`blocked.${stat}label`)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Future of Restrictions ──────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("future.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
              {t("future.intro")}
            </p>

            {/* Timeline stages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {futureStages.map((stage, i) => (
                <div key={stage} className={`rounded-2xl border ${stageColors[i]} p-6`}>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${stageLabelColors[i]}`}>
                    {t(`future.${stage}.label`)}
                  </span>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t(`future.${stage}.title`)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">
                    {t(`future.${stage}.description`)}
                  </p>
                  <span className="text-xs text-text-muted/70 italic">
                    {t(`future.${stage}.status`)}
                  </span>
                </div>
              ))}
            </div>

            {/* Economic reality */}
            <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 md:p-8">
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                {t("future.reality.title")}
              </h3>
              <div className="space-y-3">
                <p className="text-text-muted leading-relaxed">{t("future.reality.p1")}</p>
                <p className="text-text-muted leading-relaxed">{t("future.reality.p2")}</p>
                <p className="text-text-muted leading-relaxed">{t("future.reality.p3")}</p>
                <p className="text-text-primary font-medium leading-relaxed">{t("future.reality.p4")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How to Prepare ──────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3 text-center">
              {t("prepare.title")}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto text-center mb-12 leading-relaxed">
              {t("prepare.subtitle")}
            </p>

            <div className="space-y-4">
              {prepareSteps.map((step, i) => (
                <div key={step} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/20 flex items-center justify-center text-accent-teal font-semibold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">
                      {t(`prepare.${step}.title`)}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`prepare.${step}.description`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Protocol Comparison ─────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-8 text-center">
              {t("comparison.title")}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-overlay/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-secondary/50">
                    <th scope="col" className="text-start p-4 font-medium text-text-muted">
                      {t("comparison.headers.protocol")}
                    </th>
                    {comparisonCols.map((col) => (
                      <th key={col} scope="col" className="text-start p-4 font-medium text-text-muted">
                        {t(`comparison.headers.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {protocolRows.map((row, i) => (
                    <tr key={row} className={`${i < protocolRows.length - 1 ? "border-t border-overlay/5" : ""} ${row === "vless" ? "bg-accent-teal/5" : ""}`}>
                      <th scope="row" className={`text-start p-4 font-medium ${row === "vless" ? "text-accent-teal" : "text-text-primary"}`}>
                        {t(`comparison.${row}.name`)}
                      </th>
                      {comparisonCols.map((col) => (
                        <td key={col} className={`p-4 ${row === "vless" ? "text-accent-teal font-medium" : "text-text-muted"}`}>
                          {t(`comparison.${row}.${col}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-text-muted text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>

            {/* Primary download buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a
                href={URLS.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors"
              >
                {t("cta.downloadIos")}
              </a>
              <a
                href={URLS.androidPlayStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors"
              >
                {t("cta.downloadAndroid")}
              </a>
              <a
                href={URLS.telegramBot}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-accent-gold/15 text-accent-gold hover:bg-accent-gold/25 transition-colors"
              >
                {t("cta.telegramBot")}
              </a>
            </div>

            {/* Telegram channel links */}
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={URLS.telegramChannelRu}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.telegramChannelRu")}
              </a>
              <a
                href={URLS.telegramChannelEn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-teal transition-colors"
              >
                <ArrowIcon />
                {t("cta.telegramChannelEn")}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
