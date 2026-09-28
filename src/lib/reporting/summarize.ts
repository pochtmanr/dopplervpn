import {
  FORMULA_VERSION,
  FX_POLICY_VERSION,
  PROJECT_ID,
  SERVICE_SCHEMA,
  TIMEZONE_PROPOSAL,
  fiatExponent,
} from "./constants";
import { addDecimals, subtractDecimals } from "./decimal";
import type { ComponentValue, FinanceRecord, MoneyValue, ReportingStore } from "./types";

export interface SummaryQuery {
  from: string;
  to: string;
  snapshotId?: string;
  now?: Date;
  source?: string;
  channel?: string;
}

export interface MetricValue {
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
      basis: "purchase";
      record_types: string[];
    };
  };
}

export interface NativeSummary {
  currency: string;
  tax_basis: "inclusive" | "exclusive" | "unknown" | "mixed";
  amount_basis: "provider_charge";
  metrics: {
    gross_customer_sales: MetricValue;
    refunded_principal: MetricValue;
    sales_tax: MetricValue;
    store_and_processor_fees: MetricValue;
    net_sales: MetricValue;
    net_proceeds: MetricValue;
    direct_costs: MetricValue;
    contribution_profit: MetricValue;
    operating_expenses: MetricValue;
    operating_profit: MetricValue;
    net_profit: MetricValue;
  };
}

export interface CryptoSummary {
  asset: string;
  network: string;
  gross: string;
  quality: "actual";
}

export interface ReportingSummary {
  schema: typeof SERVICE_SCHEMA;
  contract_version: "business-os.contract.v1";
  formula_version: typeof FORMULA_VERSION;
  basis: "purchase";
  posting: false;
  timezone_proposal: typeof TIMEZONE_PROPOSAL;
  timezone_confirmed: false;
  snapshot_id: string;
  data_as_of: string;
  high_watermark: string;
  period: { from: string; to: string; timezone: typeof TIMEZONE_PROPOSAL };
  native: NativeSummary[];
  crypto: CryptoSummary[];
  gbp: {
    amount: null;
    currency: "GBP";
    quality: "unavailable";
    reason: "missing_fx_evidence";
    policy_version: typeof FX_POLICY_VERSION;
  };
  coverage: { status: "complete" | "partial" | "missing"; missing: string[] };
  excluded: { sandbox_observations: number; quarantined_observations: number };
  unsupported: string[];
}

const UNSUPPORTED = [
  "revenuecat_monetary_history",
  "historical_invoices_without_environment",
  "provider_refund_webhooks",
  "direct_costs",
  "operating_expenses",
];

export async function summarizeProduction(
  store: ReportingStore,
  query: SummaryQuery,
): Promise<ReportingSummary> {
  const now = query.now ?? new Date("2026-09-28T12:00:00Z");
  const snapshot = query.snapshotId
    ? await store.getSnapshot(query.snapshotId)
    : await store.createSnapshot(now);
  if (!snapshot) throw new Error("snapshot_not_found");
  const records = (await store.recordsAt(snapshot.highWatermark)).filter(
    (record) =>
      record.environment === "production" &&
      record.occurred_at >= query.from &&
      record.occurred_at < query.to &&
      (!query.source || record.source_system === query.source) &&
      (!query.channel || record.channel === query.channel),
  );
  const excluded = await store.exclusionCounts();
  const native = summarizeFiat(records, snapshot.snapshotId, query.from, query.to);
  const crypto = summarizeCrypto(records);
  const missing = new Set<string>();
  if (native.length === 0 && crypto.length === 0) missing.add("no_production_sales_in_cutoff");
  for (const row of native) {
    for (const [name, metric] of Object.entries(row.metrics)) {
      if (metric.amount === null) missing.add(metric.reason ?? name);
    }
  }
  missing.add("fx");
  const status = native.length === 0 && crypto.length === 0
    ? "missing"
    : missing.size > 1
      ? "partial"
      : "complete";
  return {
    schema: SERVICE_SCHEMA,
    contract_version: "business-os.contract.v1",
    formula_version: FORMULA_VERSION,
    basis: "purchase",
    posting: false,
    timezone_proposal: TIMEZONE_PROPOSAL,
    timezone_confirmed: false,
    snapshot_id: snapshot.snapshotId,
    data_as_of: snapshot.dataAsOf,
    high_watermark: snapshot.highWatermark,
    period: { from: query.from, to: query.to, timezone: TIMEZONE_PROPOSAL },
    native,
    crypto,
    gbp: {
      amount: null,
      currency: "GBP",
      quality: "unavailable",
      reason: "missing_fx_evidence",
      policy_version: FX_POLICY_VERSION,
    },
    coverage: { status, missing: [...missing].sort() },
    excluded: {
      sandbox_observations: excluded.sandbox,
      quarantined_observations: excluded.quarantined,
    },
    unsupported: UNSUPPORTED,
  };
}

