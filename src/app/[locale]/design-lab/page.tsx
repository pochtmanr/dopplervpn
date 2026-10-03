import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PlatformsAvailable } from '@/components/sections/platforms-available';
import { TrafficStepCard } from '@/components/sections/traffic-step-card';
import { Pricing } from '@/components/sections/pricing';
import { Features } from '@/components/sections/features';
import { FAQ } from '@/components/sections/faq';
import { CensorshipResistance } from '@/components/sections/censorship-resistance';
import { SpeedComparison } from '@/components/sections/speed-comparison';
import { PriceComparison } from '@/components/sections/price-comparison';
import { ComparisonTable } from '@/components/sections/comparison-table';
import { UseCases } from '@/components/sections/use-cases';
import { Servers } from '@/components/sections/servers';
import { PrivacyModel } from '@/components/sections/privacy-model';
import { HowItWorks } from '@/components/sections/how-it-works';
import { CTA } from '@/components/sections/cta';
import { RestoreCard } from '@/components/account/dashboard/restore-card';
import { SupportFaq } from '../support/faq';
import {
  CurrentAccountId,
  CurrentDevices,
  CurrentSubscription,
  CurrentSupportActions,
  LabAuthPanel,
  LabPlanPicker,
} from './current-client';
import { CalmFeatures, CalmPlatforms, CalmPricing, CalmTrafficSteps } from './calm/landing';
import { CalmFaq, CalmSupportActions } from './calm/support';
import {
  CalmAccountId,
  CalmDevices,
  CalmRestore,
  CalmSubscriptionActive,
  CalmSubscriptionPaywall,
} from './calm/dashboard';
import { PlusFeatures, PlusHomeFaq, PlusPlatforms, PlusPricing, PlusTrafficSteps } from './plus/landing';
import { PlusFaq, PlusSupportActions } from './plus/support';
import { PlusCensorship } from './plus/censorship';
import { PlusPriceComparison, PlusSpeedComparison } from './plus/bars';
import { PlusComparison, PlusCta, PlusGetStarted, PlusPrivacyModel, PlusServers, PlusUseCases } from './plus/home-lower';
import { PlusBlogCard } from './plus/blog';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogContent } from '@/components/blog/blog-content';
import { ContactRemovalPanel } from '../support/contact-removal-panel';
import { LabContent, type LabRow } from './lab-content';
import { jakarta } from './fonts';
import {
  MOCK_ACCOUNT_ID,
  MOCK_ACCOUNT_INFO,
  MOCK_ARTICLE,
  MOCK_EXPIRED_AT,
  MOCK_EXPIRES_AT,
  MOCK_POST,
  mockDevices,
} from './mocks';
import './calm.css';
import './plus.css';


