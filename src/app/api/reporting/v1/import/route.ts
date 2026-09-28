import { NextRequest, NextResponse } from "next/server";
import { unauthorizedReporting } from "@/lib/reporting/auth";
import { importDurableHistory } from "@/lib/reporting/persist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = unauthorizedReporting(request);
  if (denied) return denied;
  try {
    const result = await importDurableHistory();
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[reporting] import_failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "reporting_unavailable" }, { status: 503 });
  }
}