function summarizeFiat(
  records: FinanceRecord[],
  snapshotId: string,
  from: string,
  to: string,
): NativeSummary[] {
  const postedRecords = records.filter((record) => record.status === "posted");
  const currencies = [...new Set(
    postedRecords
      .map((record) => record.original_amount.currency)
      .filter((currency): currency is string => !!currency),
  )].sort();
  return currencies.map((currency) => {
    const posted = postedRecords.filter((record) => record.original_amount.currency === currency);
    const scale = fiatExponent(currency);
    const sales = posted.filter((record) => record.record_type === "sale" && record.counts_as_new_revenue);
    const gross = sumAmounts(sales.map((record) => record.original_amount), scale);
    const refunded = refundedPrincipal(posted, scale);
    const tax = componentSum(posted, ["sales_tax", "tax_reversal"], scale, sales.length + refundCount(posted) > 0);
    const fees = componentSum(posted, ["processor_fee", "store_commission", "network_fee", "fee_reversal"], scale, sales.length > 0);
    const taxBasis = taxBasisOf(sales);
    const netSales = netSalesAmount(gross, refunded, tax, taxBasis, scale);
    const netProceeds = netSales.amount && fees.amount
      ? subtractDecimals(netSales.amount, fees.amount, scale)
      : null;
    const metric = (
      amount: string | null,
      reason: string | null,
      types: string[],
      coverage: MetricValue["coverage"],
    ): MetricValue => ({
      amount,
      currency,
      quality: amount === null ? "unavailable" : "actual",
      ...(amount === null && reason ? { reason } : {}),
      coverage: amount === null ? "missing" : coverage,
      drill_through: {
        dataset: "finance.records",
        snapshot_id: snapshotId,
        filter: {
          project_id: PROJECT_ID,
          from,
          to,
          basis: "purchase",
          record_types: types,
        },
      },
    });
    const unavailable = (reason: string, types: string[]): MetricValue =>
      metric(null, reason, types, "missing");
    return {
      currency,
      tax_basis: taxBasis,
      amount_basis: "provider_charge",
      metrics: {
        gross_customer_sales: metric(gross.amount, gross.reason, ["sale"], gross.amount ? "complete" : "missing"),
        refunded_principal: metric(refunded.amount, refunded.reason, ["refund", "chargeback", "refund_reversal"], "complete"),
        sales_tax: metric(tax.amount, tax.reason, ["sale", "refund", "chargeback"], tax.amount ? "complete" : "missing"),
        store_and_processor_fees: metric(fees.amount, fees.reason, ["sale", "fee"], fees.amount ? "complete" : "missing"),
        net_sales: metric(netSales.amount, netSales.reason, ["sale", "refund", "chargeback", "refund_reversal"], netSales.amount ? "complete" : "missing"),
        net_proceeds: metric(
          netProceeds,
          netProceeds === null ? fees.reason ?? netSales.reason ?? "missing_processor_fees" : null,
          ["sale", "refund", "fee"],
          netProceeds ? "complete" : "missing",
        ),
        direct_costs: unavailable("direct_costs_not_recorded", ["direct_cost"]),
        contribution_profit: unavailable("missing_direct_costs", ["sale", "direct_cost"]),
        operating_expenses: unavailable("operating_expenses_not_recorded", ["expense"]),
        operating_profit: unavailable("incomplete_costs", ["sale", "expense"]),
        net_profit: unavailable("incomplete_costs_and_taxes", ["sale", "expense"]),
      },
    };
  });
}

function summarizeCrypto(records: FinanceRecord[]): CryptoSummary[] {
  const groups = new Map<string, { asset: string; network: string; amounts: string[] }>();
  for (const record of records) {
    if (record.status !== "posted" || record.record_type !== "sale") continue;
    const amount = record.original_amount;
    if (!amount.asset || !amount.network || !amount.amount) continue;
    const key = `${amount.asset}:${amount.network}`;
    const group = groups.get(key) ?? { asset: amount.asset, network: amount.network, amounts: [] };
    group.amounts.push(amount.amount);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const scale = Math.max(...group.amounts.map((amount) => amount.split(".")[1]?.length ?? 0));
    return {
      asset: group.asset,
      network: group.network,
      gross: addDecimals(group.amounts, scale),
      quality: "actual" as const,
    };
  });
}

interface SumResult {
  amount: string | null;
  reason: string | null;
}

function sumAmounts(values: MoneyValue[], scale: number): SumResult {
  if (values.length === 0) return { amount: null, reason: "no_production_sales_in_cutoff" };
  if (values.some((value) => value.amount === null)) {
    return { amount: null, reason: values.find((value) => value.reason)?.reason ?? "missing_provider_amount" };
  }
  return { amount: addDecimals(values.map((value) => value.amount as string), scale), reason: null };
}

