import { analyticsConfigured } from "../analytics/report";
import { contentHash } from "../canonical";
import {
  CONTRACT_VERSION,
  FORMULA_VERSION,
  FX_POLICY_VERSION,
  IMPORT_SOURCE,
  PROJECT_ID,
  TIMEZONE_PROPOSAL,
} from "../constants";
import { assembleMoneyModel, MONEY_FORMULA_VERSION, type MoneyMetric, type MoneyPageModel } from "../money";
import { MemoryReportingStore } from "../memory-store";
import { MoneyBook } from "../money";
import { summarizeProduction } from "../summarize";
import {
  SUBSCRIPTION_FORMULA_VERSION,
  summarizeSubscriptions,
  toOperationsDaily,
  toSubscriptionsSummary,
  type SubscriptionEvidence,
} from "../subscriptions";
import type { FinanceRecord, ReportingStore } from "../types";
import { cursorExpiry, encodeCursor, type CursorPayload } from "./cursors";
import type { IntervalQuery } from "./guards";

export class ExportConflict extends Error {
  constructor() {
    super("record_hash_conflict");
    this.name = "ExportConflict";
  }
}

const RECORD_KEYS = [
  "record_id", "revision", "change_sequence", "record_type", "project_id", "source_system",
  "source_account_id", "environment", "external_object_id", "economic_transaction_id", "alias_ids",
  "occurred_at", "updated_at", "status", "original_amount", "quality", "coverage", "formula_version",
  "economic_direction", "counts_as_new_revenue", "counts_as_gross_refunded_principal", "parent_record_id",
  "supersedes_revision", "component_id", "posting_role", "components", "legacy_net_amount",
  "legacy_formula_version", "gross_reconstructed", "source_gbp_valuation", "subscription_id",
  "product_id", "channel", "store", "processor", "settled_at", "service_period", "expense_category",
  "vendor_reference", "financial_account_id", "destination_account_id", "tax_inclusion",
  "document_refs", "acquisition", "source_as_of", "retrieved_at",
] as const;

export const KNOWN_SOURCES = ["revolut", "oxapay", "revenuecat", IMPORT_SOURCE] as const;

const REPORTS: Record<string, "ga4" | "gsc" | "vercel"> = {
  ga4_overview_daily: "ga4",
  ga4_breakdown: "ga4",
  ga4_period_unique_users: "ga4",
  gsc_daily_totals: "gsc",
  gsc_dimension_rows: "gsc",
  vercel_daily: "vercel",
};

export function hashConflict(records: FinanceRecord[]): boolean {
  const seen = new Map<string, string>();
  for (const record of records) {
    const key = `${record.record_id}\0${record.revision}`;
    const previous = seen.get(key);
    if (previous !== undefined && previous !== record.content_hash) return true;
    seen.set(key, record.content_hash);
  }
  return false;
}

export async function loadSharedModel(
  store: ReportingStore,
  query: { from: string; to: string; basis: "purchase" | "settled_cash"; snapshotId?: string; source?: string; channel?: string },
): Promise<MoneyPageModel> {
  if (store instanceof MemoryReportingStore) return new MoneyBook(store).snapshot(query);
  const summary = await summarizeProduction(store, {
    from: query.from,
    to: query.to,
    snapshotId: query.snapshotId,
    source: query.source,
    channel: query.channel,
  });
  const records = (await store.recordsAt(summary.high_watermark)).filter((record) =>
    (!query.source || record.source_system === query.source) &&
    (!query.channel || record.channel === query.channel)
  );
  return assembleMoneyModel(summary, records, query, [], []);
}

function envelope(model: MoneyPageModel, environment: string, generatedAt: string) {
  return {
    schema_version: "1.0.0" as const,
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    environment,
    snapshot_id: model.snapshot_id,
    generated_at: generatedAt,
    data_as_of: model.data_as_of,
  };
}

function drill(snapshotId: string, query: IntervalQuery, recordTypes: string[]) {
  return {
    dataset: "finance.records" as const,
    snapshot_id: snapshotId,
    filter: {
      project_id: "doppler" as const,
      from: query.from,
      to: query.to,
      basis: query.basis,
      record_types: recordTypes,
    },
  };
}

const METRIC_NAMES = [
  "gross_customer_sales", "refunded_principal", "sales_tax", "store_and_processor_fees",
  "net_sales", "net_proceeds", "direct_costs", "contribution_profit", "operating_expenses",
  "operating_profit", "net_profit",
] as const;

