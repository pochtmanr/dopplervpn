-- =====================================================
-- AD CONVERSIONS — paid-campaign conversion postback log
-- Safe, idempotent, non-destructive to existing data
-- =====================================================
-- Apply via: Supabase SQL Editor (paste this file) or `supabase db push`
-- =====================================================
--
-- Purpose: an advertising agency drives paid traffic to the site with a per-click
-- id on the landing URL. src/middleware.ts stores that id in a first-party cookie;
-- src/lib/postback.ts echoes it back to the agency's tracker when the visitor
-- converts, so they can attribute the payout.
--
-- This table is both the dedupe mechanism and our own record of what we reported.
-- The record matters: it is the only independent number we can check the agency's
-- invoice against.

BEGIN;

CREATE TABLE IF NOT EXISTS ad_conversions (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  click_id   text NOT NULL,
  goal       text NOT NULL,
  source     text,          -- query parameter the click id arrived on
  arch       text,          -- x64 | arm64, for the download goal
  locale     text,
  page_path  text,
  status     text NOT NULL DEFAULT 'pending',
  response   text,          -- truncated tracker response, for debugging disputes
  fired_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ad_conversions_goal_valid CHECK (goal IN ('download', 'purchase')),
  CONSTRAINT ad_conversions_status_valid CHECK (status IN ('pending', 'ok', 'failed'))
);

-- Dedupe key is (click_id, goal), NOT click_id alone: one click may legitimately
-- produce a download conversion now and a purchase conversion weeks later. The
-- insert in firePostback() relies on this raising 23505 to stop a double-fire.
CREATE UNIQUE INDEX IF NOT EXISTS ad_conversions_click_goal_idx
  ON ad_conversions (click_id, goal);

CREATE INDEX IF NOT EXISTS ad_conversions_fired_at_idx
  ON ad_conversions (fired_at DESC);

-- RLS on, no policies. The service role bypasses RLS; the anon / authenticated
-- roles must never read or write this table.
ALTER TABLE ad_conversions ENABLE ROW LEVEL SECURITY;

-- Payment webhooks are server-to-server and carry no cookies, so the click id has
-- to be captured when the invoice is created and read back at confirmation time.
ALTER TABLE vpn_invoices
  ADD COLUMN IF NOT EXISTS click_id text;

COMMIT;
