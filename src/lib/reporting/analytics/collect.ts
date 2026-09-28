import { IMPORT_MAX_RETRIES, LEASE_MS } from "../constants";
import type { ReportingStore } from "../types";
import type { AnalyticsStore } from "./store";
import { integerMetric, type Ga4Metadata, type Ga4ParsedReport, type GscParsedReport } from "./parse";
import { GSC_TIMEZONE, refreshDates, sourceDate, windowBounds } from "./time";

export const GA_LOOKBACK_DAYS = 90;
export const GA_PERIOD_WINDOWS = [7, 30, 90] as const;
export const GSC_LOOKBACK_DAYS = 14;
export const GSC_ROW_LIMIT = 1000;

export class QuotaStop extends Error {
  constructor() {
    super("quota_exhausted");
    this.name = "QuotaStop";
  }
}

export interface Ga4DailyRow {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
}

export interface Ga4BreakdownRow {
  label: string;
  metric: number;
}

export interface Ga4Load {
  timeZone: string | null;
  sourceAsOf: string;
  metadata: Ga4Metadata;
  dataState: Ga4ParsedReport["dataState"];
  daily: Ga4DailyRow[];
  periods: Array<{ days: number; activeUsers: number }>;
  pages: Ga4BreakdownRow[];
  countries: Ga4BreakdownRow[];
  channels: Ga4BreakdownRow[];
}

export interface GscLoad {
  sourceAsOf: string;
  totals: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: string;
    position: string;
    searchType: "web";
    aggregationType: "auto" | "byPage" | "byProperty";
    dataState: "final" | "partial";
  }>;
  dimensions: Array<{
    dimension: "query" | "page" | "country" | "device";
    key: string;
    date: string | null;
    clicks: number;
    impressions: number;
    ctr: string;
    position: string;
    dataState: "final" | "partial";
  }>;
}

export interface CollectOutcome {
  status: "imported" | "leased" | "retry" | "bounded_stop" | "quota" | "unconfigured";
  retryCount: number;
}

export async function collectGa4(input: {
  reporting: ReportingStore;
  analytics: AnalyticsStore;
  now: Date;
  configured: boolean;
  load: () => Promise<Ga4Load>;
}): Promise<CollectOutcome> {
  if (!input.configured) return { status: "unconfigured", retryCount: 0 };
  return runCollected({
    source: "ga4",
    reporting: input.reporting,
    nowMs: input.now.getTime(),
    work: async () => {
      const loaded = await input.load();
      const timeZone = loaded.timeZone;
      if (!timeZone) throw new Error("missing_property_timezone");
      const retrievedAt = input.now.toISOString().replace(/\.\d{3}Z$/, "Z");
      const today = sourceDate(retrievedAt, timeZone);
      for (const row of loaded.daily) {
        const dataState = row.date === today || loaded.dataState !== "final" ? worse(loaded.dataState, "partial") : loaded.dataState;
        await input.analytics.replaceFact({
          provider: "ga4",
          report: "ga4_overview_daily",
          grainKey: row.date,
          sourceDate: row.date,
          sourceTimezone: timeZone,
          sourceAsOf: loaded.sourceAsOf,
          retrievedAt,
          dataState,
          body: {
            date: row.date,
            active_users: row.activeUsers,
            new_users: row.newUsers,
            sessions: row.sessions,
            screen_page_views: row.screenPageViews,
          },
          metadata: metadataBody(loaded.metadata),
        });
      }
      const dates = refreshDates(input.now, timeZone, GA_LOOKBACK_DAYS);
      for (const period of loaded.periods) {
        const windowDates = dates.slice(-period.days);
        const bounds = windowBounds(windowDates, timeZone);
        await input.analytics.replaceFact({
          provider: "ga4",
          report: "ga4_period_unique_users",
          grainKey: `period:${period.days}`,
          sourceDate: null,
          sourceTimezone: timeZone,
          sourceAsOf: loaded.sourceAsOf,
          retrievedAt,
          dataState: loaded.dataState === "final" ? "partial" : loaded.dataState,
          body: { active_users: period.activeUsers, period_from: bounds.from, period_to: bounds.to, days: period.days },
          metadata: metadataBody(loaded.metadata),
        });
      }
      await storeBreakdown(input.analytics, "pagePath", loaded.pages, timeZone, loaded, retrievedAt);
      await storeBreakdown(input.analytics, "country", loaded.countries, timeZone, loaded, retrievedAt);
      await storeBreakdown(input.analytics, "sessionDefaultChannelGroup", loaded.channels, timeZone, loaded, retrievedAt);
      const covered = windowBounds(refreshDates(input.now, timeZone, 7), timeZone).to;
      return { coveredThrough: covered };
    },
  });
}

