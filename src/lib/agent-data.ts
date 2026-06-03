import { createUntypedAdminClient } from "@/lib/supabase/admin";
import {
  PLANS,
  CURRENCY,
  TERMS,
  COMPARISON,
  HIGHLIGHTS,
  PRIVACY,
  COMPANY,
  SITE_URL,
} from "@/lib/facts";

/**
 * Shared payload builders for the agent surface. Both the /api/agents/* route
 * handlers and the MCP tools return these, so the two never drift. Read
 * payloads are pure (derived from lib/facts.ts); getServerSummary hits Supabase.
 */

export function pricingPayload() {
  return { currency: CURRENCY, plans: Object.values(PLANS), terms: TERMS };
}

export function comparePayload() {
  return {
    title: "Doppler VPN vs. traditional VPNs",
    highlights: HIGHLIGHTS,
    rows: COMPARISON,
  };
}

export function privacyPayload() {
  return {
    ...PRIVACY,
    provider: { legalName: COMPANY.legalName, jurisdiction: COMPANY.jurisdiction },
    policyUrl: `${SITE_URL}/en/privacy`,
  };
}

type ServerRow = {
  country: string | null;
  country_code: string | null;
  is_premium: boolean | null;
  load_percentage: number | null;
};

/**
 * Public aggregate network map — counts and a country list only. Never selects
 * ip_address or config_data (same safe-field discipline as /api/vpn/servers).
 */
export async function getServerSummary() {
  const supabase = createUntypedAdminClient();
  const { data, error } = await supabase
    .from("vpn_servers")
    .select("country, country_code, is_premium, load_percentage")
    .eq("is_active", true);

  if (error) throw new Error("Failed to fetch servers");

  const rows = (data ?? []) as ServerRow[];
  const countries = Array.from(
    new Set(rows.map((s) => s.country).filter((c): c is string => Boolean(c)))
  ).sort();
  const premiumServers = rows.filter((s) => s.is_premium).length;
  const loads = rows
    .map((s) => s.load_percentage)
    .filter((n): n is number => typeof n === "number");
  const averageLoadPercent = loads.length
    ? Math.round(loads.reduce((a, b) => a + b, 0) / loads.length)
    : null;

  return {
    protocol: "VLESS-Reality over Xray-core",
    activeServers: rows.length,
    countryCount: countries.length,
    countries,
    premiumServers,
    averageLoadPercent,
  };
}
