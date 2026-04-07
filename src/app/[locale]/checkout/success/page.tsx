import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SuccessClient } from './success-client';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'success' });
  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutSuccessPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <SuccessClient />
    </Suspense>
  );
}