/**
 * Design Lab: the common cards from the landing, /support and the account
 * dashboard, each shown as it ships beside an experimental direction.
 * Local only — 404 in any production build unless DESIGN_LAB=1.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Design Lab',
  robots: { index: false, follow: false },
};

const labEnabled = () => process.env.NODE_ENV !== 'production' || process.env.DESIGN_LAB === '1';

const FAQ_KEYS = ['what', 'cost', 'subscribe', 'multiDevice'] as const;

export default async function DesignLabPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!labEnabled()) notFound();
  const { locale } = await params;
  setRequestLocale(locale);

  const tSupport = await getTranslations('support');
  const tSteps = await getTranslations('technicalHowItWorks');
  const now = Date.now();
  const devices = mockDevices(now);

  const rows: LabRow[] = [
    {
      id: 'platforms',
      group: 'Landing',
      title: 'Platform row card (recipe A)',
      source: 'sections/platforms-available.tsx',
      wide: true,
      current: <PlatformsAvailable />,
      calm: <CalmPlatforms />,
      plus: <PlusPlatforms />,
    },
    {
      id: 'traffic-steps',
      group: 'Landing',
      title: 'Step card with terminal plate (recipe B)',
      source: 'sections/traffic-step-card.tsx',
      current: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['step1', 'step2'] as const).map((s, i) => (
            <TrafficStepCard
              key={s}
              index={i}
              title={tSteps(`flow.${s}.title`)}
              description={tSteps(`flow.${s}.description`)}
              href="/how-it-works"
              linkLabel={tSteps('readMore')}
            />
          ))}
        </div>
      ),
      calm: <CalmTrafficSteps />,
      plus: <PlusTrafficSteps />,
    },
    {
      id: 'pricing',
      group: 'Landing',
      title: 'Pricing card (recipe C)',
      source: 'sections/pricing.tsx',
      wide: true,
      current: <Pricing />,
      calm: <CalmPricing />,
      plus: <PlusPricing />,
    },
    {
      id: 'features',
      group: 'Landing',
      title: 'Feature cards (legacy card)',
      source: 'sections/features.tsx',
      wide: true,
      current: <Features />,
      calm: <CalmFeatures />,
      plus: <PlusFeatures />,
    },
    {
      id: 'censorship',
      group: 'Landing',
      title: 'Built to bypass censorship',
      source: 'sections/censorship-resistance.tsx',
      wide: true,
      current: <CensorshipResistance />,
      plus: <PlusCensorship />,
    },
    ...(
      [
        ['speed', 'Speed comparison', 'sections/speed-comparison.tsx', <SpeedComparison key="c" />, <PlusSpeedComparison key="p" />],
        ['price-comparison', 'Price comparison', 'sections/price-comparison.tsx', <PriceComparison key="c" />, <PlusPriceComparison key="p" />],
        ['comparison', 'Doppler vs. traditional VPNs', 'sections/comparison-accordion.tsx', <ComparisonTable key="c" />, <PlusComparison key="p" />],
        ['use-cases', 'Use cases', 'sections/use-cases.tsx', <UseCases key="c" />, <PlusUseCases key="p" />],
        ['servers', 'Server network', 'sections/servers.tsx', <Servers key="c" />, <PlusServers key="p" />],
        ['privacy', "What we don't store", 'sections/privacy-model.tsx', <PrivacyModel key="c" />, <PlusPrivacyModel key="p" />],
        ['get-started', 'Get started in three steps', 'sections/how-it-works.tsx', <HowItWorks key="c" />, <PlusGetStarted key="p" />],
        ['cta', 'Closing download card', 'sections/cta.tsx', <CTA key="c" />, <PlusCta key="p" />],
      ] as const
    ).map(([id, title, source, current, plus]) => ({ id, group: 'Landing', title, source, wide: true, current, plus }) as LabRow),
    {
      id: 'home-faq',
      group: 'Landing',
      title: 'Homepage FAQ',
      source: 'sections/faq.tsx',
      wide: true,
      current: <FAQ />,
      plus: <PlusHomeFaq />,
    },
    {
      id: 'support-actions',
      group: 'Support',
      title: 'Action cards + delete row',
      source: 'support/action-buttons.tsx',
      wide: true,
      current: (
        <div className="p-5 md:p-6">
          <CurrentSupportActions />
        </div>
      ),
      calm: (
        <div className="p-5 md:p-6">
          <CalmSupportActions />
        </div>
      ),
      plus: (
        <div className="p-5 md:p-6">
          <PlusSupportActions />
        </div>
      ),
    },
    {
      id: 'faq',
      group: 'Support',
      title: 'FAQ accordion',
      source: 'support/faq.tsx → ui/accordion.tsx',
      current: (
        <div>
          <h3 className="mb-4 font-display text-2xl font-semibold text-text-primary">{tSupport('faq.title')}</h3>
          <SupportFaq
            items={FAQ_KEYS.map((k) => ({
              question: tSupport(`faq.items.${k}.question`),
              answer: tSupport(`faq.items.${k}.answer`),
            }))}
          />
        </div>
      ),
      calm: <CalmFaq />,
      plus: <PlusFaq />,
    },
    {
      id: 'sub-active',
      group: 'Dashboard',
      title: 'Subscription · active Pro',
      source: 'account/dashboard/subscription-card.tsx',
      current: <CurrentSubscription locale={locale} state="active" expiresAt={MOCK_EXPIRES_AT} />,
      calm: <CalmSubscriptionActive locale={locale} expiresAt={MOCK_EXPIRES_AT} />,
      plus: <CurrentSubscription locale={locale} state="active" expiresAt={MOCK_EXPIRES_AT} plus />,
    },
    {
      id: 'sub-paywall',
      group: 'Dashboard',
      title: 'Subscription · expired (paywall)',
      source: 'account/dashboard/subscription-card.tsx',
      current: <CurrentSubscription locale={locale} state="expired" expiresAt={MOCK_EXPIRED_AT} />,
      calm: <CalmSubscriptionPaywall locale={locale} expiredAt={MOCK_EXPIRED_AT} />,
      plus: <CurrentSubscription locale={locale} state="expired" expiresAt={MOCK_EXPIRED_AT} plus />,
    },
    {
      id: 'account-id',
      group: 'Dashboard',
      title: 'Account ID',
      source: 'account/dashboard/account-id-card.tsx',
      current: <CurrentAccountId locale={locale} />,
      calm: <CalmAccountId accountId={MOCK_ACCOUNT_ID} telegram={MOCK_ACCOUNT_INFO.contactValue} />,
      plus: <CurrentAccountId locale={locale} plus />,
    },
    {
      id: 'devices',
      group: 'Dashboard',
      title: 'My devices',
      source: 'account/dashboard/devices-card.tsx',
      current: <CurrentDevices locale={locale} data={devices} />,
      calm: <CalmDevices data={devices} now={now} locale={locale} />,
      plus: (
        <div className="space-y-5">
          <CurrentDevices locale={locale} data={devices} plus />
          <CurrentDevices locale={locale} data={devices} plus state="loading" />
          <CurrentDevices locale={locale} data={devices} plus state="error" />
          <CurrentDevices locale={locale} data={devices} plus state="empty" />
        </div>
      ),
    },
    {
      id: 'restore',
      group: 'Dashboard',
      title: 'Restore purchases',
      source: 'account/dashboard/restore-card.tsx',
      current: <RestoreCard />,
      calm: <CalmRestore />,
      plus: <RestoreCard plus />,
    },
    {
      id: 'plan-picker',
      group: 'Dashboard',
      title: 'Plan picker + checkout',
      source: 'account/subscribe-content.tsx (plansView) → plus/plan-picker.tsx',
      current: (
        <p className="text-sm text-text-tertiary">
          The shipped picker is inline JSX in subscribe-content.tsx; see /en/account with the flag off.
        </p>
      ),
      plus: <LabPlanPicker />,
    },
    {
      id: 'contact-removal',
      group: 'Support',
      title: 'Remove a support contact',
      source: 'support/contact-removal-panel.tsx',
      wide: true,
      current: (
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <ContactRemovalPanel />
        </div>
      ),
      plus: (
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <ContactRemovalPanel plus />
        </div>
      ),
    },
    {
      id: 'blog-card',
      group: 'Blog',
      title: 'Post card (index, related, homepage)',
      source: 'blog/blog-card.tsx → plus/blog.tsx',
      current: (
        <div className="max-w-sm">
          <BlogCard {...MOCK_POST} locale={locale} readMoreText="Read more" />
        </div>
      ),
      plus: (
        <div className="max-w-sm">
          <PlusBlogCard post={MOCK_POST} locale={locale} readMoreText="Read more" href="#" />
        </div>
      ),
    },
    {
      id: 'article-body',
      group: 'Blog',
      title: 'Article body (prose, quote, code, table, inline CTA)',
      source: 'blog/blog-content.tsx',
      current: <BlogContent content={MOCK_ARTICLE} locale={locale} />,
      plus: <BlogContent content={MOCK_ARTICLE} locale={locale} plus />,
    },
    {
      id: 'auth-panel',
      group: 'Auth',
      title: 'Sign-up panel (/signup, /login, signed-out /account)',
      source: 'account/auth-panel.tsx',
      current: <LabAuthPanel />,
      plus: <LabAuthPanel plus />,
    },
  ];

  return (
    <div className={jakarta.variable}>
      <LabContent rows={rows} />
    </div>
  );
}
