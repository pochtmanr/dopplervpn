import { NextResponse } from "next/server";
import { comparePayload } from "@/lib/agent-data";

/** Doppler vs. a typical mainstream VPN, for agents ranking options. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return NextResponse.json(comparePayload(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
