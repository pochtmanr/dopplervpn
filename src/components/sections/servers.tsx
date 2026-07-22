import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { getFlagUrl } from "@/lib/languages";

/* ─── Server location data (from Supabase vpn_servers, updated 2026-07-23) ─── */
interface ServerLocation {
  key: string;
  count: number;
  protocol: string;
  countryCode: string;
}

const serverLocations: ServerLocation[] = [
  { key: "canada", count: 1, protocol: "VLESS-Reality", countryCode: "ca" },
  { key: "hongkong", count: 1, protocol: "VLESS-Reality", countryCode: "hk" },
  { key: "japan", count: 1, protocol: "VLESS-Reality", countryCode: "jp" },
  { key: "poland", count: 2, protocol: "VLESS-Reality", countryCode: "pl" },
  { key: "russia", count: 1, protocol: "VLESS-Reality", countryCode: "ru" },
  { key: "sweden", count: 1, protocol: "VLESS-Reality", countryCode: "se" },
  { key: "uae", count: 1, protocol: "VLESS-Reality", countryCode: "ae" },
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
    <div className="group relative overflow-hidden rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors">
      {/* Full-height country flag on the trailing edge, ~30° angled cut */}
      <div className="server-flag-clip absolute inset-y-0 end-0 w-24" aria-hidden="true">
        <img
          src={getFlagUrl(location.countryCode)}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover scale-150"
        />
      </div>
      <div className="relative pe-24">
        <h3 className="text-base font-semibold text-text-primary">
          {t(`locations.${location.key}.city`)}
        </h3>
        <p className="text-xs text-text-muted">
          {t(`locations.${location.key}.country`)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <ProtocolBadge protocol={location.protocol} />
          <span className="text-xs text-text-muted bg-overlay/5 px-2 py-1 rounded-full">
            {location.count} {location.count > 1 ? t("servers") : t("server")}
          </span>
        </div>
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
