import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export function reportingAuthorized(request: Request): boolean {
  const expected = process.env.REPORTING_SERVICE_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  const actual = createHash("sha256").update(token).digest();
  const wanted = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actual, wanted);
}

export function unauthorizedReporting(request: Request): NextResponse | null {
  if (!process.env.REPORTING_SERVICE_TOKEN) {
    return NextResponse.json({ error: "reporting_not_configured" }, { status: 503 });
  }
  if (!reportingAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
