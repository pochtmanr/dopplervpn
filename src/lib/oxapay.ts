import 'server-only';
import crypto from 'crypto';

const OXAPAY_API_BASE = 'https://api.oxapay.com/v1';

function getMerchantKey(): string {
  const key = process.env.OXAPAY_MERCHANT_API_KEY;
  if (!key) throw new Error('OXAPAY_MERCHANT_API_KEY is not configured');
  return key;
}

function isSandbox(): boolean {
  return process.env.OXAPAY_SANDBOX === 'true';
}

async function oxapayFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${OXAPAY_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      merchant_api_key: getMerchantKey(),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  // OxaPay returns `error: {}` (empty object) on success and a populated
  // object like `error: { type, key, message }` on failure. Truthy check
  // alone is wrong — must inspect the fields.
  const errObj = body?.error;
  const hasError = errObj && typeof errObj === 'object' && Object.keys(errObj).length > 0;
  if (!res.ok || hasError) {
    const msg = errObj?.message || body?.message || `OxaPay API error ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

export interface OxaPayInvoice {
  track_id: string;
  payment_url: string;
  expired_at: number;
  date: number;
}

export interface OxaPayCreateParams {
  amount: number;           // decimal in `currency` units (e.g. 6.99 USD)
  currency: string;         // e.g. "USD"
  orderId: string;          // our internal UUID
  callbackUrl: string;      // absolute webhook URL
  returnUrl: string;        // absolute success page URL
  description: string;
  email?: string;
  lifetimeMinutes?: number; // default 60
}

export async function createInvoice(params: OxaPayCreateParams): Promise<OxaPayInvoice> {
  const payload: Record<string, unknown> = {
    amount: params.amount,
    currency: params.currency,
    order_id: params.orderId,
    callback_url: params.callbackUrl,
    return_url: params.returnUrl,
    description: params.description,
    lifetime: params.lifetimeMinutes ?? 60,
    fee_paid_by_payer: 1,
    sandbox: isSandbox(),
  };
  if (params.email) payload.email = params.email;

  const body = await oxapayFetch('/payment/invoice', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const data = body?.data;
  if (!data?.payment_url || !data?.track_id) {
    throw new Error('OxaPay response missing payment_url or track_id');
  }
  return {
    track_id: String(data.track_id),
    payment_url: String(data.payment_url),
    expired_at: Number(data.expired_at ?? 0),
    date: Number(data.date ?? 0),
  };
}

export interface OxaPayPaymentInfo {
  track_id: string;
  order_id?: string;
  status: string;     // "Waiting" | "Confirming" | "Paid" | "Expired" | ...
  amount: number;
  currency: string;
  date?: number;
}

export async function getPayment(trackId: string): Promise<OxaPayPaymentInfo> {
  const body = await oxapayFetch(`/payment/${encodeURIComponent(trackId)}`, { method: 'GET' });
  const d = body?.data ?? {};
  return {
    track_id: String(d.track_id ?? trackId),
    order_id: d.order_id ? String(d.order_id) : undefined,
    status: String(d.status ?? 'Unknown'),
    amount: Number(d.amount ?? 0),
    currency: String(d.currency ?? 'USD'),
    date: d.date ? Number(d.date) : undefined,
  };
}

/**
 * OxaPay webhook signature: HMAC-SHA512 of raw request body using
 * MERCHANT_API_KEY as the shared secret. Sent in the `HMAC` header.
 * https://docs.oxapay.com/webhook
 */
export function verifyWebhookSignature(rawBody: string, hmacHeader: string): boolean {
  if (!hmacHeader) return false;
  const expected = crypto
    .createHmac('sha512', getMerchantKey())
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmacHeader, 'hex'),
      Buffer.from(expected, 'hex'),
    );
  } catch {
    return false;
  }
}

/**
 * OxaPay webhook payload shape for invoice payments. `status` values we act on:
 * - "Paid"   → final success (credit the account)
 * - "Paying" / "Confirming" → intermediate, ignore
 * - "Expired" / "Failed" → terminal failure
 */
export interface OxaPayWebhookPayload {
  type: string;           // "invoice"
  track_id: string;
  status: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  email?: string;
  date?: number;
  txs?: Array<{ tx_hash?: string; network?: string; confirmations?: number; status?: string }>;
}
