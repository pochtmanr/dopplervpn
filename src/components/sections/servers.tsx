"use client";

import { useTranslations } from "next-intl";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

/* ─── Types ─── */
interface ServerData {
  name: string;
  country: string;
  country_code: string;
  city: string;
  protocol: string;
  is_premium: boolean;
}

interface ServerGroup {
  country: string;
  city: string;
  flag: string;
  count: number;
  protocol: string;
  hasPremium: boolean;
}

/* ─── Country code to flag emoji ─── */
const FLAG_MAP: Record<string, string> = {
  DE: "\u{1F1E9}\u{1F1EA}",
  RU: "\u{1F1F7}\u{1F1FA}",
  RU2: "\u{1F1F7}\u{1F1FA}",
  FR: "\u{1F1EB}\u{1F1F7}",
  JP: "\u{1F1EF}\u{1F1F5}",
  NL: "\u{1F1F3}\u{1F1F1}",
  SG: "\u{1F1F8}\u{1F1EC}",
  US: "\u{1F1FA}\u{1F1F8}",
  IL: "\u{1F1EE}\u{1F1F1}",
  CH: "\u{1F1E8}\u{1F1ED}",
  GB: "\u{1F1EC}\u{1F1E7}",
};

function groupServers(servers: ServerData[]): ServerGroup[] {
  const groups = new Map<string, ServerGroup>();

  for (const s of servers) {
    const baseCode = s.country_code.replace(/\d+$/, "");
    const existing = groups.get(baseCode);
    if (existing) {
      existing.count += 1;
      if (s.is_premium) existing.hasPremium = true;
    } else {
      groups.set(baseCode, {
        country: s.country,
        city: s.city,
        flag: FLAG_MAP[s.country_code] || FLAG_MAP[baseCode] || "\u{1F30D}",
        count: 1,
        protocol: s.protocol === "vless" ? "VLESS-Reality" : s.protocol,
        hasPremium: s.is_premium,
      });
    }
  }

  return Array.from(groups.values());
}

/* ─── Protocol badge ─── */
function ProtocolBadge({ protocol }: { protocol: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/20">
      {protocol}
    </span>
  );
}

/* ─── Server card ─── */
function ServerCard({ group, t }: { group: ServerGroup; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="group rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-5 hover:border-accent-teal/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{group.flag}</span>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              {group.city}
            </h3>
            <p className="text-xs text-text-muted">
              {group.country}
            </p>
          </div>
        </div>
        <span className="text-xs text-text-muted bg-overlay/5 px-2 py-1 rounded-full">
          {group.count} {group.count > 1 ? t("servers") : t("server")}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <ProtocolBadge protocol={group.protocol} />
      </div>
    </div>
  );
}

/* ─── Servers section ─── */
export function Servers({ servers }: { servers: ServerData[] }) {
  const t = useTranslations("servers");
  const groups = groupServers(servers);

  return (
    <Section id="servers">
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((group, i) => (
          <Reveal key={group.country + group.city} delay={i * 50}>
            <ServerCard group={group} t={t} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
