import type { Metadata } from "next";
import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SubscribeContent } from './subscribe-content';
// Calm+ (design-lab/home-preview.tsx; CALM_PLUS_PREVIEW=0 turns it off).
import { calmPlusPreview, PlusPageShell } from '../design-lab/home-preview';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SubscribePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      {calmPlusPreview ? (
        <PlusPageShell>
          <SubscribeContent plus />
        </PlusPageShell>
      ) : (
        <SubscribeContent />
      )}
      <Footer />
    </>
  );
}
