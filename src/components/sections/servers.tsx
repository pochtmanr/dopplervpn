import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { getFlagUrl } from "@/lib/languages";

/* ─── Server location data (from Supabase vpn_servers, updated 2026-03-06) ─── */
interface ServerLocation {
  country: string;
  city: string;
  count: number;
  protocol: string;
  countryCode: string;
}

const serverLocations: ServerLocation[] = [
  { country: "Germany", city: "Frankfurt", count: 1, protocol: "VLESS-Reality", countryCode: "de" },
  { country: "France", city: "Paris", count: 1, protocol: "VLESS-Reality", countryCode: "fr" },
  { country: "Japan", city: "Tokyo", count: 1, protocol: "VLESS-Reality", countryCode: "jp" },
  { country: "Netherlands", city: "Amsterdam", count: 1, protocol: "VLESS-Reality", countryCode: "nl" },
  { country: "Russia", city: "Moscow", count: 2, protocol: "VLESS-Reality", countryCode: "ru" },
  { country: "Singapore", city: "Singapore", count: 1, protocol: "VLESS-Reality", countryCode: "sg" },
  { country: "United States", city: "Dallas", count: 1, protocol: "VLESS-Reality", countryCode: "us" },
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
          <img src={getFlagUrl(location.countryCode)} alt={location.country} className="w-8 h-8 rounded-full object-cover" />
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              {location.city}
            </h3>
            <p className="text-xs text-text-muted">
              {location.country}
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
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serverLocations.map((location, i) => (
          <Reveal key={location.country + location.city} delay={i * 50}>
            <ServerCard location={location} t={t} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
