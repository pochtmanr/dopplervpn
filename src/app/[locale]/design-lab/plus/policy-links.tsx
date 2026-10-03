'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PLUS_META } from '../plus-recipes';

/**
 * The policies behind a purchase, as one quiet row of links under a
 * subscription surface. Labels reuse the support page's guide titles
 * (support.guides.*, all 44 locales) and subscribe.terms/privacy, so no new strings.
 */
const LINKS = {
  refund: { href: '/refund', ns: 'support', key: 'guides.refund' },
  restoreCancelRefund: { href: '/help/restore-cancel-refund', ns: 'support', key: 'guides.restoreCancelRefund' },
  webAndStore: { href: '/help/web-and-store', ns: 'support', key: 'guides.webAndStore' },
  terms: { href: '/terms', ns: 'subscribe', key: 'terms' },
  privacy: { href: '/privacy', ns: 'subscribe', key: 'privacy' },
} as const;

export type PolicyLink = keyof typeof LINKS;

export function PlusPolicyLinks({ include, className = '' }: { include: PolicyLink[]; className?: string }) {
  const tSupport = useTranslations('support');
  const tSubscribe = useTranslations('subscribe');

  return (
    // No separators: a wrapped row would strand a dot at a line's end. The underline marks each link.
    <p className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${PLUS_META} ${className}`}>
      {include.map((id) => {
        const l = LINKS[id];
        return (
          <Link
            key={id}
            href={l.href}
            className="rounded-sm underline decoration-(--c-separator) underline-offset-4 transition-colors hover:text-(--c-accent) hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent)"
          >
            {l.ns === 'support' ? tSupport(l.key) : tSubscribe(l.key)}
          </Link>
        );
      })}
    </p>
  );
}
