import "server-only";
import { randomUUID } from "node:crypto";
import { createUntypedAdminClient } from "@/lib/supabase/admin";
import { FORMULA_VERSION } from "./constants";
import {
  ascCredentialsFromEnv,
  fetchAppleSalesReport,
  importAppleSales,
  type AppleImportResult,
} from "./apple-sales";
import { importInvoiceHistory, type InvoiceReader } from "./import-history";
import { invoiceEnvironment, type InvoiceRow } from "./map-evidence";
import type { BalanceRow, MoneyDraft, MoneyStore, MoneyVault, StoredDocument } from "./money";
import { formatUtcInstant, planObservation } from "./plan";
import type {
  ApplyResult,
  Checkpoint,
  FinanceRecord,
  Observation,
  ReportingStore,
  Snapshot,
} from "./types";

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
  count?: number | null;
}

interface QueryBuilder extends PromiseLike<QueryResult<unknown>> {
  select(columns: string, options?: { count?: "exact"; head?: boolean }): QueryBuilder;
  eq(column: string, value: string): QueryBuilder;
  lte(column: string, value: string): QueryBuilder;
  or(filters: string): QueryBuilder;
  order(column: string, options: { ascending: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  maybeSingle(): Promise<QueryResult<Record<string, unknown>>>;
  insert(row: Record<string, unknown> | Array<Record<string, unknown>>): Promise<QueryResult<unknown>>;
  upsert(row: Record<string, unknown>): Promise<QueryResult<unknown>>;
  update(row: Record<string, unknown>): QueryBuilder;
}

interface SupabaseLike {
  from(table: string): QueryBuilder;
  rpc(fn: string, args: Record<string, unknown>): Promise<QueryResult<unknown>>;
}

export class SupabaseReportingStore implements ReportingStore, MoneyStore {
  constructor(private readonly supabase: SupabaseLike) {}

  clock(): Date {
    return new Date();
  }

  async currentWatermark(): Promise<string> {
    return this.highWatermark();
  }

  /**
   * Manual entries, settlements and transfers. Same change sequence and same
   * commit function as provider observations, so a snapshot watermark covers
   * both and a stale revision is refused rather than overwritten.
   */
  async appendBuilt(
    build: (allocate: () => Promise<string>, now: string) => Promise<FinanceRecord[]>,
  ): Promise<FinanceRecord[]> {
    const records = await build(() => this.allocate(), formatUtcInstant(new Date()));
    if (records.length === 0) return records;
    const committed = await this.supabase.rpc("reporting_commit_plan", {
      p_plan: {
        lock_key: `money.${records[0].record_id}`,
        transport: null,
        quarantine: null,
        inserts: records.map((record) => ({
          expected_previous_revision: record.revision === 1 ? null : record.revision - 1,
          record,
        })),
        fx: [],
      },
    });
    if (committed.error) throw new Error("reporting_commit_failed");
    const status = (committed.data as { status?: string } | null)?.status;
    if (status !== "ok") throw new Error("reporting_commit_conflict");
    return records;
  }

  async apply(obs: Observation): Promise<ApplyResult> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const view = await this.loadView(obs);
      const sequence = await this.allocate();
      const planned = planObservation(view, obs, formatUtcInstant(new Date()), () => sequence);
      if (planned.status === "duplicate" || planned.status === "conflict") return planned.result;
      const effects = planned.effects;
      const committed = await this.supabase.rpc("reporting_commit_plan", {
        p_plan: {
          lock_key: obs.economicTransactionId,
          transport: {
            source_system: effects.transport.sourceSystem,
            transport_id: effects.transport.transportId,
            payload_hash: effects.transport.payloadHash,
            environment: effects.transport.environment,
            external_object_id: effects.transport.externalObjectId,
            economic_transaction_id: effects.transport.economicTransactionId,
            body: effects.transport.body,
          },
          quarantine: effects.quarantine
            ? {
                source_system: effects.quarantine.sourceSystem,
                transport_id: effects.quarantine.transportId,
                payload_hash: effects.quarantine.payloadHash,
                reason: effects.quarantine.reason,
                environment: effects.quarantine.environment,
                body: effects.quarantine.body,
              }
            : null,
          inserts: effects.records.map((record) => ({
            expected_previous_revision: record.revision === 1 ? null : record.revision - 1,
            record,
          })),
          fx: effects.fx.map((row) => ({
            economic_transaction_id: row.economicTransactionId,
            policy_version: row.policyVersion,
            rate: row.rate,
            rate_source: row.rateSource,
            effective_at: row.effectiveAt,
            source_amount: row.sourceAmount,
            source_currency: row.sourceCurrency,
            reason: row.reason,
          })),
        },
      });
      if (committed.error) throw new Error("reporting_commit_failed");
      const status = (committed.data as { status?: string } | null)?.status;
      if (status === "ok") return effects.result;
      if (status === "duplicate") return { ...effects.result, status: "duplicate" };
    }
    return {
      status: "conflict",
      economicTransactionId: obs.economicTransactionId,
      reason: "retry_exhausted",
    };
  }

