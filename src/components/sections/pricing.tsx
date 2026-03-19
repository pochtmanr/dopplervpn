"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

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
              {isAnnual && (
                <span
                  className={`
                  hidden sm:inline text-[10px] uppercase tracking-wider font-bold
                  px-1.5 py-0.5 rounded-full
                  ${
                    isSelected
                      ? "bg-bg-primary/20 text-bg-primary"
                      : "bg-accent-teal/15 text-accent-teal"
                  }
                `}
                >
                  {t("bestValue")}
                </span>
              )}
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
        <span className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-text-primary">
          {formatPrice(priceData.monthly)}
        </span>
        <span className="text-lg lg:text-2xl text-text-muted">/mo</span>
        {priceData.savings && (
          <Badge variant="teal" className="self-center ms-1 text-[10px] lg:text-xs px-1.5 py-0.5 lg:px-2 lg:py-1">
            {t("save")} {priceData.savings}%
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

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      className={`w-5 h-5 flex-shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
      />
    </svg>
  );
}

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
                <div className="mb-8 lg:mb-10 max-w-md mx-auto lg:mx-0 w-full">
                  <DurationSelector
                    selected={selectedDuration}
                    onSelect={setSelectedDuration}
                    t={t}
                  />
                </div>

                {/* Price Display */}
                <div className="text-center lg:text-start mb-8 lg:mb-0 min-h-[140px] lg:min-h-[160px] flex items-center justify-center lg:justify-start flex-1">
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
                <ul className="hidden lg:block space-y-4 mb-8 flex-1">
                  {plusFeatureKeys.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-text-primary text-sm lg:text-base"
                    >
                      <span className="w-8 h-8 rounded-lg bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="text-accent-teal" />
                      </span>
                      {t(`plusFeatures.${feature}`)}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  href="/account"
                >
                  {t("plusCta")}
                </Button>

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
