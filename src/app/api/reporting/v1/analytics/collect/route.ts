import { NextRequest, NextResponse } from "next/server";
import { unauthorizedReporting } from "@/lib/reporting/auth";
import { reportingStore } from "@/lib/reporting/persist";
import { analyticsStore } from "@/lib/reporting/analytics/persist";
import { collectGa4, collectGsc } from "@/lib/reporting/analytics/collect";
import { ga4ConfigFromEnv } from "@/lib/reporting/analytics/ga4-client";
import { gscConfigFromEnv } from "@/lib/reporting/analytics/gsc-client";
import { loadGa4, loadGsc } from "@/lib/reporting/analytics/providers";
import { createHash, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function collect(request: NextRequest) {
  if (!authorized(request)) {
    const denied = unauthorizedReporting(request);
    if (denied) return denied;
  }
  const now = new Date();
  const reporting = reportingStore();
  const analytics = analyticsStore();
  const ga4 = await collectGa4({
    reporting,
    analytics,
    now,
    configured: ga4ConfigFromEnv() != null,
    load: () => loadGa4(now),
  });
  const gsc = await collectGsc({
    reporting,
    analytics,
    now,
    configured: gscConfigFromEnv() != null,
    load: () => loadGsc(now),
  });
  return NextResponse.json({
    ga4,
    gsc,
    vercel: { status: "unconfigured", retryCount: 0 },
  }, { headers: { "Cache-Control": "private, no-store" } });
}

function authorized(request: NextRequest): boolean {
  const cron = process.env.CRON_SECRET;
  if (!cron) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const actual = createHash("sha256").update(token).digest();
  const wanted = createHash("sha256").update(cron).digest();
  return timingSafeEqual(actual, wanted);
}

export function GET(request: NextRequest) {
  return collect(request);
}

export function POST(request: NextRequest) {
  return collect(request);
}
