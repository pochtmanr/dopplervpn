'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CARD, CARD_HAIRLINE, CTA_PILL, KEY_PILL } from '@/components/ui/card-recipes';
import { CONTACT } from '@/lib/facts';
import type { AccountInfo } from '../types';
import { IconButton } from './icon-button';
import {
  CheckIcon,
  CopyIcon,
  EllipsisIcon,
  LogOutIcon,
  MailIcon,
  ShareIcon,
  TelegramIcon,
  TrashIcon,
  WarningIcon,
} from './icons';
import { onMenuKeyDown, usePopover } from './popover';
import { SendToDevices } from './send-to-devices';
import { EYEBROW, FOCUS, MENU_ITEM, MENU_ITEM_DANGER, MENU_PANEL, ORB } from './ui';

const COPIED_MS = 2000;
/** Long enough to see the check land before the dashboard goes away. */
const LOGOUT_AFTER_COPY_MS = 600;

const PANEL_SHOWN = 'opacity-100 translate-y-0';
const PANEL_HIDDEN = 'opacity-0 -translate-y-1';

interface AccountIdCardProps {
  accountId: string;
  locale: string;
  accountInfo: AccountInfo | null;
  isActivePro: boolean;
  /** A brand-new account whose ID the visitor may not have saved yet. */
  unsavedId: boolean;
  onLogout: () => void;
  onDeleteRequest: () => void;
  onConnectEmail: () => void;
  onShowContacts: () => void;
}

/**
 * Card recipe B: the ID with its copy control, the account's actions in a
 * toolbar at the top-end, send-to-devices as the one key. No glyph plate: the
 * card is for acting on the account, and motion there only competed with the ID.
 *
 * Destructive actions sit behind a step on purpose: log out asks first (the ID
 * is the only way back in), delete lives in the ⋯ menu and then opens a dialog.
 */
