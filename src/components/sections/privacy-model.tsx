import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { PrivacyVoidBand } from "@/components/glyph/privacy-void-band";

const items = ["browsing", "ip", "dns", "account"] as const;

export function PrivacyModel() {
  const t = useTranslations("privacyModel");

  return (
    <Section id="privacy-model">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {items.map((key, i) => (
          <Reveal key={key} delay={i * 50}>
            {/* Recipe A's row card, with the query plate as its leading strip.
                min-h rather than h: the text is a sentence, and the strip
                stretches with it. Below sm the plate stacks on top. */}
            <div className="group relative flex h-full flex-col sm:min-h-[120px] sm:flex-row overflow-hidden rounded-xl border border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-accent-teal/30 transition-colors">
              <div className="relative shrink-0 overflow-hidden border-b border-overlay/5 sm:w-[46%] sm:border-b-0 sm:border-e">
                <PrivacyVoidBand index={i} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 px-4 md:px-5 py-3 text-start">
                <h3 className="text-base md:text-lg font-semibold leading-tight text-text-primary">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-xs md:text-sm leading-snug text-text-muted">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Tagline, set as the last line of a terminal session. */}
      <Reveal delay={200}>
        <p className="text-center mt-8 text-lg font-medium text-text-primary">
          {t("tagline")}
          <span aria-hidden="true" className="terminal-cursor ms-1 text-accent-teal-light">
            ▌
          </span>
        </p>
      </Reveal>
    </Section>
  );
}
