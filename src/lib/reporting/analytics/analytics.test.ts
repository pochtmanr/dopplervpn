import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { MemoryReportingStore } from "../memory-store";
import { collectGa4, collectGsc, QuotaStop } from "./collect";
import { ctrDecimal } from "./decimals";
import { aggregateDrain, verifyDrainSignature } from "./drain";
import { createHmac } from "node:crypto";
import { runGa4Report } from "./ga4-client";
import { parseGa4Report, parseGscReport } from "./parse";
import { funnelObservation, periodUniqueUsers, propertyTotalFromDimensionRows, refusePositionAverage, visitorComparison } from "./policy";
import { buildAnalyticsReport } from "./report";
import { MemoryAnalyticsStore, type AnalyticsFactInput } from "./store";
import { sourceDate, sourceDayBounds } from "./time";
import { websiteFromFacts } from "./website";

const NOW = new Date("2026-09-28T12:00:00Z");
const FROM = "2026-09-26T23:00:00Z";
const TO = "2026-09-28T23:00:00Z";

function fact(partial: Partial<AnalyticsFactInput> & Pick<AnalyticsFactInput, "report" | "grainKey" | "body">): AnalyticsFactInput {
  return {
    provider: "ga4",
    sourceDate: "2026-09-27",
    sourceTimezone: "Europe/London",
    sourceAsOf: "2026-09-28T08:00:00Z",
    retrievedAt: "2026-09-28T08:00:00Z",
    dataState: "final",
    metadata: {},
    ...partial,
  };
}

function input(overrides: Partial<Parameters<typeof buildAnalyticsReport>[0]> = {}) {
  return {
    provider: "ga4",
    report: "ga4_overview_daily",
    from: FROM,
    to: TO,
    limit: 100,
    cursor: null,
    facts: [],
    batches: [],
    checkpoint: { cursorCreatedAt: TO, cursorId: "ga4", coveredThrough: TO, retryCount: 0, lastError: null },
    configured: true,
    now: NOW,
    environment: "production",
    snapshotId: "snap-test",
    dataAsOf: "2026-09-28T08:00:00Z",
    binding: "binding",
    primary: "ga4_active_users" as const,
    vercelEnabled: false,
    ...overrides,
  };
}

