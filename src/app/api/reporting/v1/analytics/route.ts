import { NextRequest, NextResponse } from "next/server";
import { unauthorizedReporting } from "@/lib/reporting/auth";
import { analyticsStore } from "@/lib/reporting/analytics/persist";
import { ga4ConfigFromEnv } from "@/lib/reporting/analytics/ga4-client";
import { websiteFromFacts } from "@/lib/reporting/analytics/website";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = unauthorizedReporting(request);
  if (denied) return denied;
  const days = Number(request.nextUrl.searchParams.get("days") ?? "7");
  if (days !== 7 && days !== 30 && days !== 90) {
    return NextResponse.json({ error: "unsupported_window" }, { status: 422 });
  }
  const configured = ga4ConfigFromEnv() != null;
  if (!configured) {
    return NextResponse.json({ configured: false, propertyId: null, error: null, data: null });
  }
  const store = analyticsStore();
  const view = websiteFromFacts({
    daily: await store.latestFacts({ provider: "ga4", report: "ga4_overview_daily" }),
    periods: await store.latestFacts({ provider: "ga4", report: "ga4_period_unique_users" }),
    breakdowns: await store.latestFacts({ provider: "ga4", report: "ga4_breakdown" }),
    days,
  });
  return NextResponse.json({
    configured: true,
    propertyId: null,
    error: view.data ? null : view.reason,
    data: view.data,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
