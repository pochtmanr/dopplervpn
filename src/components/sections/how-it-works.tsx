import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const stepIcons: Record<string, React.ReactNode> = {
  choose: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  ),
  download: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  connect: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
};

const stepKeys = ["choose", "download", "connect"] as const;

const stepLinks: Record<(typeof stepKeys)[number], { href: string; isPage?: boolean }> = {
  choose: { href: "/account", isPage: true },
  download: { href: "/downloads", isPage: true },
  connect: { href: "/#faq" },
};

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <Section id="how-it-works">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stepKeys.map((key, index) => (
          <Reveal key={key} delay={index * 50}>
            <div className="relative h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors group">
              {/* Connector line (desktop only) */}
              {index < stepKeys.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -end-2 w-4 h-px bg-overlay/15" />
              )}

              {/* Teal icon */}
              <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
                {stepIcons[key]}
              </div>

              {/* Title as Link */}
              <h3 className="mb-1.5">
                {stepLinks[key].isPage ? (
                  <Link
                    href={stepLinks[key].href}
                    className="inline-flex items-center gap-1.5 text-lg font-semibold text-text-primary group-hover:text-accent-teal transition-colors"
                  >
                    {t(`steps.${key}.title`)}
                    <svg className="w-4 h-4 shrink-0 opacity-0 -translate-x-1 rtl:translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                ) : (
                  <a
                    href={stepLinks[key].href}
                    className="inline-flex items-center gap-1.5 text-lg font-semibold text-text-primary group-hover:text-accent-teal transition-colors"
                  >
                    {t(`steps.${key}.title`)}
                    <svg className="w-4 h-4 shrink-0 opacity-0 -translate-x-1 rtl:translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                )}
              </h3>

              <p className="text-sm text-text-muted leading-relaxed">
                {t(`steps.${key}.description`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
