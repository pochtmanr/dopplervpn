-- =====================================================
-- CHECKOUT TOKENS — short-lived tokens for WebView checkout
-- Safe, idempotent, non-destructive to existing data
-- =====================================================
-- Apply via: Supabase SQL Editor (paste this file) or `supabase db push`
-- =====================================================
--
-- Purpose: the Android sideload flavor used to open
--   https://www.dopplervpn.org/<locale>/checkout?account_id=VPN-...&plan=...
-- which leaked the account ID into WebView history, referrer headers, and
-- access logs. The new flow POSTs {accountId, plan, locale} to
-- /api/checkout/init which mints an opaque token and persists the mapping
-- here. The WebView then opens /checkout?t=<token> and the server resolves
-- it server-side. Tokens are single-use and short-lived (10 min default).

BEGIN;

CREATE TABLE IF NOT EXISTS checkout_tokens (
  token       text PRIMARY KEY,
  account_id  text NOT NULL,
  plan        text NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checkout_tokens_plan_valid CHECK (plan IN ('monthly', '6month', 'yearly'))
);

CREATE INDEX IF NOT EXISTS checkout_tokens_expires_at_idx
  ON checkout_tokens (expires_at);

-- RLS on, no policies. The service role bypasses RLS; the anon / authenticated
-- roles must never read or write this table.
ALTER TABLE checkout_tokens ENABLE ROW LEVEL SECURITY;

COMMIT;
