import type { Metadata } from "next";
import { PlatformLandingPage } from "@/components/landing/platform-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { macosPlatform } from "@/config/platforms/macos";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: macosPlatform.slug,
    namespace: macosPlatform.namespace,
    ogType: "website",
    ogImageAlt: macosPlatform.ogImageAlt,
  });
}

export default async function VpnForMacosPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformLandingPage locale={locale} config={macosPlatform} />;
}
