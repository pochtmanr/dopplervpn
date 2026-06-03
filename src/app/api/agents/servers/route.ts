import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSummary } from "@/lib/agent-data";

/**
 * Public, aggregate network map for agents. Returns counts and a country list
 * only — never per-server detail, IPs, or config. This is intentionally
 * distinct from the X-API-Key-gated /api/vpn/servers used by the apps.
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000, prefix: "agents-servers" });
  if (rl) return rl;

  try {
    const summary = await getServerSummary();
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "public, max-age=120, s-maxage=300" },
    });
  } catch (err) {
    console.error("Agent servers error:", err);
    return NextResponse.json({ error: "Failed to fetch servers" }, { status: 500 });
  }
}
