import { NextResponse } from "next/server";
import { privacyPayload } from "@/lib/agent-data";

/** No-logs / jurisdiction posture for agents assessing privacy. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return NextResponse.json(privacyPayload(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
