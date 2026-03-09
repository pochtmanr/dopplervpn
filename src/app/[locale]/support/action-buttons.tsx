'use client';

import { useTranslations } from 'next-intl';

/* ── Icons ────────────────────────────────────────────────────────── */

function TicketIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function KeyIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function BriefcaseIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */

interface ActionButtonsProps {
  onOpenTicket: () => void;
  onOpenRestore: () => void;
}

/* ── Component ────────────────────────────────────────────────────── */

export function ActionButtons({ onOpenTicket, onOpenRestore }: ActionButtonsProps) {
  const t = useTranslations('support');

  const actions = [
    {
      key: 'ticket',
      icon: <TicketIcon className="w-6 h-6 text-accent-teal" />,
      title: t('actions.submitRequest'),
      subtitle: t('actions.submitRequestDesc'),
      onClick: onOpenTicket,
      href: undefined as string | undefined,
    },
    {
      key: 'restore',
      icon: <KeyIcon className="w-6 h-6 text-accent-teal" />,
      title: t('actions.restoreAccount'),
      subtitle: t('actions.restoreAccountDesc'),
      onClick: onOpenRestore,
      href: undefined as string | undefined,
    },
    {
      key: 'business',
      icon: <BriefcaseIcon className="w-6 h-6 text-accent-teal" />,
      title: t('actions.businessContact'),
      subtitle: t('actions.businessContactDesc'),
      onClick: undefined as (() => void) | undefined,
      href: 'mailto:support@simnetiq.store?subject=Business Inquiry',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action) => {
        const content = (
          <>
            <div className="w-12 h-12 rounded-xl bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center mb-4">
              {action.icon}
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              {action.title}
            </h3>
            <p className="text-xs text-text-muted">
              {action.subtitle}
            </p>
          </>
        );

        if (action.href) {
          return (
            <a
              key={action.key}
              href={action.href}
              className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 backdrop-blur-sm p-6 cursor-pointer transition-all duration-200 hover:border-accent-teal/30 hover:scale-[1.02] hover:bg-bg-secondary/70 block"
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            className="rounded-2xl border border-overlay/10 bg-bg-secondary/50 backdrop-blur-sm p-6 cursor-pointer transition-all duration-200 hover:border-accent-teal/30 hover:scale-[1.02] hover:bg-bg-secondary/70 text-start"
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
