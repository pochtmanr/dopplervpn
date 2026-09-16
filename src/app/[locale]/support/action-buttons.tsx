'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/components/ui/reveal';
import { ObfuscatedEmail } from '@/components/ui/obfuscated-email';
import { TicketPlate } from '@/components/glyph/ticket-plate';
import { TelegramChat } from './telegram-chat';
import {
  CARD,
  CARD_BLUE,
  CARD_HAIRLINE,
  CARD_HAIRLINE_BLUE,
  CARD_TITLE,
  CTA_PILL,
  DELETE_TILE,
  KEY_PILL,
  ROW_TEXT,
  ROW_TILE,
  ROW_TILE_BLUE,
  ROW_TILE_TELEGRAM,
  ROW_TITLE,
} from '@/components/ui/card-recipes';

/* ── Icons ────────────────────────────────────────────────────────── */

function TicketIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function KeyIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function BriefcaseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}

/** Telegram's paper plane on its own, for a tile like every other card's icon. */
function TelegramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="3.5 4.5 16 16" fill="currentColor" aria-hidden="true">
      <path d="M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function EmailIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function TrashIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ── Recipes ──────────────────────────────────────────────────────── */
// Five action cards, one structure (DESIGN.md, "Downloads ↔ support"): icon tile
// top-start → title → subtitle → CTA pill bottom-end, diagonally opposite the
// icon. The title is the card's one control, stretched over the whole card with
// ::after, so nothing interactive is nested. The foot pill is a <span>, except on
// the email card, where the revealed mailto itself is the stretched control.
// Artwork is extra, xl+ only, in a well beside the copy; below xl the five cards
// are identical and still (a display:none well never mounts its animation).

const STRETCH =
  "cursor-pointer text-start focus-visible:outline-none after:absolute after:inset-0 after:z-10 after:content-['']";

const FOCUS_RING =
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg-primary';

const TEAL_CARD = `${CARD} ${FOCUS_RING} has-[:focus-visible]:ring-accent-teal-light`;
const BLUE_CARD = `${CARD_BLUE} ${FOCUS_RING} has-[:focus-visible]:ring-accent-blue-light`;

/** Recipe B in Telegram blue, as the business card is in its blue. */
const TELEGRAM_CARD =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-telegram/25 ' +
  'bg-gradient-to-br from-telegram/[0.16] via-bg-secondary/60 to-telegram/[0.05] backdrop-blur-sm ' +
  `hover:border-telegram/45 transition-colors duration-300 ${FOCUS_RING} has-[:focus-visible]:ring-telegram`;
const TELEGRAM_HAIRLINE =
  'absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-telegram/70 to-transparent';

/** Recipe A row in danger: rare, required by the stores, kept quiet. */
const DELETE_ROW =
  'group relative flex min-h-[88px] flex-row items-center overflow-hidden rounded-xl ' +
  'border border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-danger/30 transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary';

/* ── Card ─────────────────────────────────────────────────────────── */

/**
 * Every action card. `title` is the control node (button / link / plain text on
 * the email card); `art` adds a well on the end half, xl+ only (at lg the half is too narrow).
 */
