import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ComparisonAccordion } from "./comparison-accordion";

const rowKeys = ["account", "fingerprint", "protocol", "dns", "censorship", "logs"] as const;

export function ComparisonTable() {
  const t = useTranslations("comparisonTable");

  return (
    <Section id="comparison">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <Reveal>
        <ComparisonAccordion
          headers={{
            feature: t("headers.feature"),
            traditional: t("headers.traditional"),
            doppler: t("headers.doppler"),
          }}
          panel={{ means: t("panel.means"), keeps: t("panel.keeps"), why: t("panel.why") }}
          rows={rowKeys.map((key) => ({
            key,
            feature: t(`rows.${key}.feature`),
            traditional: t(`rows.${key}.traditional`),
            doppler: t(`rows.${key}.doppler`),
            means: t(`rows.${key}.means`),
            keeps: t(`rows.${key}.keeps`),
            why: t(`rows.${key}.why`),
          }))}
        />
      </Reveal>
    </Section>
  );
}
