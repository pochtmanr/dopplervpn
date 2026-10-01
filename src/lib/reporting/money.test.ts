import { describe, expect, it } from "vitest";
import { addDecimals } from "./decimal";
import { observationFromOxapay } from "./map-evidence";
import {
  MoneyBook,
  MoneyError,
  allocateExact,
  authorizeReceipt,
  moneyPageView,
  servicePeriodSlice,
  type MoneyDraftInput,
} from "./money";
import { MemoryReportingStore } from "./memory-store";
import { summarizeProduction } from "./summarize";
import type { Observation } from "./types";
import { canonicalize } from "./canonical";

const FROM = "2026-09-01T00:00:00Z";
const TO = "2026-10-01T00:00:00Z";

function openBook(): { book: MoneyBook; store: MemoryReportingStore } {
  const store = new MemoryReportingStore();
  store.clock = () => new Date("2026-09-28T12:00:00Z");
  return { book: new MoneyBook(store), store };
}

function expense(overrides: Partial<MoneyDraftInput> = {}): MoneyDraftInput {
  return {
    kind: "expense",
    amount: "25.00",
    currency: "USD",
    occurredAt: "2026-09-15T12:00:00Z",
    category: "hosting",
    vendor: "vendor.example",
    taxInclusion: "exclusive",
    vatRecoverable: null,
    vatReason: "vat_status_unconfirmed",
    servicePeriod: { from: FROM, to: TO },
    dueAt: "2026-09-20T00:00:00Z",
    paidAt: null,
    paymentAccountId: "bank.operating",
    recurrence: null,
    actor: "admin.test",
    channel: "web",
    processor: "manual",
    store: "manual",
    acquisitionSource: "manual",
    ...overrides,
  };
}

function sale(id: string, amount: string): Observation {
  return {
    sourceSystem: "invoice",
    transportId: `invoice.${id}`,
    environment: "production",
    externalObjectId: id,
    economicTransactionId: `econ.invoice.${id}`,
    eventKind: "sale",
    occurredAt: "2026-09-10T12:00:00Z",
    sourceAccountId: "revolut.unspecified",
    amount,
    currency: "USD",
    crypto: null,
    tax: null,
    fee: null,
    parentExternalObjectId: null,
    targetRecordId: null,
    aliasIds: [`invoice.${id}`],
    attribution: null,
    productId: "pro",
    processor: "revolut",
    store: "web",
    channel: "web",
    fx: null,
    amountReason: null,
    postingRole: null,
    feeComponentId: null,
  };
}

