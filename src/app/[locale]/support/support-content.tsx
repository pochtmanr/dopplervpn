'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { AccountCard } from './account-card';
import { ActionButtons } from './action-buttons';
import { TicketModal } from './ticket-modal';
import { RestoreModal } from './restore-modal';

/* ── Account type ─────────────────────────────────────────────────── */

export interface AccountData {
  account_id: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  contact_method: string | null;
  contact_value: string | null;
  contact_verified: boolean;
  subscription_source: string | null;
  created_at: string;
}

/* ── SupportContent ───────────────────────────────────────────────── */

export function SupportContent() {
  const t = useTranslations('support');
  const locale = useLocale();

  const [account, setAccount] = useState<AccountData | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  /* Auto-open restore modal if hash is #restore */
  useEffect(() => {
    if (window.location.hash === '#restore') {
      setRestoreModalOpen(true);
    }
  }, []);

  /* Try to restore session from localStorage */
  useEffect(() => {
    const savedId = localStorage.getItem('doppler_account_id');
    if (savedId) {
      fetchAccount(savedId);
    }
  }, []);

  const fetchAccount = async (accountId: string) => {
    try {
      const res = await fetch(
        `/api/support/account?account_id=${encodeURIComponent(accountId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.account) {
          setAccount(data.account);
          localStorage.setItem('doppler_account_id', data.account.account_id);
        }
      }
    } catch {
      // silently fail
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('doppler_account_id');
    setAccount(null);
  };

  return (
    <section className="mb-14 space-y-8">
      <AccountCard
        account={account}
        locale={locale}
        onSignIn={fetchAccount}
        onSignOut={handleSignOut}
        onAccountUpdate={fetchAccount}
      />

      <ActionButtons
        onOpenTicket={() => setTicketModalOpen(true)}
        onOpenRestore={() => setRestoreModalOpen(true)}
      />

      {ticketModalOpen && (
        <TicketModal
          account={account}
          onClose={() => setTicketModalOpen(false)}
        />
      )}

      {restoreModalOpen && (
        <RestoreModal
          locale={locale}
          onClose={() => setRestoreModalOpen(false)}
          onOpenTicket={() => {
            setRestoreModalOpen(false);
            setTicketModalOpen(true);
          }}
        />
      )}
    </section>
  );
}