function gbpHeadline(model: MoneyPageModel, query: IntervalQuery): Record<string, MoneyMetric> {
  const native = model.native.find((row) => row.currency === "GBP");
  const output: Record<string, MoneyMetric> = {};
  for (const name of METRIC_NAMES) {
    const metric = native?.metrics[name];
    if (metric && metric.currency === "GBP") {
      output[name] = metric;
      continue;
    }
    const source = model.native[0]?.metrics[name];
    output[name] = {
      amount: null,
      currency: "GBP",
      quality: "unavailable",
      reason: source?.reason && source.amount === null ? source.reason : "missing_fx_evidence",
      coverage: "missing",
      drill_through: source?.drill_through ?? drill(model.snapshot_id, query, ["sale"]),
    };
  }
  return output;
}

function coverageOf(model: MoneyPageModel) {
  return {
    status: model.coverage.status,
    missing: [...new Set(model.coverage.missing.map((item) => item.slice(0, 80)))].sort(),
  };
}

export function toFinanceSummary(model: MoneyPageModel, query: IntervalQuery, environment: string, generatedAt: string) {
  return {
    ...envelope(model, environment, generatedAt),
    period: { from: query.from, to: query.to, timezone: TIMEZONE_PROPOSAL },
    reporting_currency: "GBP" as const,
    basis: model.basis,
    formula_version: MONEY_FORMULA_VERSION,
    fx_policy_version: FX_POLICY_VERSION,
    coverage: coverageOf(model),
    posting: false as const,
    metrics: gbpHeadline(model, query),
    native_currency_subtotals: model.native.map((row) => ({ currency: row.currency, metrics: row.metrics })),
    warnings: ["missing_fx_evidence"],
  };
}

export function subscriptionsFor(model: MoneyPageModel, evidence: SubscriptionEvidence, query: IntervalQuery) {
  const summarized = summarizeSubscriptions(evidence, {
    from: query.from,
    to: query.to,
    asOf: model.data_as_of,
    snapshotId: model.snapshot_id,
    generatedAt: model.data_as_of,
    dataAsOf: model.data_as_of,
  });
  return { summary: toSubscriptionsSummary(summarized), operations: toOperationsDaily(summarized) };
}

export function toOverview(
  model: MoneyPageModel,
  subscriptions: ReturnType<typeof toSubscriptionsSummary>,
  query: IntervalQuery,
  environment: string,
  generatedAt: string,
) {
  const summary = toFinanceSummary(model, query, environment, generatedAt);
  const counts = subscriptions.metrics ?? {
    active_contracts: { value: null, reason: "missing_subscription_events" },
    active_customers: { value: null, reason: "missing_subscription_events" },
    paid_access_accounts: { value: null, reason: "missing_subscription_events" },
  };
  return {
    ...envelope(model, environment, generatedAt),
    period: summary.period,
    reporting_currency: "GBP" as const,
    basis: model.basis,
    formula_version: summary.formula_version,
    fx_policy_version: FX_POLICY_VERSION,
    coverage: summary.coverage,
    posting: false as const,
    metrics: summary.metrics,
    subscriber_counts: {
      active_contracts: counts.active_contracts,
      active_customers: counts.active_customers,
      paid_access_accounts: counts.paid_access_accounts,
    },
    traffic_highlights: [],
    warnings: ["missing_fx_evidence", "analytics_not_configured"],
  };
}

