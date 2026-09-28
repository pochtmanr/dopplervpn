import { TIMEZONE_PROPOSAL, CONTRACT_VERSION, PROJECT_ID } from "../constants";
import type { Checkpoint } from "../types";
import { cursorExpiry, decodeCursor, encodeCursor } from "../bos/cursors";
import type { HeadlineMetric, TrafficHighlight } from "./policy";
import { primaryHeadline, visitorComparison } from "./policy";
import type { StoredFact } from "./store";
import { aggregateDrain } from "./drain";
import type { DrainBatchRecord } from "./store";
import { sourceDayBounds } from "./time";

const ANALYTICS_FORMULA = "doppler-analytics-native-v1";

export { ANALYTICS_FORMULA };

export interface AnalyticsReportInput {
  provider: string;
  report: string;
  from: string;
  to: string;
  limit: number;
  cursor: string | null;
  facts: StoredFact[];
  batches: DrainBatchRecord[];
  checkpoint: Checkpoint | null;
  configured: boolean;
  now: Date;
  environment: string;
  snapshotId: string;
  dataAsOf: string;
  binding: string;
  primary: HeadlineMetric | null;
  vercelEnabled: boolean;
}

export function analyticsConfigured(env: NodeJS.ProcessEnv = process.env) {
  const ga = Boolean(env.GA_PROPERTY_ID && env.GA_SA_CLIENT_EMAIL && env.GA_SA_PRIVATE_KEY);
  const gsc = Boolean(env.GSC_SITE_URL && env.GSC_SA_CLIENT_EMAIL && env.GSC_SA_PRIVATE_KEY);
  const vercel = env.VERCEL_ANALYTICS_DRAIN === "enabled" && Boolean(env.VERCEL_DRAIN_SECRET);
  return {
    ga4_overview_daily: ga,
    ga4_breakdown: ga,
    ga4_period_unique_users: ga,
    gsc_daily_totals: gsc,
    gsc_dimension_rows: gsc,
    vercel_daily: vercel,
  };
}

export function buildAnalyticsReport(input: AnalyticsReportInput): { ok: true; body: Record<string, unknown> } | { ok: false; code: "bad_cursor" } {
  if (input.report === "vercel_daily" && !input.vercelEnabled) {
    return { ok: true, body: unavailable(input, "drain_not_configured", "UTC", [
      "No drain delivery contract is confirmed for this project. Metrics are omitted rather than filled with zero.",
    ], ["vercel_drain"]) };
  }
  if (!input.configured) {
    return { ok: true, body: unavailable(input, "not_configured", input.provider === "gsc" ? "America/Los_Angeles" : TIMEZONE_PROPOSAL, [
      "The provider is not configured. This is not a zero report.",
    ]) };
  }
  const sourceTimezone = input.facts[0]?.sourceTimezone
    ?? (input.provider === "gsc" ? "America/Los_Angeles" : TIMEZONE_PROPOSAL);
  if (input.provider === "vercel") {
    return { ok: true, body: vercelReport(input, sourceTimezone) };
  }
  const matching = input.facts.filter((fact) => factInPeriod(fact, input.from, input.to));
  if (input.checkpoint?.lastError && matching.length === 0) {
    return { ok: true, body: unavailable(input, "provider_outage", sourceTimezone, [
      "The last collection failed. No zero row was written.",
    ]) };
  }
  if (input.report === "ga4_period_unique_users") {
    return periodReport(input, matching, sourceTimezone);
  }
  const sorted = [...matching].sort((left, right) => left.grainKey.localeCompare(right.grainKey));
  const page = pageFacts(sorted, input);
  if (!page.ok) return page;
  const stale = isStale(input.checkpoint, input.to, input.now);
  const sampled = page.rows.some((fact) => fact.dataState === "sampled");
  const partial = stale || page.rows.some((fact) => fact.dataState !== "final") || !covers(input.checkpoint, input.to);
  const completePropertyTotal = input.report === "ga4_overview_daily" || input.report === "gsc_daily_totals";
  return {
    ok: true,
    body: envelope(input, {
      availability: page.rows.length === 0 ? "unavailable" : "available",
      reason: page.rows.length === 0 ? "not_collected" : undefined,
      dataState: page.rows.length === 0 ? "unavailable" : sampled ? "sampled" : partial ? "partial" : "final",
      sourceTimezone,
      coverage: page.rows.length === 0 ? "missing" : partial || sampled ? "partial" : "complete",
      rows: page.rows.map((fact) => fact.body),
      page: {
        limit: input.limit,
        has_more: page.hasMore,
        next_cursor: page.nextCursor,
        complete_property_total: input.report === "gsc_dimension_rows" || input.report === "ga4_breakdown" || sampled
          ? false
          : completePropertyTotal,
      },
      limitations: limitations(input.report, stale, sampled),
      propertyRef: "redacted",
    }),
  };
}

