import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

const items = [
  { key: "dpi", icon: "scan" },
  { key: "tls", icon: "lock" },
  { key: "fingerprint", icon: "fingerprint" },
  { key: "regions", icon: "globe" },
] as const;

const icons: Record<string, React.ReactNode> = {
  scan: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  fingerprint: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  ),
};

export function CensorshipResistance() {
  const t = useTranslations("censorshipResistance");

  return (
    <Section id="censorship-resistance">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(({ key, icon }, i) => (
          <Reveal key={key} delay={i * 50}>
            {key === "regions" ? (
              <Link href="/bypass-censorship" className="relative h-full rounded-2xl overflow-hidden border border-overlay/10 group block">
                <Image
                  src="/images/downloads.avif"
                  alt={t(`items.${key}.title`)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/60 to-transparent" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-4 -end-3 text-accent-teal/20 group-hover:text-accent-teal/30 transition-colors duration-300 [&>svg]:!w-28 [&>svg]:!h-28"
                >
                  {icons[icon]}
                </span>
                <div className="relative p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">
                    {t(`items.${key}.description`)}
                  </p>
                  <span className="inline-flex items-center gap-2 text-accent-teal group-hover:text-accent-gold transition-colors text-sm font-medium">
                    {t("learnMore")}
                    <svg className="w-4 h-4 rtl:-scale-x-100" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ) : (
              <div className="group relative h-full rounded-2xl border border-overlay/10 bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04] p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300">
                <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />
                <div className="absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-4 -end-3 text-accent-teal/10 group-hover:text-accent-teal/20 transition-colors duration-300 [&>svg]:!w-28 [&>svg]:!h-28"
                >
                  {icons[icon]}
                </span>
                <div className="relative">
                  <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
