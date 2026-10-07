import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { PlusFeatures, PlusHomeFaq, PlusPlatforms, PlusPricing, PlusTrafficSteps } from './plus/landing';
import { PlusCensorship } from './plus/censorship';
import { PlusPriceComparison, PlusSpeedComparison } from './plus/bars';
import {
  PlusBlog,
  PlusComparison,
  PlusCta,
  PlusGetStarted,
  PlusPrivacyModel,
  PlusServers,
  PlusUseCases,
  type PlusPost,
} from './plus/home-lower';
import { PLUS_BODY, PLUS_TITLE, PlusContainer } from './plus-recipes';
import { jakarta } from './fonts';
import './calm.css';
import './plus.css';

/**
 * Calm+ is the site's design: pages render these sections and the `plus`
 * branches of the shared components. Set CALM_PLUS_PREVIEW=0 (Vercel env, then
 * redeploy) to fall back to the Glyph Terminal markup, which is still in place.
 */
export const calmPlusPreview = process.env.CALM_PLUS_PREVIEW !== '0';

function Shell({ id, className = '', children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`lab-calm lab-plus ${jakarta.variable} ${className}`}>
      {children}
    </section>
  );
}

/**
 * A whole page in Calm+ (/support, /downloads): the scope plus `.plus-remap`, so
 * markup still on the site tokens (heroes, dialogs, forms) lands on the tonal ramp.
 */
export function PlusPageShell({ children }: { children: ReactNode }) {
  return <div className={`lab-calm lab-plus plus-remap ${jakarta.variable}`}>{children}</div>;
}

export function PreviewPlatforms() {
  // Desktop and tablet only, as the shipped section.
  return (
    <Shell className="hidden md:block">
      <PlusPlatforms live />
    </Shell>
  );
}

export function PreviewFeatures() {
  return (
    <Shell id="features" className="py-6 md:py-10">
      <PlusFeatures live />
    </Shell>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <PlusContainer className="mb-8 text-center">
      <h2 className={`${PLUS_TITLE} md:text-3xl`}>{title}</h2>
      <p className={`mx-auto mt-2 max-w-2xl ${PLUS_BODY}`}>{subtitle}</p>
    </PlusContainer>
  );
}

export function PreviewSteps() {
  const t = useTranslations('technicalHowItWorks');
  return (
    <Shell id="how-doppler-works" className="py-12 md:py-16">
      <Header title={t('title')} subtitle={t('subtitle')} />
      <PlusContainer>
        <PlusTrafficSteps live />
      </PlusContainer>
    </Shell>
  );
}

export function PreviewPricing() {
  const t = useTranslations('pricing');
  return (
    <Shell id="pricing" className="pt-12 pb-6 md:pt-16 md:pb-10">
      <Header title={t('title')} subtitle={t('subtitle')} />
      <PlusPricing live />
    </Shell>
  );
}

export function PreviewFaq() {
  return (
    <Shell id="faq" className="py-6 md:py-10">
      <PlusHomeFaq live />
    </Shell>
  );
}

export function PreviewCensorship() {
  return (
    <Shell id="censorship-resistance" className="py-6 md:py-10">
      <PlusCensorship live />
    </Shell>
  );
}

export function PreviewSpeed() {
  return (
    <Shell id="speed-comparison" className="py-6 md:py-10">
      <PlusSpeedComparison live />
    </Shell>
  );
}

export function PreviewPriceComparison() {
  return (
    <Shell id="price-comparison" className="py-6 md:py-10">
      <PlusPriceComparison live />
    </Shell>
  );
}

export function PreviewComparison() {
  return (
    <Shell id="comparison" className="py-6 md:py-10">
      <PlusComparison live />
    </Shell>
  );
}

export function PreviewUseCases() {
  return (
    <Shell id="use-cases" className="py-6 md:py-10">
      <PlusUseCases live />
    </Shell>
  );
}

export function PreviewServers() {
  return (
    <Shell id="servers" className="py-6 md:py-10">
      <PlusServers live />
    </Shell>
  );
}

export function PreviewPrivacy() {
  return (
    <Shell id="privacy-model" className="py-6 md:py-10">
      <PlusPrivacyModel live />
    </Shell>
  );
}

export function PreviewGetStarted() {
  return (
    <Shell id="how-it-works" className="py-6 md:py-10">
      <PlusGetStarted live />
    </Shell>
  );
}

export function PreviewCta() {
  return (
    <Shell className="py-6 md:py-10">
      <PlusCta />
    </Shell>
  );
}

export function PreviewBlog({ posts, locale }: { posts: PlusPost[]; locale: string }) {
  if (posts.length === 0) return null;
  return (
    <Shell id="blog" className="py-6 md:py-10">
      <PlusBlog posts={posts} locale={locale} live />
    </Shell>
  );
}
