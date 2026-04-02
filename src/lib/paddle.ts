import { Paddle, Environment } from '@paddle/paddle-node-sdk';

function getPaddleApiKey(): string {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error('PADDLE_API_KEY is not configured');
  return key;
}

function getPaddleEnvironment(): Environment {
  const env = process.env.PADDLE_ENVIRONMENT;
  if (env === 'production') return Environment.production;
  return Environment.sandbox;
}

let paddleInstance: Paddle | null = null;

export function getPaddle(): Paddle {
  if (!paddleInstance) {
    paddleInstance = new Paddle(getPaddleApiKey(), {
      environment: getPaddleEnvironment(),
    });
  }
  return paddleInstance;
}

export function getPaddleWebhookSecret(): string {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) throw new Error('PADDLE_WEBHOOK_SECRET is not configured');
  return secret;
}

/**
 * Plan configuration — maps internal plan IDs to Paddle price IDs.
 * All price IDs come from environment variables.
 */
export interface PlanConfig {
  name: string;
  days: number;
  priceId: string;
}

export function getPlans(): Record<string, PlanConfig> {
  const monthlyPriceId = process.env.PADDLE_PRICE_ID_MONTHLY;
  const sixMonthPriceId = process.env.PADDLE_PRICE_ID_6M;
  const yearlyPriceId = process.env.PADDLE_PRICE_ID_YEARLY;

  if (!monthlyPriceId || !sixMonthPriceId || !yearlyPriceId) {
    throw new Error('Missing PADDLE_PRICE_ID_MONTHLY, PADDLE_PRICE_ID_6M, or PADDLE_PRICE_ID_YEARLY');
  }

  return {
    monthly: { name: 'Doppler VPN Pro — Monthly', days: 30, priceId: monthlyPriceId },
    '6month': { name: 'Doppler VPN Pro — 6 Months', days: 180, priceId: sixMonthPriceId },
    yearly: { name: 'Doppler VPN Pro — Yearly', days: 365, priceId: yearlyPriceId },
  };
}

/**
 * Client-side config — safe to expose to the browser.
 */
export function getPaddleClientConfig() {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) throw new Error('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not configured');

  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';

  return { token, environment };
}
