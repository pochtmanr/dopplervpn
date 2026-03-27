"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminLoader } from "@/components/admin/admin-loader";

interface Ticket {
  id: string;
  ticket_number: string;
  topic: string;
  subject: string;
  description: string;
  contact_email: string;
  account_id: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface AccountInfo {
  id: string;
  account_id: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  subscription_store: string | null;
  subscription_product_id: string | null;
  max_devices: number;
  created_at: string;
}

const STATUSES = [
  { value: "open", label: "Open", color: "text-blue-400 border-blue-500/40", activeBg: "bg-blue-500/20" },
  { value: "in_progress", label: "In Progress", color: "text-yellow-400 border-yellow-500/40", activeBg: "bg-yellow-500/20" },
  { value: "resolved", label: "Resolved", color: "text-green-400 border-green-500/40", activeBg: "bg-green-500/20" },
  { value: "closed", label: "Closed", color: "text-gray-400 border-gray-500/40", activeBg: "bg-gray-500/20" },
];

const TOPICS: Record<string, { label: string; color: string }> = {
  connection_issues: { label: "Connection Issues", color: "text-red-400 border-red-500/40" },
  subscription_billing: { label: "Subscription & Billing", color: "text-purple-400 border-purple-500/40" },
  account: { label: "Account", color: "text-blue-400 border-blue-500/40" },
  feature_request: { label: "Feature Request", color: "text-teal-400 border-teal-500/40" },
  other: { label: "Other", color: "text-gray-400 border-gray-500/40" },
};

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const router = useRouter();
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [_account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesValue, setNotesValue] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/tickets/${ticketId}`);
      const data = await res.json();
      setTicket(data.ticket);
      setAccount(data.account || null);
      setNotesValue(data.ticket?.admin_notes || "");
      setLoading(false);
    }
    load();
  }, [ticketId]);

  async function updateStatus(newStatus: string) {
    setStatusUpdating(true);
    const res = await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }
    setStatusUpdating(false);
  }

  async function saveNotes() {
    const res = await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_notes: notesValue }),
    });
    if (res.ok) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <AdminLoader />;
  }

  if (!ticket) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>Ticket not found</p>
      </div>
    );
  }

  const topicInfo = TOPICS[ticket.topic] || TOPICS.other;
  const currentStatus = ticket.status;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left column */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Back button */}
        <button
          onClick={() => router.push("/admin-dvpn/tickets")}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Tickets
        </button>

        {/* Ticket heading */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary">{ticket.ticket_number}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-lg text-xs border ${topicInfo.color}`}>
              {topicInfo.label}
            </span>
          </div>
        </div>

        {/* Subject */}
        <div>
          <h2 className="text-base font-semibold text-text-primary">{ticket.subject}</h2>
        </div>

        {/* Description */}
        <div className="bg-overlay/10 rounded-lg p-4">
          <p className="text-sm text-text-primary whitespace-pre-wrap break-words">{ticket.description}</p>
        </div>

        {/* Created */}
        <div className="text-xs text-text-muted">
          Created: {formatTime(ticket.created_at)}
        </div>
      </div>

      {/* Right column */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
        {/* Status */}
        <div className="border border-overlay/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-muted mb-3">Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => updateStatus(s.value)}
                disabled={statusUpdating || currentStatus === s.value}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer disabled:cursor-default ${
                  currentStatus === s.value
                    ? `${s.color} ${s.activeBg} ring-1 ring-current`
                    : "bg-overlay/5 text-text-muted border-overlay/10 hover:bg-overlay/10"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="border border-overlay/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-text-muted mb-3">Contact</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-text-muted">Email</span>
              <a
                href={`mailto:${ticket.contact_email}`}
                className="text-accent-teal hover:underline"
              >
                {ticket.contact_email}
              </a>
            </div>
            {ticket.account_id && (
              <div className="flex justify-between">
                <span className="text-text-muted">Account</span>
                <button
                  onClick={() => router.push("/admin-dvpn/accounts")}
                  className="text-accent-teal hover:underline cursor-pointer font-mono text-xs"
                >
                  {ticket.account_id}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        <div className="border border-overlay/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-muted">Admin Notes</h3>
            {notesSaved && (
              <span className="text-xs text-green-400">Saved</span>
            )}
          </div>
          <textarea
            ref={notesRef}
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={saveNotes}
            placeholder="Add internal notes..."
            rows={4}
            className="w-full px-3 py-2 text-xs bg-overlay/5 border border-overlay/10 rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-teal/50 resize-none"
          />
        </div>

        {/* Reply via Email */}
        <a
          href={`mailto:${ticket.contact_email}?subject=${encodeURIComponent(`Re: ${ticket.subject} [${ticket.ticket_number}]`)}`}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-teal/20 text-accent-teal rounded-lg text-sm hover:bg-accent-teal/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          Reply via Email
        </a>
      </div>
    </div>
  );
}
