import { Navbar } from '@/components/layout/navbar';
import { PageLoader } from '@/components/ui/page-loader';

// Shown while navigating here; the navbar stays so the page doesn't blank out.
export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg-primary text-text-primary pt-24">
        <PageLoader />
      </main>
    </>
  );
}
