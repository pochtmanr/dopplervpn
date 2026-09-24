-- Marketing attribution snapshot for each web order: UTM tags / gclid /
-- referrer from the landing visit, plus the GA client+session ids and Meta
-- fbp/fbc the buyer consented to at checkout. Written by
-- /api/oxapay/create-invoice (pending row) and the Revolut webhook (after
-- insert); read by the webhooks to report the purchase server-side
-- (src/lib/purchase-events.ts) and available for revenue-by-channel queries.
--
-- Nullable jsonb: older rows and Telegram Mini App orders simply have none.
-- The app tolerates this column being absent, so it can be applied before or
-- after the deploy.

ALTER TABLE vpn_invoices
  ADD COLUMN IF NOT EXISTS attribution jsonb;
