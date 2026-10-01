import 'server-only';

function getBaseUrl(): string {
  const env = process.env.REVOLUT_ENVIRONMENT;
  if (env === 'production' || env === 'prod') {
    return 'https://merchant.revolut.com/api';
  }
  return 'https://sandbox-merchant.revolut.com/api';
}

function getSecretKey(): string {
  const key = process.env.REVOLUT_SECRET_KEY;
  if (!key) throw new Error('REVOLUT_SECRET_KEY is not configured');
  return key;
}

async function revolutFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Revolut-Api-Version': '2025-12-04',
      Authorization: `Bearer ${getSecretKey()}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Revolut API error ${res.status}: ${body}`);
  }

  return res.json();
}

export interface RevolutOrderPayment {
  id?: string;
  state?: string;
  payment_method?: {
    type?: string;
    subtype?: string;
  };
}

export interface RevolutOrder {
  id: string;
  token: string;
  state: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  payments?: RevolutOrderPayment[];
}

export async function createOrder(
  amount: number,
  currency: string,
  description: string,
  metadata: Record<string, string>,
): Promise<RevolutOrder> {
  return revolutFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency,
      description,
      metadata,
    }),
  });
}

export async function getOrder(orderId: string): Promise<RevolutOrder> {
  return revolutFetch(`/orders/${encodeURIComponent(orderId)}`);
}

/** The payments on an order, each with the `fees` Revolut charged on it. */
export async function getOrderPayments(orderId: string): Promise<unknown[]> {
  const body = await revolutFetch(`/orders/${encodeURIComponent(orderId)}/payments`);
  if (Array.isArray(body)) return body;
  const nested = (body as { payments?: unknown })?.payments;
  return Array.isArray(nested) ? nested : [];
}

/** One payment's details, including the `fees` Revolut charged on it. */
export async function getPaymentDetails(paymentId: string): Promise<unknown> {
  return revolutFetch(`/payments/${encodeURIComponent(paymentId)}`);
}
