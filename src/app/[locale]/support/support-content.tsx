'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ActionButtons } from './action-buttons';
import { TicketModal } from './ticket-modal';
import { RestoreModal } from './restore-modal';

/* ── Account type (for pre-filling ticket form) ───────────────────── */

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

  /* Try to restore session from localStorage (for pre-filling ticket form only) */
  useEffect(() => {
    const savedId = localStorage.getItem('doppler_account_id');
    if (savedId) {
      fetch(`/api/support/account?account_id=${encodeURIComponent(savedId)}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => { if (data?.account) setAccount(data.account); })
        .catch(() => {});
    }
  }, []);

  return (
    <section className="mb-14">
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
