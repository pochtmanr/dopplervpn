import type { Metadata } from "next";
import { PlatformLandingPage } from "@/components/landing/platform-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { windowsPlatform } from "@/config/platforms/windows";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: windowsPlatform.slug,
    namespace: windowsPlatform.namespace,
    ogType: "website",
    ogImageAlt: windowsPlatform.ogImageAlt,
  });
}

export default async function VpnForWindowsPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformLandingPage locale={locale} config={windowsPlatform} />;
}
