import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SubscribeContent } from './subscribe-content';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function SubscribePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <SubscribeContent />
      <Footer />
    </>
  );
}
