import { useLocale, useTranslations } from "next-intl";
import { isHowItWorksLocale } from "@/i18n/how-it-works-locales";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { TrafficStepCard } from "./traffic-step-card";

const flowSteps = ["step1", "step2", "step3", "step4"] as const;
/** Each card opens its step's article; the last one, "Open Internet", opens the leak tests. */
const stepHrefs = [
  "/how-it-works/your-device",
  "/how-it-works/vless-reality-tunnel",
  "/how-it-works/edge-network",
  "/tools",
] as const;

export function TechnicalHowItWorks() {
  const t = useTranslations("technicalHowItWorks");
  // The step articles are English-first: link other locales straight to /en
  // rather than through a 308 on every card.
  const articleLocale = isHowItWorksLocale(useLocale()) ? undefined : "en";

  return (
    <Section id="how-doppler-works">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      {/* Flow Steps as Cards with Arrows */}
      <div
        className="flex flex-col md:flex-row items-center md:items-stretch gap-0"
        // No role="img" here any more: the cards are links now, and an img role
        // would hide them from assistive tech.
      >
        {flowSteps.map((step, i) => (
          <div key={step} className="flex flex-col md:flex-row items-center md:items-stretch w-full md:w-1/4">
            <Reveal delay={i * 50} className="w-full">
              <TrafficStepCard
                index={i}
                title={t(`flow.${step}.title`)}
                description={t(`flow.${step}.description`)}
                href={stepHrefs[i]}
                hrefLocale={stepHrefs[i].startsWith("/how-it-works") ? articleLocale : undefined}
                linkLabel={t("readMore")}
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
    </Section>
  );
}
