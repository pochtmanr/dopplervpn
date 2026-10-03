import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
// Calm+ (design-lab/home-preview.tsx; CALM_PLUS_PREVIEW=0 turns it off).
import { calmPlusPreview, PlusPageShell } from "../design-lab/home-preview";

// noindex to match /account — these are account-entry screens, not content.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {calmPlusPreview ? (
        /* The entry screen fills the viewport, so the footer starts below the fold. */
        <PlusPageShell>
          <main className="flex min-h-dvh flex-col justify-center pt-20">{children}</main>
        </PlusPageShell>
      ) : (
        <main className="pt-20">{children}</main>
      )}
      <Footer />
    </>
  );
}