  async acquireLease(source: string, owner: string, nowMs: number, ttlMs: number): Promise<boolean> {
    const result = await this.supabase.rpc("reporting_acquire_lease", {
      p_source: source,
      p_owner: owner,
      p_now: new Date(nowMs).toISOString(),
      p_ttl_ms: ttlMs,
    });
    if (result.error) throw new Error("reporting_lease_failed");
    return result.data === true;
  }

  async releaseLease(source: string, owner: string): Promise<void> {
    const result = await this.supabase
      .from("reporting_import_checkpoints")
      .update({ lease_owner: null, lease_until: null, updated_at: new Date().toISOString() })
      .eq("source_key", source)
      .eq("lease_owner", owner);
    const resolved = await result;
    if (resolved.error) throw new Error("reporting_lease_release_failed");
  }

  async getCheckpoint(source: string): Promise<Checkpoint | null> {
    const result = await this.supabase
      .from("reporting_import_checkpoints")
      .select("cursor_created_at, cursor_id, covered_through, retry_count, last_error")
      .eq("source_key", source)
      .maybeSingle();
    if (result.error) throw new Error("reporting_checkpoint_failed");
    if (!result.data) return null;
    return {
      cursorCreatedAt: text(result.data.cursor_created_at),
      cursorId: text(result.data.cursor_id),
      coveredThrough: text(result.data.covered_through),
      retryCount: Number(result.data.retry_count ?? 0),
      lastError: text(result.data.last_error),
    };
  }

  async saveCheckpoint(source: string, checkpoint: Checkpoint): Promise<void> {
    const result = await this.supabase.from("reporting_import_checkpoints").upsert({
      source_key: source,
      cursor_created_at: checkpoint.cursorCreatedAt,
      cursor_id: checkpoint.cursorId,
      covered_through: checkpoint.coveredThrough,
      retry_count: checkpoint.retryCount,
      last_error: checkpoint.lastError,
      updated_at: new Date().toISOString(),
    });
    if (result.error) throw new Error("reporting_checkpoint_write_failed");
  }

  async noteFailure(source: string, error: string): Promise<number> {
    const current = await this.getCheckpoint(source);
    const retryCount = (current?.retryCount ?? 0) + 1;
    await this.saveCheckpoint(source, {
      cursorCreatedAt: current?.cursorCreatedAt ?? null,
      cursorId: current?.cursorId ?? null,
      coveredThrough: current?.coveredThrough ?? null,
      retryCount,
      lastError: error,
    });
    return retryCount;
  }

  async resetFailures(source: string): Promise<void> {
    const current = await this.getCheckpoint(source);
    if (!current) return;
    await this.saveCheckpoint(source, { ...current, retryCount: 0, lastError: null });
  }

  async createSnapshot(now: Date): Promise<Snapshot> {
    const highWatermark = await this.highWatermark();
    const snapshot: Snapshot = {
      snapshotId: `snap.${highWatermark}.${formatUtcInstant(now).replace(/[-:]/g, "")}.${randomUUID().slice(0, 8)}`,
      environment: "production",
      dataAsOf: formatUtcInstant(now),
      highWatermark,
      formulaVersion: FORMULA_VERSION,
    };
    const inserted = await this.supabase.from("reporting_snapshots").insert({
      snapshot_id: snapshot.snapshotId,
      environment: snapshot.environment,
      data_as_of: snapshot.dataAsOf,
      high_watermark: Number(snapshot.highWatermark),
      formula_version: snapshot.formulaVersion,
    });
    if (inserted.error) throw new Error("reporting_snapshot_failed");
    return snapshot;
  }

