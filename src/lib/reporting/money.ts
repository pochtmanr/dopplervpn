import { createHash } from "node:crypto";
import { contentHash } from "./canonical";
import { FORMULA_VERSION, PROJECT_ID, TIMEZONE_PROPOSAL, fiatExponent } from "./constants";
import { addDecimals, formatDecimal, isZeroDecimal, parseDecimal, rescale, subtractDecimals } from "./decimal";
import type { MemoryReportingStore } from "./memory-store";
import { summarizeProduction, type MetricValue } from "./summarize";
import type { FinanceRecord, MoneyValue, TaxInclusion } from "./types";

export const MONEY_FORMULA_VERSION = "doppler-money-native-v1";

const IMMUTABLE_SOURCES = new Set(["revolut", "oxapay", "revenuecat", "invoice", "statement_import"]);
const REJECTED_CATEGORIES = new Set([
  "shared_overhead",
  "company_overhead",
  "company_allocation",
  "simnetiq_allocation",
]);
const ACCOUNT_KINDS = new Set([
  "cash",
  "prepaid",
  "frozen",
  "clearing",
  "reserve",
  "pending_payout",
]);

export type MoneyBasis = "purchase" | "settled_cash";
export type DraftKind = "expense" | "direct_cost" | "manual_income";
export type AccountKind = "cash" | "prepaid" | "frozen" | "clearing" | "reserve" | "pending_payout";

export class MoneyError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "MoneyError";
  }
}

export interface MoneyDraftInput {
  kind: DraftKind;
  amount: string;
  currency: string;
  occurredAt: string;
  category: string;
  vendor?: string | null;
  taxAmount?: string | null;
  taxInclusion?: TaxInclusion;
  vatRecoverable?: boolean | null;
  vatReason?: string | null;
  servicePeriod?: { from: string; to: string } | null;
  dueAt?: string | null;
  paidAt?: string | null;
  paymentAccountId?: string | null;
  recurrence?: { interval: "month" | "year"; intervalCount: number } | null;
  documentId?: string | null;
  channel?: string | null;
  processor?: string | null;
  store?: string | null;
  acquisitionSource?: string | null;
  actor: string;
}

export interface MoneyDraft extends MoneyDraftInput {
  draftId: string;
  status: "draft" | "posted";
  recordId: string | null;
}

export interface StoredDocument {
  documentId: string;
  filename: string;
  checksum: string;
  bytes: Uint8Array;
}

export interface ReceiptGrant {
  ok: boolean;
  reason?: string;
  expiresAt?: string;
  checksum?: string;
  delivery?: "authorized_short_lived";
  url: null;
}

export interface MoneyMetric {
  amount: string | null;
  currency: string;
  quality: "actual" | "unavailable";
  reason?: string;
  coverage: "complete" | "partial" | "missing";
  drill_through: {
    dataset: "finance.records";
    snapshot_id: string;
    filter: {
      project_id: "doppler";
      from: string;
      to: string;
      basis: MoneyBasis;
      record_types: string[];
    };
  };
}

export interface DrillRow {
  record_id: string;
  revision: number;
  record_type: FinanceRecord["record_type"];
  channel: string | null;
  processor: string | null;
  store: string | null;
  acquisition_source: string | null;
  amount: string | null;
  currency: string | null;
}

export interface BalanceRow {
  financial_account_id: string;
  account_kind: AccountKind;
  as_of: string;
  amount: MoneyValue;
  additive: false;
}

export interface PayoutResidual {
  code: "payout_residual";
  settlement_id: string;
  amount: string | null;
  currency: string;
  quality: "actual" | "unavailable";
  reason?: string;
}