export function trafficHighlights(input: {
  primary: HeadlineMetric | null;
  ga4ActiveUsers: number | null;
  vercelVisitors: number | null;
  vercelVisitorsReliable: boolean;
}): TrafficHighlight[] {
  if (!input.primary) return [];
  const compared = visitorComparison({
    primary: input.primary,
    ga4ActiveUsers: input.ga4ActiveUsers,
    vercelVisitors: input.vercelVisitors,
    vercelVisitorsReliable: input.vercelVisitorsReliable,
  });
  return compared.highlights;
}

export function headlineFromEnv(ga4Configured: boolean): HeadlineMetric | null {
  return primaryHeadline(process.env.ANALYTICS_PRIMARY_HEADLINE, ga4Configured);
}

function periodReport(
  input: AnalyticsReportInput,
  facts: StoredFact[],
  sourceTimezone: string,
): { ok: true; body: Record<string, unknown> } {
  const fact = facts.find((item) => {
    const from = item.body.period_from;
    const to = item.body.period_to;
    return from === input.from && to === input.to;
  });
  if (!fact || typeof fact.body.active_users !== "number") {
    return {
      ok: true,
      body: {
        ...unavailable(input, "period_unique_query_required", sourceTimezone, [
          "Period activeUsers come from one query. Do not sum daily or country rows.",
        ]),
        must_not_sum_daily_uniques: true,
      },
    };
  }
  return {
    ok: true,
    body: envelope(input, {
      availability: "available",
      dataState: fact.dataState === "unavailable" ? "partial" : fact.dataState,
      sourceTimezone,
      coverage: fact.dataState === "final" ? "complete" : "partial",
      rows: [{ active_users: fact.body.active_users }],
      page: { limit: input.limit, has_more: false, next_cursor: null, complete_property_total: true },
      limitations: ["Period activeUsers come from one query. Do not sum daily or country rows."],
      propertyRef: "redacted",
      mustNotSum: true,
    }),
  };
}

function vercelReport(input: AnalyticsReportInput, sourceTimezone: string): Record<string, unknown> {
  const aggregated = aggregateDrain({
    batches: input.batches.map((batch) => ({
      deliveryId: batch.deliveryId,
      retryCount: batch.retryCount,
      receivedAt: batch.receivedAt,
      body: batch.body,
    })),
    timeZone: sourceTimezone,
    samplingConfirmedUnsampled: false,
  });
  const rows = aggregated.pageviews.filter((row) => {
    const bounds = sourceDayBounds(row.date, sourceTimezone);
    return bounds.from < input.to && bounds.to > input.from;
  });
  if (rows.length === 0) {
    return unavailable(input, "not_collected", sourceTimezone, [
      "Drain batches did not contain pageviews for this period. Visitors stay unavailable.",
    ]);
  }
  return envelope(input, {
    availability: "available",
    dataState: "partial",
    sourceTimezone,
    coverage: "partial",
    rows: rows.map((row) => ({
      date: row.date,
      pageviews: row.pageviews,
      custom_events: row.customEvents,
      visitors: null,
      reason: aggregated.visitorsReason,
    })),
    page: { limit: input.limit, has_more: false, next_cursor: null, complete_property_total: false },
    limitations: [
      "Pageviews count delivered events, including duplicate drain batches. Unsampled visitors are not reconstructed.",
    ],
    propertyRef: "redacted",
  });
}