export async function toFinanceDaily(
  store: ReportingStore,
  model: MoneyPageModel,
  query: IntervalQuery,
  environment: string,
  generatedAt: string,
  coveredThrough: string | null,
) {
  const buckets = [];
  const fromMs = Date.parse(query.from);
  const toMs = Date.parse(query.to);
  let cursor = londonDate(fromMs);
  const last = londonDate(toMs - 1);
  while (cursor <= last) {
    const start = londonMidnightUtc(cursor);
    const end = londonMidnightUtc(nextLondonDate(cursor));
    const sliceFrom = new Date(Math.max(start, fromMs)).toISOString().replace(/\.\d{3}Z$/, "Z");
    const sliceTo = new Date(Math.min(end, toMs)).toISOString().replace(/\.\d{3}Z$/, "Z");
    const summary = await summarizeProduction(store, {
      from: sliceFrom,
      to: sliceTo,
      snapshotId: model.snapshot_id,
      source: query.source ?? undefined,
      channel: query.channel ?? undefined,
    });
    const native = summary.native[0];
    const bucketEnd = new Date(end).toISOString().replace(/\.\d{3}Z$/, "Z");
    const partial = start < fromMs || end > toMs || coveredThrough == null || coveredThrough < bucketEnd;
    buckets.push({
      date: cursor,
      timezone: TIMEZONE_PROPOSAL,
      partial,
      bounds: { from: new Date(start).toISOString().replace(/\.\d{3}Z$/, "Z"), to: bucketEnd },
      ...(partial ? { covered_from: sliceFrom, covered_to: sliceTo } : {}),
      metrics: {
        gross_customer_sales: dailyMetric(native?.metrics.gross_customer_sales, model, query, ["sale"]),
        net_proceeds: dailyMetric(native?.metrics.net_proceeds, model, query, ["sale", "fee"]),
      },
    });
    cursor = nextLondonDate(cursor);
  }
  return {
    ...envelope(model, environment, generatedAt),
    period: { from: query.from, to: query.to, timezone: TIMEZONE_PROPOSAL },
    reporting_currency: "GBP" as const,
    basis: query.basis,
    formula_version: FORMULA_VERSION,
    coverage: coverageOf(model),
    posting: false as const,
    balances_included: false as const,
    buckets,
    warnings: coveredThrough ? [] : ["source_coverage_unconfirmed"],
  };
}

function dailyMetric(
  metric: { amount: string | null; currency: string; quality: "actual" | "unavailable"; reason?: string; coverage: "complete" | "partial" | "missing" } | undefined,
  model: MoneyPageModel,
  query: IntervalQuery,
  recordTypes: string[],
): MoneyMetric {
  if (query.basis !== "settled_cash" && metric?.currency === "GBP") {
    return {
      amount: metric.amount,
      currency: "GBP",
      quality: metric.quality,
      ...(metric.reason ? { reason: metric.reason } : {}),
      coverage: metric.coverage,
      drill_through: drill(model.snapshot_id, query, recordTypes),
    };
  }
  return {
    amount: null,
    currency: "GBP",
    quality: "unavailable",
    reason: query.basis === "settled_cash" ? "settled_cash_sales_unsupported" : "missing_fx_evidence",
    coverage: "missing",
    drill_through: drill(model.snapshot_id, query, recordTypes),
  };
}

export function toBalances(model: MoneyPageModel, environment: string, generatedAt: string, asOf: string) {
  return {
    ...envelope(model, environment, generatedAt),
    as_of_requested: asOf,
    posting: false as const,
    balances_are_not_additive: true as const,
    snapshots: model.balances
      .filter((row) => row.as_of <= asOf)
      .map((row) => ({
        financial_account_id: row.financial_account_id,
        account_kind: row.account_kind,
        as_of: row.as_of,
        amount: row.amount,
        additive: false as const,
      })),
    warnings: ["missing_statement_evidence"],
  };
}

export function toReconciliation(model: MoneyPageModel, query: IntervalQuery, environment: string, generatedAt: string) {
  return {
    ...envelope(model, environment, generatedAt),
    period: { from: query.from, to: query.to, timezone: TIMEZONE_PROPOSAL },
    posting: false as const,
    runs: model.reconciliation.runs.map((run) => ({
      run_id: run.run_id,
      compared: run.compared,
      status: run.status,
      residuals: run.residuals.map((residual) => ({
        code: residual.code,
        amount: {
          amount: residual.amount,
          currency: residual.currency,
          quality: residual.quality,
          ...(residual.amount === null ? { reason: residual.reason ?? "missing_statement_evidence" } : {}),
        },
        quality: residual.quality,
      })),
    })),
    warnings: [],
  };
}

export function projectRecord(record: FinanceRecord): Record<string, unknown> {
  const projected: Record<string, unknown> = {};
  const source = record as unknown as Record<string, unknown>;
  for (const key of RECORD_KEYS) {
    const value = source[key];
    if (value === undefined) continue;
    if (key === "alias_ids" && Array.isArray(value) && value.length === 0) continue;
    if (key === "document_refs" && Array.isArray(value)) {
      projected[key] = value.map((item) => {
        const ref = item as { document_id?: string; checksum_sha256?: string; title?: string; url?: string };
        return {
          document_id: ref.document_id,
          checksum_sha256: ref.checksum_sha256,
          ...(ref.title ? { title: ref.title } : {}),
        };
      });
      continue;
    }
    projected[key] = value;
  }
  projected.content_hash = contentHash(projected);
  return projected;
}

