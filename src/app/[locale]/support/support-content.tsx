"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { ActionButtons } from "./action-buttons";
import { BusinessModal } from "./business-modal";
import { ContactRemovalPanel } from "./contact-removal-panel";
import { RestoreModal } from "./restore-modal";
import { TicketFlow, useTicketSession, type TicketAccountPrefill } from "./ticket-flow";

export interface AccountData extends TicketAccountPrefill {
  subscription_tier: string;
  subscription_expires_at: string | null;
  contact_verified: boolean;
  subscription_source: string | null;
  created_at: string;
}

function desktopShell(): boolean {
  return window.matchMedia("(min-width: 1024px)").matches;
}

/** `plus`: the Calm+ preview, decided on the server (see design-lab/home-preview.tsx). */
export function SupportContent({ plus = false }: { plus?: boolean }) {
  const locale = useLocale();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [shell, setShell] = useState<"page" | "dialog">("page");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [scrollRemoval, setScrollRemoval] = useState(false);
  const session = useTicketSession(account);

  useEffect(() => {
    if (window.location.hash === "#restore") setRestoreOpen(true);
    else if (window.location.hash === "#business") setBusinessOpen(true);
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem("doppler_account_id");
    if (!savedId) return;
    fetch(`/api/support/account?account_id=${encodeURIComponent(savedId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.account) setAccount(data.account);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!ticketOpen) return;
    const mql = window.matchMedia("(min-width: 1024px)");
    const apply = () => setShell(mql.matches ? "dialog" : "page");
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [ticketOpen]);

  const openTicket = () => {
    setShell(desktopShell() ? "dialog" : "page");
    setTicketOpen(true);
  };

  useEffect(() => {
    if (!scrollRemoval || ticketOpen) return;
    const panel = document.getElementById("contact-removal");
    panel?.scrollIntoView({ block: "start" });
    panel?.focus({ preventScroll: true });
    setScrollRemoval(false);
  }, [scrollRemoval, ticketOpen]);

  const openRemoval = () => {
    setTicketOpen(false);
    setScrollRemoval(true);
  };

  const showCards = !(ticketOpen && shell === "page");

  return (
    <section>
      {showCards && (
        <ActionButtons
          onOpenTicket={openTicket}
          onOpenRestore={() => setRestoreOpen(true)}
          onOpenBusiness={() => setBusinessOpen(true)}
          plus={plus}
        />
      )}

      {ticketOpen && (
        <TicketFlow
          shell={shell}
          session={session}
          onCancel={() => setTicketOpen(false)}
          onDone={() => {
            session.reset();
            setTicketOpen(false);
          }}
          onOpenRemoval={openRemoval}
        />
      )}

      <ContactRemovalPanel plus={plus} />

      {businessOpen && <BusinessModal onClose={() => setBusinessOpen(false)} />}

      {restoreOpen && (
        <RestoreModal
          locale={locale}
          onClose={() => setRestoreOpen(false)}
          onOpenTicket={() => {
            setRestoreOpen(false);
            openTicket();
          }}
        />
      )}
    </section>
  );
}
