import { NextResponse, type NextRequest } from "next/server";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

// Never cache — every scan must hit the counter.
export const dynamic = "force-dynamic";

const FALLBACK_URL = "https://www.dopplervpn.org/";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let target: unknown = null;
  try {
    const supabase = createUntypedAdminClient();
    const { data } = await supabase.rpc("track_qr_scan", { p_slug: slug });
    target = data;
  } catch {
    // Printed QR codes must never dead-end — fall through to homepage.
  }

  return NextResponse.redirect(
    typeof target === "string" && target.startsWith("http") ? target : FALLBACK_URL,
    302
  );
}
