import "server-only";
import { createUntypedAdminClient } from "@/lib/supabase/admin";
import { canonicalize, sha256Hex } from "../canonical";
import type { AnalyticsFactInput, AnalyticsStore, DrainBatchRecord, StoredFact } from "./store";

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

interface Builder extends PromiseLike<QueryResult<unknown>> {
  select(columns: string): Builder;
  eq(column: string, value: string): Builder;
  insert(row: Record<string, unknown>): Promise<QueryResult<unknown>>;
}

interface SupabaseLike {
  from(table: string): Builder;
}

interface FactRow {
  provider: string;
  report: string;
  grain_key: string;
  revision: number;
  content_hash: string;
  source_timezone: string;
  source_date: string | null;
  source_as_of: string;
  retrieved_at: string;
  data_state: StoredFact["dataState"];
  body: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export class SupabaseAnalyticsStore implements AnalyticsStore {
  constructor(private readonly supabase: SupabaseLike) {}

  async replaceFact(input: AnalyticsFactInput): Promise<StoredFact> {
    const contentHash = sha256Hex(canonicalize({
      body: input.body,
      dataState: input.dataState,
      metadata: input.metadata,
    }));
    const existing = await this.rows(input.provider, input.report);
    const previous = existing
      .filter((row) => row.grain_key === input.grainKey)
      .sort((left, right) => right.revision - left.revision)[0];
    if (previous && previous.content_hash === contentHash) return toFact(previous);
    const revision = (previous?.revision ?? 0) + 1;
    const inserted = await this.supabase.from("reporting_analytics_revisions").insert({
      provider: input.provider,
      report: input.report,
      grain_key: input.grainKey,
      revision,
      content_hash: contentHash,
      source_timezone: input.sourceTimezone,
      source_date: input.sourceDate,
      source_as_of: input.sourceAsOf,
      retrieved_at: input.retrievedAt,
      data_state: input.dataState,
      body: input.body,
      metadata: input.metadata,
    });
    if (inserted.error) throw new Error("analytics_store_failed");
    return { ...input, revision, contentHash };
  }

  async latestFacts(filter: { provider: string; report: string }): Promise<StoredFact[]> {
    const rows = await this.rows(filter.provider, filter.report);
    const latest = new Map<string, FactRow>();
    for (const row of rows) {
      const current = latest.get(row.grain_key);
      if (!current || row.revision > current.revision) latest.set(row.grain_key, row);
    }
    return [...latest.values()].map(toFact).sort((left, right) => left.grainKey.localeCompare(right.grainKey));
  }

  async appendDrainBatch(input: Omit<DrainBatchRecord, "id">): Promise<DrainBatchRecord> {
    const inserted = await this.supabase.from("reporting_analytics_drain_batches").insert({
      delivery_id: input.deliveryId,
      retry_count: input.retryCount,
      received_at: input.receivedAt,
      body: input.body,
    });
    if (inserted.error) throw new Error("analytics_store_failed");
    return { ...input, id: "stored" };
  }

  async drainBatches(): Promise<DrainBatchRecord[]> {
    const result = await this.supabase
      .from("reporting_analytics_drain_batches")
      .select("id, delivery_id, retry_count, received_at, body");
    if (result.error) throw new Error("analytics_store_failed");
    return ((result.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      deliveryId: typeof row.delivery_id === "string" ? row.delivery_id : null,
      retryCount: typeof row.retry_count === "number" ? row.retry_count : null,
      receivedAt: String(row.received_at),
      body: row.body,
    }));
  }

  private async rows(provider: string, report: string): Promise<FactRow[]> {
    const result = await this.supabase
      .from("reporting_analytics_revisions")
      .select("provider, report, grain_key, revision, content_hash, source_timezone, source_date, source_as_of, retrieved_at, data_state, body, metadata")
      .eq("provider", provider)
      .eq("report", report);
    if (result.error) throw new Error("analytics_store_failed");
    return (result.data ?? []) as FactRow[];
  }
}

function toFact(row: FactRow): StoredFact {
  return {
    provider: row.provider as StoredFact["provider"],
    report: row.report,
    grainKey: row.grain_key,
    revision: row.revision,
    contentHash: row.content_hash,
    sourceTimezone: row.source_timezone,
    sourceDate: row.source_date,
    sourceAsOf: row.source_as_of,
    retrievedAt: row.retrieved_at,
    dataState: row.data_state,
    body: row.body,
    metadata: row.metadata ?? {},
  };
}

export function analyticsStore(): SupabaseAnalyticsStore {
  return new SupabaseAnalyticsStore(createUntypedAdminClient() as unknown as SupabaseLike);
}
