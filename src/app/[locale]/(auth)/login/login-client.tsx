'use client';

import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

import { AuthPanel, ExistingAccountBanner } from '@/components/account/auth-panel';

/** `plus`: the Calm+ preview, decided on the server. */
export function LoginClient({ plus = false }: { plus?: boolean }) {
  const t = useTranslations('subscribe');
  const locale = useLocale();
  const router = useRouter();

  return (
    <>
      <ExistingAccountBanner plus={plus} />
      <AuthPanel
        title={t('loginTitle')}
        subtitle={t('loginSubtitle')}
        initialMode="existing"
        lockMode
        plus={plus}
        onSuccess={() => {
          // Returning user — no welcome modal.
          router.replace(`/${locale}/account`);
        }}
      />
    </>
  );
}
