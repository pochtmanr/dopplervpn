-- =====================================================
-- ACCOUNT HANDOFF TOKENS — one-time "open the account page signed in"
-- Safe, idempotent, non-destructive to existing data
-- =====================================================
-- Apply via: SQL editor (paste this file).
-- =====================================================
--
-- Purpose: the desktop app's "Manage subscription" opened /{locale}/account
-- with no identity, so the buyer had to type their account code. The app now
-- POSTs its device credentials to /api/account/handoff, which stores the
-- SHA-256 of a random token here and returns /{locale}/account?h=<token>.
-- The page redeems it once through /api/account/handoff/redeem.
--
-- Only the hash is stored, so a leaked table row cannot be replayed. Tokens
-- are single-use (deleted on redeem) and live 5 minutes.

BEGIN;

CREATE TABLE IF NOT EXISTS account_handoff_tokens (
  token_hash  text PRIMARY KEY,
  account_id  text NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS account_handoff_tokens_expires_at_idx
  ON account_handoff_tokens (expires_at);

-- RLS on, no policies: only the service role touches this table.
ALTER TABLE account_handoff_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE account_handoff_tokens FROM anon, authenticated;

COMMIT;