function pageFacts(facts: StoredFact[], input: AnalyticsReportInput):
  | { ok: true; rows: StoredFact[]; hasMore: boolean; nextCursor: string | null }
  | { ok: false; code: "bad_cursor" } {
  let start = 0;
  if (input.cursor) {
    const decoded = decodeCursor(input.cursor);
    if (!decoded || decoded.endpoint !== "/api/business-os/v1/analytics/report" || decoded.query_sha256 !== input.binding) {
      return { ok: false, code: "bad_cursor" };
    }
    const index = facts.findIndex((fact) => fact.grainKey === decoded.after_change_sequence);
    if (index < 0) return { ok: false, code: "bad_cursor" };
    start = index + 1;
  }
  const slice = facts.slice(start, start + input.limit);
  const hasMore = start + input.limit < facts.length;
  const last = slice[slice.length - 1];
  const nextCursor = hasMore && last
    ? encodeCursor({
        v: 1,
        project_id: "doppler",
        environment: input.environment as "production" | "staging" | "test",
        endpoint: "/api/business-os/v1/analytics/report",
        query_sha256: input.binding,
        snapshot_id: input.snapshotId,
        high_watermark: String(facts.length),
        after_change_sequence: last.grainKey,
        expires_at: cursorExpiry(input.now),
      })
    : null;
  return { ok: true, rows: slice, hasMore, nextCursor };
}

function factInPeriod(fact: StoredFact, from: string, to: string): boolean {
  if (!fact.sourceDate) return true;
  const bounds = sourceDayBounds(fact.sourceDate, fact.sourceTimezone);
  return bounds.from < to && bounds.to > from;
}

function covers(checkpoint: Checkpoint | null, to: string): boolean {
  return Boolean(checkpoint?.coveredThrough && checkpoint.coveredThrough >= to);
}

function isStale(checkpoint: Checkpoint | null, to: string, now: Date): boolean {
  if (!checkpoint?.coveredThrough) return true;
  if (checkpoint.coveredThrough < to) return true;
  const age = now.getTime() - Date.parse(checkpoint.coveredThrough);
  return age > 36 * 60 * 60 * 1000;
}

function limitations(report: string, stale: boolean, sampled: boolean): string[] {
  const lines: string[] = [];
  if (report === "ga4_overview_daily") lines.push("Daily active users are not a period unique count.");
  if (report === "gsc_dimension_rows") {
    lines.push("Dimension rows overlap, omit data, and are not the property total. Dates stay in America/Los_Angeles.");
  }
  if (report === "gsc_daily_totals") {
    lines.push("CTR is clicks divided by impressions for this aggregation. Position is the provider value, not an average of other rows.");
  }
  if (stale) lines.push("Collection is behind the requested period.");
  if (sampled) lines.push("The provider marked this report as sampled.");
  return lines;
}

function unavailable(
  input: AnalyticsReportInput,
  reason: string,
  sourceTimezone: string,
  limitations: string[],
  missing: string[] = [input.provider],
): Record<string, unknown> {
  return envelope(input, {
    availability: "unavailable",
    reason,
    dataState: "unavailable",
    sourceTimezone: input.provider === "gsc" ? "America/Los_Angeles" : sourceTimezone,
    coverage: "missing",
    rows: [],
    page: { limit: input.limit, has_more: false, next_cursor: null, complete_property_total: false },
    limitations,
    propertyRef: "redacted",
    missing,
  });
}

function envelope(input: AnalyticsReportInput, fields: {
  availability: "available" | "unavailable";
  reason?: string;
  dataState: "final" | "partial" | "sampled" | "unavailable";
  sourceTimezone: string;
  coverage: "complete" | "partial" | "missing";
  rows: Array<Record<string, unknown>>;
  page: { limit: number; has_more: boolean; next_cursor: string | null; complete_property_total: boolean };
  limitations: string[];
  propertyRef: string;
  mustNotSum?: boolean;
  missing?: string[];
}): Record<string, unknown> {
  return {
    schema_version: "1.0.0",
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    environment: input.environment,
    snapshot_id: input.snapshotId,
    generated_at: input.now.toISOString().replace(/\.\d{3}Z$/, "Z"),
    data_as_of: input.dataAsOf,
    provider: input.provider,
    report: input.report,
    availability: fields.availability,
    ...(fields.reason ? { reason: fields.reason } : {}),
    data_state: fields.dataState,
    source_timezone: input.provider === "gsc" ? "America/Los_Angeles" : fields.sourceTimezone,
    property_ref: fields.propertyRef,
    coverage: {
      status: fields.coverage,
      missing: fields.coverage === "missing" ? (fields.missing ?? [input.provider]) : [],
    },
    posting: false,
    ...(fields.mustNotSum || input.report === "ga4_period_unique_users" ? { must_not_sum_daily_uniques: true } : {}),
    rows: fields.rows,
    page: fields.page,
    limitations: fields.limitations,
    period: {
      from: input.from,
      to: input.to,
      timezone: input.provider === "gsc" ? "America/Los_Angeles" : fields.sourceTimezone,
    },
  };
}