export function pageRecords(input: {
  records: FinanceRecord[];
  after: string;
  limit: number;
  watermark: string;
  snapshotId: string;
  dataAsOf: string;
  generatedAt: string;
  environment: string;
  binding: string;
  now: Date;
  endpoint: CursorPayload["endpoint"];
  from: string | null;
  to: string | null;
  source: string | null;
  channel: string | null;
}) {
  if (hashConflict(input.records)) throw new ExportConflict();
  const after = BigInt(input.after);
  const watermark = BigInt(input.watermark);
  const rows = input.records
    .filter((record) => record.environment === "production")
    .filter((record) => {
      const sequence = BigInt(record.change_sequence);
      return sequence > after && sequence <= watermark;
    })
    .filter((record) => !input.from || record.occurred_at >= input.from)
    .filter((record) => !input.to || record.occurred_at < input.to)
    .filter((record) => !input.source || record.source_system === input.source)
    .filter((record) => !input.channel || record.channel === input.channel)
    .sort((left, right) => {
      const delta = BigInt(left.change_sequence) - BigInt(right.change_sequence);
      if (delta !== BigInt(0)) return delta < BigInt(0) ? -1 : 1;
      return left.revision - right.revision;
    });
  const pageRows = rows.slice(0, input.limit);
  const hasMore = rows.length > input.limit;
  const last = pageRows[pageRows.length - 1];
  const expires = cursorExpiry(input.now);
  const nextCursor = hasMore && last ? encodeCursor(cursorBody(input, last.change_sequence, expires)) : null;
  const checkpoint = hasMore ? null : encodeCursor(cursorBody(input, input.watermark, expires));
  return {
    schema_version: "1.0.0" as const,
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    environment: input.environment,
    snapshot_id: input.snapshotId,
    generated_at: input.generatedAt,
    data_as_of: input.dataAsOf,
    high_watermark: input.watermark,
    query_binding_sha256: input.binding,
    records: pageRows.map((record) => projectRecord(record)),
    page: {
      limit: input.limit,
      has_more: hasMore,
      next_cursor: nextCursor,
      cursor_expires_at: expires,
      next_sync_checkpoint: checkpoint,
    },
  };
}

function cursorBody(
  input: { snapshotId: string; watermark: string; binding: string; environment: string; endpoint: CursorPayload["endpoint"] },
  after: string,
  expires: string,
): CursorPayload {
  return {
    v: 1,
    project_id: "doppler",
    environment: input.environment as CursorPayload["environment"],
    endpoint: input.endpoint,
    query_sha256: input.binding,
    snapshot_id: input.snapshotId,
    high_watermark: input.watermark,
    after_change_sequence: after,
    expires_at: expires,
  };
}

export async function toCapabilities(
  store: ReportingStore,
  environment: string,
  generatedAt: string,
  snapshotId: string,
  dataAsOf: string,
) {
  const configured: string[] = [];
  for (const source of KNOWN_SOURCES) {
    const checkpoint = await store.getCheckpoint(source);
    if (checkpoint?.coveredThrough) configured.push(source);
  }
  const history = process.env.DOPPLER_HISTORY_START ?? "";
  const historyOk = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/.test(history);
  return {
    schema_version: "1.0.0" as const,
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    product_name: "Doppler",
    environment,
    snapshot_id: snapshotId,
    generated_at: generatedAt,
    data_as_of: dataAsOf,
    api_version: "1.0.0" as const,
    formula_versions: [FORMULA_VERSION, MONEY_FORMULA_VERSION, SUBSCRIPTION_FORMULA_VERSION],
    fx_policy_version: FX_POLICY_VERSION,
    timezone: TIMEZONE_PROPOSAL,
    reporting_currency: "GBP" as const,
    supported_bases: ["purchase", "settled_cash"],
    datasets: {
      finance: true,
      subscriptions: true,
      operations: true,
      analytics: analyticsConfigured(),
    },
    earliest_data_at: historyOk ? history : null,
    ...(historyOk ? {} : { earliest_data_reason: "history_start_unconfigured" }),
    limits: { max_range_days: 366, max_page_size: 500 },
    configured_sources: configured.length > 0 ? configured : [...KNOWN_SOURCES],
    warnings: configured.length > 0 ? [] : ["provider_access_not_confirmed"],
  };
}

