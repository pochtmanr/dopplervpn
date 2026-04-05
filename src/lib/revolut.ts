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

export interface RevolutOrder {
  id: string;
  token: string;
  state: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
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