  async getSnapshot(id: string): Promise<Snapshot | null> {
    const result = await this.supabase
      .from("reporting_snapshots")
      .select("snapshot_id, data_as_of, high_watermark, formula_version")
      .eq("snapshot_id", id)
      .maybeSingle();
    if (result.error) throw new Error("reporting_snapshot_read_failed");
    if (!result.data) return null;
    return {
      snapshotId: String(result.data.snapshot_id),
      environment: "production",
      dataAsOf: formatUtcInstant(String(result.data.data_as_of)),
      highWatermark: String(result.data.high_watermark),
      formulaVersion: FORMULA_VERSION,
    };
  }

  async recordsAt(watermark: string): Promise<FinanceRecord[]> {
    const result = await this.supabase
      .from("reporting_records")
      .select("body")
      .lte("change_sequence", watermark);
    const resolved = await result;
    if (resolved.error) throw new Error("reporting_records_failed");
    const rows = (resolved.data ?? []) as Array<{ body: FinanceRecord }>;
    const latest = new Map<string, FinanceRecord>();
    for (const row of rows) {
      const record = row.body;
      if (BigInt(record.change_sequence) > BigInt(watermark)) continue;
      const current = latest.get(record.record_id);
      if (!current || record.revision > current.revision) latest.set(record.record_id, record);
    }
    return [...latest.values()];
  }

  async revisionsAt(watermark: string): Promise<FinanceRecord[]> {
    const result = await this.supabase
      .from("reporting_records")
      .select("body")
      .lte("change_sequence", watermark);
    const resolved = await result;
    if (resolved.error) throw new Error("reporting_records_failed");
    const rows = (resolved.data ?? []) as Array<{ body: FinanceRecord }>;
    return rows
      .map((row) => row.body)
      .filter((record) => BigInt(record.change_sequence) <= BigInt(watermark));
  }

  async exclusionCounts(): Promise<{ sandbox: number; quarantined: number }> {
    const sandbox = await this.supabase
      .from("reporting_transports")
      .select("id", { count: "exact", head: true })
      .eq("environment", "sandbox");
    const sandboxResolved = await sandbox;
    const quarantined = await this.supabase
      .from("reporting_quarantine")
      .select("id", { count: "exact", head: true });
    const quarantinedResolved = await quarantined;
    if (sandboxResolved.error || quarantinedResolved.error) {
      throw new Error("reporting_exclusion_failed");
    }
    return {
      sandbox: sandboxResolved.count ?? 0,
      quarantined: quarantinedResolved.count ?? 0,
    };
  }

  private async loadView(obs: Observation) {
    const transport = await this.supabase
      .from("reporting_transports")
      .select("payload_hash")
      .eq("source_system", obs.sourceSystem)
      .eq("transport_id", obs.transportId)
      .maybeSingle();
    if (transport.error) throw new Error("reporting_transport_failed");
    const records = await this.supabase
      .from("reporting_records")
      .select("body")
      .eq("economic_transaction_id", obs.economicTransactionId);
    const resolved = await records;
    if (resolved.error) throw new Error("reporting_records_failed");
    const bodies = ((resolved.data ?? []) as Array<{ body: FinanceRecord }>).map((row) => row.body);
    return {
      transportHash: transport.data ? String(transport.data.payload_hash) : null,
      records: bodies,
    };
  }

  private async highWatermark(): Promise<string> {
    const latest = await this.supabase
      .from("reporting_records")
      .select("change_sequence")
      .order("change_sequence", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest.error) throw new Error("reporting_watermark_failed");
    return latest.data?.change_sequence == null ? "0" : String(latest.data.change_sequence);
  }