export async function toHealth(
  store: ReportingStore,
  environment: string,
  generatedAt: string,
  snapshotId: string,
  dataAsOf: string,
  now: Date,
) {
  const sources = [];
  for (const source of KNOWN_SOURCES) {
    const checkpoint = await store.getCheckpoint(source);
    if (!checkpoint?.coveredThrough) {
      sources.push({
        source,
        status: "unknown" as const,
        last_successful_sync_at: null,
        covered_through: null,
        lag_seconds: null,
        reason: checkpoint?.lastError ? "import_error" : "permission_unverified",
      });
      continue;
    }
    const lag = Math.max(0, Math.floor((now.getTime() - Date.parse(checkpoint.coveredThrough)) / 1000));
    sources.push({
      source,
      status: checkpoint.lastError ? "degraded" as const : "ok" as const,
      last_successful_sync_at: checkpoint.coveredThrough,
      covered_through: checkpoint.coveredThrough,
      lag_seconds: lag,
      ...(checkpoint.lastError ? { reason: "import_error" } : {}),
    });
  }
  for (const source of ["ga4", "gsc", "vercel"] as const) {
    const checkpoint = await store.getCheckpoint(source);
    if (!checkpoint?.coveredThrough) {
      sources.push({
        source,
        status: "unknown" as const,
        last_successful_sync_at: null,
        covered_through: null,
        lag_seconds: null,
        reason: source === "vercel" ? "drain_not_configured" : checkpoint?.lastError ? "provider_outage" : "permission_unverified",
      });
      continue;
    }
    const lag = Math.max(0, Math.floor((now.getTime() - Date.parse(checkpoint.coveredThrough)) / 1000));
    sources.push({
      source,
      status: checkpoint.lastError ? "degraded" as const : "ok" as const,
      last_successful_sync_at: checkpoint.coveredThrough,
      covered_through: checkpoint.coveredThrough,
      lag_seconds: lag,
      ...(checkpoint.lastError ? { reason: "provider_outage" } : {}),
    });
  }
  const status = sources.every((source) => source.status === "ok") ? "ok" : "degraded";
  return {
    schema_version: "1.0.0" as const,
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    environment,
    snapshot_id: snapshotId,
    generated_at: generatedAt,
    data_as_of: dataAsOf,
    status,
    sources,
  };
}

export function unsupportedAnalytics(input: {
  environment: string;
  snapshotId: string;
  generatedAt: string;
  dataAsOf: string;
  provider: string;
  report: string;
  from: string;
  to: string;
  limit: number;
}) {
  return {
    schema_version: "1.0.0" as const,
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    environment: input.environment,
    snapshot_id: input.snapshotId,
    generated_at: input.generatedAt,
    data_as_of: input.dataAsOf,
    provider: input.provider,
    report: input.report,
    availability: "unsupported" as const,
    reason: "analytics_not_configured",
    data_state: "unsupported" as const,
    source_timezone: input.provider === "gsc" ? "America/Los_Angeles" : TIMEZONE_PROPOSAL,
    coverage: { status: "missing" as const, missing: [input.provider] },
    posting: false as const,
    ...(input.report === "ga4_period_unique_users" ? { must_not_sum_daily_uniques: true as const } : {}),
    rows: [],
    page: { limit: input.limit, has_more: false, next_cursor: null, complete_property_total: false },
    limitations: ["The dataset is unsupported for this project. This is not a zero report."],
    period: { from: input.from, to: input.to, timezone: TIMEZONE_PROPOSAL },
  };
}

export function knownReportProvider(report: string): "ga4" | "gsc" | "vercel" | null {
  return REPORTS[report] ?? null;
}

function londonDate(utcMs: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(utcMs));
}

function nextLondonDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + 1)).toISOString().slice(0, 10);
}

function londonMidnightUtc(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  let guess = Date.UTC(year!, month! - 1, day!, 0, 0, 0);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const offset = wallOffset("Europe/London", guess);
    const next = Date.UTC(year!, month! - 1, day!, 0, 0, 0) - offset;
    if (next === guess) return guess;
    guess = next;
  }
  return guess;
}

function wallOffset(timeZone: string, utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  let hour = read("hour");
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(read("year"), read("month") - 1, read("day"), hour, read("minute"), read("second"));
  return asUtc - utcMs;
}
