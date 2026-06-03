import type { Metadata } from "next";
import "@/app/globals.css";
import { SITE_URL } from "@/lib/facts";

export const metadata: Metadata = {
  title: "Agent Hub — Doppler VPN",
  description:
    "Machine-readable entry point for AI agents: capability manifest, structured endpoints, pricing, network map, and policies for Doppler VPN.",
  alternates: { canonical: `${SITE_URL}/agents` },
  robots: { index: true, follow: true },
};

export default function AgentsLayout({
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
