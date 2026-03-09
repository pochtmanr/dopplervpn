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
  const durations = useMemo<Duration[]>(() => ["monthly", "sixMonth", "annual"], []);
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
    <div className="flex flex-col items-center gap-2 transition-opacity duration-150">
      {/* Strikethrough original price (for multi-month plans) */}
      {priceData.savings && (
        <span className="text-lg text-text-muted line-through">
          {formatPrice(monthlyBase)}/mo
        </span>
      )}

      {/* Main price */}
      <div className="flex items-baseline gap-1">
        <span className="font-display text-5xl md:text-6xl font-bold text-text-primary">
          {formatPrice(priceData.monthly)}
        </span>
        <span className="text-xl text-text-muted">/mo</span>
      </div>

      {/* Total billing info */}
      <p className="text-text-muted text-sm">
        {duration === "monthly" ? (
          t("billedMonthly")
        ) : (
          <>
            {t("billed")} {formatPrice(priceData.total)}{" "}
            {duration === "sixMonth" ? t("every6Months") : t("perYear")}
          </>
        )}
      </p>

      {/* Savings badge */}
      {priceData.savings && (
        <Badge variant="teal" className="mt-1">
          {t("save")} {priceData.savings}%
        </Badge>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 12.75 6 6 9-13.5"
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

      <Reveal className="max-w-xl mx-auto">
        <Card
          padding="lg"
          className="border-accent-teal/30 bg-gradient-to-b from-accent-teal/5 to-transparent"
        >
          <div className="text-center mb-6">
            <Badge variant="teal" className="mb-4">
              {t("plusBadge")}
            </Badge>
            <h3 className="font-display text-2xl font-semibold text-text-primary mb-2">
              {t("plusTitle")}
            </h3>
            <p className="text-text-muted text-sm">
              {t("plusSubtitle")}
            </p>
          </div>

          {/* Duration Selector */}
          <div className="mb-8">
            <DurationSelector
              selected={selectedDuration}
              onSelect={setSelectedDuration}
              t={t}
            />
          </div>

          {/* Price Display */}
          <div className="text-center mb-8 min-h-[140px] flex items-center justify-center">
            <PriceDisplay duration={selectedDuration} t={t} />
          </div>

          {/* Plus Features */}
          <ul className="space-y-3 mb-8">
            {plusFeatureKeys.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-text-muted text-sm"
              >
                <CheckIcon className="text-accent-teal" />
                {t(`plusFeatures.${feature}`)}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            variant="primary"
            className="w-full"
            size="lg"
            href="/subscribe"
          >
            {t("plusCta")}
          </Button>

          {/* Trial note */}
          <p className="text-center text-accent-teal text-xs mt-4 font-medium">
            {t("trialNote")}
          </p>

          {/* Tax note */}
          <p className="text-center text-text-muted text-xs mt-2">
            {t("taxNote")}
          </p>

          {/* Footer note */}
          <p className="text-center text-text-muted text-xs mt-2">
            {t("guarantee")}
          </p>
        </Card>
      </Reveal>
    </Section>
  );
}
