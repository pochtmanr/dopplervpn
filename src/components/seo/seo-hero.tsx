import { HeroCTAsWrapper } from "@/components/hero/hero-ctas-wrapper";
import { CheckIcon } from "@/components/seo/glass-card";
import type { CtaLocation } from "@/lib/track-cta";
import type { ReactNode } from "react";

const TRUST_KEYS = ["noData", "noLogs", "vless"] as const;

export function SeoHero({
  title,
  subtitle,
  location,
  secondaryHref = "/signup",
  secondaryLabel,
  trustLabel,
  primary,
}: {
  title: string;
  subtitle: string;
  location: CtaLocation;
  secondaryHref?: string;
  secondaryLabel: string;
  trustLabel: (key: (typeof TRUST_KEYS)[number]) => string;
  /** Replaces the download pair (crypto page uses a buy button). */
  primary?: ReactNode;
}) {
  return (
    <div className="mx-auto text-center space-y-6">
      <h1 className="font-display text-4xl sm:text-5xl lg:text-[clamp(2.5rem,3.6vw,3.75rem)] font-semibold text-text-primary leading-[1.12]">
        {title}
      </h1>
      <p className="text-text-muted text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
      <div className="pt-2 flex justify-center">
        {primary ?? (
          <HeroCTAsWrapper
            location={location}
            secondaryHref={secondaryHref}
            secondaryLabel={secondaryLabel}
            centered
          />
        )}
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
        {TRUST_KEYS.map((key) => (
          <li key={key} className="flex items-center gap-1.5">
            <CheckIcon />
            {trustLabel(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
