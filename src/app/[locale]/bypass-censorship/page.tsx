import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section, SectionHeader } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "bypassCensorship.metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

const protocolRows = ["openvpn", "wireguard", "vless"] as const;
const comparisonCols = ["detectability", "speed", "censorship", "fingerprint"] as const;
const environments = ["isp", "national", "corporate", "public"] as const;

export default async function BypassCensorshipPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("bypassCensorship");

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-text-primary mb-4">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* The Problem */}
        <Section>
          <SectionHeader title={t("problem.title")} />
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-text-muted leading-relaxed">{t("problem.p1")}</p>
            <p className="text-text-muted leading-relaxed">{t("problem.p2")}</p>
            <p className="text-text-muted leading-relaxed">{t("problem.p3")}</p>
          </div>
        </Section>

        {/* How Doppler Evades Detection */}
        <Section>
          <SectionHeader title={t("evasion.title")} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {(["reality", "noSignature", "indistinguishable", "infrastructure"] as const).map((key) => (
              <div key={key} className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t(`evasion.${key}.title`)}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {t(`evasion.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Flow Diagram */}
        <Section>
          <SectionHeader title={t("flow.title")} />
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {(["step1", "step2", "step3", "step4"] as const).map((step, i) => (
                <div key={step} className="rounded-2xl border border-accent-teal/20 bg-accent-teal/5 p-5 flex flex-col items-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-xl bg-accent-teal/15 flex items-center justify-center text-accent-teal font-semibold">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {t(`flow.${step}`)}
                  </span>
                  <span className="text-xs text-text-muted leading-relaxed">
                    {t(`flow.${step}note`)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-sm text-accent-teal font-medium">
              {t("flow.dpiLabel")}
            </p>
          </div>
        </Section>

        {/* Protocol Comparison */}
        <Section>
          <SectionHeader title={t("comparison.title")} />
          <div className="max-w-4xl mx-auto overflow-x-auto rounded-2xl border border-overlay/10">
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
        </Section>

        {/* Where Doppler Works */}
        <Section>
          <SectionHeader title={t("works.title")} />
          <div className="max-w-3xl mx-auto">
            <p className="text-text-muted leading-relaxed mb-6">{t("works.description")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {environments.map((env) => (
                <div key={env} className="flex items-center gap-3 p-3 rounded-xl border border-overlay/10 bg-bg-secondary/50">
                  <svg className="w-5 h-5 text-accent-teal shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-text-primary">{t(`works.environments.${env}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Bottom CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-3">
              {t("cta.title")}
            </h2>
            <p className="text-text-muted text-lg mb-6">{t("cta.subtitle")}</p>
            <Link
              href="/downloads"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-accent-teal/20 text-accent-teal hover:bg-accent-teal/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
            >
              {t("cta.button")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
