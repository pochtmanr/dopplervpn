import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SuccessClient } from './success-client';

export const metadata: Metadata = {
  title: 'Welcome to Doppler VPN Pro',
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessClient />
    </Suspense>
  );
}
