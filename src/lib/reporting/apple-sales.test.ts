import { describe, expect, it } from "vitest";
import { importAppleSales, parseAppleSalesReport } from "./apple-sales";
import { MemoryReportingStore } from "./memory-store";
import { MoneyBook } from "./money";

const HEADER = [
  "Provider", "Provider Country", "SKU", "Developer", "Title", "Version", "Product Type Identifier",
  "Units", "Developer Proceeds", "Begin Date", "End Date", "Customer Currency", "Country Code",
  "Currency of Proceeds", "Apple Identifier", "Customer Price", "Promo Code", "Parent Identifier",
  "Subscription", "Period",
].join("\t");

function row(sku: string, type: string, units: number, proceeds: string, date: string, currency: string, country: string, price: string, proceedsCurrency = currency) {
  const [y, m, d] = date.split("-");
  return ["APPLE", "US", sku, "Dev", "Doppler VPN", "", type, String(units), proceeds, `${m}/${d}/${y}`, `${m}/${d}/${y}`,
    currency, country, proceedsCurrency, "6757000001", price, "", "", "", ""].join("\t");
}

const SEPT_14 = [
  HEADER,
  // free download and a free-trial start carry no money
  row("doppler", "1F", 12, "0", "2026-09-14", "USD", "US", "0"),
  row("vpn_premium_monthly", "IAY", 3, "0", "2026-09-14", "USD", "US", "0"),
  // two paid monthly renewals: 6.99 each, 5.94 proceeds each (15%)
  row("vpn_premium_monthly", "IAY", 2, "5.94", "2026-09-14", "USD", "US", "6.99"),
  // one yearly in EUR, VAT-inclusive price, proceeds in EUR
  row("vpn_premium_yearly", "IAY", 1, "28.57", "2026-09-14", "EUR", "DE", "39.99"),
  // a refund of one monthly
  row("vpn_premium_monthly", "IAY", -1, "-5.94", "2026-09-14", "USD", "US", "-6.99"),
].join("\n");

describe("App Store sales import", () => {
  it("parses the summary report", () => {
    const rows = parseAppleSalesReport(SEPT_14);
    expect(rows).toHaveLength(5);
    expect(rows[2]).toMatchObject({ date: "2026-09-14", sku: "vpn_premium_monthly", units: 2, customerPrice: "6.99", proceeds: "5.94" });
  });

  it("books paid rows per currency with Apple's cut as a store deduction", async () => {
    const store = new MemoryReportingStore();
    store.clock = () => new Date("2026-09-28T12:00:00Z");
    const reports: Record<string, string> = { "2026-09-14": SEPT_14 };
    const fetch = async (date: string) => reports[date] ?? "";
    const result = await importAppleSales(store, fetch, { now: new Date("2026-09-16T08:00:00Z"), maxDays: 400 });
    expect(result.status).toBe("imported");
    expect(result.applied).toBe(3);
    expect(result.through).toBe("2026-09-15");

    const again = await importAppleSales(store, fetch, { now: new Date("2026-09-16T08:00:00Z"), maxDays: 400 });
    expect(again.days).toBe(0);

    const page = await new MoneyBook(store).snapshot({ from: "2026-09-01T00:00:00Z", to: "2026-10-01T00:00:00Z", basis: "purchase" });
    const usd = page.native.find((n) => n.currency === "USD")!.metrics;
    expect(usd.gross_customer_sales.amount).toBe("13.98");
    expect(usd.refunded_principal.amount).toBe("6.99");
    expect(usd.sales_tax.amount).toBe("0.00");
    // Apple returns its cut on a refund: 2 x 1.05 taken, 1.05 given back.
    expect(usd.store_and_processor_fees.amount).toBe("1.05");
    expect(usd.net_proceeds.amount).toBe("5.94");
    const eur = page.native.find((n) => n.currency === "EUR")!.metrics;
    expect(eur.gross_customer_sales.amount).toBe("39.99");
    expect(eur.store_and_processor_fees.amount).toBe("11.42");
    expect(eur.net_proceeds.amount).toBe("28.57");

    const appOnly = await new MoneyBook(store).snapshot({ from: "2026-09-01T00:00:00Z", to: "2026-10-01T00:00:00Z", basis: "purchase", methods: ["revolut"] });
    expect(appOnly.native.find((n) => n.currency === "USD")?.metrics.gross_customer_sales.amount ?? null).not.toBe("13.98");
  });

  it("reports unconfigured without credentials", async () => {
    const result = await importAppleSales(new MemoryReportingStore(), null);
    expect(result.status).toBe("unconfigured");
  });
});
