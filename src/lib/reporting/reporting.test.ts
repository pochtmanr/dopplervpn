import { describe, expect, it } from "vitest";
import { addDecimals } from "./decimal";
import { fulfilThenObserve } from "./isolate";
import { importInvoiceHistory, type InvoiceReader } from "./import-history";
import {
  adjustmentObservation,
  observationFromInvoice,
  observationFromOxapay,
  observationFromRevenueCat,
  observationFromRevolut,
  type InvoiceRow,
} from "./map-evidence";
import { MemoryReportingStore } from "./memory-store";
import { summarizeProduction } from "./summarize";
import type { Observation } from "./types";

const FROM = "2026-09-01T00:00:00Z";
const TO = "2026-10-01T00:00:00Z";
const WHEN = "2026-09-15T12:00:00Z";

function windowOf(store: MemoryReportingStore, snapshotId?: string) {
  return summarizeProduction(store, { from: FROM, to: TO, snapshotId, now: new Date("2026-09-28T12:00:00Z") });
}

function revolutSale(orderId = "ord_1", amountMinor = 1000, environment: "production" | "sandbox" = "production"): Observation {
  return observationFromRevolut({
    orderId,
    amountMinor,
    currency: "USD",
    occurredAt: WHEN,
    environment,
    planId: "monthly",
    attribution: { utm_source: "newsletter", utm_medium: "email" },
  });
}

function invoice(orderId = "ord_1", id = "inv_1"): InvoiceRow {
  return {
    id,
    plan: "monthly:VPN-TEST-TEST-TEST",
    amount: 1000,
    currency: "USD",
    status: "paid",
    provider: "revolut",
    provider_payment_id: orderId,
    created_at: WHEN,
    attribution: { utm_source: "newsletter" },
  };
}

function reader(rows: InvoiceRow[]): InvoiceReader {
  const ordered = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
  return {
    async page(after, limit) {
      const filtered = after
        ? ordered.filter((row) => row.created_at > after.createdAt || (row.created_at === after.createdAt && row.id > after.id))
        : ordered;
      return filtered.slice(0, limit);
    },
  };
}

async function sales(store: MemoryReportingStore) {
  const snapshot = await store.createSnapshot(new Date("2026-09-28T12:00:00Z"));
  const records = await store.recordsAt(snapshot.highWatermark);
  return records.filter((record) => record.record_type === "sale");
}

