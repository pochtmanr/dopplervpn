'use client';

import { useState } from 'react';
import type { AccountDevices } from '@/components/account/types';
import { SubscriptionCard } from '@/components/account/dashboard/subscription-card';
import { AccountIdCard } from '@/components/account/dashboard/account-id-card';
import { DevicesCard } from '@/components/account/dashboard/devices-card';
import { ActionButtons } from '../support/action-buttons';
import { MOCK_ACCOUNT_ID, MOCK_ACCOUNT_INFO } from './mocks';

/**
 * The production cards with mock props. They take handlers, which a Server
 * Component cannot pass, so this file supplies no-ops and local state.
 */

const noop = () => {};

const PLANS_PLACEHOLDER = (
  <p className="rounded-xl border border-dashed border-overlay/20 p-4 text-sm text-text-tertiary">
    Plan picker lives in subscribe-content.tsx (not rendered in the lab).
  </p>
);

export function CurrentSubscription({
  locale,
  state,
  expiresAt,
}: {
  locale: string;
  state: 'active' | 'free' | 'expired';
  expiresAt: string | null;
}) {
  const [showPlans, setShowPlans] = useState(false);
  return (
    <SubscriptionCard
      locale={locale}
      isActivePro={state === 'active'}
      isExpiredPro={state === 'expired'}
      expiresAt={expiresAt}
      showPlans={showPlans}
      onShowPlans={setShowPlans}
      onExpressSupport={noop}
      plansView={PLANS_PLACEHOLDER}
    />
  );
}

export function CurrentAccountId({ locale }: { locale: string }) {
  return (
    <AccountIdCard
      accountId={MOCK_ACCOUNT_ID}
      locale={locale}
      accountInfo={MOCK_ACCOUNT_INFO}
      isActivePro
      unsavedId={false}
      onLogout={noop}
      onDeleteRequest={noop}
      onConnectEmail={noop}
      onShowContacts={noop}
    />
  );
}

export function CurrentDevices({ locale, data }: { locale: string; data: AccountDevices }) {
  return <DevicesCard locale={locale} data={data} loading={false} error={false} onRetry={noop} />;
}

export function CurrentSupportActions() {
  return <ActionButtons onOpenTicket={noop} onOpenRestore={noop} onOpenBusiness={noop} />;
}
