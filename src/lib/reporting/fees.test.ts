import { describe, expect, it } from "vitest";
import { importProviderFees, minorToDecimal, revolutFeeFromPayments, type FeeLookup } from "./fees";
import { observationFromOxapay, observationFromRevolut } from "./map-evidence";
import { MemoryReportingStore } from "./memory-store";
import { MoneyBook } from "./money";
import { summarizeProduction } from "./summarize";

const FROM = "2026-09-01T00:00:00Z";
const TO = "2026-10-01T00:00:00Z";
const WHEN = "2026-09-15T12:00:00Z";

function revolut(orderId: string, amountMinor: number) {
  return observationFromRevolut({
    orderId,
    amountMinor,
    currency: "USD",
    occurredAt: WHEN,
    environment: "production",
    planId: "monthly",
  });
}

function oxapay(trackId: string, amountMajor: number) {
  return observationFromOxapay({
    orderId: `order-${trackId}`,
    trackId,
    amountMajor,
    currency: "USD",
    occurredAt: WHEN,
    environment: "production",
    planId: "monthly",
  });
}

function lookup(fees: Record<string, { amount: string; currency: string } | null>): FeeLookup & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async revolut(id) {
      calls.push(id);
      return fees[id] ?? null;
    },
    async oxapay(id) {
      calls.push(id);
      return fees[id] ?? null;
    },
  };
}

describe("provider fees", () => {
  it("reads Revolut fees in minor units and refuses mixed or missing ones", () => {
    expect(minorToDecimal(21)).toBe("0.21");
    expect(minorToDecimal(1234)).toBe("12.34");
    expect(revolutFeeFromPayments([
      { state: "completed", fees: [{ type: "acquiring", amount: 21, currency: "USD" }, { type: "fx", amount: 4, currency: "USD" }] },
    ])).toEqual({ amount: "0.25", currency: "USD" });
    expect(revolutFeeFromPayments([
      { state: "completed", fees: [{ type: "acquiring", amount: { value: 30, currency: "GBP" } }] },
    ])).toEqual({ amount: "0.30", currency: "GBP" });
    expect(revolutFeeFromPayments([{ state: "completed", fees: [] }])).toBeNull();
    expect(revolutFeeFromPayments([{ state: "failed", fees: [{ amount: 21, currency: "USD" }] }])).toBeNull();
    expect(revolutFeeFromPayments([
      { state: "completed", fees: [{ amount: 21, currency: "USD" }, { amount: 4, currency: "GBP" }] },
    ])).toBeNull();
  });

  it("records each provider fee once and fills Provider deductions and Proceeds", async () => {
    const store = new MemoryReportingStore();
    await store.apply(revolut("ord_a", 699));
    await store.apply(oxapay("trk_b", 6.99));
    const before = await summarizeProduction(store, { from: FROM, to: TO });
    expect(before.native[0].metrics.store_and_processor_fees.reason).toBe("missing_processor_fees");

    const fees = lookup({ ord_a: { amount: "0.21", currency: "USD" }, "order-trk_b": { amount: "0.00", currency: "USD" } });
    const first = await importProviderFees(store, fees);
    expect(first).toMatchObject({ candidates: 2, recorded: 2, unresolved: 0, failed: 0 });
    const again = await importProviderFees(store, fees);
    expect(again.candidates).toBe(0);

    const after = await summarizeProduction(store, { from: FROM, to: TO });
    const metrics = after.native[0].metrics;
    expect(metrics.gross_customer_sales.amount).toBe("13.98");
    expect(metrics.sales_tax.amount).toBe("0.00");
    expect(metrics.store_and_processor_fees.amount).toBe("0.21");
    expect(metrics.net_proceeds.amount).toBe("13.77");
  });

  it("leaves a sale without a fee when the provider gives no answer", async () => {
    const store = new MemoryReportingStore();
    await store.apply(revolut("ord_c", 699));
    const result = await importProviderFees(store, lookup({}));
    expect(result).toMatchObject({ candidates: 1, recorded: 0, unresolved: 1 });
    const summary = await summarizeProduction(store, { from: FROM, to: TO });
    expect(summary.native[0].metrics.store_and_processor_fees.amount).toBeNull();
  });
});

describe("money page profit", () => {
  async function bookWith(expense: string) {
    const store = new MemoryReportingStore();
    store.clock = () => new Date("2026-09-28T12:00:00Z");
    await store.apply(revolut("ord_p", 10000));
    await store.apply(oxapay("trk_p", 50));
    await importProviderFees(store, lookup({ ord_p: { amount: "2.00", currency: "USD" }, "order-trk_p": { amount: "0.00", currency: "USD" } }));
    const book = new MoneyBook(store);
    for (const [kind, amount] of [["direct_cost", "20.00"], ["expense", expense]] as const) {
      const draft = await book.createDraft({
        kind,
        amount,
        currency: "USD",
        occurredAt: WHEN,
        category: kind === "direct_cost" ? "servers" : "tools",
        servicePeriod: { from: FROM, to: TO },
        actor: "test",
      });
      await book.postDraft(draft.draftId);
    }
    return book;
  }

  it("estimates UK corporation tax on a profit and reports the margin", async () => {
    const book = await bookWith("28.00");
    const page = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    const metrics = page.native[0].metrics;
    expect(metrics.net_proceeds.amount).toBe("148.00");
    expect(metrics.operating_profit.amount).toBe("100.00");
    expect(metrics.corporation_tax_estimate.amount).toBe("19.00");
    expect(metrics.net_profit.amount).toBe("81.00");
    expect(page.native[0].margin).toMatchObject({ amount: "54.0", currency: "%" });
  });

  it("shows a loss as a negative profit with no tax", async () => {
    const book = await bookWith("200.00");
    const metrics = (await book.snapshot({ from: FROM, to: TO, basis: "purchase" })).native[0].metrics;
    expect(metrics.operating_profit.amount).toBe("-72.00");
    expect(metrics.corporation_tax_estimate.amount).toBe("0.00");
    expect(metrics.net_profit.amount).toBe("-72.00");
  });

  it("filters sales by payment method but keeps costs", async () => {
    const book = await bookWith("28.00");
    const page = await book.snapshot({ from: FROM, to: TO, basis: "purchase", methods: ["oxapay"] });
    const metrics = page.native[0].metrics;
    expect(metrics.gross_customer_sales.amount).toBe("50.00");
    expect(metrics.store_and_processor_fees.amount).toBe("0.00");
    expect(metrics.operating_profit.amount).toBe("2.00");
  });
});
