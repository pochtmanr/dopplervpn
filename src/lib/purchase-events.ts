import "server-only";

import type { CheckoutAttribution } from "@/lib/attribution";
import { sendServerEvent } from "@/lib/ga-server";
import { sendCapiEvent } from "@/lib/meta-capi";
import { SITE_URL } from "@/lib/facts";

/**
 * The single place a confirmed web purchase is reported to analytics and ad
 * platforms. Called from the Revolut and OxaPay webhooks, inside `after()`,
 * past their idempotency guards — so each paid order reaches here once.
 *
 * Why the server and not the success page: the webhook sees every paid order,
 * including buyers who closed the tab, block trackers, or paid in the Telegram
 * Mini App. The success page now sends only the Meta Pixel `Purchase` (which
 * Meta dedupes against this one by order id); GA4 `purchase` is sent ONLY
 * from here, because GA4 does not reliably dedupe browser against server.
 *
 * Consent: GA4 always gets the sale (revenue totals must be complete), but the
 * client/session ids — which tie it to a person's history — only exist in
 * `attribution` if the buyer granted Analytics. Meta is only told at all if
 * the buyer granted Marketing (Mini App buyers never see the banner, so they
 * are never sent). See `readCheckoutAttribution`.
 */

export interface PurchaseReport {
  orderId: string;
  /** Minor units (cents), as stored in `vpn_invoices.amount`. */
  amountMinor: number;
  currency: string;
  plan: string;
  provider: "revolut" | "oxapay";
  /** e.g. card / apple_pay / crypto — becomes GA4 `payment_type`. */
  paymentMethod?: string;
  accountId?: string;
  email?: string | null;
  attribution: CheckoutAttribution;
  promoCode?: string | null;
}

export async function reportPurchase(report: PurchaseReport): Promise<void> {
  const { attribution: attr } = report;
  const value = Math.round(report.amountMinor) / 100;
  const currency = (report.currency || "USD").toUpperCase();
  const fromMiniApp = attr.source === "telegram_miniapp";

  const tasks: Promise<void>[] = [];

  tasks.push(
    sendServerEvent(
      {
        name: "purchase",
        params: {
          transaction_id: report.orderId,
          value,
          currency,
          coupon: report.promoCode || undefined,
          payment_type: report.paymentMethod,
          provider: report.provider,
          checkout_source: fromMiniApp ? "telegram_miniapp" : "web",
          // Custom dimensions so revenue can be broken down even for buyers
          // with no GA session (declined analytics, or the Mini App). Register
          // them in GA4 Admin -> Custom definitions to report on them.
          campaign_source: attr.utm_source,
          campaign_medium: attr.utm_medium,
          campaign_name: attr.utm_campaign,
          landing_path: attr.landing_path,
          referrer_host: attr.referrer_host,
          items: [
            { item_id: report.plan, item_name: report.plan, price: value, quantity: 1 },
          ],
        },
      },
      undefined,
      { clientId: attr.ga_client_id, sessionId: attr.ga_session_id }
    )
  );

  // Mini App buyers never saw the banner, so they never reach this branch.
  if (attr.consent_marketing) {
    tasks.push(
      sendCapiEvent({
        eventName: "Purchase",
        eventId: report.orderId,
        actionSource: "website",
        eventSourceUrl: `${SITE_URL}/en/checkout/success`,
        user: {
          email: report.email,
          externalId: report.accountId,
          fbp: attr.fbp,
          fbc: attr.fbc,
          ip: attr.ip,
          userAgent: attr.user_agent,
        },
        custom: {
          value,
          currency,
          content_ids: [report.plan],
          content_type: "product",
          num_items: 1,
        },
      })
    );
  }

  await Promise.allSettled(tasks);
}
