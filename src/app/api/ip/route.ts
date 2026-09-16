import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export interface IpInfo {
  ip: string;
  version: 4 | 6;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  asn: string | null;
  isp: string | null;
  asDomain: string | null;
}

interface IpinfoLite {
  ip?: string;
  asn?: string;
  as_name?: string;
  as_domain?: string;
  country_code?: string;
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Loopback, link-local and RFC 1918 / ULA ranges — what `next dev` sees. */
function isPrivate(ip: string): boolean {
  return (
    ip === "::1" ||
    ip === "0.0.0.0" ||
    /^127\./.test(ip) ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    /^f[cd][0-9a-f]{2}:/i.test(ip) ||
    /^fe80:/i.test(ip)
  );
}

/**
 * ASN and ISP name. Vercel sends no ASN header, so this is the only source;
 * without IPINFO_TOKEN (or on any failure) those fields are simply null.
 */
async function lookup(target: string): Promise<IpinfoLite | null> {
  const token = process.env.IPINFO_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.ipinfo.io/lite/${encodeURIComponent(target)}?token=${token}`,
      { cache: "no-store", signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) return null;
    return (await res.json()) as IpinfoLite;
  } catch {
    return null;
  }
}

/** Dev without a token: at least show the machine's real address, not ::1. */
async function devPublicIp(): Promise<string | null> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    return res.ok ? ((await res.json()) as { ip?: string }).ip ?? null : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request): Promise<NextResponse<IpInfo>> {
  const headers = request.headers;

  // Vercel populates x-real-ip on every request; fall back to x-forwarded-for
  // (first hop) when running behind another proxy or locally.
  const xRealIp = headers.get("x-real-ip");
  const xForwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  let ip = (xRealIp || xForwardedFor || "0.0.0.0").replace(/^::ffff:/i, "");

  // Locally the request comes from ::1, which has no geography. Ask ipinfo for
  // this machine's public address instead, so the dev page shows real data.
  // The ipinfo lookup only runs for `?details=1` (the IP checker). Other callers
  // — the WebRTC test and /cn-check, which times /api/ip as a reachability
  // probe — must not wait on a third party.
  const details = new URL(request.url).searchParams.has("details");
  const local = isPrivate(ip) && !process.env.VERCEL;
  const info = details ? await lookup(local ? "me" : ip) : null;
  if (local && details) ip = info?.ip ?? (await devPublicIp()) ?? ip;

  // Vercel URL-encodes non-ASCII geo values ("São Paulo" → "S%C3%A3o%20Paulo").
  const body: IpInfo = {
    ip,
    version: ip.includes(":") ? 6 : 4,
    country: headers.get("x-vercel-ip-country") ?? info?.country_code ?? null,
    region: decodeHeader(headers.get("x-vercel-ip-country-region")),
    city: decodeHeader(headers.get("x-vercel-ip-city")),
    timezone: headers.get("x-vercel-ip-timezone"),
    latitude: toNumber(headers.get("x-vercel-ip-latitude")),
    longitude: toNumber(headers.get("x-vercel-ip-longitude")),
    asn: info?.asn ?? null,
    isp: info?.as_name ?? null,
    asDomain: info?.as_domain ?? null,
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
