import "server-only";
import { listPaidPayments, type OxaPayHistoryEntry } from "@/lib/oxapay";
import { getOrderPayments, getPaymentDetails } from "@/lib/revolut";
import { importProviderFees, revolutFeeFromPayments, type FeeImportResult, type FeeLookup } from "./fees";
import { reportingStore } from "./persist";

// Kept out of persist.ts: doppler-admin compiles persist.ts through its
// @reporting alias and has no Revolut or OxaPay client.

/** Live provider lookups. Only the deployed server holds the production keys. */
export function providerFeeLookup(): FeeLookup {
  let oxapayByOrder: Promise<Map<string, OxaPayHistoryEntry>> | null = null;
  return {
    async revolut(orderId) {
      // The order's payment list omits fees; each payment's details carry them.
      const payments = await getOrderPayments(orderId);
      const detailed = await Promise.all(payments.map(async (payment) => {
        const id = (payment as { id?: unknown }).id;
        return typeof id === "string" ? getPaymentDetails(id) : payment;
      }));
      return revolutFeeFromPayments(detailed);
    },
    async oxapay(orderId) {
      // A sale is keyed by our order id; OxaPay's history carries it as order_id.
      oxapayByOrder ??= listPaidPayments().then((entries) =>
        new Map(entries
          .filter((entry) => entry.order_id)
          .map((entry) => [entry.order_id as string, entry])));
      const payment = (await oxapayByOrder).get(orderId);
      if (!payment || payment.status.toLowerCase() !== "paid" || payment.fee_paid_by_payer !== 1) return null;
      // Invoices are created with fee_paid_by_payer=1: the payer covered
      // OxaPay's fee and the merchant kept the full invoice amount.
      return { amount: "0.00", currency: payment.currency.toUpperCase() };
    },
  };
}

export async function importDurableFees(): Promise<FeeImportResult> {
  return importProviderFees(reportingStore(), providerFeeLookup());
}

/**
 * The shape of Revolut's payments for one order, with only state and fee
 * fields kept: no card, customer or address data leaves this function.
 */
export async function probeRevolutFees(orderId: string): Promise<unknown> {
  const payments = await getOrderPayments(orderId);
  const detailed = await Promise.all(payments.map(async (payment) => {
    const id = (payment as { id?: unknown }).id;
    return typeof id === "string" ? getPaymentDetails(id) : payment;
  }));
  return detailed.map((payment) => {
    const item = payment as Record<string, unknown>;
    return {
      keys: Object.keys(item).sort(),
      state: item.state ?? null,
      fees: item.fees ?? null,
      settled_amount: item.settled_amount ?? null,
      amount: item.amount ?? null,
      currency: item.currency ?? null,
    };
  });
}
