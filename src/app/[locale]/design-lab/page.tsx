import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PlatformsAvailable } from '@/components/sections/platforms-available';
import { TrafficStepCard } from '@/components/sections/traffic-step-card';
import { Pricing } from '@/components/sections/pricing';
import { Features } from '@/components/sections/features';
import { RestoreCard } from '@/components/account/dashboard/restore-card';
import { SupportFaq } from '../support/faq';
import { CurrentAccountId, CurrentDevices, CurrentSubscription, CurrentSupportActions } from './current-client';
import { CalmFeatures, CalmPlatforms, CalmPricing, CalmTrafficSteps } from './calm/landing';
import { CalmFaq, CalmSupportActions } from './calm/support';
import {
  CalmAccountId,
  CalmDevices,
  CalmRestore,
  CalmSubscriptionActive,
  CalmSubscriptionPaywall,
} from './calm/dashboard';
import { PlusFeatures, PlusPlatforms, PlusPricing, PlusTrafficSteps } from './plus/landing';
import { PlusFaq, PlusSupportActions } from './plus/support';
import {
  PlusAccountId,
  PlusDevices,
  PlusRestore,
  PlusSubscriptionActive,
  PlusSubscriptionPaywall,
} from './plus/dashboard';
import { LabContent, type LabRow } from './lab-content';
import { MOCK_ACCOUNT_ID, MOCK_ACCOUNT_INFO, MOCK_EXPIRED_AT, MOCK_EXPIRES_AT, mockDevices } from './mocks';
import './calm.css';
import './plus.css';

/** The Android app's face, for the Calm+ pane only. */
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta' });

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
      plus: <PlusSubscriptionActive locale={locale} expiresAt={MOCK_EXPIRES_AT} now={now} />,
    },
    {
      id: 'sub-paywall',
      group: 'Dashboard',
      title: 'Subscription · expired (paywall)',
      source: 'account/dashboard/subscription-card.tsx',
      current: <CurrentSubscription locale={locale} state="expired" expiresAt={MOCK_EXPIRED_AT} />,
      calm: <CalmSubscriptionPaywall locale={locale} expiredAt={MOCK_EXPIRED_AT} />,
      plus: <PlusSubscriptionPaywall locale={locale} expiredAt={MOCK_EXPIRED_AT} />,
    },
    {
      id: 'account-id',
      group: 'Dashboard',
      title: 'Account ID',
      source: 'account/dashboard/account-id-card.tsx',
      current: <CurrentAccountId locale={locale} />,
      calm: <CalmAccountId accountId={MOCK_ACCOUNT_ID} telegram={MOCK_ACCOUNT_INFO.contactValue} />,
      plus: <PlusAccountId accountId={MOCK_ACCOUNT_ID} telegram={MOCK_ACCOUNT_INFO.contactValue} />,
    },
    {
      id: 'devices',
      group: 'Dashboard',
      title: 'My devices',
      source: 'account/dashboard/devices-card.tsx',
      current: <CurrentDevices locale={locale} data={devices} />,
      calm: <CalmDevices data={devices} now={now} locale={locale} />,
      plus: <PlusDevices data={devices} now={now} locale={locale} />,
    },
    {
      id: 'restore',
      group: 'Dashboard',
      title: 'Restore purchases',
      source: 'account/dashboard/restore-card.tsx',
      current: <RestoreCard />,
      calm: <CalmRestore />,
      plus: <PlusRestore />,
    },
  ];

  return (
    <div className={jakarta.variable}>
      <LabContent rows={rows} />
    </div>
  );
}