  private async allocate(): Promise<string> {
    const result = await this.supabase.rpc("reporting_allocate_change_sequence", {});
    if (result.error || result.data == null) throw new Error("reporting_sequence_failed");
    return String(result.data);
  }
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function reportingStore(): SupabaseReportingStore {
  return new SupabaseReportingStore(createUntypedAdminClient() as unknown as SupabaseLike);
}

export function invoiceReader(): InvoiceReader {
  const supabase = createUntypedAdminClient() as unknown as SupabaseLike;
  return {
    async page(after, limit) {
      let query = supabase
        .from("vpn_invoices")
        .select("id, plan, amount, currency, status, provider, provider_payment_id, created_at")
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .limit(limit);
      if (after) {
        query = query.or(
          `created_at.gt.${after.createdAt},and(created_at.eq.${after.createdAt},id.gt.${after.id})`,
        );
      }
      const result = await query;
      if (result.error) throw new Error("invoice_read_failed");
      // vpn_invoices has neither an attribution nor an environment column.
      return ((result.data ?? []) as Array<Omit<InvoiceRow, "attribution" | "environment">>).map((row) => ({
        ...row,
        id: String(row.id),
        attribution: null,
        environment: invoiceEnvironment(row.provider),
      }));
    },
  };
}

export async function applyDurableObservation(obs: Observation): Promise<ApplyResult> {
  return reportingStore().apply(obs);
}

export async function importDurableAppleSales(): Promise<AppleImportResult> {
  const credentials = ascCredentialsFromEnv();
  return importAppleSales(
    reportingStore(),
    credentials ? (date) => fetchAppleSalesReport(credentials, date) : null,
  );
}

export async function importDurableHistory(): Promise<Awaited<ReturnType<typeof importInvoiceHistory>>> {
  return importInvoiceHistory(reportingStore(), invoiceReader());
}

export function moneyVault(): SupabaseMoneyVault {
  return new SupabaseMoneyVault(createUntypedAdminClient() as unknown as SupabaseLike);
}

/** Drafts, receipts, statement files and balances in the reporting_money_* tables. */
export class SupabaseMoneyVault implements MoneyVault {
  constructor(private readonly supabase: SupabaseLike) {}

  async saveDraft(draft: MoneyDraft): Promise<void> {
    const result = await this.supabase.from("reporting_money_drafts").upsert({
      draft_id: draft.draftId,
      kind: draft.kind,
      status: draft.status,
      payload: draft,
      record_id: draft.recordId,
    });
    if (result.error) throw new Error("money_draft_write_failed");
  }

  async getDraft(draftId: string): Promise<MoneyDraft | null> {
    const result = await this.supabase
      .from("reporting_money_drafts")
      .select("payload")
      .eq("draft_id", draftId)
      .maybeSingle();
    if (result.error) throw new Error("money_draft_read_failed");
    return result.data ? (result.data.payload as MoneyDraft) : null;
  }

  async saveDocument(document: StoredDocument): Promise<void> {
    const result = await this.supabase.from("reporting_money_documents").insert({
      document_id: document.documentId,
      filename: document.filename,
      checksum_sha256: document.checksum,
      bytes: toBytea(document.bytes),
    });
    if (result.error) throw new Error("money_document_write_failed");
  }

  async getDocument(documentId: string): Promise<StoredDocument | null> {
    const result = await this.supabase
      .from("reporting_money_documents")
      .select("document_id, filename, checksum_sha256, bytes")
      .eq("document_id", documentId)
      .maybeSingle();
    if (result.error) throw new Error("money_document_read_failed");
    if (!result.data) return null;
    return {
      documentId: String(result.data.document_id),
      filename: String(result.data.filename),
      checksum: String(result.data.checksum_sha256),
      bytes: fromBytea(String(result.data.bytes)),
    };
  }

  async getStatement(checksum: string): Promise<Uint8Array | null> {
    const result = await this.supabase
      .from("reporting_money_statements")
      .select("bytes")
      .eq("checksum_sha256", checksum)
      .maybeSingle();
    if (result.error) throw new Error("money_statement_read_failed");
    return result.data ? fromBytea(String(result.data.bytes)) : null;
  }

  async saveStatement(checksum: string, bytes: Uint8Array, balances: BalanceRow[]): Promise<void> {
    if (balances.length > 0) {
      const inserted = await this.supabase.from("reporting_money_balances").insert(
        balances.map((row) => ({
          financial_account_id: row.financial_account_id,
          account_kind: row.account_kind,
          as_of: row.as_of,
          payload: row,
        })),
      );
      if (inserted.error) throw new Error("money_balance_write_failed");
    }
    const result = await this.supabase.from("reporting_money_statements").insert({
      checksum_sha256: checksum,
      bytes: toBytea(bytes),
    });
    if (result.error) throw new Error("money_statement_write_failed");
  }

  async listBalances(): Promise<BalanceRow[]> {
    const result = await this.supabase
      .from("reporting_money_balances")
      .select("payload")
      .order("as_of", { ascending: true });
    const resolved = await result;
    if (resolved.error) throw new Error("money_balance_read_failed");
    return ((resolved.data ?? []) as Array<{ payload: BalanceRow }>).map((row) => row.payload);
  }
}

// PostgREST reads and writes bytea as a "\\x" hex string.
function toBytea(bytes: Uint8Array): string {
  return `\\x${Buffer.from(bytes).toString("hex")}`;
}

function fromBytea(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value.startsWith("\\x") ? value.slice(2) : value, "hex"));
}