export interface MoneyPageModel {
  snapshot_id: string;
  data_as_of: string;
  high_watermark: string;
  basis: MoneyBasis;
  timezone: typeof TIMEZONE_PROPOSAL;
  timezone_confirmed: false;
  posting: false;
  formula_version: typeof FORMULA_VERSION;
  money_formula_version: typeof MONEY_FORMULA_VERSION;
  coverage: { status: "complete" | "partial" | "missing"; missing: string[] };
  native: Array<{
    currency: string;
    metrics: {
      gross_customer_sales: MoneyMetric;
      refunded_principal: MoneyMetric;
      sales_tax: MoneyMetric;
      store_and_processor_fees: MoneyMetric;
      net_sales: MoneyMetric;
      net_proceeds: MoneyMetric;
      direct_costs: MoneyMetric;
      contribution_profit: MoneyMetric;
      operating_expenses: MoneyMetric;
      operating_profit: MoneyMetric;
      net_profit: MoneyMetric;
    };
    margin: MoneyMetric;
  }>;
  drill: DrillRow[];
  balances: BalanceRow[];
  reconciliation: {
    posting: false;
    runs: Array<{
      run_id: string;
      compared: ["source_admin", "export_api"];
      status: "match" | "incomplete";
      residuals: PayoutResidual[];
    }>;
  };
  gbp: {
    amount: null;
    currency: "GBP";
    quality: "unavailable";
    reason: "missing_fx_evidence";
    policy_version: "gbp-unconfigured";
  };
}

export interface SnapshotQuery {
  from: string;
  to: string;
  basis: MoneyBasis;
  snapshotId?: string;
  source?: string;
  channel?: string;
}

/**
 * The page and the service snapshot are the same object.
 * Callers compare canonical JSON of this view.
 */
export function moneyPageView(model: MoneyPageModel): MoneyPageModel {
  return model;
}

export function allocateExact(total: string, weights: number[], scale: number): string[] {
  if (weights.length === 0 || weights.some((weight) => !Number.isInteger(weight) || weight < 0)) {
    throw new MoneyError("invalid_allocation_weights");
  }
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum <= 0) throw new MoneyError("invalid_allocation_weights");
  const units = rescale(parseDecimal(total), scale);
  const shares = weights.map((weight) => (units * BigInt(weight)) / BigInt(weightSum));
  const allocated = shares.reduce((sum, share) => sum + share, BigInt(0));
  shares[shares.length - 1] += units - allocated;
  return shares.map((share) => formatDecimal(share, scale));
}

export function authorizeReceipt(input: {
  isAdmin: boolean;
  document: StoredDocument | null;
  nowMs: number;
  ttlMs?: number;
}): ReceiptGrant {
  if (!input.isAdmin) return { ok: false, reason: "admin_required", url: null };
  if (!input.document) return { ok: false, reason: "document_not_found", url: null };
  const checksum = sha256(input.document.bytes);
  if (checksum !== input.document.checksum) {
    return { ok: false, reason: "checksum_mismatch", url: null };
  }
  const ttl = input.ttlMs ?? 60_000;
  return {
    ok: true,
    expiresAt: new Date(input.nowMs + ttl).toISOString().replace(/\.\d{3}Z$/, "Z"),
    checksum,
    delivery: "authorized_short_lived",
    url: null,
  };
}

export class MoneyBook {
  private drafts = new Map<string, MoneyDraft>();
  private documents = new Map<string, StoredDocument>();
  private statements = new Map<string, Uint8Array>();
  private balances: BalanceRow[] = [];
  private residuals: PayoutResidual[] = [];
  private frozen = new Map<string, MoneyPageModel>();
  private localSeq = 0;

  constructor(readonly store: MemoryReportingStore) {}

  createDraft(input: MoneyDraftInput): MoneyDraft {
    validateDraft(input);
    const draft: MoneyDraft = {
      ...input,
      vendor: input.vendor ?? null,
      taxAmount: input.taxAmount ?? null,
      taxInclusion: input.taxInclusion ?? "unknown",
      vatRecoverable: input.vatRecoverable ?? null,
      vatReason: input.vatReason ?? (input.vatRecoverable == null ? "vat_status_unconfirmed" : null),
      servicePeriod: input.servicePeriod ?? null,
      dueAt: input.dueAt ?? null,
      paidAt: input.paidAt ?? null,
      paymentAccountId: input.paymentAccountId ?? null,
      recurrence: input.recurrence ?? null,
      documentId: input.documentId ?? null,
      channel: input.channel ?? null,
      processor: input.processor ?? null,
      store: input.store ?? null,
      acquisitionSource: input.acquisitionSource ?? "manual",
      draftId: this.nextId("draft"),
      status: "draft",
      recordId: null,
    };
    this.drafts.set(draft.draftId, draft);
    return draft;
  }

