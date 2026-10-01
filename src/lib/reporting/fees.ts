import { adjustmentObservation } from "./map-evidence";
import type { FinanceRecord, ReportingStore } from "./types";

/** A provider's own statement of what it kept from one payment. */
export interface ProviderFee {
  amount: string;
  currency: string;
}

/**
 * Looks up the fee each provider charged on one payment. `null` means the
 * provider gave no usable answer, and the sale stays without a fee rather
 * than getting a guessed one.
 */
export interface FeeLookup {
  /** Revolut's order id, which is the sale's external object id. */
  revolut(orderId: string): Promise<ProviderFee | null>;
  /** Our checkout order id, which is the sale's external object id. */
  oxapay(orderId: string): Promise<ProviderFee | null>;
}

export interface FeeImportResult {
  candidates: number;
  recorded: number;
  unresolved: number;
  failed: number;
}

const FEE_PROVIDERS = new Set(["revolut", "oxapay"]);

/** Sales from a fee-bearing provider that have no fee evidence yet. */
export function salesMissingFees(records: FinanceRecord[]): FinanceRecord[] {
  const covered = new Set(
    records
      .filter((record) => record.record_type === "fee" && record.status === "posted")
      .map((record) => record.economic_transaction_id),
  );
  return records.filter((record) =>
    record.record_type === "sale" &&
    record.status === "posted" &&
    record.environment === "production" &&
    FEE_PROVIDERS.has(record.source_system) &&
    !covered.has(record.economic_transaction_id) &&
    !(record.components ?? []).some((component) =>
      component.posting_role === "primary" &&
      (component.component_type === "processor_fee" || component.component_type === "network_fee")),
  );
}

/**
 * Records each provider's fee as a fee record on the sale's economic
 * transaction. Bounded per run so a slow provider cannot hold the cron; the
 * next run picks up whatever is still missing.
 */
export async function importProviderFees(
  store: ReportingStore,
  lookup: FeeLookup,
  options: { limit?: number; now?: Date } = {},
): Promise<FeeImportResult> {
  const snapshot = await store.createSnapshot(options.now ?? new Date());
  const missing = salesMissingFees(await store.recordsAt(snapshot.highWatermark));
  const batch = missing.slice(0, options.limit ?? 60);
  let recorded = 0;
  let unresolved = 0;
  let failed = 0;
  for (const sale of batch) {
    const provider = sale.source_system as "revolut" | "oxapay";
    let fee: ProviderFee | null;
    try {
      fee = provider === "revolut"
        ? await lookup.revolut(sale.external_object_id)
        : await lookup.oxapay(sale.external_object_id);
    } catch {
      failed += 1;
      continue;
    }
    if (!fee) {
      unresolved += 1;
      continue;
    }
    const result = await store.apply(adjustmentObservation({
      provider,
      eventKind: "fee",
      externalObjectId: `fee.${sale.external_object_id}`,
      saleExternalObjectId: sale.external_object_id,
      amount: fee.amount,
      currency: fee.currency,
      occurredAt: sale.occurred_at,
      transportId: `fee.${provider}.${sale.external_object_id}`,
      fee: { amount: fee.amount, componentType: "processor_fee" },
    }));
    if (result.status === "ok" || result.status === "duplicate") recorded += 1;
    else failed += 1;
  }
  return { candidates: missing.length, recorded, unresolved, failed };
}

/** Revolut minor units → decimal string, e.g. 21 → "0.21". */
export function minorToDecimal(minor: number, exponent = 2): string {
  const sign = minor < 0 ? "-" : "";
  const digits = String(Math.abs(Math.round(minor))).padStart(exponent + 1, "0");
  return exponent === 0
    ? `${sign}${digits}`
    : `${sign}${digits.slice(0, -exponent)}.${digits.slice(-exponent)}`;
}

/**
 * Sum of the fees Revolut reports on an order's payments, in one currency.
 * Revolut's payment objects carry `fees: [{ type, amount, currency }]` with
 * `amount` in minor units (older payloads nest `{ value, currency }`).
 * Returns null when nothing settled, a fee is unreadable, or fees span
 * currencies; those are unresolved, never zero.
 */
export function revolutFeeFromPayments(payments: unknown): ProviderFee | null {
  if (!Array.isArray(payments)) return null;
  const settled = payments.filter((payment) => {
    const state = String((payment as { state?: unknown }).state ?? "").toLowerCase();
    return state === "completed" || state === "captured" || state === "authorised" || state === "settled";
  });
  if (settled.length === 0) return null;
  let total = 0;
  let currency: string | null = null;
  for (const payment of settled) {
    const fees = (payment as { fees?: unknown }).fees;
    if (!Array.isArray(fees)) return null;
    for (const fee of fees) {
      const raw = fee as { amount?: unknown; currency?: unknown };
      const nested = raw.amount && typeof raw.amount === "object"
        ? raw.amount as { value?: unknown; currency?: unknown }
        : null;
      const value = nested ? nested.value : raw.amount;
      const code = String((nested ? nested.currency : raw.currency) ?? "").toUpperCase();
      if (typeof value !== "number" || !Number.isFinite(value) || !code) return null;
      if (currency && currency !== code) return null;
      currency = code;
      total += value;
    }
  }
  // Revolut lists fees once a payment settles; none listed is not proof of zero.
  if (!currency) return null;
  return { amount: minorToDecimal(total), currency };
}
