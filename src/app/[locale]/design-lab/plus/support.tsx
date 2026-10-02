import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { TicketPlate } from '@/components/glyph/ticket-plate';
import { MailIcon, TelegramIcon, TrashIcon } from '@/components/account/dashboard/icons';
import { TelegramChat } from '../../support/telegram-chat';
import {
  ArrowGlyph,
  PLUS_BODY,
  PLUS_BTN,
  PLUS_BTN_SECONDARY,
  PLUS_CARD_HOVER,
  PLUS_ICON,
  PLUS_ICON_TONE,
  PLUS_META,
  PLUS_TITLE,
  PLUS_TITLE_SM,
  PLUS_WELL,
} from '../plus-recipes';

function TicketIcon() {
  return (
    <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function Chevron({ className = '' }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 shrink-0 text-(--c-tert) rtl:rotate-180 transition-transform ${className}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function PlusAction({
  tone,
  icon,
  title,
  subtitle,
  cta,
  primary,
  art,
  className = '',
}: {
  tone: keyof typeof PLUS_ICON_TONE;
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  cta: string;
  primary?: boolean;
  /** The card's live element, in a tray on the end half (xl+). */
  art?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${PLUS_CARD_HOVER} min-h-52 ${art ? 'xl:!grid xl:grid-cols-2 xl:gap-5' : ''} ${className}`}>
      <div className="flex h-full flex-col">
        <span className={`${PLUS_ICON} ${PLUS_ICON_TONE[tone]} [&_svg]:h-[30px] [&_svg]:w-[30px]`}>{icon}</span>
        <h3 className={`mt-5 ${PLUS_TITLE_SM}`}>{title}</h3>
        <div className={`mt-1 ${PLUS_BODY}`}>{subtitle}</div>
        <div className="mt-auto pt-5">
          <button type="button" className={primary ? PLUS_BTN : PLUS_BTN_SECONDARY}>
            {cta}
            <ArrowGlyph />
          </button>
        </div>
      </div>
      {art && <div className={`${PLUS_WELL} hidden min-h-44 xl:block`} aria-hidden="true">{art}</div>}
    </div>
  );
}

/** Live elements: the ticket plate and the Telegram chat, each in its card's tray. */
export function PlusSupportActions() {
  const t = useTranslations('support');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      <PlusAction
        className="lg:col-span-6"
        tone="teal"
        icon={<TicketIcon />}
        title={t('actions.submitRequest')}
        subtitle={t('actions.submitRequestDesc')}
        cta={t('actions.submitRequestCta')}
        primary
        art={<TicketPlate />}
      />
      <PlusAction
        className="lg:col-span-6"
        tone="telegram"
        icon={<TelegramIcon className="h-6 w-6" />}
        title={t('contact.telegram')}
        subtitle={<span dir="ltr">{t('contact.telegramBot')}</span>}
        cta={t('actions.submitRequestCta')}
        art={<TelegramChat />}
      />
      <PlusAction
        className="lg:col-span-4"
        tone="blue"
        icon={<BriefcaseIcon />}
        title={t('actions.businessContact')}
        subtitle={t('actions.businessContactDesc')}
        cta={t('actions.businessContactCta')}
      />
      <PlusAction
        className="lg:col-span-4"
        tone="teal"
        icon={<KeyIcon />}
        title={t('actions.restoreAccount')}
        subtitle={t('actions.restoreAccountDesc')}
        cta={t('actions.restoreAccountCta')}
      />
      <PlusAction
        className="md:col-span-2 lg:col-span-4"
        tone="teal"
        icon={<MailIcon className="h-6 w-6" />}
        title={t('contact.email')}
        subtitle={t('contact.responseTime')}
        cta={t('contact.emailAddress')}
      />
      <a href="#" className={`${PLUS_CARD_HOVER} md:col-span-2 lg:col-span-12 !flex-row items-center gap-4 !p-4`}>
        <span className={`${PLUS_ICON} ${PLUS_ICON_TONE.danger} ms-1`}>
          <TrashIcon className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block ${PLUS_TITLE_SM}`}>{t('deleteAccount.title')}</span>
          <span className={`block ${PLUS_META}`}>{t('deleteAccount.step2')}</span>
        </span>
        <ArrowGlyph className="me-1 h-4 w-4 text-(--c-tert)" />
      </a>
    </div>
  );
}

const FAQ_KEYS = ['what', 'cost', 'subscribe', 'multiDevice'] as const;

/** Live element: the open row's teal start bar (recipe D's open state). */
export function PlusFaq() {
  const t = useTranslations('support');
  return (
    <div>
      <h3 className={`mb-4 ${PLUS_TITLE}`}>{t('faq.title')}</h3>
      <div className="overflow-hidden rounded-[22px] bg-(--c-card)">
        {FAQ_KEYS.map((k, i) => (
          <details key={k} open={i === 0} className={`group ${i > 0 ? 'border-t border-(--c-separator)' : ''}`}>
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-[16px] font-bold text-(--c-text) transition-colors hover:bg-(--c-accent-tint)">
              <span className="flex-1">{t(`faq.items.${k}.question`)}</span>
              <Chevron className="calm-chevron" />
            </summary>
            <p className={`px-5 pb-5 ${PLUS_BODY}`}>{t(`faq.items.${k}.answer`)}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
