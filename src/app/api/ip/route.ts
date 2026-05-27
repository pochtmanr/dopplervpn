import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface IpInfo {
  ip: string;
  country: string | null;
  region: string | null;
  city: string | null;
  asn: string | null;
}

export async function GET(request: Request): Promise<NextResponse<IpInfo>> {
  const headers = request.headers;

  // Vercel populates x-real-ip on every request; fall back to x-forwarded-for
  // (first hop) when running behind another proxy or locally.
  const xRealIp = headers.get("x-real-ip");
  const xForwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = xRealIp || xForwardedFor || "0.0.0.0";

  // Vercel geo headers — set automatically on the Edge runtime. Decode the
  // city header because Vercel URL-encodes non-ASCII characters (e.g.
  // "São Paulo" → "S%C3%A3o%20Paulo").
  const country = headers.get("x-vercel-ip-country");
  const region = headers.get("x-vercel-ip-country-region");
  const cityRaw = headers.get("x-vercel-ip-city");
  const city = cityRaw ? decodeURIComponent(cityRaw) : null;
  const asn = headers.get("x-vercel-ip-asn") ?? null;

  return NextResponse.json(
    { ip, country, region, city, asn },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
