import type { ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ArrowGlyph,
  PLUS_BODY,
  PLUS_BTN_SM,
  PLUS_CARD,
  PLUS_CARD_HOVER,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_TITLE_SM,
  PLUS_WELL,
  PlusContainer,
  PlusHeading,
} from '../plus-recipes';

/** The shipped section's glyphs (sections/censorship-resistance.tsx), at Calm+ size. */
const icons: Record<'dpi' | 'tls' | 'fingerprint' | 'regions', ReactNode> = {
  dpi: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
    </svg>
  ),
  tls: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  fingerprint: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
    </svg>
  ),
  regions: (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  ),
};

const techKeys = ['dpi', 'tls', 'fingerprint'] as const;

/**
 * Three technique cards, then the "still operational" card at full width.
 * Live element: the shipped section's photo, kept, in that card's tray (still: no zoom on hover).
 */
export function PlusCensorship({ live = false }: { live?: boolean }) {
  const t = useTranslations('censorshipResistance');
  return (
    <PlusContainer className="py-10">
      <PlusHeading title={t('title')} subtitle={t('subtitle')} live={live} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {techKeys.map((k) => (
          <div key={k} className={PLUS_CARD}>
            <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-8 [&_svg]:w-8`}>{icons[k]}</span>
            <h3 className={`mt-5 ${PLUS_TITLE_SM}`}>{t(`items.${k}.title`)}</h3>
            <p className={`mt-1.5 ${PLUS_BODY}`}>{t(`items.${k}.description`)}</p>
          </div>
        ))}

        <Link
          href={live ? '/bypass-censorship' : '#'}
          className={`${PLUS_CARD_HOVER} gap-5 md:col-span-3 md:!grid md:grid-cols-2 md:items-stretch`}
        >
          <div className="flex flex-col">
            <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.teal} [&_svg]:h-8 [&_svg]:w-8`}>{icons.regions}</span>
            <h3 className={`mt-5 ${PLUS_TITLE_SM}`}>{t('items.regions.title')}</h3>
            <p className={`mt-1.5 ${PLUS_BODY}`}>{t('items.regions.description')}</p>
            <div className="mt-auto flex pt-5">
              <span className={PLUS_BTN_SM}>
                {t('learnMore')}
                <ArrowGlyph className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
          <div className={`${PLUS_WELL} order-first min-h-48 md:order-none md:min-h-56`}>
            <Image
              src="/images/downloads.avif"
              alt={t('items.regions.title')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Link>
      </div>
    </PlusContainer>
  );
}