export function AccountIdCard({
  accountId,
  locale,
  accountInfo,
  isActivePro,
  unsavedId,
  onLogout,
  onDeleteRequest,
  onConnectEmail,
  onShowContacts,
}: AccountIdCardProps) {
  const t = useTranslations('subscribe');
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logout = usePopover();
  const menu = usePopover();

  /* Clear both timers on unmount (logging out unmounts this card) */
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    },
    [],
  );

  const contact = accountInfo?.contactValue ?? null;
  const hasTelegram = accountInfo?.contactMethod === 'telegram' && !!contact;
  const hasEmail = accountInfo?.contactMethod === 'email' && !!contact;
  const verifiedLabel = accountInfo?.contactVerified ? t('dashboard.verified') : t('dashboard.unverified');

  const copyId = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(accountId);
    } catch {
      // Clipboard blocked; the ID is selectable text beside the button.
      return false;
    }
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), COPIED_MS);
    return true;
  };

  const copyAndLogout = async () => {
    // If the copy failed, stay: logging out now is exactly the loss this guards against.
    if (!(await copyId())) return;
    setLeaving(true);
    logoutTimer.current = setTimeout(onLogout, LOGOUT_AFTER_COPY_MS);
  };

  return (
    // CARD carries h-full for the support grid's equal-height cells. Here the card
    // sits in a stretched column with siblings under it, so this wrapper (auto
    // height) makes that 100% resolve to auto instead of the whole column.
    <div>
      <div className={`${CARD} p-6`}>
        <span className={CARD_HAIRLINE} aria-hidden="true" />
        <div className={ORB} />

        <div className="relative space-y-4">
          {/* ── Label + toolbar ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <h2 className={EYEBROW}>{t('accountLabel')}</h2>

            {/* Popovers anchor to this row's end, not to their own button: the card
                clips, and a panel hung off the middle button would run out of it. */}
            <div className="relative flex items-center gap-2">
              {hasTelegram ? (
                <IconButton
                  label={`${t('dashboard.telegramLinked')} · ${contact} · ${verifiedLabel}`}
                  tooltip={
                    <>
                      {t('dashboard.telegramLinked')} · <span dir="ltr">{contact}</span>
                    </>
                  }
                  tone="telegram"
                  badge="dot"
                  onClick={onShowContacts}
                >
                  <TelegramIcon className="w-[18px] h-[18px]" />
                </IconButton>
              ) : (
                <IconButton label={t('dashboard.connectTelegram')} href={CONTACT.telegram.verifyBot} badge="plus">
                  <TelegramIcon className="w-[18px] h-[18px]" />
                </IconButton>
              )}

              {/* ── Log out, with a check first ─────────────────────────── */}
              <div ref={logout.rootRef}>
                <IconButton label={t('dashboard.logout')} aria-haspopup="dialog" {...logout.triggerProps}>
                  <LogOutIcon className="w-[18px] h-[18px] rtl:-scale-x-100" />
                </IconButton>
                {logout.open && (
                  <div
                    ref={logout.panelRef}
                    id={logout.panelId}
                    role="dialog"
                    aria-labelledby={`${logout.panelId}-title`}
                    aria-describedby={`${logout.panelId}-body`}
                    className={`${MENU_PANEL} w-[min(20rem,calc(100vw-5rem))] p-4 ${logout.shown ? PANEL_SHOWN : PANEL_HIDDEN}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-bg-secondary/80 ${
                          unsavedId ? 'border-accent-amber/30 text-accent-amber' : 'border-overlay/10 text-text-muted'
                        }`}
                      >
                        {unsavedId ? <WarningIcon className="w-[18px] h-[18px]" /> : <LogOutIcon className="w-[18px] h-[18px] rtl:-scale-x-100" />}
                      </span>
                      <div className="min-w-0">
                        <p id={`${logout.panelId}-title`} className="font-display text-base font-semibold leading-tight text-text-primary">
                          {t('dashboard.logoutTitle')}
                        </p>
                        <p id={`${logout.panelId}-body`} className="mt-1 text-sm leading-snug text-text-muted">
                          {unsavedId ? t('dashboard.logoutBodyNew') : t('dashboard.logoutBody')}
                        </p>
                      </div>
                    </div>

                    <p
                      className="mt-3 rounded-lg border border-dashed border-overlay/15 px-3 py-2 font-mono text-sm font-bold tracking-wide text-text-primary select-all"
                      dir="ltr"
                    >
                      {accountId}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onLogout()}
                        disabled={leaving}
                        className={`cta-flat ${CTA_PILL} min-h-10 ${FOCUS}`}
                      >
                        {t('dashboard.logout')}
                      </button>
                      <button
                        type="button"
                        onClick={copyAndLogout}
                        disabled={leaving}
                        className={`${KEY_PILL} min-h-10 ${FOCUS}`}
                      >
                        {leaving ? (
                          <CheckIcon key="done" className="w-4 h-4 copy-pop" />
                        ) : (
                          <CopyIcon key="copy" className="w-4 h-4" />
                        )}
                        {leaving ? t('dashboard.copied') : t('dashboard.copyAndLogout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── More: copy, connect email, delete ───────────────────── */}
              <div ref={menu.rootRef}>
                <IconButton label={t('dashboard.moreActions')} aria-haspopup="menu" {...menu.triggerProps}>
                  <EllipsisIcon className="w-5 h-5" />
                </IconButton>
                {menu.open && (
                  <div
                    ref={menu.panelRef}
                    id={menu.panelId}
                    role="menu"
                    aria-label={t('dashboard.moreActions')}
                    onKeyDown={onMenuKeyDown}
                    className={`${MENU_PANEL} w-[min(16rem,calc(100vw-5rem))] p-1.5 ${menu.shown ? PANEL_SHOWN : PANEL_HIDDEN}`}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className={MENU_ITEM}
                      onClick={() => {
                        copyId();
                        menu.close();
                      }}
                    >
                      <CopyIcon className="w-4 h-4 text-accent-teal" />
                      {t('dashboard.copyId')}
                    </button>
                    {!hasEmail && (
                      <button
                        type="button"
                        role="menuitem"
                        className={MENU_ITEM}
                        onClick={() => {
                          menu.close(false);
                          onConnectEmail();
                        }}
                      >
                        <MailIcon className="w-4 h-4 text-accent-teal" />
                        {t('dashboard.connectEmail')}
                      </button>
                    )}
                    <div role="separator" className="mx-2 my-1.5 h-px bg-overlay/10" />
                    {isActivePro ? (
                      <a role="menuitem" href={`/${locale}/support#delete-account`} className={MENU_ITEM_DANGER}>
                        <TrashIcon className="mt-0.5 w-4 h-4 shrink-0" />
                        <span className="min-w-0">
                          <span className="block">{t('dashboard.deleteAccount')}</span>
                          <span className="mt-0.5 block text-xs font-normal leading-snug text-text-tertiary">
                            {t('dashboard.deleteProSupportNote')}
                          </span>
                        </span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        role="menuitem"
                        className={MENU_ITEM_DANGER}
                        onClick={() => {
                          menu.close(false);
                          onDeleteRequest();
                        }}
                      >
                        <TrashIcon className="mt-0.5 w-4 h-4 shrink-0" />
                        {t('dashboard.deleteAccount')}…
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── The ID and its copy control ─────────────────────────────── */}
          <div>
            <div className="flex items-center gap-3">
              <p
                className="min-w-0 font-mono text-2xl sm:text-[1.7rem] font-bold tracking-wide text-text-primary break-all select-all"
                dir="ltr"
              >
                {accountId}
              </p>
              <IconButton
                label={t('dashboard.copyId')}
                tooltip={copied ? t('dashboard.copied') : undefined}
                tooltipShown={copied}
                tone={copied ? 'teal' : 'default'}
                onClick={() => copyId()}
              >
                {copied ? (
                  <CheckIcon key="check" className="w-4 h-4 copy-pop" />
                ) : (
                  <CopyIcon key="copy" className="w-[18px] h-[18px]" />
                )}
              </IconButton>
              <span className="sr-only" aria-live="polite">
                {copied ? t('dashboard.copied') : ''}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-text-muted">{t('dashboard.accountIdHint')}</p>
          </div>

          {/* ── The one key ─────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setShareOpen((o) => !o)}
            aria-expanded={shareOpen}
            aria-controls="send-to-devices"
            className={`${KEY_PILL} min-h-11 ${FOCUS}`}
          >
            <ShareIcon className="w-4 h-4" />
            {t('dashboard.sendToDevices')}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${shareOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {shareOpen && (
            <div id="send-to-devices">
              <SendToDevices accountId={accountId} locale={locale} />
            </div>
          )}

          {/* ── Linked contact, at a glance ─────────────────────────────── */}
          {(hasTelegram || hasEmail) && (
            <button
              type="button"
              onClick={onShowContacts}
              className={`flex w-full items-center gap-2.5 rounded-xl border border-overlay/10 bg-bg-primary/30 px-3 py-2 text-start text-sm hover:border-overlay/20 transition-colors ${FOCUS}`}
            >
              {hasTelegram ? (
                <TelegramIcon className="w-4 h-4 shrink-0 text-telegram" />
              ) : (
                <MailIcon className="w-4 h-4 shrink-0 text-accent-teal" />
              )}
              <span className="shrink-0 text-text-muted">
                {hasTelegram ? t('dashboard.telegramLinked') : t('dashboard.email')}
              </span>
              <span className="min-w-0 truncate font-medium text-text-primary" dir="ltr">
                {contact}
              </span>
              <span
                className={`ms-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  accountInfo?.contactVerified ? 'bg-accent-teal/15 text-accent-teal' : 'bg-accent-amber/15 text-accent-amber'
                }`}
              >
                {verifiedLabel}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
