import { sha256Hex } from "../canonical";

export interface CursorPayload {
  v: 1;
  project_id: "doppler";
  environment: "production" | "staging" | "test";
  endpoint: "/api/business-os/v1/finance/records" | "/api/business-os/v1/analytics/report";
  query_sha256: string;
  snapshot_id: string;
  high_watermark: string;
  after_change_sequence: string;
  expires_at: string;
}

const QUERY_KEYS = ["from", "to", "timezone", "currency", "basis", "source", "channel", "as_of", "provider", "report"] as const;

export function queryBinding(params: URLSearchParams): string {
  const pairs: Array<[string, string]> = [];
  for (const key of QUERY_KEYS) {
    const value = params.get(key);
    if (value) pairs.push([key, value]);
  }
  pairs.sort((left, right) => left[0].localeCompare(right[0]) || left[1].localeCompare(right[1]));
  return sha256Hex(JSON.stringify(pairs));
}

export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify({
    v: payload.v,
    project_id: payload.project_id,
    environment: payload.environment,
    endpoint: payload.endpoint,
    query_sha256: payload.query_sha256,
    snapshot_id: payload.snapshot_id,
    high_watermark: payload.high_watermark,
    after_change_sequence: payload.after_change_sequence,
    expires_at: payload.expires_at,
  });
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeCursor(wire: string): CursorPayload | null {
  try {
    const json = Buffer.from(wire, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as CursorPayload;
    if (parsed.v !== 1 || typeof parsed.snapshot_id !== "string" || typeof parsed.high_watermark !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function cursorExpiry(now: Date): string {
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
}
