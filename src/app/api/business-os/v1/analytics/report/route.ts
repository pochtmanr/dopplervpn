import { GET as businessOsGet } from "@/lib/reporting/bos/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return businessOsGet(request);
}
