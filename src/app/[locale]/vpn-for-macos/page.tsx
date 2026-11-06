import type { Metadata } from "next";
import { AppleAppPage } from "@/components/landing/apple-app-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { macosApple } from "@/config/platforms/apple";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: macosApple.slug,
    namespace: macosApple.namespace,
    ogType: "website",
    ogImageAlt: macosApple.ogImageAlt,
  });
}

export default async function VpnForMacosPage({ params }: PageProps) {
  const { locale } = await params;
  return <AppleAppPage locale={locale} config={macosApple} />;
}
