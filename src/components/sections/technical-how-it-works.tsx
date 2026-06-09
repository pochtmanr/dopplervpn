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
              <div className="group relative h-full rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300">
                <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
                <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-4 -end-2 font-display text-[7rem] leading-none font-semibold tracking-tighter text-accent-teal/10 group-hover:text-accent-teal/20 transition-colors duration-300 select-none"
                >
                  {i + 1}
                </span>
                <div className="relative">
                  <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                    {t(`flow.${step}.title`)}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    {t(`flow.${step}.description`)}
                  </p>
                </div>
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
