import type { Metadata } from "next";
import { PlatformLandingPage } from "@/components/landing/platform-landing-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { androidPlatform } from "@/config/platforms/android";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: androidPlatform.slug,
    namespace: androidPlatform.namespace,
    ogType: "website",
    ogImageAlt: androidPlatform.ogImageAlt,
  });
}

export default async function VpnForAndroidPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformLandingPage locale={locale} config={androidPlatform} />;
}
