import { ctrDecimal } from "./decimals";

export type HeadlineMetric = "ga4_active_users" | "vercel_visitors";

export function periodUniqueUsers(
  input: { kind: "period"; activeUsers: number } | { kind: "daily"; activeUsers: number[] },
): { ok: true; activeUsers: number } | { ok: false; reason: "summed_daily_uniques" } {
  if (input.kind === "daily") return { ok: false, reason: "summed_daily_uniques" };
  return { ok: true, activeUsers: input.activeUsers };
}

export function propertyTotalFromDimensionRows(): {
  clicks: null;
  impressions: null;
  position: null;
  reason: "dimension_rows_are_not_property_totals";
} {
  return {
    clicks: null,
    impressions: null,
    position: null,
    reason: "dimension_rows_are_not_property_totals",
  };
}

export function refusePositionAverage(): { position: null; reason: "position_is_not_an_arithmetic_mean" } {
  return { position: null, reason: "position_is_not_an_arithmetic_mean" };
}

export interface FunnelInput {
  ga4Sessions: number | null;
  ga4PurchaseEvents: number | null;
  ga4PurchaseRevenue: string | null;
  nativePurchases?: number | null;
  searchQuery?: string | null;
  buyerId?: string | null;
}

export function funnelObservation(input: FunnelInput) {
  const purchaseRevenue = {
    amount: input.ga4PurchaseRevenue,
    role: "check_signal" as const,
    posts_to_ledger: false as const,
  };
  if (input.nativePurchases != null) {
    return { rate: null, reason: "native_purchases_are_not_web_sessions", purchaseRevenue };
  }
  if (input.searchQuery && input.buyerId) {
    return { rate: null, reason: "search_queries_are_not_buyer_links", purchaseRevenue };
  }
  if (input.ga4Sessions == null) {
    return { rate: null, reason: "missing_web_sessions", purchaseRevenue };
  }
  if (input.ga4Sessions === 0) {
    return { rate: null, reason: "zero_denominator", purchaseRevenue };
  }
  if (input.ga4PurchaseEvents == null) {
    return { rate: null, reason: "missing_purchase_events", purchaseRevenue };
  }
  return {
    rate: ctrDecimal(input.ga4PurchaseEvents, input.ga4Sessions),
    reason: null,
    purchaseRevenue,
  };
}

export interface TrafficHighlight {
  provider: "ga4" | "gsc" | "vercel";
  metric: string;
  value: number | string | null;
  quality: "actual" | "unavailable";
  reason?: string;
  definition: string;
}

export function visitorComparison(input: {
  primary: HeadlineMetric;
  ga4ActiveUsers: number | null;
  vercelVisitors: number | null;
  vercelVisitorsReliable: boolean;
}): { highlights: TrafficHighlight[]; forbiddenSum: number | null } {
  const ga: TrafficHighlight = input.ga4ActiveUsers == null
    ? {
        provider: "ga4",
        metric: "active_users",
        value: null,
        quality: "unavailable",
        reason: "missing_ga4_active_users",
        definition: "GA4 activeUsers for the requested period. Not a sum of daily users.",
      }
    : {
        provider: "ga4",
        metric: "active_users",
        value: input.ga4ActiveUsers,
        quality: "actual",
        definition: "GA4 activeUsers for the requested period. Not a sum of daily users.",
      };
  const vercel: TrafficHighlight = input.vercelVisitorsReliable && input.vercelVisitors != null
    ? {
        provider: "vercel",
        metric: "visitors",
        value: input.vercelVisitors,
        quality: "actual",
        definition: "Vercel visitors. A different definition from GA4 activeUsers.",
      }
    : {
        provider: "vercel",
        metric: "visitors",
        value: null,
        quality: "unavailable",
        reason: "unsampled_visitors_not_guaranteed",
        definition: "Vercel visitors. A different definition from GA4 activeUsers.",
      };
  const highlights = input.primary === "vercel_visitors" ? [vercel, ga] : [ga, vercel];
  const forbiddenSum = input.ga4ActiveUsers != null && input.vercelVisitors != null
    ? input.ga4ActiveUsers + input.vercelVisitors
    : null;
  return { highlights, forbiddenSum };
}

export function primaryHeadline(raw: string | undefined, ga4Configured: boolean): HeadlineMetric | null {
  if (raw === "vercel_visitors") return "vercel_visitors";
  if (raw === "ga4_active_users") return "ga4_active_users";
  if (!raw && ga4Configured) return "ga4_active_users";
  return null;
}