export async function collectGsc(input: {
  reporting: ReportingStore;
  analytics: AnalyticsStore;
  now: Date;
  configured: boolean;
  load: () => Promise<GscLoad>;
}): Promise<CollectOutcome> {
  if (!input.configured) return { status: "unconfigured", retryCount: 0 };
  return runCollected({
    source: "gsc",
    reporting: input.reporting,
    nowMs: input.now.getTime(),
    work: async () => {
      const loaded = await input.load();
      const retrievedAt = input.now.toISOString().replace(/\.\d{3}Z$/, "Z");
      for (const row of loaded.totals) {
        await input.analytics.replaceFact({
          provider: "gsc",
          report: "gsc_daily_totals",
          grainKey: row.date,
          sourceDate: row.date,
          sourceTimezone: GSC_TIMEZONE,
          sourceAsOf: loaded.sourceAsOf,
          retrievedAt,
          dataState: row.dataState,
          body: {
            date: row.date,
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
            search_type: row.searchType,
            aggregation_type: row.aggregationType,
          },
          metadata: {},
        });
      }
      for (const row of loaded.dimensions) {
        await input.analytics.replaceFact({
          provider: "gsc",
          report: "gsc_dimension_rows",
          grainKey: `${row.dimension}|${row.date ?? ""}|${row.key}`,
          sourceDate: row.date,
          sourceTimezone: GSC_TIMEZONE,
          sourceAsOf: loaded.sourceAsOf,
          retrievedAt,
          dataState: row.dataState,
          body: {
            ...(row.dimension === "query" ? { query: row.key } : {}),
            ...(row.dimension === "page" ? { page: row.key } : {}),
            ...(row.dimension === "country" ? { country: row.key } : {}),
            ...(row.dimension === "device" ? { device: row.key } : {}),
            ...(row.date ? { date: row.date } : {}),
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr,
            position: row.position,
          },
          metadata: { dimension: row.dimension },
        });
      }
      const dates = refreshDates(input.now, GSC_TIMEZONE, GSC_LOOKBACK_DAYS);
      return { coveredThrough: windowBounds(dates, GSC_TIMEZONE).to };
    },
  });
}

export function rowsFromGa4Daily(report: Ga4ParsedReport): Ga4DailyRow[] {
  return report.rows.flatMap((row) => {
    const date = isoDate(row.dimensions[0] ?? "");
    const activeUsers = integerMetric(row.metrics[0] ?? "");
    const newUsers = integerMetric(row.metrics[1] ?? "");
    const sessions = integerMetric(row.metrics[2] ?? "");
    const screenPageViews = integerMetric(row.metrics[3] ?? "");
    if (!date || activeUsers == null || newUsers == null || sessions == null || screenPageViews == null) return [];
    return [{ date, activeUsers, newUsers, sessions, screenPageViews }];
  });
}

export function rowsFromGa4Breakdown(report: Ga4ParsedReport): Ga4BreakdownRow[] {
  return report.rows.flatMap((row) => {
    const label = row.dimensions[0] ?? "";
    const metric = integerMetric(row.metrics[0] ?? "");
    if (!label || metric == null) return [];
    return [{ label, metric }];
  });
}

export function gscDataState(date: string, firstIncompleteDate: string | null, today: string): "final" | "partial" {
  if (date >= today) return "partial";
  if (firstIncompleteDate && date >= firstIncompleteDate) return "partial";
  return "final";
}

