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
    <svg className="w-5 h-5" viewBox="0 0 48 48" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.0208 21V31C10.0208 31.5523 9.57305 32 9.02077 32C8.46848 32 8.02077 31.5523 8.02077 31V21C8.02077 12.7157 14.7365 6 23.0208 6H25.0208C28.1211 6 31.0832 6.94415 33.5756 8.67693C34.0291 8.99219 34.1411 9.61537 33.8258 10.0688C33.5106 10.5223 32.8874 10.6343 32.4339 10.3191C30.274 8.81739 27.7095 8 25.0208 8H23.0208C15.8411 8 10.0208 13.8203 10.0208 21ZM35.6728 13.5448C36.4702 14.6817 37.0805 15.9383 37.4793 17.2746C37.6373 17.8038 38.1944 18.1048 38.7236 17.9468C39.2528 17.7889 39.5538 17.2318 39.3958 16.7026C38.9352 15.1596 38.2305 13.7085 37.3103 12.3964C36.9932 11.9442 36.3695 11.8348 35.9174 12.1519C35.4652 12.469 35.3557 13.0926 35.6728 13.5448ZM39.0208 20C38.4685 20 38.0208 20.4477 38.0208 21V41C38.0208 41.5523 38.4685 42 39.0208 42C39.573 42 40.0208 41.5523 40.0208 41V21C40.0208 20.4477 39.573 20 39.0208 20ZM23.0208 14H25.0208C28.8865 14 32.0208 17.1343 32.0208 21V33C32.0208 37.5152 30.3941 40 27.0208 40C23.4947 40 22.0208 38.0184 22.0208 34V22C22.0208 20.8955 22.9158 20 24.0208 20C25.1257 20 26.0208 20.8955 26.0208 22V26.958C26.0208 27.5103 26.4685 27.958 27.0208 27.958C27.5731 27.958 28.0208 27.5103 28.0208 26.958V22C28.0208 19.7911 26.2305 18 24.0208 18C21.8111 18 20.0208 19.7911 20.0208 22V34C20.0208 39.0162 22.2401 42 27.0208 42C31.7205 42 34.0208 38.4862 34.0208 33V21C34.0208 16.0297 29.9911 12 25.0208 12H23.0208C22.4685 12 22.0208 12.4477 22.0208 13C22.0208 13.5523 22.4685 14 23.0208 14ZM19.4655 14.9671C17.6133 16.0635 16.3532 17.952 16.0781 20.1016C16.008 20.6494 15.507 21.0366 14.9592 20.9665C14.4114 20.8964 14.0241 20.3955 14.0943 19.8476C14.4483 17.0815 16.068 14.6541 18.4468 13.2461C18.9221 12.9647 19.5354 13.122 19.8167 13.5972C20.098 14.0725 19.9408 14.6858 19.4655 14.9671ZM16.0208 41V23.992C16.0208 23.4397 15.5731 22.992 15.0208 22.992C14.4685 22.992 14.0208 23.4397 14.0208 23.992V41C14.0208 41.5523 14.4685 42 15.0208 42C15.5731 42 16.0208 41.5523 16.0208 41ZM25.9524 31.0254V34.9794C25.9524 35.5317 26.4001 35.9794 26.9524 35.9794C27.5047 35.9794 27.9524 35.5317 27.9524 34.9794V31.0254C27.9524 30.4731 27.5047 30.0254 26.9524 30.0254C26.4001 30.0254 25.9524 30.4731 25.9524 31.0254ZM10.0004 36.995V41.043C10.0004 41.5953 9.55265 42.043 9.00037 42.043C8.44808 42.043 8.00037 41.5953 8.00037 41.043V36.995C8.00037 36.4427 8.44808 35.995 9.00037 35.995C9.55265 35.995 10.0004 36.4427 10.0004 36.995Z" />
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
