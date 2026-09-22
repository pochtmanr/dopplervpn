-- OxaPay invoices remember the promo that was validated at checkout so the
-- paid webhook can redeem it the same way Revolut does. Nullable: invoices
-- without a promo stay unchanged.
--
-- promo_redemptions already has unique index idx_promo_one_per_account on
-- (promo_code_id, account_id). A retried webhook hits that and does not
-- increment the counter again.

ALTER TABLE vpn_invoices
  ADD COLUMN IF NOT EXISTS promo_id uuid,
  ADD COLUMN IF NOT EXISTS promo_code text;
