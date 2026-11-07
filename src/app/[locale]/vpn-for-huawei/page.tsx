import type { Metadata } from "next";
import { PlatformAppPage } from "@/components/landing/platform-app-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { huaweiApp } from "@/config/platforms/android";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: huaweiApp.slug,
    namespace: huaweiApp.namespace,
    ogType: "website",
    ogImageAlt: huaweiApp.ogImageAlt,
  });
}

export default async function VpnForHuaweiPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformAppPage locale={locale} config={huaweiApp} />;
}
