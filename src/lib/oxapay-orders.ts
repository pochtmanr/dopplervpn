import 'server-only';

/**
 * Shared pieces of every OxaPay checkout: the web hosted invoice, the Mini App
 * white label and the admin "send crypto invoice" link.
 *
 * The pending `vpn_invoices` row is the webhook's only record of what was sold
 * (OxaPay does not echo the plan back). It is therefore written BEFORE the
 * invoice exists at OxaPay, and a failed write stops the checkout: a payment
 * without a row can never be credited.
 */

// Price in MINOR units (cents), same convention as the Revolut flow.
export const CHECKOUT_PLANS: Record<string, { amount: number; name: string }> = {
  monthly: { amount: 699, name: 'Doppler VPN Pro — Monthly' },
  '6month': { amount: 2999, name: 'Doppler VPN Pro — 6 Months' },
  yearly: { amount: 3999, name: 'Doppler VPN Pro — Yearly' },
};

export const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export interface PendingOxapayInvoice {
  orderId: string;
  planId: string;
  accountId: string;
  amountMinor: number;
  promoId: string | null;
  promoCode: string | null;
  clickId?: string | null;
  attribution?: Record<string, unknown> | null;
}

// Minimal structural type so callers can pass the untyped admin client.
interface InvoiceTable {
  insert(row: Record<string, unknown>): PromiseLike<{ error: { message?: string } | null }>;
  update(row: Record<string, unknown>): {
    eq(col: string, v: unknown): { eq(col: string, v: unknown): PromiseLike<{ error: unknown }> };
  };
}
interface Db {
  from(table: 'vpn_invoices'): unknown;
}

function invoices(db: Db): InvoiceTable {
  return db.from('vpn_invoices') as InvoiceTable;
}

/** Writes the pending row. Throws if it cannot be stored. */
export async function insertPendingOxapayInvoice(db: Db, p: PendingOxapayInvoice): Promise<void> {
  const row: Record<string, unknown> = {
    telegram_user_id: 0,
    plan: `${p.planId}:${p.accountId}`,
    amount: p.amountMinor,
    currency: 'USD',
    status: 'pending',
    provider: 'oxapay',
    provider_payment_id: p.orderId,
    promo_id: p.promoId,
    promo_code: p.promoCode,
  };
  if (p.clickId !== undefined) row.click_id = p.clickId;

  let { error } = p.attribution
    ? await invoices(db).insert({ ...row, attribution: p.attribution })
    : await invoices(db).insert(row);
  if (error && p.attribution && /attribution/i.test(error.message ?? '')) {
    // Migration 010 not applied: keep the row, lose attribution.
    console.error('[oxapay-orders] attribution_column_missing');
    ({ error } = await invoices(db).insert(row));
  }
  if (error) {
    console.error('[oxapay-orders] pending_invoice_insert_failed', error);
    throw new Error('Could not record the order. Please try again.');
  }
}

/** The invoice could not be created at OxaPay: retire the pending row. */
export async function markOxapayInvoiceAbandoned(db: Db, orderId: string): Promise<void> {
  const { error } = await invoices(db)
    .update({ status: 'failed' })
    .eq('provider_payment_id', orderId)
    .eq('status', 'pending');
  if (error) console.error('[oxapay-orders] abandon_update_failed', orderId, error);
}
