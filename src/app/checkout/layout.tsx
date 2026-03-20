import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Subscribe — Doppler VPN",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