  async postDraft(draftId: string): Promise<FinanceRecord> {
    const draft = this.requireDraft(draftId);
    if (draft.status === "posted") throw new MoneyError("draft_already_posted");
    const document = draft.documentId ? this.documents.get(draft.documentId) ?? null : null;
    if (draft.documentId && !document) throw new MoneyError("document_not_found");
    const recordId = this.nextId(draft.kind === "manual_income" ? "sale.manual" : draft.kind);
    const [record] = await this.store.appendBuilt((allocate, now) => [
      sealRecord(draftToRecord(draft, {
        recordId,
        revision: 1,
        sequence: allocate(),
        now,
        document,
      })),
    ]);
    draft.status = "posted";
    draft.recordId = record.record_id;
    this.frozen.clear();
    return record;
  }

  async voidRecord(recordId: string, actor: string): Promise<FinanceRecord> {
    const previous = await this.latest(recordId);
    this.assertMutable(previous);
    if (previous.status !== "posted") throw new MoneyError("record_not_posted");
    const [record] = await this.store.appendBuilt((allocate, now) => [
      sealRecord({
        ...previous,
        revision: previous.revision + 1,
        supersedes_revision: previous.revision,
        change_sequence: allocate(),
        updated_at: now,
        status: "void",
        source_as_of: now,
        retrieved_at: now,
        content_hash: "",
      }),
    ]);
    void actor;
    this.frozen.clear();
    return record;
  }

  async replaceRecord(recordId: string, input: MoneyDraftInput): Promise<FinanceRecord> {
    validateDraft(input);
    const previous = await this.latest(recordId);
    this.assertMutable(previous);
    if (previous.status !== "posted") throw new MoneyError("record_not_posted");
    const expectedKind = previous.record_type === "sale" ? "manual_income" : previous.record_type;
    if (input.kind !== expectedKind) throw new MoneyError("kind_mismatch");
    const document = input.documentId ? this.documents.get(input.documentId) ?? null : null;
    if (input.documentId && !document) throw new MoneyError("document_not_found");
    const draft: MoneyDraft = {
      ...input,
      vendor: input.vendor ?? null,
      taxAmount: input.taxAmount ?? null,
      taxInclusion: input.taxInclusion ?? "unknown",
      vatRecoverable: input.vatRecoverable ?? null,
      vatReason: input.vatReason ?? (input.vatRecoverable == null ? "vat_status_unconfirmed" : null),
      servicePeriod: input.servicePeriod ?? null,
      dueAt: input.dueAt ?? null,
      paidAt: input.paidAt ?? null,
      paymentAccountId: input.paymentAccountId ?? null,
      recurrence: input.recurrence ?? null,
      documentId: input.documentId ?? null,
      channel: input.channel ?? previous.channel ?? null,
      processor: input.processor ?? previous.processor ?? null,
      store: input.store ?? previous.store ?? null,
      acquisitionSource: input.acquisitionSource ?? previous.acquisition.source,
      draftId: previous.external_object_id,
      status: "posted",
      recordId,
    };
    const [record] = await this.store.appendBuilt((allocate, now) => [
      sealRecord(draftToRecord(draft, {
        recordId,
        revision: previous.revision + 1,
        sequence: allocate(),
        now,
        document,
        supersedes: previous.revision,
      })),
    ]);
    this.frozen.clear();
    return record;
  }

  storeDocument(filename: string, bytes: Uint8Array): StoredDocument {
    const document: StoredDocument = {
      documentId: this.nextId("doc"),
      filename,
      checksum: sha256(bytes),
      bytes,
    };
    this.documents.set(document.documentId, document);
    return document;
  }

  authorizeDownload(documentId: string, isAdmin: boolean, nowMs: number): ReceiptGrant {
    return authorizeReceipt({
      isAdmin,
      document: this.documents.get(documentId) ?? null,
      nowMs,
    });
  }

