-- Doppler monitoring overhaul, 2026-07-14.
-- Run against Supabase project fzlrhmjdjjzcgstaeblu.

-- 1. Support-ticket -> Telegram notifier (n8n polls WHERE telegram_notified_at IS NULL).
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS telegram_notified_at timestamptz;

-- Backfill existing tickets so the first poll doesn't flood Telegram.
UPDATE support_tickets SET telegram_notified_at = now() WHERE telegram_notified_at IS NULL;

CREATE INDEX IF NOT EXISTS support_tickets_unnotified_idx
  ON support_tickets (created_at)
  WHERE telegram_notified_at IS NULL;

-- 2. Stats-agent endpoints for bare-xray servers (no Marzban panel).
--    Deliberately separate from marzban_* columns: doppler-bot treats a
--    non-null marzban_api_url as "this server runs Marzban" and would try
--    to provision users against it.
ALTER TABLE vpn_servers ADD COLUMN IF NOT EXISTS stats_agent_url text;
ALTER TABLE vpn_servers ADD COLUMN IF NOT EXISTS stats_agent_token text;
