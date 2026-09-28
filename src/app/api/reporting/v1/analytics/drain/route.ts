import { NextRequest, NextResponse } from "next/server";
import { analyticsStore } from "@/lib/reporting/analytics/persist";
import { parseDrainBody, verifyDrainSignature } from "@/lib/reporting/analytics/drain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ANALYTICS_DRAIN !== "enabled" || !process.env.VERCEL_DRAIN_SECRET) {
    return NextResponse.json({ error: "drain_not_configured" }, { status: 503 });
  }
  const raw = await request.text();
  const valid = verifyDrainSignature(raw, process.env.VERCEL_DRAIN_SECRET, request.headers.get("x-vercel-signature"));
  if (!valid) return NextResponse.json({ error: "invalid_signature" }, { status: 403 });
  let events: unknown;
  try {
    events = parseDrainBody(raw);
  } catch {
    return NextResponse.json({ error: "malformed_body" }, { status: 400 });
  }
  const retry = request.headers.get("x-vercel-delivery-retry");
  await analyticsStore().appendDrainBatch({
    deliveryId: request.headers.get("x-vercel-id"),
    retryCount: retry && /^[0-9]+$/.test(retry) ? Number(retry) : null,
    receivedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    body: events,
  });
  return NextResponse.json({ stored: true }, { headers: { "Cache-Control": "private, no-store" } });
}
