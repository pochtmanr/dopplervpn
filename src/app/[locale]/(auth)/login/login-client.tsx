'use client';

import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

import { AuthPanel, ExistingAccountBanner } from '@/components/account/auth-panel';

export function LoginClient() {
  const t = useTranslations('subscribe');
  const locale = useLocale();
  const router = useRouter();

  return (
    <>
      <ExistingAccountBanner />
      <AuthPanel
        title={t('loginTitle')}
        subtitle={t('loginSubtitle')}
        initialMode="existing"
        lockMode
        onSuccess={() => {
          // Returning user — no welcome modal.
          router.replace(`/${locale}/account`);
        }}
      />
    </>
  );
}
