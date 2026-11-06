import type { Metadata } from "next";
import { AppleAppPage } from "@/components/landing/apple-app-page";
import { buildSeoLandingMetadata } from "@/components/landing/seo-landing-metadata";
import { ipadApple } from "@/config/platforms/apple";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildSeoLandingMetadata({
    locale,
    slug: ipadApple.slug,
    namespace: ipadApple.namespace,
    ogType: "website",
    ogImageAlt: ipadApple.ogImageAlt,
  });
}

export default async function VpnForIpadPage({ params }: PageProps) {
  const { locale } = await params;
  return <AppleAppPage locale={locale} config={ipadApple} />;
}
