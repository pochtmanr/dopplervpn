"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open", color: "text-blue-400 border-blue-500/40" },
  { value: "in_progress", label: "In Progress", color: "text-yellow-400 border-yellow-500/40" },
  { value: "resolved", label: "Resolved", color: "text-green-400 border-green-500/40" },
  { value: "closed", label: "Closed", color: "text-gray-400 border-gray-500/40" },
];

const TOPICS = [
  { value: "", label: "All Topics" },
  { value: "connection_issues", label: "Connection Issues", color: "text-red-400 border-red-500/40" },
  { value: "subscription_billing", label: "Subscription & Billing", color: "text-purple-400 border-purple-500/40" },
  { value: "account", label: "Account", color: "text-blue-400 border-blue-500/40" },
  { value: "feature_request", label: "Feature Request", color: "text-teal-400 border-teal-500/40" },
  { value: "other", label: "Other", color: "text-gray-400 border-gray-500/40" },
];

function getStatusObj(value: string) {
  return STATUSES.find((s) => s.value === value) || STATUSES[1];
}

function getTopicObj(value: string) {
  return TOPICS.find((t) => t.value === value) || TOPICS[5];
}

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [openStatusMenu, setOpenStatusMenu] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (statusFilter) params.set("status", statusFilter);
    if (topicFilter) params.set("topic", topicFilter);
    const res = await fetch(`/api/admin/tickets?${params}`);
    const data = await res.json();
    setTickets(data.tickets || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, statusFilter, topicFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, topicFilter]);

  async function handleStatusChange(ticketId: string, newStatus: string) {
    setOpenStatusMenu(null);
    const res = await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ticketId, status: newStatus }),
    });
    if (res.ok) {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: newStatus } : t
        )
      );
    }
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  const statusOptions = STATUSES.filter((s) => s.value !== "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Support Tickets</h1>
          <p className="text-sm text-text-muted mt-1">Tickets submitted via the support form</p>
        </div>
        <span className="text-sm text-text-muted">{total} ticket{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-overlay/5 border border-overlay/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-teal/50"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-overlay/5 border border-overlay/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-teal/50"
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Ticket list */}
      <div className="space-y-3">
        {loading ? (
          <AdminLoader />
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <div className="text-4xl mb-2">&#x1F3AB;</div>
            <p>No support tickets</p>
            <p className="text-xs mt-1">When users submit support tickets, they&apos;ll appear here</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {tickets.map((t) => {
                const status = getStatusObj(t.status);
                const topic = getTopicObj(t.topic);
                return (
                  <div
                    key={t.id}
                    className="border border-overlay/10 rounded-lg p-4 hover:bg-overlay/5 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Top: ticket info — clickable */}
                      <div
                        className="cursor-pointer"
                        onClick={() => router.push(`/admin-dvpn/tickets/${t.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-text-muted">{t.ticket_number}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs border ${topic.color}`}>
                            {topic.label}
                          </span>
                        </div>
                        <div className="font-medium text-text-primary text-sm truncate">{t.subject}</div>
                        <div className="text-xs text-text-muted mt-1">{t.contact_email}</div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {formatTime(t.created_at)} &middot; {timeAgo(t.created_at)}
                        </div>
                      </div>

                      {/* Bottom: status */}
                      <div className="flex items-center justify-between">
                        <div className="relative">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setOpenStatusMenu(openStatusMenu === t.id ? null : t.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${status.color}`}
                          >
                            {status.label}
                          </button>

                          {openStatusMenu === t.id && (
                            <div className="absolute left-0 top-full mt-1 z-20 bg-bg-secondary border border-overlay/10 rounded-lg shadow-lg py-1 min-w-[130px]">
                              {statusOptions.map((s) => (
                                <button
                                  key={s.value}
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    handleStatusChange(t.id, s.value);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                                    s.value === t.status
                                      ? "text-text-primary font-medium bg-overlay/10"
                                      : "text-text-muted hover:text-text-primary hover:bg-overlay/5"
                                  }`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block border border-overlay/10 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-overlay/10 text-text-muted text-xs">
                    <th className="text-left px-4 py-3 font-medium">Ticket #</th>
                    <th className="text-left px-4 py-3 font-medium">Topic</th>
                    <th className="text-left px-4 py-3 font-medium">Subject</th>
                    <th className="text-left px-4 py-3 font-medium">Email</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => {
                    const status = getStatusObj(t.status);
                    const topic = getTopicObj(t.topic);
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-overlay/5 hover:bg-overlay/5 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin-dvpn/tickets/${t.id}`)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-text-muted">{t.ticket_number}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-xs border ${topic.color}`}>
                            {topic.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-primary truncate max-w-[200px]">{t.subject}</td>
                        <td className="px-4 py-3 text-text-muted text-xs">{t.contact_email}</td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setOpenStatusMenu(openStatusMenu === t.id ? null : t.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${status.color}`}
                            >
                              {status.label}
                            </button>

                            {openStatusMenu === t.id && (
                              <div className="absolute left-0 top-full mt-1 z-20 bg-bg-secondary border border-overlay/10 rounded-lg shadow-lg py-1 min-w-[130px]">
                                {statusOptions.map((s) => (
                                  <button
                                    key={s.value}
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      handleStatusChange(t.id, s.value);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                                      s.value === t.status
                                        ? "text-text-primary font-medium bg-overlay/10"
                                        : "text-text-muted hover:text-text-primary hover:bg-overlay/5"
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-text-muted">{formatTime(t.created_at)}</div>
                          <div className="text-xs text-orange-400 mt-0.5">{timeAgo(t.created_at)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-overlay/10 rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-overlay/10 rounded-lg text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
