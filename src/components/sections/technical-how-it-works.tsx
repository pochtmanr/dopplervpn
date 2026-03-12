"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const flowSteps = ["step1", "step2", "step3", "step4"] as const;

export function TechnicalHowItWorks() {
  const t = useTranslations("technicalHowItWorks");

  return (
    <Section id="how-doppler-works">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Flow Steps as Cards with Arrows */}
      <div
        className="flex flex-col md:flex-row items-center md:items-stretch gap-0"
        aria-label={`${t("flow.step1.title")} → ${t("flow.step2.title")} → ${t("flow.step3.title")} → ${t("flow.step4.title")}`}
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
                  {t(`flow.${step}.title`)}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {t(`flow.${step}.description`)}
                </p>
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
    </Section>
  );
}
