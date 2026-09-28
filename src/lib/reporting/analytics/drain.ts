import { createHmac, timingSafeEqual } from "node:crypto";
import { sourceDate } from "./time";

export interface DrainEvent {
  schema: string | null;
  eventType: string | null;
  eventName: string | null;
  timestamp: number | null;
  path: string | null;
  deviceId: number | null;
}

export interface DrainBatchInput {
  deliveryId: string | null;
  retryCount: number | null;
  receivedAt: string;
  body: unknown;
}

export function verifyDrainSignature(rawBody: string, secret: string, header: string | null): boolean {
  if (!header || !/^[0-9a-f]+$/i.test(header)) return false;
  const expected = createHmac("sha1", secret).update(Buffer.from(rawBody, "utf8")).digest("hex");
  const actual = Buffer.from(header, "hex");
  const wanted = Buffer.from(expected, "hex");
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

export function parseDrainBody(raw: string): DrainEvent[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as unknown;
    return Array.isArray(parsed) ? parsed.map(parseEvent) : [];
  }
  return trimmed.split("\n").filter((line) => line.trim()).map((line) => parseEvent(JSON.parse(line)));
}

export function aggregateDrain(input: {
  batches: DrainBatchInput[];
  timeZone: string;
  samplingConfirmedUnsampled: boolean;
}): {
  pageviews: Array<{ date: string; pageviews: number; customEvents: number }>;
  visitors: null;
  visitorsReason: "unsampled_visitors_not_guaranteed";
  retainedBatches: number;
} {
  const byDate = new Map<string, { pageviews: number; customEvents: number }>();
  for (const batch of input.batches) {
    const events = Array.isArray(batch.body) ? batch.body.map(parseEvent) : [];
    for (const event of events) {
      if (event.timestamp == null) continue;
      const date = sourceDate(new Date(event.timestamp).toISOString(), input.timeZone);
      const current = byDate.get(date) ?? { pageviews: 0, customEvents: 0 };
      if (event.eventType === "pageview") current.pageviews += 1;
      else if (event.eventType === "event") current.customEvents += 1;
      byDate.set(date, current);
    }
  }
  return {
    pageviews: [...byDate.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([date, counts]) => ({ date, ...counts })),
    visitors: null,
    visitorsReason: "unsampled_visitors_not_guaranteed",
    retainedBatches: input.batches.length,
    ...(input.samplingConfirmedUnsampled ? {} : {}),
  };
}

function parseEvent(value: unknown): DrainEvent {
  const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    schema: typeof row.schema === "string" ? row.schema : null,
    eventType: typeof row.eventType === "string" ? row.eventType : null,
    eventName: typeof row.eventName === "string" ? row.eventName : null,
    timestamp: typeof row.timestamp === "number" ? row.timestamp : null,
    path: typeof row.path === "string" ? row.path : null,
    deviceId: typeof row.deviceId === "number" ? row.deviceId : null,
  };
}