  async importStatement(bytes: Uint8Array, claimedChecksum?: string): Promise<{
    status: "imported" | "duplicate";
    checksum: string;
    residuals: PayoutResidual[];
  }> {
    const checksum = sha256(bytes);
    if (claimedChecksum && claimedChecksum !== checksum) throw new MoneyError("checksum_mismatch");
    const existing = this.statements.get(checksum);
    if (existing) {
      if (!bytesEqual(existing, bytes)) throw new MoneyError("immutable_statement_conflict");
      return { status: "duplicate", checksum, residuals: [] };
    }
    const text = new TextDecoder().decode(bytes);
    const rows = parseStatement(text);
    const records = await this.store.recordsAt(this.store.currentWatermark());
    const residuals: PayoutResidual[] = [];
    const built = await this.store.appendBuilt((allocate, now) => {
      const posted: FinanceRecord[] = [];
      for (const row of rows) {
        if (row.rowType === "balance") {
          this.balances.push({
            financial_account_id: row.accountId,
            account_kind: row.accountKind,
            as_of: row.occurredAt,
            additive: false,
            amount: {
              amount: row.amount,
              currency: row.currency,
              quality: "actual",
            },
          });
          continue;
        }
        const sequence = allocate();
        const recordId = this.nextId(row.rowType === "transfer" ? "transfer" : "settlement");
        if (row.rowType === "settlement") {
          residuals.push(residualFor(recordId, row, records));
        }
        posted.push(sealRecord(statementRecord(row, recordId, sequence, now)));
      }
      return posted;
    });
    void built;
    this.residuals.push(...residuals);
    this.statements.set(checksum, bytes);
    this.frozen.clear();
    return { status: "imported", checksum, residuals };
  }

  async snapshot(query: SnapshotQuery): Promise<MoneyPageModel> {
    if (query.basis !== "purchase" && query.basis !== "settled_cash") {
      throw new MoneyError("unsupported_basis");
    }
    const summary = await summarizeProduction(this.store, {
      from: query.from,
      to: query.to,
      snapshotId: query.snapshotId,
      now: this.store.clock(),
      source: query.source,
      channel: query.channel,
    });
    const cacheKey = `${summary.snapshot_id}|${query.basis}|${query.from}|${query.to}|${query.source ?? ""}|${query.channel ?? ""}`;
    const cached = this.frozen.get(cacheKey);
    if (cached) return cached;
    const records = (await this.store.recordsAt(summary.high_watermark)).filter((record) =>
      (!query.source || record.source_system === query.source) &&
      (!query.channel || record.channel === query.channel)
    );
    const model = buildModel(summary, records, query, this.balances, this.residuals);
    this.frozen.set(cacheKey, model);
    return model;
  }

  private async latest(recordId: string): Promise<FinanceRecord> {
    const records = await this.store.recordsAt(this.store.currentWatermark());
    const record = records.find((item) => item.record_id === recordId);
    if (!record) throw new MoneyError("record_not_found");
    return record;
  }

  private assertMutable(record: FinanceRecord): void {
    if (IMMUTABLE_SOURCES.has(record.source_system)) {
      throw new MoneyError("imported_evidence_immutable");
    }
  }

  private requireDraft(draftId: string): MoneyDraft {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new MoneyError("draft_not_found");
    return draft;
  }

  private nextId(prefix: string): string {
    this.localSeq += 1;
    return `${prefix}.${this.localSeq}`;
  }
}

function validateDraft(input: MoneyDraftInput): void {
  fiatExponent(input.currency.toUpperCase());
  parseDecimal(input.amount);
  if (input.taxAmount) parseDecimal(input.taxAmount);
  const category = input.category.trim().toLowerCase();
  if (!category) throw new MoneyError("category_required");
  if (REJECTED_CATEGORIES.has(category)) throw new MoneyError("shared_overhead_owned_by_simnetiq");
  if (input.vatRecoverable == null && !input.vatReason && input.kind !== "manual_income") {
    input.vatReason = "vat_status_unconfirmed";
  }
  if (input.servicePeriod && Date.parse(input.servicePeriod.to) <= Date.parse(input.servicePeriod.from)) {
    throw new MoneyError("invalid_service_period");
  }
}