function ActionCard({
  surface,
  hairline,
  tile,
  icon,
  title,
  subtitle,
  cta,
  art,
}: {
  surface: string;
  hairline: string;
  tile: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  cta: React.ReactNode;
  art?: React.ReactNode;
}) {
  return (
    <div className={`${surface} min-h-56`}>
      <span className={hairline} aria-hidden="true" />
      <div className={`grid min-h-0 flex-1 grid-cols-1 ${art ? 'xl:grid-cols-2' : ''}`}>
        <div className="flex h-full min-w-0 flex-col p-6">
          <div className={tile}>{icon}</div>
          <h3 className={`mt-5 ${CARD_TITLE}`}>{title}</h3>
          <div className="mt-1.5 text-sm leading-relaxed text-text-muted">{subtitle}</div>
          <div className="mt-auto flex pt-5">{cta}</div>
        </div>
        {art && (
          <div className="relative hidden overflow-hidden border-s border-overlay/5 xl:block" aria-hidden="true">
            {art}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

interface ActionButtonsProps {
  onOpenTicket: () => void;
  onOpenRestore: () => void;
  onOpenBusiness: () => void;
}

export function ActionButtons({ onOpenTicket, onOpenRestore, onOpenBusiness }: ActionButtonsProps) {
  const t = useTranslations('support');

  return (
    <div id="contact" className="scroll-mt-28">
      <h2 className="sr-only">{t('contact.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5">
        {/* ── 1 · Submit a request ──────────────────────────────────── */}
        <Reveal className="h-full lg:col-span-6">
          <ActionCard
            surface={TEAL_CARD}
            hairline={CARD_HAIRLINE}
            tile={ROW_TILE}
            icon={<TicketIcon />}
            title={
              <button type="button" onClick={onOpenTicket} className={STRETCH}>
                {t('actions.submitRequest')}
              </button>
            }
            subtitle={t('actions.submitRequestDesc')}
            cta={
              <span className={`ms-auto ${KEY_PILL}`}>
                {t('actions.submitRequestCta')}
                <ArrowIcon />
              </span>
            }
            art={<TicketPlate />}
          />
        </Reveal>

        {/* ── 2 · Telegram — same card, chat in the well ───────────── */}
        <Reveal delay={50} className="h-full lg:col-span-6">
          <ActionCard
            surface={TELEGRAM_CARD}
            hairline={TELEGRAM_HAIRLINE}
            tile={ROW_TILE_TELEGRAM}
            icon={<TelegramIcon />}
            title={
              <a
                href="https://t.me/DopplerSupportBot"
                target="_blank"
                rel="noopener noreferrer"
                className={STRETCH}
              >
                {t('contact.telegram')}
              </a>
            }
            subtitle={<span dir="ltr">{t('contact.telegramBot')}</span>}
            cta={
              <span className={`ms-auto cta-key-telegram ${KEY_PILL}`}>
                {t('actions.submitRequestCta')}
                <ArrowIcon />
              </span>
            }
            art={<TelegramChat />}
          />
        </Reveal>

        {/* ── 3 · Business ───────────────────────────────────────────── */}
        <Reveal delay={100} className="h-full lg:col-span-4">
          <ActionCard
            surface={BLUE_CARD}
            hairline={CARD_HAIRLINE_BLUE}
            tile={ROW_TILE_BLUE}
            icon={<BriefcaseIcon />}
            title={
              <button type="button" onClick={onOpenBusiness} className={STRETCH}>
                {t('actions.businessContact')}
              </button>
            }
            subtitle={t('actions.businessContactDesc')}
            cta={
              <span className={`ms-auto cta-key-blue ${KEY_PILL}`}>
                {t('actions.businessContactCta')}
                <ArrowIcon />
              </span>
            }
          />
        </Reveal>

        {/* ── 4 · Restore account ────────────────────────────────────── */}
        <Reveal delay={150} className="h-full lg:col-span-4">
          <ActionCard
            surface={TEAL_CARD}
            hairline={CARD_HAIRLINE}
            tile={ROW_TILE}
            icon={<KeyIcon />}
            title={
              <button type="button" onClick={onOpenRestore} className={STRETCH}>
                {t('actions.restoreAccount')}
              </button>
            }
            subtitle={t('actions.restoreAccountDesc')}
            cta={
              <span className={`ms-auto ${KEY_PILL}`}>
                {t('actions.restoreAccountCta')}
                <ArrowIcon />
              </span>
            }
          />
        </Reveal>

        {/* ── 5 · Email — the address stays obfuscated in the HTML; spans
             both columns on md so the 2-up grid has no hole ───────────── */}
        <Reveal delay={200} className="h-full md:col-span-2 lg:col-span-4">
          <ActionCard
            surface={TEAL_CARD}
            hairline={CARD_HAIRLINE}
            tile={ROW_TILE}
            icon={<EmailIcon />}
            title={t('contact.email')}
            subtitle={t('contact.responseTime')}
            cta={
              <ObfuscatedEmail
                user="support"
                domain="simnetiq.store"
                className={`ms-auto cta-flat ${CTA_PILL} ${STRETCH}`}
              />
            }
          />
        </Reveal>

        {/* ── 6 · Delete account — a quiet full-width row ────────────── */}
        <Reveal delay={250} className="md:col-span-2 lg:col-span-12">
          <Link id="delete-account" href="/delete-account" className={`scroll-mt-28 ${DELETE_ROW}`}>
            <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
              <div className={DELETE_TILE}>
                <TrashIcon />
              </div>
              <div className="min-w-0 text-start">
                <h3 className={ROW_TITLE}>{t('deleteAccount.title')}</h3>
                <p className={ROW_TEXT}>{t('deleteAccount.step2')}</p>
              </div>
            </div>
            <svg
              className="me-5 w-4 h-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
