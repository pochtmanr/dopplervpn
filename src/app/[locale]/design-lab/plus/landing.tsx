import { useTranslations } from 'next-intl';
import { PlusPolicyLinks } from './policy-links';
import { Link } from '@/i18n/navigation';
import { PlatformLogo } from '@/components/glyph/platform-icons';
import { PlatformGlyphBand } from '@/components/glyph/platform-glyph-band';
import { CheckIcon, ShieldIcon, SparkleIcon, UserIcon, featureIcons } from '@/components/account/dashboard/icons';
import { PricingBackdrop } from '@/components/glyph/pricing-glyphs';
import { CARD_HAIRLINE } from '@/components/ui/card-recipes';
import { PLANS } from '@/lib/facts';
import { PaymentMarks } from './payment-marks';
import { PlusFaqAccordion } from './faq';
import { PlusPlate } from './plate';
import {
  ArrowGlyph,
  PLUS_BODY,
  PLUS_BTN,
  PLUS_BTN_SM,
  PLUS_CARD_HOVER,
  PLUS_CHIP,
  PLUS_FOOTER_BTN,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_LABEL,
  PLUS_META,
  PLUS_TITLE,
  PLUS_TITLE_SM,
  PLUS_WELL,
  PlusContainer,
  PlusHeading,
} from '../plus-recipes';

const platforms = [
  { key: 'ios', href: '/vpn-for-ios', store: 'appStore', icon: 'apple' },
  { key: 'android', href: '/vpn-for-android', store: 'googlePlay', icon: 'googlePlay' },
  { key: 'mac', href: '/vpn-for-macos', store: 'macAppStore', icon: 'apple' },
  { key: 'windows', href: '/vpn-for-windows', store: 'directDownload', icon: 'windows' },
] as const;

/** The step articles, as technical-how-it-works.tsx links them. */
const stepHrefs = [
  '/how-it-works/your-device',
  '/how-it-works/vless-reality-tunnel',
  '/how-it-works/edge-network',
  '/tools',
] as const;
const allSteps = ['step1', 'step2', 'step3', 'step4'] as const;

/**
 * `live`: the homepage preview (home-preview.tsx) passes it so the cards link
 * where the shipped ones do. In the lab they stay on `#`.
 */
interface LiveProps {
  live?: boolean;
}