function draftToRecord(
  draft: MoneyDraft,
  ids: { recordId: string; revision: number; sequence: string; now: string; document: StoredDocument | null; supersedes?: number },
): FinanceRecord {
  const currency = draft.currency.toUpperCase();
  const scale = fiatExponent(currency);
  const amount = formatDecimal(rescale(parseDecimal(draft.amount), scale), scale);
  const manualIncome = draft.kind === "manual_income";
  const record: FinanceRecord = {
    record_id: ids.recordId,
    revision: ids.revision,
    change_sequence: ids.sequence,
    record_type: manualIncome ? "sale" : draft.kind === "direct_cost" ? "direct_cost" : "expense",
    project_id: "doppler",
    source_system: "manual",
    source_account_id: draft.paymentAccountId || "manual.unspecified",
    environment: "production",
    external_object_id: draft.draftId,
    economic_transaction_id: `econ.manual.${ids.recordId}`,
    occurred_at: draft.occurredAt,
    updated_at: ids.now,
    status: "posted",
    original_amount: { amount, currency, quality: "actual" },
    quality: "actual",
    coverage: "partial",
    formula_version: FORMULA_VERSION,
    content_hash: "",
    economic_direction: manualIncome ? "inflow" : "outflow",
    counts_as_new_revenue: manualIncome,
    acquisition: {
      source: draft.acquisitionSource || "manual",
      medium: null,
      campaign: null,
      model: null,
      window_days: null,
      consent: "not_applicable",
    },
    source_as_of: ids.now,
    retrieved_at: ids.now,
    tax_inclusion: draft.taxInclusion ?? "unknown",
    vat_recoverable: draft.vatRecoverable ?? null,
    vat_treatment_reason: draft.vatReason ?? "vat_status_unconfirmed",
  };
  if (ids.supersedes) record.supersedes_revision = ids.supersedes;
  if (!manualIncome) record.expense_category = draft.category;
  if (draft.vendor) record.vendor_reference = draft.vendor;
  if (draft.servicePeriod) record.service_period = draft.servicePeriod;
  if (draft.paidAt) record.settled_at = draft.paidAt;
  if (draft.dueAt) record.due_at = draft.dueAt;
  if (draft.paymentAccountId) record.financial_account_id = draft.paymentAccountId;
  if (draft.channel) record.channel = draft.channel;
  if (draft.processor) record.processor = draft.processor;
  if (draft.store) record.store = draft.store;
  if (draft.taxAmount) {
    record.entered_tax = {
      amount: formatDecimal(rescale(parseDecimal(draft.taxAmount), scale), scale),
      currency,
      quality: "actual",
    };
  }
  if (ids.document) {
    record.document_refs = [{ document_id: ids.document.documentId, checksum_sha256: ids.document.checksum }];
  }
  return record;
}

function statementRecord(
  row: StatementRow,
  recordId: string,
  sequence: string,
  now: string,
): FinanceRecord {
  const transfer = row.rowType === "transfer";
  return {
    record_id: recordId,
    revision: 1,
    change_sequence: sequence,
    record_type: transfer ? "transfer" : "settlement",
    project_id: "doppler",
    source_system: "statement_import",
    source_account_id: row.accountId,
    environment: "production",
    external_object_id: row.externalId,
    economic_transaction_id: `econ.statement.${recordId}`,
    occurred_at: row.occurredAt,
    updated_at: now,
    status: "posted",
    original_amount: { amount: row.amount, currency: row.currency, quality: "actual" },
    quality: "actual",
    coverage: "partial",
    formula_version: FORMULA_VERSION,
    content_hash: "",
    economic_direction: transfer ? "transfer" : "inflow",
    counts_as_new_revenue: false,
    financial_account_id: row.accountId,
    ...(transfer ? { destination_account_id: row.destinationAccountId } : {}),
    settled_at: row.occurredAt,
    acquisition: {
      source: "statement_import",
      medium: null,
      campaign: null,
      model: null,
      window_days: null,
      consent: "not_applicable",
    },
    source_as_of: now,
    retrieved_at: now,
  };
}

function sealRecord(record: FinanceRecord): FinanceRecord {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (key === "content_hash" || value === undefined) continue;
    body[key] = value;
  }
  return { ...(body as unknown as FinanceRecord), content_hash: contentHash(body) };
}

export function assembleMoneyModel(
  summary: Awaited<ReturnType<typeof summarizeProduction>>,
  records: FinanceRecord[],
  query: SnapshotQuery,
  balances: BalanceRow[],
  residuals: PayoutResidual[],
): MoneyPageModel {
  return buildModel(summary, records, query, balances, residuals);
}

