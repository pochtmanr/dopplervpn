import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Connectivity check — Doppler",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * /cn-check is its own root layout, deliberately barer than /checkout's.
 *
 * No Google Analytics, no consent banner, no next-intl provider. Every one of
 * those pulls in a third-party origin or a large message bundle, and this page
 * exists to be opened from networks where third-party origins are exactly what
 * is in question — googletagmanager.com is itself blocked in mainland China, so
 * mounting it here would hang the page we are asking someone to load.
 *
 * Nothing on this page is loaded cross-origin: Tailwind is compiled into our
 * own stylesheet and the type is a system font stack, so no fonts.googleapis.com
 * request is made either.
 */
export default function CnCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
