import { useTranslations } from 'next-intl';
import { PlatformLogo } from '@/components/glyph/platform-icons';
import { PLANS } from '@/lib/facts';
import { CheckIcon, ArrowRightIcon } from '@/components/account/dashboard/icons';
import {
  CALM_BODY,
  CALM_BTN,
  CALM_CARD,
  CALM_CARD_LINK,
  CALM_CHIP,
  CALM_ICON,
  CALM_LABEL,
  CALM_LINK,
  CALM_META,
  CALM_TITLE,
  CALM_TITLE_SM,
  TONE,
} from '../calm-recipes';

function Chevron() {
  return (
    <svg className="h-4 w-4 shrink-0 text-(--c-tert) rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

const platforms = [
  { key: 'ios', store: 'appStore', icon: 'apple' },
  { key: 'android', store: 'googlePlay', icon: 'googlePlay' },
  { key: 'mac', store: 'macAppStore', icon: 'apple' },
  { key: 'windows', store: 'directDownload', icon: 'windows' },
] as const;

/** Recipe A without the glyph strip: icon well, name, store, chevron. */
export function CalmPlatforms() {
  const t = useTranslations('platformsAvailable');
  const tApps = useTranslations('apps');
  return (
    <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 text-center">
        <p className={CALM_LABEL}>{t('eyebrow')}</p>
        <h3 className={`mt-1 ${CALM_TITLE}`}>{t('title')}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {platforms.map(({ key, store, icon }) => (
          <a key={key} href="#" className={`${CALM_CARD_LINK} !flex-row items-center gap-4 !p-4`}>
            <span className={`${CALM_ICON} !h-12 !w-12 ${TONE.neutral}`}>
              <PlatformLogo icon={icon} className="h-6 w-6 text-(--c-text)" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block ${CALM_TITLE_SM}`}>{tApps(`${key}.title`)}</span>
              <span className={`block ${CALM_META}`}>{t(`stores.${store}`)}</span>
            </span>
            <Chevron />
          </a>
        ))}
      </div>
    </div>
  );
}

/** Recipe B without the plate: a numbered step, plain words, a text link. */
export function CalmTrafficSteps() {
  const t = useTranslations('technicalHowItWorks');
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(['step1', 'step2'] as const).map((step, i) => (
        <a key={step} href="#" className={CALM_CARD_LINK}>
          <span className={`${CALM_ICON} ${TONE.teal} font-display text-lg font-semibold`}>{i + 1}</span>
          <h3 className={`mt-5 ${CALM_TITLE_SM}`}>{t(`flow.${step}.title`)}</h3>
          <p className={`mt-1.5 ${CALM_BODY}`}>{t(`flow.${step}.description`)}</p>
          <span className={`mt-auto pt-5 ${CALM_LINK}`}>
            {t('readMore')}
            <ArrowRightIcon className="h-4 w-4 rtl:-scale-x-100" />
          </span>
        </a>
      ))}
    </div>
  );
}

const plusFeatureKeys = ['premiumServers', 'smartRouting', 'alwaysOn', 'devices', 'noLogs', 'support'] as const;

/**
 * Recipe C without the backdrop or the serif: a segmented plan picker (static
 * here, annual selected), the price in the display face, features, one button.
 */
export function CalmPricing() {
  const t = useTranslations('pricing');
  const plan = PLANS.annual;
  return (
    <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 py-10">
      <div className={`${CALM_CARD} !p-0 overflow-hidden lg:!grid lg:grid-cols-5`}>
        <div className="p-6 md:p-8 lg:col-span-3">
          <p className={CALM_LABEL}>{t('plusBadge')}</p>
          <h3 className={`mt-1 ${CALM_TITLE}`}>{t('plusSubtitle')}</h3>

          <div role="radiogroup" aria-label={t('durationSelector')} className="mt-6 inline-flex rounded-full bg-(--c-inset) p-1">
            {(['monthly', 'sixMonth', 'annual'] as const).map((d) => (
              <span
                key={d}
                role="radio"
                aria-checked={d === 'annual'}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  d === 'annual' ? 'bg-(--c-card) text-(--c-text) shadow-sm' : 'text-(--c-muted)'
                }`}
              >
                {t(`durations.${d}`)}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-6xl font-semibold tracking-tight text-(--c-text)">${plan.monthly.toFixed(2)}</span>
            <span className="text-lg text-(--c-muted)">/mo</span>
            <span className={`ms-2 ${CALM_CHIP} ${TONE.teal}`}>
              {t('save')} {plan.savings}%
            </span>
          </div>
          <p className={`mt-2 ${CALM_META}`}>
            {t('billed')} ${plan.total.toFixed(2)} {t('perYear')}
          </p>
          <p className={`mt-6 ${CALM_META}`}>{t('cryptoPaymentNote')}</p>
          <p className={`mt-1 ${CALM_META}`}>{t('taxNote')}</p>
        </div>

        <div className="border-t border-(--c-separator) p-6 md:p-8 lg:col-span-2 lg:border-t-0 lg:border-s flex flex-col">
          <ul className="space-y-3.5">
            {plusFeatureKeys.map((k) => (
              <li key={k} className="flex items-center gap-3 text-[15px] text-(--c-text)">
                <CheckIcon className="h-5 w-5 shrink-0 text-(--c-accent)" />
                {t(`plusFeatures.${k}`)}
              </li>
            ))}
          </ul>
          <button type="button" className={`mt-8 w-full ${CALM_BTN} !h-12`}>
            {t('plusCta')}
          </button>
          <p className={`mt-3 text-center ${CALM_META}`}>{t('trialNote')}</p>
        </div>
      </div>
    </div>
  );
}

const featureKeys = ['noRegistration', 'vlessReality', 'smartRouting', 'cryptoPayment', 'minimalData', 'dnsProtection'] as const;

/** The legacy feature card as a Calm card: same copy, no border, no tile box. */
export function CalmFeatures() {
  const t = useTranslations('features');
  return (
    <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center">
        <h3 className={CALM_TITLE}>{t('title')}</h3>
        <p className={`mx-auto mt-2 max-w-2xl ${CALM_BODY}`}>{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureKeys.map((k) => (
          <div key={k} className={CALM_CARD}>
            <span className={`${CALM_ICON} ${TONE.teal}`}>
              <CheckIcon className="h-5 w-5" />
            </span>
            <h4 className={`mt-5 ${CALM_TITLE_SM}`}>{t(`items.${k}.title`)}</h4>
            <p className={`mt-1.5 ${CALM_BODY}`}>{t(`items.${k}.description`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
