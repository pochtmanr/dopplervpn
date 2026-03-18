-- Atomic promo redemption counter increment
-- Called from webhook after inserting into promo_redemptions to avoid race conditions
create or replace function increment_promo_redemptions(p_promo_id uuid)
returns void
language sql
security definer
as $$
  update promo_codes
  set current_redemptions = current_redemptions + 1
  where id = p_promo_id;
$$;
