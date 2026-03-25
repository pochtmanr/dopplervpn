import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { extractFromUrl } from "@/lib/openai/extract";

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    // Only allow HTTPS URLs to prevent SSRF with file://, ftp://, etc.
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return NextResponse.json({ error: "Only HTTP/HTTPS URLs are allowed" }, { status: 400 });
    }
    // Block private/internal hostnames
    const hostname = parsed.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.") ||
      hostname === "169.254.169.254" ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".local")
    ) {
      return NextResponse.json({ error: "Internal URLs are not allowed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    const result = await extractFromUrl(url);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[extract-url] Error:", err);
    const message =
      err instanceof Error ? err.message : "URL extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
