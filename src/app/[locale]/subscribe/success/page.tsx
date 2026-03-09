import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SuccessContent } from './success-content';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SubscribeSuccessPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <SuccessContent />
      <Footer />
    </>
  );
}
