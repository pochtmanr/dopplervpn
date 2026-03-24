import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SupportFaq } from "./faq";
import { SupportContent } from "./support-content";
import { routing } from "@/i18n/routing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const baseUrl = "https://www.dopplervpn.org";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${baseUrl}/${locale}/support`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/support`]),
        ["x-default", `${baseUrl}/en/support`],
      ]),
    },
  };
}

/* ── Icons ────────────────────────────────────────────────────────── */

function TelegramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function EmailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

/* ── Data ─────────────────────────────────────────────────────────── */

const FAQ_KEYS = ["what", "cost", "subscribe", "multiDevice", "accountId", "refund", "privacy", "platforms"] as const;
const TROUBLESHOOT_KEYS = ["wontConnect", "drops", "battery", "noSub"] as const;

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function SupportPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");

  const faqItems = FAQ_KEYS.map((key) => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  }));

  const troubleshootItems = TROUBLESHOOT_KEYS.map((key) => ({
    question: t(`troubleshooting.items.${key}.question`),
    answer: t(`troubleshooting.items.${key}.answer`),
  }));

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-bg-primary pt-28 pb-20">
        {/* Background blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -start-20 w-[28rem] h-[28rem] bg-accent-teal/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -end-20 w-[32rem] h-[32rem] bg-accent-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Header ────────────────────────────────────────────── */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-text-primary mb-4 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* ── Account & Actions ──────────────────────────────────── */}
          <SupportContent />

          {/* ── FAQ + Troubleshooting (2-col on desktop) ──────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
            {/* ── FAQ ──────────────────────────────────────────────── */}
            <section id="faq">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                {t("faq.title")}
              </h2>
              <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 px-6">
                <SupportFaq items={faqItems} />
              </div>
            </section>

            {/* ── Troubleshooting ──────────────────────────────────── */}
            <section id="troubleshooting">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                {t("troubleshooting.title")}
              </h2>
              <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 px-6">
                <SupportFaq items={troubleshootItems} />
              </div>
            </section>
          </div>

          {/* ── Delete Account + Contact Us (2-col on desktop) ───── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
            {/* ── Delete Account ──────────────────────────────────── */}
            <section id="delete-account">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                {t("deleteAccount.title")}
              </h2>
              <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6">
                <ol className="space-y-3 mb-5">
                  {(["step1", "step2", "step3", "step4"] as const).map((key, i) => (
                    <li key={key} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-teal/15 text-accent-teal text-xs font-semibold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-text-muted leading-relaxed">
                        {t(`deleteAccount.${key}`)}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-4">
                  <p className="text-sm text-red-400 leading-relaxed">
                    {t("deleteAccount.warning")}
                  </p>
                </div>

                <p className="text-sm text-text-muted">
                  {t("deleteAccount.alternative")}
                </p>
              </div>
            </section>

            {/* ── Contact Us ─────────────────────────────────────── */}
            <section id="contact">
              <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
                {t("contact.title")}
              </h2>
              <div className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 space-y-4">
                <a
                  href="https://t.me/DopplerSupportBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-overlay/10 hover:border-[#2AABEE]/30 hover:bg-[#2AABEE]/5 p-4 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2AABEE]/15 border border-[#2AABEE]/25 flex items-center justify-center text-[#2AABEE] shrink-0">
                    <TelegramIcon />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{t("contact.telegram")}</div>
                    <div className="text-xs text-text-muted">{t("contact.telegramBot")}</div>
                  </div>
                </a>

                <a
                  href="mailto:support@simnetiq.store"
                  className="group flex items-center gap-4 rounded-xl border border-overlay/10 hover:border-accent-teal/30 hover:bg-accent-teal/5 p-4 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-teal/15 border border-accent-teal/25 flex items-center justify-center text-accent-teal shrink-0">
                    <EmailIcon />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{t("contact.email")}</div>
                    <div className="text-xs text-text-muted">{t("contact.emailAddress")}</div>
                  </div>
                </a>

                <p className="text-xs text-text-muted/70 text-center pt-2">
                  {t("contact.responseTime")}
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
