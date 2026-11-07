import type { Metadata } from "next";
import { PlatformAppPage } from "@/components/landing/platform-app-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { androidApp } from "@/config/platforms/android";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: androidApp.slug,
    namespace: androidApp.namespace,
    ogType: "website",
    ogImageAlt: androidApp.ogImageAlt,
  });
}

export default async function VpnForAndroidPage({ params }: PageProps) {
  const { locale } = await params;
  return <PlatformAppPage locale={locale} config={androidApp} />;
}