async function storeBreakdown(
  analytics: AnalyticsStore,
  dimension: string,
  rows: Ga4BreakdownRow[],
  timeZone: string,
  loaded: Ga4Load,
  retrievedAt: string,
) {
  for (const row of rows) {
    await analytics.replaceFact({
      provider: "ga4",
      report: "ga4_breakdown",
      grainKey: `${dimension}|${row.label}`,
      sourceDate: null,
      sourceTimezone: timeZone,
      sourceAsOf: loaded.sourceAsOf,
      retrievedAt,
      dataState: loaded.dataState,
      body: { dimension, label: row.label, value: row.metric },
      metadata: metadataBody(loaded.metadata),
    });
  }
}

async function runCollected(input: {
  source: string;
  reporting: ReportingStore;
  nowMs: number;
  work: () => Promise<{ coveredThrough: string }>;
}): Promise<CollectOutcome> {
  const checkpoint = await input.reporting.getCheckpoint(input.source);
  if ((checkpoint?.retryCount ?? 0) >= IMPORT_MAX_RETRIES) {
    return { status: "bounded_stop", retryCount: checkpoint?.retryCount ?? IMPORT_MAX_RETRIES };
  }
  const owner = `analytics-${input.source}`;
  const leased = await input.reporting.acquireLease(input.source, owner, input.nowMs, LEASE_MS);
  if (!leased) return { status: "leased", retryCount: checkpoint?.retryCount ?? 0 };
  try {
    const result = await input.work();
    await input.reporting.saveCheckpoint(input.source, {
      cursorCreatedAt: result.coveredThrough,
      cursorId: input.source,
      coveredThrough: result.coveredThrough,
      retryCount: 0,
      lastError: null,
    });
    await input.reporting.resetFailures(input.source);
    return { status: "imported", retryCount: 0 };
  } catch (error) {
    if (error instanceof QuotaStop) {
      await input.reporting.saveCheckpoint(input.source, {
        cursorCreatedAt: checkpoint?.cursorCreatedAt ?? null,
        cursorId: checkpoint?.cursorId ?? null,
        coveredThrough: checkpoint?.coveredThrough ?? null,
        retryCount: checkpoint?.retryCount ?? 0,
        lastError: "quota_exhausted",
      });
      return { status: "quota", retryCount: checkpoint?.retryCount ?? 0 };
    }
    const retryCount = await input.reporting.noteFailure(
      input.source,
      error instanceof Error ? error.name : "collect_failed",
    );
    return { status: retryCount >= IMPORT_MAX_RETRIES ? "bounded_stop" : "retry", retryCount };
  } finally {
    await input.reporting.releaseLease(input.source, owner);
  }
}

function metadataBody(metadata: Ga4Metadata): Record<string, unknown> {
  return {
    timeZone: metadata.timeZone,
    currencyCode: metadata.currencyCode,
    dataLossFromOtherRow: metadata.dataLossFromOtherRow,
    subjectToThresholding: metadata.subjectToThresholding,
    samplingMetadatas: metadata.samplingMetadatas,
    propertyQuota: metadata.propertyQuota,
    dataTruncationReasons: metadata.dataTruncationReasons,
  };
}

function worse(
  current: Ga4ParsedReport["dataState"],
  next: "partial",
): Ga4ParsedReport["dataState"] {
  if (current === "sampled") return "sampled";
  return next;
}

function isoDate(value: string): string | null {
  if (/^[0-9]{8}$/.test(value)) return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return value;
  return null;
}

export function gscTotalsFromReport(report: GscParsedReport, today: string) {
  return report.rows.flatMap((row) => {
    const date = row.keys[0] ?? "";
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date) || row.clicks == null || row.impressions == null || !row.ctr || !row.position) {
      return [];
    }
    return [{
      date,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
      searchType: "web" as const,
      aggregationType: report.responseAggregationType ?? "byProperty" as const,
      dataState: gscDataState(date, report.firstIncompleteDate, today),
    }];
  });
}
