import { getTranslations } from "next-intl/server";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const rowKeys = ["account", "fingerprint", "protocol", "dns", "censorship", "logs"] as const;

export async function ComparisonTable() {
  const t = await getTranslations("comparisonTable");

  return (
    <Section id="comparison">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <Reveal>
        <div className="overflow-x-auto rounded-2xl border border-overlay/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary/50">
                <th scope="col" className="text-start p-4 font-medium text-text-muted">
                  {t("headers.feature")}
                </th>
                <th scope="col" className="text-start p-4 font-medium text-text-muted">
                  {t("headers.traditional")}
                </th>
                <th scope="col" className="text-start p-4 font-medium text-accent-teal">
                  {t("headers.doppler")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((key, i) => (
                <tr
                  key={key}
                  className={i < rowKeys.length - 1 ? "border-t border-overlay/5" : ""}
                >
                  <th scope="row" className="text-start p-4 font-medium text-text-primary">
                    {t(`rows.${key}.feature`)}
                  </th>
                  <td className="p-4 text-text-muted">
                    {t(`rows.${key}.traditional`)}
                  </td>
                  <td className="p-4 text-accent-teal font-medium">
                    {t(`rows.${key}.doppler`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Section>
  );
}
