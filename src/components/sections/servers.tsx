import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { getFlagUrl } from "@/lib/languages";

/* ─── Server location data (from Supabase vpn_servers, updated 2026-06-05) ─── */
interface ServerLocation {
  key: string;
  count: number;
  protocol: string;
  countryCode: string;
}

const serverLocations: ServerLocation[] = [
  { key: "australia", count: 1, protocol: "VLESS-Reality", countryCode: "au" },
  { key: "canada", count: 1, protocol: "VLESS-Reality", countryCode: "ca" },
  { key: "israel", count: 1, protocol: "VLESS-Reality", countryCode: "il" },
  { key: "netherlands", count: 1, protocol: "VLESS-Reality", countryCode: "nl" },
  { key: "poland", count: 1, protocol: "VLESS-Reality", countryCode: "pl" },
  { key: "singapore", count: 1, protocol: "VLESS-Reality", countryCode: "sg" },
  { key: "sweden", count: 1, protocol: "VLESS-Reality", countryCode: "se" },
  { key: "us", count: 1, protocol: "VLESS-Reality", countryCode: "us" },
];

/* ─── Protocol badge ─── */
function ProtocolBadge({ protocol }: { protocol: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
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
          <img
            src={getFlagUrl(location.countryCode)}
            alt={t(`locations.${location.key}.country`)}
            width={32}
            height={32}
            loading="lazy"
            decoding="async"
            className="w-8 h-8 rounded-full object-cover"
          />
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
        <ProtocolBadge protocol={location.protocol} />
      </div>
    </div>
  );
}

/* ─── Servers section ─── */
export function Servers() {
  const t = useTranslations("servers");

  return (
    <Section id="servers">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} headingLevel="h3" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {serverLocations.map((location, i) => (
          <Reveal key={location.key} delay={i * 50}>
            <ServerCard location={location} t={t} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