/** Live element: the data-rain well behind the logo, on an inset tray. */
export function PlusPlatforms({ live = false }: LiveProps) {
  const t = useTranslations('platformsAvailable');
  const tApps = useTranslations('apps');
  return (
    <PlusContainer className="py-10">
      <div className="mb-6 text-center">
        <p className={PLUS_LABEL}>{t('eyebrow')}</p>
        <h3 className={`mt-1 ${PLUS_TITLE}`}>{t('title')}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {platforms.map(({ key, href, store, icon }, i) => (
          <Link key={key} href={live ? href : '#'} className={`${PLUS_CARD_HOVER} !flex-row items-center gap-4 !p-3`}>
            <span className={`${PLUS_WELL} h-16 w-20 shrink-0`}>
              <PlatformGlyphBand index={i} />
              <span className="absolute inset-0 flex items-center justify-center">
                <PlatformLogo icon={icon} className="h-7 w-7 text-(--c-text) transition-colors group-hover:text-(--c-accent)" />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block ${PLUS_TITLE_SM}`}>{tApps(`${key}.title`)}</span>
              <span className={`block ${PLUS_META}`}>{t(`stores.${store}`)}</span>
            </span>
            <ArrowGlyph className="me-2 h-4 w-4 text-(--c-tert) group-hover:text-(--c-accent)" />
          </Link>
        ))}
      </div>
    </PlusContainer>
  );
}

/** Live element: the step's own terminal plate, on a tray; the CTA pill sits under it at the end. */
export function PlusTrafficSteps({ live = false }: LiveProps) {
  const t = useTranslations('technicalHowItWorks');
  const steps = live ? allSteps : allSteps.slice(0, 2);
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${live ? 'lg:grid-cols-4' : ''}`}>
      {steps.map((step, i) => (
        <Link key={step} href={live ? stepHrefs[i] : '#'} className={PLUS_CARD_HOVER}>
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold tabular-nums text-(--c-accent)">{String(i + 1).padStart(2, '0')}</span>
            <h3 className={PLUS_TITLE_SM}>{t(`flow.${step}.title`)}</h3>
          </div>
          <p className={`mt-3 ${PLUS_BODY}`}>{t(`flow.${step}.description`)}</p>
          <div className={`mt-auto ${PLUS_WELL} -mx-2 mt-5`}>
            <PlusPlate index={i} />
          </div>
          <div className="mt-4 flex justify-end">
            <span className={PLUS_BTN_SM}>
              {t('readMore')}
              <ArrowGlyph className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Current's pricing glass: translucent so the glyph backdrop reads through it. */
export const PRICING_GLASS =
  'relative overflow-hidden rounded-[22px] border border-(--c-accent)/20 ' +
  'bg-gradient-to-br from-(--c-accent)/[0.08] via-(--c-bg)/60 to-(--c-bg)/75 backdrop-blur-md';

const plusFeatureKeys = ['premiumServers', 'smartRouting', 'alwaysOn', 'devices', 'noLogs', 'support'] as const;

/**
 * Live element: Current's glyph backdrop behind the section (md+, spotlight
 * follows the pointer), seen through Current's glass. Nothing moves inside the
 * card; the CTA is the feature column's attached footer.
 */
export function PlusPricing({ live = false }: LiveProps) {
  const t = useTranslations('pricing');
  const plan = PLANS.annual;
  return (
    <div className="relative overflow-hidden">
      <PricingBackdrop />
      <PlusContainer className="relative py-10">
        <div className={`${PRICING_GLASS} lg:!grid lg:grid-cols-5`}>
          <div className={CARD_HAIRLINE} aria-hidden="true" />
          <div className="flex flex-col p-6 md:p-8 lg:col-span-3">
            <span className={`${PLUS_CHIP} self-start bg-(--c-accent-tint) text-(--c-accent)`}>
              <SparkleIcon className="h-3.5 w-3.5" />
              {t('plusBadge')}
            </span>
            <h3 className={`mt-3 ${PLUS_TITLE}`}>{t('plusSubtitle')}</h3>

            <div role="radiogroup" aria-label={t('durationSelector')} className="mt-6 inline-flex self-start rounded-full bg-(--c-inset) p-1">
              {(['monthly', 'sixMonth', 'annual'] as const).map((d) => (
                <span
                  key={d}
                  role="radio"
                  aria-checked={d === 'annual'}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    d === 'annual' ? 'bg-(--c-accent-fill) text-white' : 'text-(--c-muted)'
                  }`}
                >
                  {t(`durations.${d}`)}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-2">
              <span className="plus-num text-6xl text-(--c-text)">${plan.monthly.toFixed(2)}</span>
              <span className="text-lg font-medium text-(--c-muted)">/mo</span>
              <span className={`ms-1 ${PLUS_CHIP} bg-(--c-accent-tint) text-(--c-accent)`}>
                {t('save')} {plan.savings}%
              </span>
            </div>
            <p className={`mt-1.5 ${PLUS_META}`}>
              <s>${PLANS.monthly.monthly.toFixed(2)}/mo</s> · {t('billed')} ${plan.total.toFixed(2)} {t('perYear')}
            </p>

            <div className="mt-8 flex flex-col items-start gap-2 border-t border-(--c-inset) pt-5 lg:mt-auto">
              <PaymentMarks />
              <p className={PLUS_META}>{t('cryptoPaymentNote')} · {t('taxNote')}</p>
              <PlusPolicyLinks include={['refund', 'webAndStore', 'terms']} />
            </div>
          </div>

          <div className="flex flex-col bg-(--c-inset)/40 p-6 md:p-8 lg:col-span-2">
            <ul className="space-y-3.5">
              {plusFeatureKeys.map((k, i) => (
                <li key={k} className="flex items-center gap-3 text-[15px] font-medium text-(--c-text)">
                  <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-[22px] [&_svg]:w-[22px]`}>
                    {featureIcons[i] ?? <CheckIcon />}
                  </span>
                  {t(`plusFeatures.${k}`)}
                </li>
              ))}
            </ul>
            <p className={`mt-8 text-center ${PLUS_META} lg:mt-auto lg:pt-8`}>{t('trialNote')}</p>
            <div className="-mx-6 -mb-6 mt-4 md:-mx-8 md:-mb-8">
              <Link href={live ? '/account' : '#'} className={`${PLUS_BTN} ${PLUS_FOOTER_BTN}`}>
                {t('plusCta')}
                <ArrowGlyph />
              </Link>
            </div>
          </div>
        </div>
      </PlusContainer>
    </div>
  );
}

const features = [
  { k: 'noRegistration', icon: <UserIcon className="h-6 w-6" /> },
  { k: 'vlessReality', icon: <ShieldIcon className="h-6 w-6" /> },
  { k: 'smartRouting', icon: featureIcons[1] },
  { k: 'cryptoPayment', icon: <SparkleIcon className="h-6 w-6" /> },
  { k: 'minimalData', icon: featureIcons[4] },
  { k: 'dnsProtection', icon: featureIcons[0] },
] as const;

/** No live element of its own: duotone glyphs; the card takes the shadow + teal edge on hover. */
export function PlusFeatures() {
  const t = useTranslations('features');
  return (
    <PlusContainer className="py-10">
      <div className="mb-8 text-center">
        <h3 className={PLUS_TITLE}>{t('title')}</h3>
        <p className={`mx-auto mt-2 max-w-2xl ${PLUS_BODY}`}>{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ k, icon }) => (
          <div key={k} className={PLUS_CARD_HOVER}>
            <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-8 [&_svg]:w-8`}>{icon}</span>
            <h4 className={`mt-5 ${PLUS_TITLE_SM}`}>{t(`items.${k}.title`)}</h4>
            <p className={`mt-1.5 ${PLUS_BODY}`}>{t(`items.${k}.description`)}</p>
          </div>
        ))}
      </div>
    </PlusContainer>
  );
}

/** The homepage FAQ's questions, in the shipped order (sections/faq.tsx, page.tsx's FAQSchema). */
const homeFaqKeys = [
  'what', 'noLogs', 'adBlocker', 'categories', 'devices', 'platforms',
  'whatIsIncluded', 'plans', 'trial', 'cancel', 'restore', 'refund',
] as const;

/**
 * Live element: the open row's teal start bar. Two cards of six at lg+, one open across both.
 * `live`: on the homepage the title is the section's h2, sized like the other preview headers.
 */
export function PlusHomeFaq({ live = false }: LiveProps) {
  const t = useTranslations('faq');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="mx-auto max-w-6xl">
        <PlusFaqAccordion
          columns={2}
          items={homeFaqKeys.map((k) => ({ question: t(`items.${k}.question`), answer: t(`items.${k}.answer`) }))}
        />
      </div>
    </PlusContainer>
  );
}