describe("doppler reporting foundation", () => {
  it("keeps crypto addition exact", () => {
    expect(addDecimals(["1.00000001", "0.00000001"], 8)).toBe("1.00000002");
  });

  it("replays an invoice, a webhook and history as one sale", async () => {
    const store = new MemoryReportingStore();
    const row = invoice();
    await store.apply(revolutSale());
    await store.apply(observationFromInvoice(row)!);
    const imported = await importInvoiceHistory(store, reader([row]), { nowMs: 1_700_000_000_000 });
    const summary = await windowOf(store);
    const posted = await sales(store);
    expect(posted).toHaveLength(1);
    expect(posted[0]?.alias_ids).toEqual(expect.arrayContaining(["ORDER_COMPLETED.ord_1", "invoice.inv_1"]));
    expect(posted[0]?.acquisition.source).toBe("newsletter");
    expect(summary.native[0]?.metrics.gross_customer_sales.amount).toBe("10.00");
    expect(imported.duplicates).toBe(1);
    expect(summary.posting).toBe(false);
  });

  it("collapses concurrent duplicate webhooks to one sale", async () => {
    const store = new MemoryReportingStore();
    const observation = revolutSale();
    await Promise.all([store.apply(observation), store.apply(observation)]);
    const summary = await windowOf(store);
    expect(await sales(store)).toHaveLength(1);
    expect(summary.native[0]?.metrics.gross_customer_sales.amount).toBe("10.00");
  });

  it("records a partial refund, a reversal and a chargeback in native currency", async () => {
    const store = new MemoryReportingStore();
    await store.apply(revolutSale("ord_partial", 1000));
    await store.apply(adjustmentObservation({
      provider: "revolut",
      eventKind: "refund",
      externalObjectId: "rf_1",
      saleExternalObjectId: "ord_partial",
      amount: "4.00",
      currency: "USD",
      occurredAt: "2026-09-16T12:00:00Z",
      transportId: "refund.rf_1",
    }));
    await store.apply(adjustmentObservation({
      provider: "revolut",
      eventKind: "refund_reversal",
      externalObjectId: "rev_1",
      saleExternalObjectId: "ord_partial",
      refundExternalObjectId: "rf_1",
      amount: "4.00",
      currency: "USD",
      occurredAt: "2026-09-17T12:00:00Z",
      transportId: "reversal.rev_1",
    }));
    await store.apply(revolutSale("ord_cb", 2500));
    await store.apply(adjustmentObservation({
      provider: "revolut",
      eventKind: "chargeback",
      externalObjectId: "cb_1",
      saleExternalObjectId: "ord_cb",
      amount: "25.00",
      currency: "USD",
      occurredAt: "2026-09-18T12:00:00Z",
      transportId: "chargeback.cb_1",
    }));
    const summary = await windowOf(store);
    expect(summary.native[0]?.metrics.gross_customer_sales.amount).toBe("35.00");
    expect(summary.native[0]?.metrics.refunded_principal.amount).toBe("25.00");
  });

  it("applies a refund that arrives before its sale", async () => {
    const store = new MemoryReportingStore();
    await store.apply(adjustmentObservation({
      provider: "revolut",
      eventKind: "refund",
      externalObjectId: "rf_early",
      saleExternalObjectId: "ord_late",
      amount: "3.00",
      currency: "USD",
      occurredAt: "2026-09-16T12:00:00Z",
      transportId: "refund.rf_early",
    }));
    await store.apply(revolutSale("ord_late", 1000));
    const summary = await windowOf(store);
    expect(summary.native[0]?.metrics.gross_customer_sales.amount).toBe("10.00");
    expect(summary.native[0]?.metrics.refunded_principal.amount).toBe("3.00");
  });

  it("removes a voided sale from production gross and keeps the correction on a later snapshot", async () => {
    const store = new MemoryReportingStore();
    await store.apply(revolutSale("ord_void", 1000));
    const before = await windowOf(store);
    await store.apply(adjustmentObservation({
      provider: "revolut",
      eventKind: "void",
      externalObjectId: "void_1",
      saleExternalObjectId: "ord_void",
      amount: null,
      currency: "USD",
      occurredAt: WHEN,
      transportId: "void.void_1",
    }));
    const afterVoid = await windowOf(store);
    expect(before.native[0]?.metrics.gross_customer_sales.amount).toBe("10.00");
    expect(afterVoid.native).toEqual([]);

    const correcting = new MemoryReportingStore();
    await correcting.apply(revolutSale("ord_fix", 1000));
    const frozen = await correcting.createSnapshot(new Date("2026-09-20T00:00:00Z"));
    await correcting.apply(adjustmentObservation({
      provider: "revolut",
      eventKind: "correction",
      externalObjectId: "corr_1",
      saleExternalObjectId: "ord_fix",
      amount: "12.00",
      currency: "USD",
      occurredAt: WHEN,
      transportId: "correction.corr_1",
    }));
    const original = await windowOf(correcting, frozen.snapshotId);
    const later = await windowOf(correcting);
    expect(original.native[0]?.metrics.gross_customer_sales.amount).toBe("10.00");
    expect(later.native[0]?.metrics.gross_customer_sales.amount).toBe("12.00");
    const revised = (await sales(correcting)).find((record) => record.external_object_id === "corr_1" || record.revision > 1);
    expect(revised?.revision).toBe(2);
    expect(revised?.supersedes_revision).toBe(1);
  });

  it("keeps crypto precision and does not label it as fiat", async () => {
    const store = new MemoryReportingStore();
    await store.apply(observationFromOxapay({
      orderId: "ox_1",
      trackId: "track_1",
      amountMajor: null,
      currency: null,
      occurredAt: WHEN,
      environment: "production",
      crypto: { asset: "BTC", network: "bitcoin", amount: "1.00000001" },
    }));
    await store.apply(observationFromOxapay({
      orderId: "ox_2",
      trackId: "track_2",
      amountMajor: null,
      currency: null,
      occurredAt: WHEN,
      environment: "production",
      crypto: { asset: "BTC", network: "bitcoin", amount: "0.00000001" },
    }));
    const summary = await windowOf(store);
    expect(summary.native).toEqual([]);
    expect(summary.crypto).toEqual([
      { asset: "BTC", network: "bitcoin", gross: "1.00000002", quality: "actual" },
    ]);
    const [sale] = await sales(store);
    expect(sale?.original_amount.currency).toBeUndefined();
    expect(sale?.original_amount.asset).toBe("BTC");
  });

  it("leaves missing tax, fees and FX null", async () => {
    const store = new MemoryReportingStore();
    await store.apply(revolutSale("ord_missing", 1000));
    const summary = await windowOf(store);
    const metrics = summary.native[0]?.metrics;
    expect(metrics?.gross_customer_sales).toMatchObject({ amount: "10.00", quality: "actual" });
    expect(metrics?.refunded_principal).toMatchObject({ amount: "0.00", quality: "actual" });
    expect(metrics?.sales_tax).toMatchObject({ amount: null, quality: "unavailable", reason: "missing_sales_tax" });
    expect(metrics?.store_and_processor_fees).toMatchObject({ amount: null, quality: "unavailable", reason: "missing_processor_fees" });
    expect(metrics?.net_sales.amount).toBeNull();
    expect(metrics?.net_proceeds.amount).toBeNull();
    expect(summary.gbp).toMatchObject({ amount: null, quality: "unavailable", reason: "missing_fx_evidence", policy_version: "gbp-unconfigured" });
    expect(store.fxEvidence().some((row) => row.reason === "missing_fx_evidence")).toBe(true);
  });

  it("calculates inclusive net sales and net proceeds when tax and fees are present", async () => {
    const store = new MemoryReportingStore();
    const sale = revolutSale("ord_net", 1000);
    sale.tax = { amount: "2.00", inclusion: "inclusive" };
    sale.fee = { amount: "1.00", componentType: "processor_fee" };
    await store.apply(sale);
    const alias = adjustmentObservation({
      provider: "revolut",
      eventKind: "fee",
      externalObjectId: "fee_alias",
      saleExternalObjectId: "ord_net",
      amount: "1.00",
      currency: "USD",
      occurredAt: WHEN,
      transportId: "fee.alias",
    });
    alias.postingRole = "alias";
    alias.feeComponentId = "fee.sale.revolut.ord_net";
    alias.economicTransactionId = sale.economicTransactionId;
    await store.apply(alias);
    const metrics = (await windowOf(store)).native[0]?.metrics;
    expect(metrics?.sales_tax.amount).toBe("2.00");
    expect(metrics?.store_and_processor_fees.amount).toBe("1.00");
    expect(metrics?.net_sales.amount).toBe("8.00");
    expect(metrics?.net_proceeds.amount).toBe("7.00");
  });

  it("excludes sandbox and quarantines invoices with no environment", async () => {
    const store = new MemoryReportingStore();
    await store.apply(revolutSale("ord_live", 500, "production"));
    await store.apply(revolutSale("ord_sand", 9000, "sandbox"));
    const imported = await importInvoiceHistory(store, reader([invoice("ord_old", "inv_old")]), { nowMs: 1_700_000_000_000 });
    const summary = await windowOf(store);
    expect(summary.native[0]?.metrics.gross_customer_sales.amount).toBe("5.00");
    expect(summary.excluded.sandbox_observations).toBe(1);
    expect(imported.quarantined).toBe(1);
    expect(summary.excluded.quarantined_observations).toBe(1);
  });

  it("does not book a RevenueCat access grant as a sale", async () => {
    const store = new MemoryReportingStore();
    const result = await store.apply(observationFromRevenueCat({
      eventId: "rc_1",
      eventType: "INITIAL_PURCHASE",
      environment: "production",
      occurredAt: WHEN,
    }));
    expect(result.reason).toBe("entitlement_only");
    expect(await sales(store)).toEqual([]);
  });

  it("keeps fulfilment when reporting observation throws", async () => {
    const result = await fulfilThenObserve(
      async () => "paid",
      async () => {
        throw new Error("reporting_store_down");
      },
    );
    expect(result).toBe("paid");
  });

  it("deduplicates an overlapping history replay and stops after bounded failures", async () => {
    const store = new MemoryReportingStore();
    const row = { ...invoice("ord_hist", "inv_hist"), environment: "production" as const };
    const first = await importInvoiceHistory(store, reader([row]), { nowMs: 1_000 });
    const second = await importInvoiceHistory(store, reader([row]), { nowMs: 2_000 });
    expect(first.applied).toBe(1);
    expect(second.duplicates).toBe(1);
    expect((await windowOf(store)).native[0]?.metrics.gross_customer_sales.amount).toBe("10.00");

    const failing = new MemoryReportingStore();
    await failing.acquireLease(IMPORT_LOCKED, "other", 5_000, 60_000);
    const leased = await importInvoiceHistory(failing, reader([row]), { nowMs: 5_000, source: IMPORT_LOCKED });
    expect(leased.status).toBe("leased");

    let calls = 0;
    const broken: InvoiceReader = {
      async page() {
        calls += 1;
        throw new Error("reader_down");
      },
    };
    const retries = new MemoryReportingStore();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await importInvoiceHistory(retries, broken, { nowMs: attempt, owner: `try-${attempt}` });
    }
    const stopped = await importInvoiceHistory(retries, broken, { nowMs: 10, owner: "after" });
    expect(stopped.status).toBe("bounded_stop");
    expect(calls).toBe(5);
  });
});

const IMPORT_LOCKED = "vpn_invoices_lease_test";
