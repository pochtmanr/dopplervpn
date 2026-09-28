import type { FORMULA_VERSION } from "./constants";

export type ReportingEnvironment = "production" | "sandbox" | "unknown";
export type RecordEnvironment = "production" | "sandbox" | "test";
export type SourceSystem = "revolut" | "oxapay" | "revenuecat" | "invoice";
export type EventKind =
  | "sale"
  | "refund"
  | "refund_reversal"
  | "chargeback"
  | "void"
  | "correction"
  | "entitlement_only"
  | "fee";

export type TaxInclusion = "inclusive" | "exclusive" | "unknown";
export type FeeComponentType = "processor_fee" | "store_commission" | "network_fee";

export interface AttributionEvidence {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  origin?: string | null;
  consent?: "unknown" | "granted" | "denied";
}

export interface CryptoEvidence {
  asset: string;
  network: string;
  amount: string;
}

export interface FxEvidence {
  rate: string;
  rateSource: string;
  effectiveAt: string;
}

export interface Observation {
  sourceSystem: SourceSystem;
  transportId: string;
  environment: ReportingEnvironment;
  externalObjectId: string;
  economicTransactionId: string;
  eventKind: EventKind;
  occurredAt: string;
  sourceAccountId: string;
  amount: string | null;
  currency: string | null;
  crypto: CryptoEvidence | null;
  tax: { amount: string; inclusion: TaxInclusion } | null;
  fee: { amount: string; componentType: FeeComponentType } | null;
  parentExternalObjectId: string | null;
  targetRecordId: string | null;
  aliasIds: string[];
  attribution: AttributionEvidence | null;
  productId: string | null;
  processor: string | null;
  store: string | null;
  channel: string | null;
  fx: FxEvidence | null;
  amountReason: string | null;
  postingRole: "primary" | "alias" | null;
  feeComponentId: string | null;
  /** Fiat invoice kept beside crypto payment evidence. Absent on non-crypto sales. */
  fiatInvoice?: { amount: string; currency: string } | null;
}

export interface MoneyValue {
  amount: string | null;
  quality: "actual" | "estimated" | "legacy_derived" | "unavailable";
  reason?: string;
  currency?: string;
  asset?: string;
  network?: string;
}

export interface ComponentValue {
  component_id: string;
  component_type:
    | "processor_fee"
    | "store_commission"
    | "sales_tax"
    | "network_fee"
    | "fee_reversal"
    | "tax_reversal";
  amount: MoneyValue;
  posting_role: "primary" | "alias";
  vat_recoverable: boolean | null;
  vat_treatment_reason?: string;
}

export interface FinanceRecord {
  record_id: string;
  revision: number;
  change_sequence: string;
  record_type:
    | "sale"
    | "refund"
    | "refund_reversal"
    | "chargeback"
    | "fee"
    | "expense"
    | "direct_cost"
    | "settlement"
    | "transfer"
    | "opening_balance";
  project_id: "doppler";
  source_system: string;
  source_account_id: string;
  environment: RecordEnvironment;
  external_object_id: string;
  economic_transaction_id: string;
  alias_ids?: string[];
  occurred_at: string;
  updated_at: string;
  status: "posted" | "pending" | "void";
  original_amount: MoneyValue;
  quality: "actual" | "unavailable";
  coverage: "complete" | "partial" | "missing";
  formula_version: typeof FORMULA_VERSION;
  content_hash: string;
  economic_direction: "inflow" | "outflow" | "transfer";
  counts_as_new_revenue: boolean;
  counts_as_gross_refunded_principal?: boolean;
  parent_record_id?: string;
  supersedes_revision?: number;
  component_id?: string;
  posting_role?: "primary" | "alias";
  components?: ComponentValue[];
  source_gbp_valuation?: SourceGbpValuation;
  product_id?: string;
  channel?: string;
  store?: string;
  processor?: string;
  tax_inclusion?: TaxInclusion;
  /** Expense tax entered by an admin. Not a sales-tax component, so it is not booked twice. */
  entered_tax?: MoneyValue;
  vat_recoverable?: boolean | null;
  vat_treatment_reason?: string;
  service_period?: { from: string; to: string };
  expense_category?: string;
  vendor_reference?: string;
  financial_account_id?: string;
  destination_account_id?: string;
  document_refs?: Array<{ document_id: string; checksum_sha256: string }>;
  settled_at?: string;
  due_at?: string | null;
  fiat_invoice?: MoneyValue;
  acquisition: {
    source: string;
    medium: string | null;
    campaign: string | null;
    model: string | null;
    window_days: number | null;
    consent: "unknown" | "granted" | "denied" | "not_applicable";
  };
  source_as_of: string;
  retrieved_at: string;
}

export interface SourceGbpValuation {
  amount: string | null;
  currency: "GBP";
  quality: "actual" | "unavailable";
  reason?: string;
  rate: string | null;
  rate_source: string | null;
  effective_at: string | null;
  policy_version: "gbp-unconfigured";
  source_amount: string | null;
  source_currency: string;
}

export interface TransportRow {
  sourceSystem: string;
  transportId: string;
  payloadHash: string;
  environment: ReportingEnvironment;
  externalObjectId: string;
  economicTransactionId: string;
  body: Observation;
}

export interface QuarantineRow {
  sourceSystem: string;
  transportId: string;
  payloadHash: string;
  reason: string;
  environment: ReportingEnvironment;
  body: Observation;
}

export interface StoredFx {
  economicTransactionId: string;
  policyVersion: "gbp-unconfigured";
  rate: string | null;
  rateSource: string | null;
  effectiveAt: string | null;
  sourceAmount: string | null;
  sourceCurrency: string | null;
  reason: string;
}

export interface Checkpoint {
  cursorCreatedAt: string | null;
  cursorId: string | null;
  coveredThrough: string | null;
  retryCount: number;
  lastError: string | null;
}

export interface Snapshot {
  snapshotId: string;
  environment: "production";
  dataAsOf: string;
  highWatermark: string;
  formulaVersion: typeof FORMULA_VERSION;
}

export interface StoreView {
  transportHash: string | null;
  records: FinanceRecord[];
}

export interface ApplyResult {
  status: "ok" | "duplicate" | "conflict" | "quarantined" | "excluded";
  economicTransactionId: string;
  recordId?: string;
  reason?: string;
}

export interface ReportingStore {
  apply(obs: Observation): Promise<ApplyResult>;
  acquireLease(source: string, owner: string, nowMs: number, ttlMs: number): Promise<boolean>;
  releaseLease(source: string, owner: string): Promise<void>;
  getCheckpoint(source: string): Promise<Checkpoint | null>;
  saveCheckpoint(source: string, checkpoint: Checkpoint): Promise<void>;
  noteFailure(source: string, error: string): Promise<number>;
  resetFailures(source: string): Promise<void>;
  createSnapshot(now: Date): Promise<Snapshot>;
  getSnapshot(id: string): Promise<Snapshot | null>;
  recordsAt(watermark: string): Promise<FinanceRecord[]>;
  /** Every revision at or under the watermark, including superseded rows. */
  revisionsAt(watermark: string): Promise<FinanceRecord[]>;
  exclusionCounts(): Promise<{ sandbox: number; quarantined: number }>;
}
