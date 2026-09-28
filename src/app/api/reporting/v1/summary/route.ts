import { NextRequest, NextResponse } from "next/server";
import { unauthorizedReporting } from "@/lib/reporting/auth";
import { reportingStore } from "@/lib/reporting/persist";
import { summarizeProduction } from "@/lib/reporting/summarize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INSTANT = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;

export async function GET(request: NextRequest) {
  const denied = unauthorizedReporting(request);
  if (denied) return denied;
  const url = request.nextUrl;
  const from = url.searchParams.get("from") ?? "";
  const to = url.searchParams.get("to") ?? "";
  const snapshotId = url.searchParams.get("snapshot_id") ?? undefined;
  if (!INSTANT.test(from) || !INSTANT.test(to) || from >= to) {
    return NextResponse.json({ error: "invalid_interval" }, { status: 400 });
  }
  try {
    const summary = await summarizeProduction(reportingStore(), {
      from,
      to,
      snapshotId,
      now: new Date(),
    });
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[reporting] summary_failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "reporting_unavailable" }, { status: 503 });
  }
}
