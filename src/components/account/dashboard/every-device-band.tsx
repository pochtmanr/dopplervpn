'use client';

import { useTranslations } from 'next-intl';
import { PlatformGlyphBand } from '@/components/glyph/platform-glyph-band';
import { PlatformLogo, type PlatformIcon } from '@/components/glyph/platform-icons';
import { trackCta, type CtaPlatform, type CtaVariant } from '@/lib/track-cta';

// Same destinations as the home CTA card (sections/cta.tsx). Signed-in visitors
// want the app itself, not the per-platform marketing page.
const APP_STORE_URL = 'https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=org.dopplervpn.android';
const WINDOWS_X64_URL = '/api/windows/download/latest-x64';

const PLATFORMS: ReadonlyArray<{
  key: 'ios' | 'android' | 'mac' | 'windows';
  store: 'appStore' | 'googlePlay' | 'macAppStore' | 'directDownload';
  icon: PlatformIcon;
  href: string;
  platform: CtaPlatform;
  variant?: CtaVariant;
  download: boolean;
}> = [
  { key: 'ios', store: 'appStore', icon: 'apple', href: APP_STORE_URL, platform: 'ios', download: false },
  { key: 'android', store: 'googlePlay', icon: 'googlePlay', href: GOOGLE_PLAY_URL, platform: 'android', variant: 'android-play', download: false },
  { key: 'mac', store: 'macAppStore', icon: 'apple', href: APP_STORE_URL, platform: 'mac', download: false },
  { key: 'windows', store: 'directDownload', icon: 'windows', href: WINDOWS_X64_URL, platform: 'windows', variant: 'windows-x64', download: true },
];

/** The home page's "Available on" band (card recipe A), pointed straight at the stores. */
export function EveryDeviceBand({ maxDevices }: { maxDevices: number }) {
  const t = useTranslations('platformsAvailable');
  const tApps = useTranslations('apps');
  const tDash = useTranslations('subscribe.dashboard');

  return (
    <section className="mt-5 rounded-2xl border border-overlay/10 bg-bg-secondary/30 px-4 py-6 sm:px-6 md:py-8">
      <div className="text-center mb-5 md:mb-6">
        <p className="text-xs md:text-sm uppercase tracking-wider text-text-tertiary mb-1">{t('eyebrow')}</p>
        <h2 className="font-display text-xl md:text-2xl font-semibold text-text-primary">{t('title')}</h2>
        <p className="mt-2 text-sm text-text-muted max-w-xl mx-auto">
          {tDash('everyDeviceHint', { max: maxDevices })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {PLATFORMS.map((p, i) => (
          <a
            key={p.key}
            href={p.href}
            {...(p.download ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
            onClick={() => trackCta('account-dashboard', p.platform, p.variant)}
            className="group relative flex h-[88px] flex-row overflow-hidden rounded-xl border border-overlay/10 bg-bg-secondary/20 hover:bg-bg-secondary/35 hover:border-accent-teal/30 transition-colors"
          >
            <div className="relative w-[34%] md:w-[26%] shrink-0 overflow-hidden border-e border-overlay/5">
              <PlatformGlyphBand index={i} />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlatformLogo icon={p.icon} className="w-8 h-8 md:w-10 md:h-10 text-text-muted group-hover:text-accent-teal transition-colors" />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5 px-3 md:px-5 py-3 text-start">
              <p className="font-display text-base md:text-xl font-semibold leading-tight text-text-primary">
                {tApps(`${p.key}.title`)}
              </p>
              <p className="text-xs md:text-sm leading-tight text-text-muted">{t(`stores.${p.store}`)}</p>
            </div>

            <svg
              className="hidden md:block me-4 w-4 h-4 shrink-0 self-center text-text-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        ))}
      </div>
    </section>
  );
}
