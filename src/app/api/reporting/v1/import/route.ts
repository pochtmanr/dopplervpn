import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { unauthorizedReporting } from "@/lib/reporting/auth";
import { importDurableHistory } from "@/lib/reporting/persist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daily catch-up for paid invoices whose webhook observation never landed.
// The live webhooks write each payment as it happens; this backfills the rest.
async function runImport(request: NextRequest) {
  if (!cronAuthorized(request)) {
    const denied = unauthorizedReporting(request);
    if (denied) return denied;
  }
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

function cronAuthorized(request: NextRequest): boolean {
  const cron = process.env.CRON_SECRET;
  if (!cron) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const actual = createHash("sha256").update(token).digest();
  const wanted = createHash("sha256").update(cron).digest();
  return timingSafeEqual(actual, wanted);
}

export function GET(request: NextRequest) {
  return runImport(request);
}

export function POST(request: NextRequest) {
  return runImport(request);
}
