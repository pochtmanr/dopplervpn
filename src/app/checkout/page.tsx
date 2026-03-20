import type { Metadata } from 'next';
import { CheckoutForm } from './checkout-form';

export const metadata: Metadata = {
  title: 'Subscribe — Doppler VPN',
  description: 'Get Doppler VPN Pro access',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ account_id?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.account_id ?? null;

  return <CheckoutForm accountId={accountId} />;
}
