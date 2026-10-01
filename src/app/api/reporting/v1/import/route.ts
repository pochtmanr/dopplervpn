import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { unauthorizedReporting } from "@/lib/reporting/auth";
import { importDurableAppleSales, importDurableHistory } from "@/lib/reporting/persist";
import { importDurableFees, probeRevolutFees } from "@/lib/reporting/provider-fees";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Apple's backfill fetches up to 40 daily reports per run.
export const maxDuration = 300;

// Daily catch-up for paid invoices whose webhook observation never landed,
// each provider's fee for sales that have none yet, and Apple's daily App
// Store sales reports once ASC credentials are configured. The live webhooks
// write each payment as it happens; this backfills the rest.
async function runImport(request: NextRequest) {
  if (!cronAuthorized(request)) {
    const denied = unauthorizedReporting(request);
    if (denied) return denied;
  }
  // Read-only: what Revolut reports as fees on one order, for checking the
  // fee parser against live data. Same service-token auth as the import.
  const probe = request.nextUrl.searchParams.get("probe_revolut_order");
  if (probe) {
    try {
      return NextResponse.json({ payments: await probeRevolutFees(probe) }, {
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message.slice(0, 200) : "probe_failed" }, { status: 502 });
    }
  }
  try {
    const result = await importDurableHistory();
    const fees = await importDurableFees();
    const appStore = await importDurableAppleSales().catch((error: unknown) => ({
      status: "failed" as const,
      error: error instanceof Error ? error.message : "apple_import_failed",
    }));
    return NextResponse.json({ ...result, fees, appStore }, {
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