function refundedPrincipal(records: FinanceRecord[], scale: number): SumResult {
  const principal = records.filter(
    (record) =>
      (record.record_type === "refund" || record.record_type === "chargeback") &&
      record.counts_as_gross_refunded_principal !== false,
  );
  const reversals = records.filter((record) => record.record_type === "refund_reversal");
  const parts = [...principal, ...reversals];
  if (parts.some((record) => record.original_amount.amount === null)) {
    return { amount: null, reason: "missing_refund_principal" };
  }
  const added = principal.length === 0
    ? formatZero(scale)
    : addDecimals(principal.map((record) => record.original_amount.amount as string), scale);
  if (reversals.length === 0) return { amount: added, reason: null };
  const reversed = addDecimals(reversals.map((record) => record.original_amount.amount as string), scale);
  const net = subtractDecimals(added, reversed, scale);
  if (net === null) return { amount: null, reason: "reversal_exceeds_refunded_principal" };
  return { amount: net, reason: null };
}

function refundCount(records: FinanceRecord[]): number {
  return records.filter((record) => record.record_type === "refund" || record.record_type === "chargeback").length;
}

function componentSum(
  records: FinanceRecord[],
  types: ComponentValue["component_type"][],
  scale: number,
  required: boolean,
): SumResult {
  const missingReason = types.includes("sales_tax") ? "missing_sales_tax" : "missing_processor_fees";
  if (!required) return { amount: formatZero(scale), reason: null };
  const positive = types.filter(
    (type): type is "processor_fee" | "store_commission" | "network_fee" | "sales_tax" =>
      type !== "tax_reversal" && type !== "fee_reversal",
  );
  const reversal = types.filter(
    (type): type is "tax_reversal" | "fee_reversal" =>
      type === "tax_reversal" || type === "fee_reversal",
  );
  const sales = records.filter((record) => record.record_type === "sale");
  for (const sale of sales) {
    const hasComponent = (sale.components ?? []).some(
      (component) => component.posting_role === "primary" && (positive as readonly string[]).includes(component.component_type),
    );
    if (!hasComponent) return { amount: null, reason: missingReason };
  }
  const seen = new Set<string>();
  const amounts: string[] = [];
  const reversals: string[] = [];
  const take = (componentId: string, amount: string | null, into: string[]) => {
    if (seen.has(componentId)) return { amount: null, reason: "duplicate_fee_component" } as SumResult;
    seen.add(componentId);
    if (amount === null) return { amount: null, reason: missingReason } as SumResult;
    into.push(amount);
    return null;
  };
  for (const record of records) {
    if (record.record_type === "fee") {
      if (record.posting_role !== "primary" || !record.component_id) continue;
      const blocked = take(record.component_id, record.original_amount.amount, amounts);
      if (blocked) return blocked;
      continue;
    }
    for (const component of record.components ?? []) {
      if (component.posting_role !== "primary" || !types.includes(component.component_type)) continue;
      const into = (reversal as readonly string[]).includes(component.component_type) ? reversals : amounts;
      const blocked = take(component.component_id, component.amount.amount, into);
      if (blocked) return blocked;
    }
  }
  if (amounts.length === 0 && reversals.length === 0) return { amount: null, reason: missingReason };
  const base = amounts.length === 0 ? formatZero(scale) : addDecimals(amounts, scale);
  if (reversals.length === 0) return { amount: base, reason: null };
  const net = subtractDecimals(base, addDecimals(reversals, scale), scale);
  if (net === null) return { amount: null, reason: "reversal_exceeds_component" };
  return { amount: net, reason: null };
}

function taxBasisOf(sales: FinanceRecord[]): NativeSummary["tax_basis"] {
  const values = new Set(sales.map((sale) => sale.tax_inclusion ?? "unknown"));
  if (values.size === 0) return "unknown";
  if (values.size > 1) return "mixed";
  return [...values][0] as NativeSummary["tax_basis"];
}

function netSalesAmount(
  gross: SumResult,
  refunded: SumResult,
  tax: SumResult,
  basis: NativeSummary["tax_basis"],
  scale: number,
): SumResult {
  if (!gross.amount) return { amount: null, reason: gross.reason };
  if (!refunded.amount) return { amount: null, reason: refunded.reason };
  const afterRefunds = subtractDecimals(gross.amount, refunded.amount, scale);
  if (afterRefunds === null) return { amount: null, reason: "refunds_exceed_gross" };
  if (basis === "unknown" || basis === "mixed" || !tax.amount) {
    return { amount: null, reason: tax.reason ?? "unknown_tax_basis" };
  }
  if (basis === "exclusive") return { amount: afterRefunds, reason: null };
  const net = subtractDecimals(afterRefunds, tax.amount, scale);
  if (net === null) return { amount: null, reason: "tax_exceeds_sales" };
  return { amount: net, reason: null };
}

function formatZero(scale: number): string {
  return scale === 0 ? "0" : `0.${"0".repeat(scale)}`;
}