describe("analytics rules", () => {
  it("does not turn daily active users into a period unique", () => {
    expect(periodUniqueUsers({ kind: "daily", activeUsers: [10, 11] })).toEqual({
      ok: false,
      reason: "summed_daily_uniques",
    });
    const built = buildAnalyticsReport(input({
      report: "ga4_period_unique_users",
      facts: [],
    }));
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.body.rows).toEqual([]);
    expect(built.body.reason).toBe("period_unique_query_required");
    expect(built.body.must_not_sum_daily_uniques).toBe(true);
    expect(JSON.stringify(built.body)).not.toContain("21");
  });

  it("keeps a separate period query instead of the daily sum", () => {
    const built = buildAnalyticsReport(input({
      report: "ga4_period_unique_users",
      facts: [{
        ...fact({ report: "ga4_period_unique_users", grainKey: "period:2", sourceDate: null, body: {
          active_users: 15,
          period_from: FROM,
          period_to: TO,
        } }),
        revision: 1,
        contentHash: "abc",
      }],
    }));
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.body.rows).toEqual([{ active_users: 15 }]);
  });

  it("does not treat GSC dimension rows as the property total", () => {
    expect(propertyTotalFromDimensionRows().reason).toBe("dimension_rows_are_not_property_totals");
    const built = buildAnalyticsReport(input({
      provider: "gsc",
      report: "gsc_dimension_rows",
      facts: [{
        ...fact({
          provider: "gsc",
          report: "gsc_dimension_rows",
          grainKey: "query|vpn",
          sourceTimezone: "America/Los_Angeles",
          body: { query: "vpn", clicks: 2, impressions: 20, ctr: "0.1", position: "8.5" },
        }),
        revision: 1,
        contentHash: "gsc",
      }],
    }));
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(built.body.page).toMatchObject({ complete_property_total: false });
    expect(built.body.source_timezone).toBe("America/Los_Angeles");
  });

  it("computes CTR from the row counts and refuses an average position", () => {
    expect(ctrDecimal(2, 20)).toBe("0.1");
    expect(refusePositionAverage().position).toBeNull();
    const parsed = parseGscReport({
      responseAggregationType: "byProperty",
      rows: [{ keys: ["2026-09-27"], clicks: 2, impressions: 20, ctr: 0.99, position: 8.5 }],
    });
    expect(parsed.rows[0]?.ctr).toBe("0.1");
    expect(parsed.rows[0]?.position).toBe("8.5");
  });

  it("keeps Pacific and London source days apart", () => {
    const instant = "2026-09-28T00:30:00Z";
    expect(sourceDate(instant, "America/Los_Angeles")).toBe("2026-09-27");
    expect(sourceDate(instant, "Europe/London")).toBe("2026-09-28");
    expect(sourceDayBounds("2026-09-27", "America/Los_Angeles").from).not.toBe(
      sourceDayBounds("2026-09-27", "Europe/London").from,
    );
  });

  it("leaves an outage empty and a stale row unchanged", () => {
    const outage = buildAnalyticsReport(input({
      facts: [],
      checkpoint: { cursorCreatedAt: null, cursorId: null, coveredThrough: null, retryCount: 1, lastError: "Error" },
    }));
    expect(outage.ok).toBe(true);
    if (!outage.ok) return;
    expect(outage.body.availability).toBe("unavailable");
    expect(outage.body.rows).toEqual([]);
    expect(JSON.stringify(outage.body)).not.toContain('"active_users":0');

    const stale = buildAnalyticsReport(input({
      checkpoint: { cursorCreatedAt: "2026-09-27T00:00:00Z", cursorId: "ga4", coveredThrough: "2026-09-27T00:00:00Z", retryCount: 0, lastError: null },
      facts: [{
        ...fact({ report: "ga4_overview_daily", grainKey: "2026-09-27", body: {
          date: "2026-09-27",
          active_users: 4,
          new_users: 1,
          sessions: 5,
          screen_page_views: 6,
        } }),
        revision: 1,
        contentHash: "day",
      }],
    }));
    expect(stale.ok).toBe(true);
    if (!stale.ok) return;
    expect(stale.body.coverage).toMatchObject({ status: "partial" });
    expect(stale.body.rows).toEqual([expect.objectContaining({ active_users: 4 })]);
  });

  it("replaces an overlap day with the next revision", async () => {
    const analytics = new MemoryAnalyticsStore();
    const reporting = new MemoryReportingStore();
    const base = {
      timeZone: "Europe/London",
      sourceAsOf: "2026-09-28T08:00:00Z",
      metadata: parseGa4Report({ metadata: { timeZone: "Europe/London" } }).metadata,
      dataState: "final" as const,
      periods: [],
      pages: [],
      countries: [],
      channels: [],
    };
    await collectGa4({
      reporting,
      analytics,
      now: NOW,
      configured: true,
      load: async () => ({ ...base, daily: [{ date: "2026-09-27", activeUsers: 4, newUsers: 1, sessions: 5, screenPageViews: 6 }] }),
    });
    await collectGa4({
      reporting,
      analytics,
      now: NOW,
      configured: true,
      load: async () => ({ ...base, daily: [{ date: "2026-09-27", activeUsers: 9, newUsers: 1, sessions: 5, screenPageViews: 6 }] }),
    });
    const latest = await analytics.latestFacts({ provider: "ga4", report: "ga4_overview_daily" });
    expect(latest).toHaveLength(1);
    expect(latest[0]?.revision).toBe(2);
    expect(latest[0]?.body.active_users).toBe(9);
  });

  it("stops on a held lease, a quota response, and the fifth failure", async () => {
    const analytics = new MemoryAnalyticsStore();
    const reporting = new MemoryReportingStore();
    await reporting.acquireLease("ga4", "other", NOW.getTime(), 60_000);
    const leased = await collectGa4({
      reporting,
      analytics,
      now: NOW,
      configured: true,
      load: async () => { throw new Error("should_not_run"); },
    });
    expect(leased.status).toBe("leased");

    const quotaStore = new MemoryReportingStore();
    const quota = await collectGa4({
      reporting: quotaStore,
      analytics,
      now: NOW,
      configured: true,
      load: async () => { throw new QuotaStop(); },
    });
    expect(quota.status).toBe("quota");
    expect((await quotaStore.getCheckpoint("ga4"))?.coveredThrough).toBeNull();

    const failing = new MemoryReportingStore();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await collectGsc({
        reporting: failing,
        analytics,
        now: new Date(NOW.getTime() + attempt * 120_000),
        configured: true,
        load: async () => { throw new Error("gsc_down"); },
      });
    }
    let calls = 0;
    const stopped = await collectGsc({
      reporting: failing,
      analytics,
      now: new Date(NOW.getTime() + 999_000),
      configured: true,
      load: async () => { calls += 1; return { sourceAsOf: "", totals: [], dimensions: [] }; },
    });
    expect(stopped.status).toBe("bounded_stop");
    expect(calls).toBe(0);
  });

  it("retains identical drain batches and does not invent visitors", async () => {
    const analytics = new MemoryAnalyticsStore();
    const body = [{ schema: "vercel.analytics.v2", eventType: "pageview", timestamp: Date.parse("2026-09-27T12:00:00Z"), path: "/pricing", deviceId: 7 }];
    await analytics.appendDrainBatch({ deliveryId: "a", retryCount: null, receivedAt: "2026-09-28T08:00:00Z", body });
    await analytics.appendDrainBatch({ deliveryId: "a", retryCount: 1, receivedAt: "2026-09-28T08:01:00Z", body });
    const batches = await analytics.drainBatches();
    expect(batches).toHaveLength(2);
    const aggregated = aggregateDrain({ batches, timeZone: "UTC", samplingConfirmedUnsampled: false });
    expect(aggregated.pageviews).toEqual([{ date: "2026-09-27", pageviews: 2, customEvents: 0 }]);
    expect(aggregated.visitors).toBeNull();
    const raw = JSON.stringify(body);
    const signature = createHmac("sha1", "drain-secret").update(raw).digest("hex");
    expect(verifyDrainSignature(raw, "drain-secret", signature)).toBe(true);
    expect(verifyDrainSignature(raw, "drain-secret", "00")).toBe(false);
  });

  it("keeps the visitor headline and the funnel off native purchases and search queries", () => {
    const compared = visitorComparison({
      primary: "ga4_active_users",
      ga4ActiveUsers: 10,
      vercelVisitors: 4,
      vercelVisitorsReliable: false,
    });
    expect(compared.highlights.map((item) => item.value)).toEqual([10, null]);
    expect(compared.highlights.some((item) => item.value === compared.forbiddenSum)).toBe(false);
    expect(funnelObservation({
      ga4Sessions: 10,
      ga4PurchaseEvents: 2,
      ga4PurchaseRevenue: "9.99",
      nativePurchases: 5,
    }).reason).toBe("native_purchases_are_not_web_sessions");
    expect(funnelObservation({
      ga4Sessions: 10,
      ga4PurchaseEvents: 2,
      ga4PurchaseRevenue: "9.99",
      searchQuery: "vpn",
      buyerId: "buyer-1",
    }).reason).toBe("search_queries_are_not_buyer_links");
    expect(funnelObservation({
      ga4Sessions: 10,
      ga4PurchaseEvents: 2,
      ga4PurchaseRevenue: "9.99",
    }).purchaseRevenue).toMatchObject({ posts_to_ledger: false, role: "check_signal" });
  });

  it("pages a GA4 report and keeps sampling metadata", async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    let reportCalls = 0;
    const fetchImpl = (async (url: RequestInfo | URL) => {
      const href = String(url);
      if (href.includes("oauth2.googleapis.com")) {
        return new Response(JSON.stringify({ access_token: "token", expires_in: 3600 }));
      }
      reportCalls += 1;
      const body = reportCalls === 1
        ? { rowCount: 2, rows: [{ dimensionValues: [{ value: "20260927" }], metricValues: [{ value: "4" }] }], metadata: { timeZone: "Europe/London", samplingMetadatas: [{ samplesReadCount: "1", samplingSpaceSize: "2" }] } }
        : { rowCount: 2, rows: [{ dimensionValues: [{ value: "20260928" }], metricValues: [{ value: "5" }] }], metadata: { timeZone: "Europe/London" } };
      return new Response(JSON.stringify(body));
    }) as typeof fetch;
    const report = await runGa4Report({
      propertyId: "properties-hidden",
      clientEmail: "collector@example.com",
      privateKey: pem,
    }, {
      startDate: "2026-09-27",
      endDate: "2026-09-28",
      dimensions: ["date"],
      metrics: ["activeUsers"],
      limit: 1,
    }, fetchImpl, 1_700_000_000);
    expect(report.rows).toHaveLength(2);
    expect(report.dataState).toBe("sampled");
    expect(report.metadata.timeZone).toBe("Europe/London");
  });

  it("serves the stored period unique to the admin view", () => {
    const daily = [{
      ...fact({ report: "ga4_overview_daily", grainKey: "2026-09-27", body: {
        date: "2026-09-27", active_users: 10, new_users: 1, sessions: 3, screen_page_views: 4,
      } }),
      revision: 1,
      contentHash: "a",
    }, {
      ...fact({ report: "ga4_overview_daily", grainKey: "2026-09-28", sourceDate: "2026-09-28", body: {
        date: "2026-09-28", active_users: 11, new_users: 1, sessions: 3, screen_page_views: 4,
      } }),
      revision: 1,
      contentHash: "b",
    }];
    const view = websiteFromFacts({
      daily,
      periods: [{
        ...fact({ report: "ga4_period_unique_users", grainKey: "period:7", sourceDate: null, body: {
          active_users: 15, period_from: FROM, period_to: TO, days: 7,
        } }),
        revision: 1,
        contentHash: "p",
      }],
      breakdowns: [],
      days: 7,
    });
    expect(view.data?.totals.activeUsers).toBe(15);
    expect(view.data?.totals.activeUsers).not.toBe(21);
  });
});
