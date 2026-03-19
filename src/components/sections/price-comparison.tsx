"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { useInView } from "@/hooks/use-in-view";

interface VPNPrice {
  key: string;
  monthly: number;
  isDoppler?: boolean;
}

const vpnPrices: VPNPrice[] = [
  { key: "doppler", monthly: 3.33, isDoppler: true },
  { key: "surfshark", monthly: 2.19 },
  { key: "nordvpn", monthly: 3.59 },
  { key: "expressvpn", monthly: 6.67 },
  { key: "protonvpn", monthly: 3.99 },
];

const maxPrice = Math.max(...vpnPrices.map((v) => v.monthly));

function AnimatedPriceBar({
  vpn,
  label,
  delay,
  visible,
}: {
  vpn: VPNPrice;
  label: string;
  delay: number;
  visible: boolean;
}) {
  const widthPercent = (vpn.monthly / maxPrice) * 100;

  return (
    <div className="space-y-2" style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${vpn.isDoppler ? "text-accent-teal" : "text-text-muted"}`}>
          {label}
        </span>
        <span className={`text-sm tabular-nums ${vpn.isDoppler ? "text-accent-teal font-semibold" : "text-text-muted"}`}>
          ${vpn.monthly.toFixed(2)}/mo
        </span>
      </div>
      <div className="h-3 rounded-full bg-overlay/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            vpn.isDoppler ? "bg-accent-teal" : "bg-text-muted/25"
          }`}
          style={{ width: visible ? `${widthPercent}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export function PriceComparison() {
  const t = useTranslations("priceComparison");
  const { ref, visible } = useInView();

  const sorted = [...vpnPrices].sort((a, b) => a.monthly - b.monthly);

  return (
    <Section id="price-comparison">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left — bars */}
          <div ref={ref} className="space-y-5">
            {sorted.map((vpn, i) => (
              <AnimatedPriceBar
                key={vpn.key}
                vpn={vpn}
                label={t(`vpns.${vpn.key}`)}
                delay={i * 100}
                visible={visible}
              />
            ))}
            <p className="text-xs text-text-muted pt-2">{t("note")}</p>
          </div>

          {/* Right — highlights */}
          <div className="grid grid-cols-2 gap-6">
            {(["savings", "trial", "noRenewal", "devices"] as const).map((stat) => (
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
