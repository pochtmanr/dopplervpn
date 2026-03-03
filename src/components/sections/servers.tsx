"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

/* ─── Server location data ─── */
interface ServerLocation {
  key: string;
  count: number;
  protocols: ("WireGuard" | "VLESS-Reality")[];
  flag: string;
}

const serverLocations: ServerLocation[] = [
  { key: "germany", count: 1, protocols: ["VLESS-Reality"], flag: "🇩🇪" },
  { key: "russia", count: 2, protocols: ["VLESS-Reality"], flag: "🇷🇺" },
  { key: "france", count: 1, protocols: ["VLESS-Reality"], flag: "🇫🇷" },
  { key: "japan", count: 1, protocols: ["VLESS-Reality"], flag: "🇯🇵" },
];

/* ─── Protocol badge ─── */
function ProtocolBadge({ protocol }: { protocol: string }) {
  const isVless = protocol === "VLESS-Reality";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
        isVless
          ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
          : "bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
      }`}
    >
      {protocol}
    </span>
  );
}

/* ─── Server card ─── */
function ServerCard({ location, t }: { location: ServerLocation; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="group rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{location.flag}</span>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              {t(`locations.${location.key}.city`)}
            </h3>
            <p className="text-xs text-text-muted">
              {t(`locations.${location.key}.country`)}
            </p>
          </div>
        </div>
        <span className="text-xs text-text-muted bg-overlay/5 px-2 py-1 rounded-full">
          {location.count} {location.count > 1 ? t("servers") : t("server")}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {location.protocols.map((protocol) => (
          <ProtocolBadge key={protocol} protocol={protocol} />
        ))}
      </div>
    </div>
  );
}

/* ─── Servers section ─── */
export function Servers() {
  const t = useTranslations("servers");

  return (
    <Section id="servers">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serverLocations.map((location, i) => (
          <Reveal key={location.key} delay={i * 50}>
            <ServerCard location={location} t={t} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
