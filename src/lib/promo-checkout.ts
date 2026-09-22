/**
 * Shared promo pricing for card (Revolut) and crypto (OxaPay).
 * Invalid promos stay at the list price. A valid one charges
 * round(list * (1 - discount_percent/100)), in minor units (cents).
 */

export interface PromoRow {
  id: string;
  code: string;
  discount_percent: number;
  expires_at?: string | null;
  max_redemptions?: number | null;
  current_redemptions?: number | null;
  applicable_plans?: string[] | null;
}

export interface PromoCharge {
  amount: number;
  promoId: string | null;
  promoCode: string | null;
}

/** Checkout plan id → value stored on promo_codes.applicable_plans. */
const PLAN_MAP: Record<string, string> = {
  monthly: 'monthly',
  '6month': 'semiannual',
  yearly: 'annual',
};

export function discountedCents(listCents: number, discountPercent: number): number {
  return Math.round(listCents * (1 - discountPercent / 100));
}

/**
 * Same gates Revolut uses before it lowers the charge: active row already
 * filtered by the query, not expired, under max_redemptions, plan allowed,
 * and this account has not redeemed it.
 */
export function promoChargeCents(
  listCents: number,
  planId: string,
  promo: PromoRow | null,
  alreadyRedeemed: boolean,
  now = new Date(),
): PromoCharge {
  const full: PromoCharge = { amount: listCents, promoId: null, promoCode: null };
  if (!promo || alreadyRedeemed) return full;

  const notExpired = !promo.expires_at || new Date(promo.expires_at) >= now;
  const notFullyRedeemed =
    !promo.max_redemptions || (promo.current_redemptions ?? 0) < promo.max_redemptions;
  const applicablePlan =
    !promo.applicable_plans || promo.applicable_plans.includes(PLAN_MAP[planId] || planId);

  if (!notExpired || !notFullyRedeemed || !applicablePlan) return full;

  return {
    amount: discountedCents(listCents, promo.discount_percent),
    promoId: promo.id,
    promoCode: promo.code,
  };
}

// Supabase's query builder is a recursive generic. A structural interface
// against it makes tsc report an infinitely deep instantiation, so the
// helper names the two methods it calls and leaves the builder untyped.
type PromoClient = {
  // Supabase's recursive builder types explode if this return is named.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: string): any;
  rpc(fn: string, args: Record<string, unknown>): PromiseLike<unknown>;
};

export async function resolvePromoCharge(
  supabase: PromoClient,
  input: {
    promoCode?: string | null;
    promoId?: string | null;
    planId: string;
    accountId: string;
    listCents: number;
  },
): Promise<PromoCharge> {
  const full: PromoCharge = { amount: input.listCents, promoId: null, promoCode: null };
  const code = typeof input.promoCode === 'string' ? input.promoCode.toUpperCase().trim() : '';
  const promoId = typeof input.promoId === 'string' ? input.promoId : '';
  if (!code || !promoId) return full;

  try {
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('id', promoId)
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (!promo) return full;

    const { data: existing } = await supabase
      .from('promo_redemptions')
      .select('id')
      .eq('promo_code_id', promoId)
      .eq('account_id', input.accountId)
      .maybeSingle();

    return promoChargeCents(input.listCents, input.planId, promo, Boolean(existing));
  } catch (err) {
    console.warn('Promo validation failed, charging full price:', err);
    return full;
  }
}

/**
 * Insert the redemption, then increment the counter. The counter moves only
 * after the row lands, so a unique conflict does not double-count.
 * Matches increment_promo_redemptions, which is meant to run after the insert.
 */
export async function recordPromoRedemption(
  supabase: PromoClient,
  input: { promoId: string; accountId: string },
): Promise<'recorded' | 'already'> {
  const { data: existing } = await supabase
    .from('promo_redemptions')
    .select('id')
    .eq('promo_code_id', input.promoId)
    .eq('account_id', input.accountId)
    .maybeSingle();
  if (existing) return 'already';

  const { error } = await supabase.from('promo_redemptions').insert({
    promo_code_id: input.promoId,
    account_id: input.accountId,
    redeemed_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === '23505') return 'already';
    throw error;
  }

  await supabase.rpc('increment_promo_redemptions', { p_promo_id: input.promoId });
  return 'recorded';
}
