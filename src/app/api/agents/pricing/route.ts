import { NextResponse } from "next/server";
import { pricingPayload } from "@/lib/agent-data";

/** Public pricing for agents. Mirrors the live pricing page (lib/facts.ts). */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return NextResponse.json(pricingPayload(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