function buildModel(
  summary: Awaited<ReturnType<typeof summarizeProduction>>,
  records: FinanceRecord[],
  query: SnapshotQuery,
  balances: BalanceRow[],
  residuals: PayoutResidual[],
): MoneyPageModel {
  const currencies = new Set<string>(summary.native.map((row) => row.currency));
  for (const record of records) {
    if (record.original_amount.currency) currencies.add(record.original_amount.currency);
  }
  const native = [...currencies].sort().map((currency) => {
    const sales = query.basis === "purchase"
      ? summary.native.find((row) => row.currency === currency) ?? null
      : null;
    const direct = costMetric(records, "direct_cost", currency, query, summary.snapshot_id);
    const operating = costMetric(records, "expense", currency, query, summary.snapshot_id);
    const proceeds = sales ? fromSummary(sales.metrics.net_proceeds) : unavailableMetric(currency, "settled_cash_sales_unsupported", ["sale"], query, summary.snapshot_id);
    const contribution = profitMetric(proceeds, direct, currency, query, summary.snapshot_id, ["sale", "direct_cost"], "missing_direct_costs");
    const operatingProfit = profitMetric(contribution, operating, currency, query, summary.snapshot_id, ["sale", "expense"], "incomplete_costs");
    return {
      currency,
      metrics: {
        gross_customer_sales: sales
          ? fromSummary(sales.metrics.gross_customer_sales)
          : unavailableMetric(currency, query.basis === "purchase" ? "no_production_sales_in_cutoff" : "settled_cash_sales_unsupported", ["sale"], query, summary.snapshot_id),
        refunded_principal: sales
          ? fromSummary(sales.metrics.refunded_principal)
          : unavailableMetric(currency, query.basis === "purchase" ? "no_production_sales_in_cutoff" : "settled_cash_sales_unsupported", ["refund", "chargeback"], query, summary.snapshot_id),
        sales_tax: sales
          ? fromSummary(sales.metrics.sales_tax)
          : unavailableMetric(currency, query.basis === "purchase" ? "no_production_sales_in_cutoff" : "settled_cash_sales_unsupported", ["sale"], query, summary.snapshot_id),
        store_and_processor_fees: sales
          ? fromSummary(sales.metrics.store_and_processor_fees)
          : unavailableMetric(currency, query.basis === "purchase" ? "no_production_sales_in_cutoff" : "settled_cash_sales_unsupported", ["fee"], query, summary.snapshot_id),
        net_sales: sales
          ? fromSummary(sales.metrics.net_sales)
          : unavailableMetric(currency, query.basis === "purchase" ? "no_production_sales_in_cutoff" : "settled_cash_sales_unsupported", ["sale", "refund"], query, summary.snapshot_id),
        net_proceeds: proceeds,
        direct_costs: direct,
        contribution_profit: contribution,
        operating_expenses: operating,
        operating_profit: operatingProfit,
        net_profit: unavailableMetric(currency, "incomplete_costs_and_taxes", ["sale", "expense"], query, summary.snapshot_id),
      },
      margin: unavailableMetric(
        currency,
        "incomplete_costs_and_taxes",
        ["sale", "expense"],
        query,
        summary.snapshot_id,
      ),
    };
  });
  const missing = new Set<string>(summary.coverage.missing);
  for (const row of native) {
    for (const metric of Object.values(row.metrics)) {
      if (metric.amount === null && metric.reason) missing.add(metric.reason);
    }
    if (row.margin.amount === null && row.margin.reason) missing.add(row.margin.reason);
  }
  const evidenceBalances = balances.filter((row) => row.as_of < query.to);
  return {
    snapshot_id: summary.snapshot_id,
    data_as_of: summary.data_as_of,
    high_watermark: summary.high_watermark,
    basis: query.basis,
    timezone: TIMEZONE_PROPOSAL,
    timezone_confirmed: false,
    posting: false,
    formula_version: FORMULA_VERSION,
    money_formula_version: MONEY_FORMULA_VERSION,
    coverage: {
      status: native.length === 0 ? "missing" : "partial",
      missing: [...missing].sort(),
    },
    native,
    drill: drillRows(records, query),
    balances: evidenceBalances.length > 0
      ? evidenceBalances
      : [{
          financial_account_id: "unverified",
          account_kind: "cash",
          as_of: summary.data_as_of,
          additive: false,
          amount: {
            amount: null,
            currency: native[0]?.currency ?? "USD",
            quality: "unavailable",
            reason: "missing_statement_evidence",
          },
        }],
    reconciliation: {
      posting: false,
      runs: [{
        run_id: `recon.${summary.snapshot_id}`,
        compared: ["source_admin", "export_api"],
        status: residuals.some((residual) => residual.amount === null || !isZeroDecimal(residual.amount))
          ? "incomplete"
          : "match",
        residuals,
      }],
    },
    gbp: {
      amount: null,
      currency: "GBP",
      quality: "unavailable",
      reason: "missing_fx_evidence",
      policy_version: "gbp-unconfigured",
    },
  };
}

