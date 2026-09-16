'use client';

import { useTranslations } from 'next-intl';
import { ThinkingOrb } from 'thinking-orbs';

/**
 * The site's page loader: the "solving" state of thinking-orbs (MIT, Jakub
 * Antalik) — dotted bands scramble in quarter turns, then click back.
 *
 * Used by the account page while it reads `localStorage` / fetches the
 * dashboard, and by the `loading.tsx` of account, login/signup, support, downloads, tools,
 * blog and delete-account.
 * A client component because the package ships without a "use client"
 * directive. It draws on a plain 2D canvas, takes its ink from next-themes'
 * `dark`/`light` class on <html>, and paints a still frame under reduced motion.
 *
 * `.loader-in` holds it back 200ms and then fades it in, so a fast load never
 * flashes a loader at all.
 */
export function PageLoader() {
  const t = useTranslations('subscribe.dashboard');
  return (
    <div className="loader-in flex min-h-[60vh] items-center justify-center px-4">
      <div role="status" className="inline-flex flex-col items-center gap-4">
        <ThinkingOrb state="solving" size={64} aria-hidden="true" />
        <span className="text-sm text-text-tertiary">{t('loading')}</span>
      </div>
    </div>
  );
}
