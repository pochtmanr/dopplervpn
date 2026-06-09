"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useInView } from "@/hooks/use-in-view";

interface BarData {
  key: string;
  speed: number;
  maxSpeed: number;
  color: string;
  isDoppler?: boolean;
}

const bars: BarData[] = [
  { key: "doppler", speed: 94, maxSpeed: 100, color: "bg-accent-teal", isDoppler: true },
  { key: "wireguard", speed: 89, maxSpeed: 100, color: "bg-text-muted/40" },
  { key: "nordvpn", speed: 72, maxSpeed: 100, color: "bg-text-muted/25" },
  { key: "expressvpn", speed: 68, maxSpeed: 100, color: "bg-text-muted/25" },
  { key: "openvpn", speed: 51, maxSpeed: 100, color: "bg-text-muted/20" },
];

function AnimatedBar({ bar, label, delay, visible }: { bar: BarData; label: string; delay: number; visible: boolean }) {
  const widthPercent = (bar.speed / bar.maxSpeed) * 100;

  return (
    <div className="space-y-2" style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${bar.isDoppler ? "text-accent-teal" : "text-text-muted"}`}>
          {label}
        </span>
        <span className={`text-sm tabular-nums ${bar.isDoppler ? "text-accent-teal font-semibold" : "text-text-muted"}`}>
          {bar.speed}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-overlay/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${bar.color} transition-all duration-1000 ease-out`}
          style={{ width: visible ? `${widthPercent}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export function SpeedComparison() {
  const t = useTranslations("speedComparison");
  const { ref, visible } = useInView();

  return (
    <Section id="speed-comparison">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left — bars */}
          <div ref={ref} className="space-y-5">
            {bars.map((bar, i) => (
              <AnimatedBar
                key={bar.key}
                bar={bar}
                label={t(`bars.${bar.key}`)}
                delay={i * 100}
                visible={visible}
              />
            ))}
            <p className="text-xs text-text-muted pt-2">{t("note")}</p>
          </div>

          {/* Right — key stats */}
          <div className="grid grid-cols-2 gap-6">
            {(["overhead", "latency", "detection", "throughput"] as const).map((stat) => (
              <div
                key={stat}
                className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6 text-center hover:border-accent-teal/20 transition-colors"
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-accent-teal mb-1">
                  {t(`stats.${stat}.value`)}
                </p>
                <p className="text-sm text-text-muted">{t(`stats.${stat}.label`)}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
