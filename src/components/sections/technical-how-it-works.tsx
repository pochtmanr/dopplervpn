"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const flowSteps = ["step1", "step2", "step3", "step4"] as const;

const cardItems = [
  { key: "handshake", icon: "handshake" },
  { key: "dns", icon: "dns" },
  { key: "auth", icon: "auth" },
] as const;

const cardIcons: Record<string, React.ReactNode> = {
  handshake: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  dns: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  ),
  auth: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
};

export function TechnicalHowItWorks() {
  const t = useTranslations("technicalHowItWorks");

  return (
    <Section id="how-doppler-works">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Flow Steps as Cards with Arrows */}
      <div
        className="flex flex-col md:flex-row items-center md:items-stretch gap-0 mb-4"
        aria-label={`${t("flow.step1")} → ${t("flow.step2")} → ${t("flow.step3")} → ${t("flow.step4")}`}
        role="img"
      >
        {flowSteps.map((step, i) => (
          <div key={step} className="flex flex-col md:flex-row items-center md:items-stretch w-full md:w-1/4">
            <Reveal delay={i * 50} className="w-full">
              <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal text-lg font-semibold mb-4">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                  {t(`flow.${step}`)}
                </h3>
              </div>
            </Reveal>
            {i < flowSteps.length - 1 && (
              <>
                {/* Arrow right — desktop */}
                <div className="hidden md:flex items-center px-2 shrink-0">
                  <svg className="w-5 h-5 text-accent-teal/40 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
                {/* Arrow down — mobile */}
                <div className="flex md:hidden items-center py-2 shrink-0">
                  <svg className="w-5 h-5 text-accent-teal/40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0 6.75-6.75M12 19.5l-6.75-6.75" />
                  </svg>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cardItems.map(({ key, icon }, i) => (
          <Reveal key={key} delay={i * 50}>
            <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
                {cardIcons[icon]}
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                {t(`cards.${key}.title`)}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {t(`cards.${key}.description`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