describe("money page", () => {
  it("counts an expense once across replacement and void", async () => {
    const { book } = openBook();
    const draft = await book.createDraft(expense());
    const posted = await book.postDraft(draft.draftId);
    await book.replaceRecord(posted.record_id, expense({ amount: "30.00" }));
    const replaced = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    expect(replaced.native[0].metrics.operating_expenses.amount).toBe("30.00");
    await book.voidRecord(posted.record_id, "admin.test");
    const voided = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    expect(voided.native[0].metrics.operating_expenses.amount).toBeNull();
    expect(voided.native[0].metrics.operating_expenses.reason).toBe("operating_expenses_not_recorded");
  });

  it("separates service-period expense from paid cash and keeps a recurrence from posting cash", async () => {
    const { book } = openBook();
    const draft = await book.createDraft(expense({
      amount: "20.00",
      paidAt: "2026-10-03T00:00:00Z",
      recurrence: { interval: "month", intervalCount: 1 },
    }));
    await book.postDraft(draft.draftId);
    const incurred = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    const cashInSeptember = await book.snapshot({ from: FROM, to: TO, basis: "settled_cash" });
    const cashInOctober = await book.snapshot({
      from: "2026-10-01T00:00:00Z",
      to: "2026-11-01T00:00:00Z",
      basis: "settled_cash",
    });
    expect(incurred.native[0].metrics.operating_expenses.amount).toBe("20.00");
    expect(cashInSeptember.native[0].metrics.operating_expenses.amount).toBe("0.00");
    expect(cashInOctober.native[0].metrics.operating_expenses.amount).toBe("20.00");
    expect(incurred.drill.filter((row) => row.record_type === "expense")).toHaveLength(1);
  });

  it("leaves profit null when fees or costs are missing", async () => {
    const { book, store } = openBook();
    await store.apply(sale("sale-1", "100.00"));
    const missingFees = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    expect(missingFees.native[0].metrics.gross_customer_sales.amount).toBe("100.00");
    expect(missingFees.native[0].metrics.net_proceeds.amount).toBeNull();
    expect(missingFees.native[0].metrics.contribution_profit.amount).toBeNull();
    expect(missingFees.native[0].metrics.operating_profit.amount).toBeNull();
    expect(missingFees.native[0].metrics.net_profit.amount).toBeNull();
    expect(missingFees.native[0].margin.amount).toBeNull();
    const summary = await summarizeProduction(store, {
      from: FROM,
      to: TO,
      snapshotId: missingFees.snapshot_id,
    });
    expect(missingFees.native[0].metrics.gross_customer_sales.amount)
      .toBe(summary.native[0].metrics.gross_customer_sales.amount);
  });

  it("allocates a service period without losing a remainder", () => {
    const parts = allocateExact("10.00", [1, 1, 1], 2);
    expect(parts).toEqual(["3.33", "3.33", "3.34"]);
    expect(addDecimals(parts, 2)).toBe("10.00");
    const period = { from: "2026-09-01T00:00:00Z", to: "2026-09-04T00:00:00Z" };
    const slices = [0, 1, 2].map((day) => servicePeriodSlice("10.00", 2, period, {
      from: `2026-09-0${day + 1}T00:00:00Z`,
      to: `2026-09-0${day + 2}T00:00:00Z`,
    }));
    expect(slices).toEqual(["3.33", "3.33", "3.34"]);
    expect(addDecimals(slices, 2)).toBe("10.00");
  });

  it("matches one payout to several sales, exposes the residual, and ignores a wallet transfer", async () => {
    const { book, store } = openBook();
    const first = await store.apply(sale("a", "40.00"));
    const second = await store.apply(sale("b", "50.00"));
    const before = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    const csv = [
      "row_type,external_id,occurred_at,amount,currency,account_id,account_kind,destination_account_id,matched_record_ids",
      `settlement,payout-1,2026-09-20T00:00:00Z,100.00,USD,bank.operating,cash,,${first.recordId}|${second.recordId}`,
      "transfer,move-1,2026-09-21T00:00:00Z,5.00,USD,wallet.ops,cash,wallet.reserve,",
    ].join("\n");
    const imported = await book.importStatement(new TextEncoder().encode(csv));
    expect(imported.residuals[0].amount).toBe("10.00");
    expect(imported.residuals[0].quality).toBe("actual");
    const after = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    expect(after.native[0].metrics.gross_customer_sales.amount).toBe("90.00");
    expect(after.native[0].metrics.gross_customer_sales.amount)
      .toBe(before.native[0].metrics.gross_customer_sales.amount);
    expect(after.drill.some((row) => row.record_type === "transfer")).toBe(true);
    expect(after.drill.find((row) => row.record_type === "transfer")?.channel).toBeNull();
    expect(after.balances[0].amount.amount).toBeNull();
    expect(after.balances[0].amount.reason).toBe("missing_statement_evidence");
  });

  it("rejects a statement whose claimed checksum does not match the bytes", async () => {
    const { book } = openBook();
    const csv = [
      "row_type,external_id,occurred_at,amount,currency,account_id,account_kind,destination_account_id,matched_record_ids",
      "balance,bal-1,2026-09-28T00:00:00Z,15.00,USD,bank.operating,cash,,",
    ].join("\n");
    const bytes = new TextEncoder().encode(csv);
    await expect(book.importStatement(bytes, "a".repeat(64))).rejects.toBeInstanceOf(MoneyError);
    const imported = await book.importStatement(bytes);
    const again = await book.importStatement(bytes);
    expect(again.status).toBe("duplicate");
    const page = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    expect(page.balances[0].amount.amount).toBe("15.00");
    expect(page.balances[0].additive).toBe(false);
    expect(imported.checksum).toBe(again.checksum);
  });

  it("authorizes a receipt only for an admin and never returns a public url", async () => {
    const { book } = openBook();
    const bytes = new TextEncoder().encode("receipt-bytes");
    const document = await book.storeDocument("receipt.pdf", bytes);
    const denied = authorizeReceipt({ isAdmin: false, document, nowMs: Date.parse("2026-09-28T12:00:00Z") });
    expect(denied.ok).toBe(false);
    expect(denied.url).toBeNull();
    const granted = await book.authorizeDownload(document.documentId, true, Date.parse("2026-09-28T12:00:00Z"));
    expect(granted.ok).toBe(true);
    expect(granted.url).toBeNull();
    expect(granted.checksum).toBe(document.checksum);
    expect(granted.delivery).toBe("authorized_short_lived");
  });

  it("keeps the OxaPay fiat invoice beside the crypto payment", async () => {
    const { store } = openBook();
    await store.apply(observationFromOxapay({
      orderId: "order-crypto",
      trackId: "track-crypto",
      amountMajor: 12.5,
      currency: "USD",
      occurredAt: "2026-09-12T00:00:00Z",
      environment: "production",
      crypto: { asset: "USDT", network: "tron", amount: "12.5" },
    }));
    const records = await store.recordsAt(store.currentWatermark());
    const saleRecord = records.find((record) => record.record_type === "sale");
    expect(saleRecord?.original_amount.asset).toBe("USDT");
    expect(saleRecord?.original_amount.network).toBe("tron");
    expect(saleRecord?.original_amount.currency).toBeUndefined();
    expect(saleRecord?.fiat_invoice).toMatchObject({ amount: "12.50", currency: "USD", quality: "actual" });
  });

  it("returns the same page view as the frozen service snapshot", async () => {
    const { book } = openBook();
    const draft = await book.createDraft(expense({ kind: "direct_cost", category: "servers", amount: "4.00" }));
    await book.postDraft(draft.draftId);
    const first = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    const second = await book.snapshot({
      from: FROM,
      to: TO,
      basis: "purchase",
      snapshotId: first.snapshot_id,
    });
    expect(canonicalize(moneyPageView(first))).toBe(canonicalize(moneyPageView(second)));
    expect(first.native[0].metrics.direct_costs.amount).toBe("4.00");
    expect(first.native[0].metrics.contribution_profit.amount).toBeNull();
    expect(first.posting).toBe(false);
  });

  it("rejects company overhead and leaves channel, processor, store, and acquisition distinct", async () => {
    const { book } = openBook();
    await expect(book.createDraft(expense({ category: "shared_overhead" }))).rejects.toThrow(MoneyError);
    const draft = await book.createDraft(expense({
      kind: "manual_income",
      category: "consulting",
      channel: "telegram",
      processor: "manual",
      store: "web",
      acquisitionSource: "partner",
    }));
    await book.postDraft(draft.draftId);
    const page = await book.snapshot({ from: FROM, to: TO, basis: "purchase" });
    const row = page.drill.find((item) => item.record_type === "sale");
    expect(row).toMatchObject({
      channel: "telegram",
      processor: "manual",
      store: "web",
      acquisition_source: "partner",
    });
    expect(page.native[0].metrics.gross_customer_sales.amount).toBe("25.00");
  });
});
