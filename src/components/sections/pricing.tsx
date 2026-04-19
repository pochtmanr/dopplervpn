"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section, SectionHeader } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { trackGetPro } from "@/lib/track-cta";

type Duration = "monthly" | "sixMonth" | "annual";

interface PriceData {
  total: number;
  monthly: number;
  savings: number | null;
}

const PRICES: Record<Duration, PriceData> = {
  monthly: { total: 6.99, monthly: 6.99, savings: null },
  sixMonth: { total: 29.99, monthly: 5.00, savings: 28 },
  annual: { total: 39.99, monthly: 3.33, savings: 52 },
};

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

const plusFeatureKeys = [
  "premiumServers",
  "smartRouting",
  "alwaysOn",
  "devices",
  "noLogs",
  "support",
] as const;

interface DurationSelectorProps {
  selected: Duration;
  onSelect: (duration: Duration) => void;
  t: ReturnType<typeof useTranslations>;
}

function DurationSelector({ selected, onSelect, t }: DurationSelectorProps) {
  const durations = useMemo<Duration[]>(
    () => ["monthly", "sixMonth", "annual"],
    []
  );
  const selectedIndex = durations.indexOf(selected);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let newIndex = currentIndex;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        newIndex = (currentIndex + 1) % durations.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        newIndex = (currentIndex - 1 + durations.length) % durations.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        newIndex = durations.length - 1;
      }

      if (newIndex !== currentIndex) {
        onSelect(durations[newIndex]);
      }
    },
    [durations, onSelect]
  );

  return (
    <div
      role="tablist"
      aria-label={t("durationSelector")}
      className="relative flex bg-overlay/5 rounded-full p-1"
    >
      {/* Sliding pill background */}
      <span
        className="absolute top-1 bottom-1 bg-accent-teal rounded-full transition-all duration-200 ease-out"
        style={{
          insetInlineStart: `calc(${selectedIndex * (100 / 3)}% + 4px)`,
          width: `calc(${100 / 3}% - 8px)`,
        }}
      />
      {durations.map((duration, index) => {
        const isSelected = selected === duration;
        const isAnnual = duration === "annual";

        return (
          <button
            key={duration}
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(duration)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`
              relative flex-1 px-4 py-3 text-sm font-medium rounded-full z-10
              transition-colors duration-200 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2
              focus-visible:ring-offset-bg-primary
              ${
                isSelected
                  ? "text-bg-primary"
                  : "text-text-muted hover:text-text-primary"
              }
            `}
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {t(`durations.${duration}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface PriceDisplayProps {
  duration: Duration;
  t: ReturnType<typeof useTranslations>;
}

function PriceDisplay({ duration, t }: PriceDisplayProps) {
  const priceData = PRICES[duration];
  const monthlyBase = PRICES.monthly.monthly;

  return (
    <div className="flex flex-col items-center lg:items-start gap-2 transition-opacity duration-150">
      {/* Main price row — price, /mo, and savings badge inline */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-5xl md:text-7xl lg:text-8xl font-semibold text-text-primary tracking-tight leading-none"
          style={{ fontFamily: "var(--font-serif)", fontStyle: "normal" }}
        >
          {formatPrice(priceData.monthly)}
        </span>
        <span className="text-lg lg:text-2xl text-text-muted">/mo</span>
        {priceData.savings && (
          <Badge variant="teal" className="self-center ms-1 text-[10px] lg:text-xs px-1.5 py-0.5 lg:px-2 lg:py-1">
            {t("save")} {priceData.savings}%
          </Badge>
        )}
        {duration === "annual" && (
          <Badge variant="gold" className="self-center ms-1 text-[10px] lg:text-xs px-1.5 py-0.5 lg:px-2 lg:py-1">
            {t("bestValue")}
          </Badge>
        )}
      </div>

      {/* Billing info — with strikethrough original price inline */}
      <p className="text-text-muted text-sm lg:text-base">
        {duration === "monthly" ? (
          t("billedMonthly")
        ) : (
          <>
            <span className="line-through opacity-60">{formatPrice(monthlyBase)}/mo</span>
            {" · "}
            {t("billed")} {formatPrice(priceData.total)}{" "}
            {duration === "sixMonth" ? t("every6Months") : t("perYear")}
          </>
        )}
      </p>
    </div>
  );
}

const featureIcons: Record<(typeof plusFeatureKeys)[number], React.ReactNode> = {
  premiumServers: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  smartRouting: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  alwaysOn: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  devices: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
    </svg>
  ),
  noLogs: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
};

function ShieldIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

export function Pricing() {
  const t = useTranslations("pricing");
  const [selectedDuration, setSelectedDuration] = useState<Duration>("annual");

  return (
    <Section id="pricing" className="bg-bg-secondary/30">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <Reveal>
        <div className="relative">
          {/* Decorative background glows */}
          <div className="absolute -top-20 -start-20 w-[24rem] h-[24rem] bg-accent-teal/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -end-20 w-[20rem] h-[20rem] bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

          <Card
            padding="none"
            className="relative border-accent-teal/20 bg-gradient-to-br from-accent-teal/5 via-transparent to-accent-gold/3 overflow-hidden"
          >
            {/* Top accent line */}
            <div className="absolute top-0 inset-inline-start-0 inset-inline-end-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Left column — price & selector (3/5 width on desktop) */}
              <div className="lg:col-span-3 p-6 sm:p-8 lg:p-12 flex flex-col">
                {/* Badge + title */}
                <div className="text-center lg:text-start mb-6 lg:mb-8">
                  <Badge variant="teal" className="mb-4">
                    {t("plusBadge")}
                  </Badge>
                  <h3 className="font-display text-2xl lg:text-3xl font-semibold text-text-primary mb-2">
                    {t("plusTitle")}
                  </h3>
                  <p className="text-text-muted text-sm lg:text-base">
                    {t("plusSubtitle")}
                  </p>
                </div>

                {/* Duration Selector */}
                <div className="mb-4 lg:mb-5 max-w-md mx-auto lg:mx-0 w-full">
                  <DurationSelector
                    selected={selectedDuration}
                    onSelect={setSelectedDuration}
                    t={t}
                  />
                </div>

                {/* Price Display */}
                <div className="text-center lg:text-start mb-8 lg:mb-0 flex items-center justify-center lg:justify-start flex-1">
                  <PriceDisplay duration={selectedDuration} t={t} />
                </div>

                {/* Notes — desktop only, shown below the price */}
                <div className="hidden lg:flex flex-col gap-1.5 mt-auto pt-8 border-t border-overlay/5">
                  <p className="text-accent-teal text-xs font-medium flex items-center gap-2">
                    <ShieldIcon />
                    {t("trialNote")}
                  </p>
                  <p className="text-text-muted text-xs ps-7">
                    {t("guarantee")}
                  </p>
                </div>
              </div>

              {/* Right column — features + CTA (2/5 width on desktop) */}
              <div className="lg:col-span-2 p-6 sm:p-8 lg:p-12 lg:border-s border-t lg:border-t-0 border-overlay/5 bg-bg-secondary/30 flex flex-col">
                {/* Features list — desktop only */}
                <ul className="hidden lg:block space-y-3 mb-8 flex-1">
                  {plusFeatureKeys.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-text-primary text-sm lg:text-base"
                    >
                      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-teal/20 to-accent-teal/5 border border-accent-teal/25 text-accent-teal flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        {featureIcons[feature]}
                      </span>
                      {t(`plusFeatures.${feature}`)}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/account"
                  onClick={() => trackGetPro("pricing")}
                  className="group relative w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold bg-accent-teal text-white shadow-[0_10px_30px_-10px_rgba(0,140,140,0.45)] hover:shadow-[0_12px_36px_-10px_rgba(0,140,140,0.6)] transition-shadow duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent rtl:scale-x-[-1]" />
                  <svg className="w-5 h-5 relative" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                  <span className="relative">{t("plusCta")}</span>
                  <svg className="w-5 h-5 relative transition-transform duration-200 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                {/* Notes — mobile only */}
                <div className="lg:hidden flex flex-col items-center gap-1.5 mt-4">
                  <p className="text-accent-teal text-xs font-medium">
                    {t("trialNote")}
                  </p>
                  <p className="text-text-muted text-xs text-center">
                    {t("guarantee")}
                  </p>
                </div>

                {/* Tax note — always visible */}
                <p className="text-center text-text-muted text-xs mt-4">
                  {t("taxNote")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Reveal>
    </Section>
  );
}
