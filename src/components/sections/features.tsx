"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

/* ─── Feature icons (teal stroke style) ─── */
const featureIcons: Record<string, React.ReactNode> = {
  noRegistration: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  ),
  vlessReality: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  adBlocker: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
  smartRouting: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  minimalData: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  completelyFree: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  ),
};

/* ─── Bento grid layout ─── */
const featureLayout: { key: string; colSpan: string; hasImage?: boolean; imagePath?: string; isWide?: boolean }[] = [
  { key: "noRegistration", colSpan: "md:col-span-2", hasImage: true, imagePath: "/images/features/1.avif" },
  { key: "vlessReality", colSpan: "" },
  { key: "smartRouting", colSpan: "" },
  { key: "adBlocker", colSpan: "" },
  { key: "minimalData", colSpan: "" },
  { key: "completelyFree", colSpan: "md:col-span-3", isWide: true },
];

/* ─── Standard feature card ─── */
function FeatureCard({ featureKey, title, description }: { featureKey: string; title: string; description: string }) {
  return (
    <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 hover:border-accent-teal/20 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-4">
        {featureIcons[featureKey]}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

/* ─── Featured card with background image ─── */
function FeaturedCard({ featureKey, title, description, imagePath }: { featureKey: string; title: string; description: string; imagePath: string }) {
  return (
    <div className="relative h-full min-h-[280px] rounded-2xl overflow-hidden border border-overlay/10 group">
      <Image
        src={imagePath}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 66vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-bg-primary/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="w-10 h-10 rounded-xl bg-accent-teal/15 backdrop-blur-sm border border-accent-teal/20 flex items-center justify-center text-accent-teal mb-3">
          {featureIcons[featureKey]}
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─── Wide banner card (completelyFree) ─── */
function WideCard({ featureKey, title, description }: { featureKey: string; title: string; description: string }) {
  return (
    <div className="h-full rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 flex items-start gap-5 hover:border-accent-teal/20 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center text-accent-teal shrink-0">
        {featureIcons[featureKey]}
      </div>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─── Features section ─── */
export function Features() {
  const t = useTranslations("features");

  return (
    <Section id="features">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featureLayout.map(({ key, colSpan, hasImage, imagePath, isWide }, i) => (
          <Reveal key={key} delay={i * 50} className={colSpan}>
            {hasImage && imagePath ? (
              <FeaturedCard
                featureKey={key}
                title={t(`items.${key}.title`)}
                description={t(`items.${key}.description`)}
                imagePath={imagePath}
              />
            ) : isWide ? (
              <WideCard
                featureKey={key}
                title={t(`items.${key}.title`)}
                description={t(`items.${key}.description`)}
              />
            ) : (
              <FeatureCard
                featureKey={key}
                title={t(`items.${key}.title`)}
                description={t(`items.${key}.description`)}
              />
            )}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