function fromSummary(metric: MetricValue): MoneyMetric {
  return metric;
}

function unavailableMetric(
  currency: string,
  reason: string,
  types: string[],
  query: SnapshotQuery,
  snapshotId: string,
): MoneyMetric {
  return {
    amount: null,
    currency,
    quality: "unavailable",
    reason,
    coverage: "missing",
    drill_through: drillFilter(snapshotId, query, types),
  };
}

function actualMetric(
  amount: string,
  currency: string,
  types: string[],
  query: SnapshotQuery,
  snapshotId: string,
): MoneyMetric {
  return {
    amount,
    currency,
    quality: "actual",
    coverage: amount === formatZero(fiatExponent(currency)) ? "complete" : "partial",
    drill_through: drillFilter(snapshotId, query, types),
  };
}

function drillFilter(snapshotId: string, query: SnapshotQuery, types: string[]): MoneyMetric["drill_through"] {
  return {
    dataset: "finance.records",
    snapshot_id: snapshotId,
    filter: {
      project_id: PROJECT_ID,
      from: query.from,
      to: query.to,
      basis: query.basis,
      record_types: types,
    },
  };
}

function costMetric(
  records: FinanceRecord[],
  type: "expense" | "direct_cost",
  currency: string,
  query: SnapshotQuery,
  snapshotId: string,
): MoneyMetric {
  const posted = records.filter((record) =>
    record.status === "posted" &&
    record.record_type === type &&
    record.original_amount.currency === currency &&
    record.original_amount.amount,
  );
  if (posted.length === 0) {
    return unavailableMetric(
      currency,
      type === "direct_cost" ? "direct_costs_not_recorded" : "operating_expenses_not_recorded",
      [type],
      query,
      snapshotId,
    );
  }
  const scale = fiatExponent(currency);
  const portions = posted.map((record) => recognizedAmount(record, query, scale));
  return actualMetric(addDecimals(portions, scale), currency, [type], query, snapshotId);
}

function recognizedAmount(record: FinanceRecord, query: SnapshotQuery, scale: number): string {
  const amount = record.original_amount.amount;
  if (!amount) return formatZero(scale);
  if (query.basis === "settled_cash") {
    const paid = record.settled_at;
    if (paid && paid >= query.from && paid < query.to) return amount;
    return formatZero(scale);
  }
  const period = record.service_period;
  if (!period) {
    return record.occurred_at >= query.from && record.occurred_at < query.to ? amount : formatZero(scale);
  }
  return servicePeriodSlice(amount, scale, period, query);
}

export function servicePeriodSlice(
  amount: string,
  scale: number,
  period: { from: string; to: string },
  window: { from: string; to: string },
): string {
  const periodFrom = Date.parse(period.from);
  const periodTo = Date.parse(period.to);
  const total = periodTo - periodFrom;
  const overlap = overlapMs(period.from, period.to, window.from, window.to);
  if (total <= 0) throw new MoneyError("invalid_service_period");
  if (overlap <= 0) return formatZero(scale);
  if (overlap >= total) return formatDecimal(rescale(parseDecimal(amount), scale), scale);
  const units = rescale(parseDecimal(amount), scale);
  const containsEnd = Date.parse(window.to) >= periodTo && Date.parse(window.from) < periodTo;
  const share = containsEnd
    ? units - (units * BigInt(total - overlap) / BigInt(total))
    : (units * BigInt(overlap)) / BigInt(total);
  return formatDecimal(share, scale);
}

function profitMetric(
  left: MoneyMetric,
  right: MoneyMetric,
  currency: string,
  query: SnapshotQuery,
  snapshotId: string,
  types: string[],
  missingReason: string,
): MoneyMetric {
  if (!left.amount || !right.amount) {
    return unavailableMetric(currency, left.reason ?? right.reason ?? missingReason, types, query, snapshotId);
  }
  const scale = fiatExponent(currency);
  const difference = subtractDecimals(left.amount, right.amount, scale);
  if (difference === null) {
    return unavailableMetric(currency, "costs_exceed_proceeds", types, query, snapshotId);
  }
  return actualMetric(difference, currency, types, query, snapshotId);
}

