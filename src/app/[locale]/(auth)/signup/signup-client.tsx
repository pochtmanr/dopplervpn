'use client';

import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

import { AuthPanel, ExistingAccountBanner } from '@/components/account/auth-panel';

export function SignupClient() {
  const t = useTranslations('subscribe');
  const locale = useLocale();
  const router = useRouter();

  return (
    <>
      <ExistingAccountBanner />
      <AuthPanel
        title={t('signupTitle')}
        subtitle={t('signupSubtitle')}
        initialMode="new"
        lockMode
        onSuccess={(result) => {
          // ?welcome=1 tells /account to open the welcome modal once; it strips the
          // param immediately so a refresh does not re-open it.
          router.replace(
            result.isNew
              ? `/${locale}/account?welcome=1`
              : `/${locale}/account`,
          );
        }}
      />
    </>
  );
}
