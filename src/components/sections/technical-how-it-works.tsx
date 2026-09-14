import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { TrafficStepCard } from "./traffic-step-card";

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
              <TrafficStepCard
                index={i}
                title={t(`flow.${step}.title`)}
                description={t(`flow.${step}.description`)}
              />
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

      <Reveal delay={200}>
        <div className="mt-10 text-center">
          <Link
            href="/tools"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-accent-teal text-white hover:bg-accent-teal/90 transition-colors"
          >
            {t("toolsCta")}
            <svg
              className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
