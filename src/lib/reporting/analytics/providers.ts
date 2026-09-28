import { GA_LOOKBACK_DAYS, GA_PERIOD_WINDOWS, GSC_LOOKBACK_DAYS, type Ga4Load, type GscLoad } from "./collect";
import { ga4ConfigFromEnv, runGa4Report } from "./ga4-client";
import { gscConfigFromEnv, querySearchAnalytics } from "./gsc-client";
import { rowsFromGa4Breakdown, rowsFromGa4Daily, gscTotalsFromReport } from "./collect";
import { integerMetric, parseGa4Report } from "./parse";
import { GSC_TIMEZONE, refreshDates, sourceDate } from "./time";

export async function loadGa4(now: Date, fetchImpl: typeof fetch = fetch): Promise<Ga4Load> {
  const config = ga4ConfigFromEnv();
  if (!config) throw new Error("ga4_not_configured");
  const probeDay = now.toISOString().slice(0, 10);
  const probe = await runGa4Report(config, {
    startDate: probeDay,
    endDate: probeDay,
    metrics: ["activeUsers"],
    limit: 1,
  }, fetchImpl);
  const timeZone = probe.metadata.timeZone;
  if (!timeZone) throw new Error("missing_property_timezone");
  const dates = refreshDates(now, timeZone, GA_LOOKBACK_DAYS);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  if (!startDate || !endDate) throw new Error("empty_window");
  const dailyReport = await runGa4Report(config, {
    startDate,
    endDate,
    dimensions: ["date"],
    metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews"],
  }, fetchImpl);
  const periods = [];
  for (const days of GA_PERIOD_WINDOWS) {
    const window = dates.slice(-days);
    const periodStart = window[0];
    const periodEnd = window[window.length - 1];
    if (!periodStart || !periodEnd) continue;
    const report = await runGa4Report(config, {
      startDate: periodStart,
      endDate: periodEnd,
      metrics: ["activeUsers"],
      limit: 1,
    }, fetchImpl);
    const activeUsers = integerMetric(report.rows[0]?.metrics[0] ?? "");
    if (activeUsers == null) continue;
    periods.push({ days, activeUsers });
  }
  const pages = rowsFromGa4Breakdown(await runGa4Report(config, {
    startDate,
    endDate,
    dimensions: ["pagePath"],
    metrics: ["screenPageViews"],
    limit: 10,
  }, fetchImpl));
  const countries = rowsFromGa4Breakdown(await runGa4Report(config, {
    startDate,
    endDate,
    dimensions: ["country"],
    metrics: ["activeUsers"],
    limit: 10,
  }, fetchImpl));
  const channels = rowsFromGa4Breakdown(await runGa4Report(config, {
    startDate,
    endDate,
    dimensions: ["sessionDefaultChannelGroup"],
    metrics: ["sessions"],
    limit: 10,
  }, fetchImpl));
  return {
    timeZone,
    sourceAsOf: now.toISOString().replace(/\.\d{3}Z$/, "Z"),
    metadata: dailyReport.metadata.timeZone ? dailyReport.metadata : probe.metadata,
    dataState: dailyReport.dataState,
    daily: rowsFromGa4Daily(dailyReport),
    periods,
    pages,
    countries,
    channels,
  };
}

export async function loadGsc(now: Date, fetchImpl: typeof fetch = fetch): Promise<GscLoad> {
  const config = gscConfigFromEnv();
  if (!config) throw new Error("gsc_not_configured");
  const dates = refreshDates(now, GSC_TIMEZONE, GSC_LOOKBACK_DAYS);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  if (!startDate || !endDate) throw new Error("empty_window");
  const today = sourceDate(now.toISOString(), GSC_TIMEZONE);
  const totals = gscTotalsFromReport(await querySearchAnalytics(config, {
    startDate,
    endDate,
    dimensions: ["date"],
    aggregationType: "byProperty",
  }, fetchImpl), today);
  const dimensions = [];
  for (const dimension of ["query", "page", "country", "device"] as const) {
    const report = await querySearchAnalytics(config, {
      startDate,
      endDate,
      dimensions: [dimension],
      aggregationType: dimension === "page" ? "auto" : "byProperty",
      rowLimit: 250,
    }, fetchImpl);
    for (const row of report.rows) {
      const key = row.keys[0];
      if (!key || row.clicks == null || row.impressions == null || !row.ctr || !row.position) continue;
      if (dimension === "device" && key !== "DESKTOP" && key !== "MOBILE" && key !== "TABLET") continue;
      dimensions.push({
        dimension,
        key,
        date: null,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        dataState: report.firstIncompleteDate ? "partial" as const : "final" as const,
      });
    }
  }
  return {
    sourceAsOf: now.toISOString().replace(/\.\d{3}Z$/, "Z"),
    totals,
    dimensions,
  };
}

export function emptyGa4Metadata() {
  return parseGa4Report({}).metadata;
}