function drillRows(records: FinanceRecord[], query: SnapshotQuery): DrillRow[] {
  return records
    .filter((record) => record.status === "posted")
    .filter((record) => {
      if (record.record_type === "expense" || record.record_type === "direct_cost") {
        const currency = record.original_amount.currency;
        if (!currency || !record.original_amount.amount) return false;
        return recognizedAmount(record, query, fiatExponent(currency)) !== formatZero(fiatExponent(currency));
      }
      return record.occurred_at >= query.from && record.occurred_at < query.to;
    })
    .map((record) => ({
      record_id: record.record_id,
      revision: record.revision,
      record_type: record.record_type,
      channel: record.channel ?? null,
      processor: record.processor ?? null,
      store: record.store ?? null,
      acquisition_source: record.acquisition?.source ?? null,
      amount: record.original_amount.amount,
      currency: record.original_amount.currency ?? record.original_amount.asset ?? null,
    }));
}

function overlapMs(aFrom: string, aTo: string, bFrom: string, bTo: string): number {
  const start = Math.max(Date.parse(aFrom), Date.parse(bFrom));
  const end = Math.min(Date.parse(aTo), Date.parse(bTo));
  return Math.max(0, end - start);
}

function formatZero(scale: number): string {
  return scale === 0 ? "0" : `0.${"0".repeat(scale)}`;
}

interface StatementRow {
  rowType: "settlement" | "transfer" | "balance";
  externalId: string;
  occurredAt: string;
  amount: string;
  currency: string;
  accountId: string;
  accountKind: AccountKind;
  destinationAccountId: string;
  matchedRecordIds: string[];
}

function parseStatement(text: string): StatementRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) throw new MoneyError("empty_statement");
  const header = lines[0].split(",").map((cell) => cell.trim());
  for (const name of ["row_type", "external_id", "occurred_at", "amount", "currency", "account_id", "account_kind"]) {
    if (!header.includes(name)) throw new MoneyError(`missing_column:${name}`);
  }
  const seen = new Set<string>();
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    if (cells.length !== header.length) throw new MoneyError("ragged_row");
    const raw: Record<string, string> = {};
    header.forEach((key, index) => {
      raw[key] = cells[index].trim();
    });
    if (seen.has(raw.external_id)) throw new MoneyError("duplicate_statement_row");
    seen.add(raw.external_id);
    if (!ACCOUNT_KINDS.has(raw.account_kind)) throw new MoneyError("unknown_account_kind");
    if (raw.row_type !== "settlement" && raw.row_type !== "transfer" && raw.row_type !== "balance") {
      throw new MoneyError("unknown_row_type");
    }
    const currency = raw.currency.toUpperCase();
    const scale = fiatExponent(currency);
    const amount = formatDecimal(rescale(parseDecimal(raw.amount), scale), scale);
    if (raw.row_type === "transfer" && !raw.destination_account_id) {
      throw new MoneyError("transfer_destination_required");
    }
    return {
      rowType: raw.row_type as StatementRow["rowType"],
      externalId: raw.external_id,
      occurredAt: raw.occurred_at,
      amount,
      currency,
      accountId: raw.account_id,
      accountKind: raw.account_kind as AccountKind,
      destinationAccountId: raw.destination_account_id ?? "",
      matchedRecordIds: (raw.matched_record_ids ?? "").split("|").map((id) => id.trim()).filter(Boolean),
    };
  });
}

function residualFor(settlementId: string, row: StatementRow, records: FinanceRecord[]): PayoutResidual {
  const scale = fiatExponent(row.currency);
  let matched = BigInt(0);
  for (const recordId of row.matchedRecordIds) {
    const record = records.find((item) => item.record_id === recordId && item.status === "posted");
    if (!record?.original_amount.amount || record.original_amount.currency !== row.currency) {
      return {
        code: "payout_residual",
        settlement_id: settlementId,
        amount: null,
        currency: row.currency,
        quality: "unavailable",
        reason: record ? "currency_mismatch" : "unmatched_sale",
      };
    }
    matched += rescale(parseDecimal(record.original_amount.amount), scale);
  }
  const payout = rescale(parseDecimal(row.amount), scale);
  if (matched > payout) {
    return {
      code: "payout_residual",
      settlement_id: settlementId,
      amount: null,
      currency: row.currency,
      quality: "unavailable",
      reason: "matched_sales_exceed_payout",
    };
  }
  return {
    code: "payout_residual",
    settlement_id: settlementId,
    amount: formatDecimal(payout - matched, scale),
    currency: row.currency,
    quality: "actual",
  };
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
