'use client';

import { useState } from 'react';
import type { AccountDevices } from '@/components/account/types';
import { SubscriptionCard } from '@/components/account/dashboard/subscription-card';
import { AccountIdCard } from '@/components/account/dashboard/account-id-card';
import { DevicesCard } from '@/components/account/dashboard/devices-card';
import { ActionButtons } from '../support/action-buttons';
import { AuthPanel } from '@/components/account/auth-panel';
import { PlusPlanPicker, type PickerPlan } from './plus/plan-picker';
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

/** subscribe-content.tsx's plans and formatting, for the lab's picker. */
const LAB_PLANS: PickerPlan[] = [
  { id: 'monthly', cents: 699, months: 1, save: null, best: false },
  { id: '6month', cents: 2999, months: 6, save: 28, best: false },
  { id: 'yearly', cents: 3999, months: 12, save: 52, best: true },
];
const formatCents = (cents: number) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);

/** The real Calm+ plan picker on local state; Subscribe and Apply do nothing here. */
export function LabPlanPicker() {
  const [selected, setSelected] = useState('yearly');
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const plan = LAB_PLANS.find((p) => p.id === selected)!;
  return (
    <div className="space-y-5">
      <PlusPlanPicker
        plans={LAB_PLANS}
        selected={selected}
        onSelect={setSelected}
        discounted={(c) => c}
        formatCents={formatCents}
        perMonth={(c, m) => `$${(c / 100 / m).toFixed(2)}`}
        promoApplied={null}
        onRemovePromo={noop}
        promoCode={promoCode}
        onPromoChange={setPromoCode}
        promoError=""
        promoLoading={false}
        onApplyPromo={noop}
        paymentMethod={paymentMethod}
        onPaymentMethod={setPaymentMethod}
        loading={false}
        onSubscribe={noop}
        finalCents={plan.cents}
        error=""
      />
    </div>
  );
}

/** The sign-up panel; in the lab its create button is inert. */
export function LabAuthPanel({ plus = false }: { plus?: boolean }) {
  return (
    <div inert>
      <AuthPanel title="Create your account" subtitle="No email. No password. One tap and you're in." lockMode onSuccess={noop} plus={plus} />
    </div>
  );
}

export function CurrentSubscription({
  locale,
  state,
  expiresAt,
  plus = false,
}: {
  locale: string;
  state: 'active' | 'free' | 'expired';
  expiresAt: string | null;
  plus?: boolean;
}) {
  const [showPlans, setShowPlans] = useState(false);
  return (
    <SubscriptionCard
      plus={plus}
      locale={locale}
      isActivePro={state === 'active'}
      isExpiredPro={state === 'expired'}
      expiresAt={expiresAt}
      showPlans={showPlans}
      onShowPlans={setShowPlans}
      onExpressSupport={noop}
      plansView={plus ? <LabPlanPicker /> : PLANS_PLACEHOLDER}
    />
  );
}

export function CurrentAccountId({ locale, plus = false }: { locale: string; plus?: boolean }) {
  return (
    <AccountIdCard
      plus={plus}
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

export function CurrentDevices({
  locale,
  data,
  plus = false,
  state = 'data',
}: {
  locale: string;
  data: AccountDevices;
  plus?: boolean;
  /** The card's other states, for the Calm+ row. */
  state?: 'data' | 'loading' | 'error' | 'empty';
}) {
  return (
    <DevicesCard
      locale={locale}
      data={state === 'data' ? data : state === 'empty' ? { ...data, devices: [] } : null}
      loading={state === 'loading'}
      error={state === 'error'}
      onRetry={noop}
      plus={plus}
    />
  );
}

export function CurrentSupportActions() {
  return <ActionButtons onOpenTicket={noop} onOpenRestore={noop} onOpenBusiness={noop} />;
}
