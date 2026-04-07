import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { getOrder } from '@/lib/revolut';
import { rateLimit } from '@/lib/rate-limit';

/**
 * GET /api/revolut/verify-order?order_id=...&account_id=...
 *
 * Returns the post-checkout state for a given Revolut order so the success
 * page can poll for the webhook to land instead of optimistically claiming
 * success the moment the card field submits.
 *
 * Response shape:
 *   { status: 'paid'    , tier: 'pro' , expires_at: ISO } — webhook ran, account upgraded
 *   { status: 'pending' , revolut_state: 'PENDING'|...  } — payment authorised, webhook not yet
 *   { status: 'failed'  , reason: string }                — payment failed / declined
 *   { status: 'unknown' , reason: string }                — order not found / lookup error
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000, prefix: 'revolut-verify' });
  if (rl) return rl;

  const orderId = req.nextUrl.searchParams.get('order_id');
  const accountId = req.nextUrl.searchParams.get('account_id');

  if (!orderId) {
    return NextResponse.json({ status: 'unknown', reason: 'Missing order_id' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  // 1. Fast path: webhook already wrote an invoice row → upgrade is real.
  const { data: invoice } = await supabase
    .from('vpn_invoices')
    .select('id, status, plan, amount, currency')
    .eq('provider_payment_id', orderId)
    .maybeSingle();

  if (invoice && invoice.status === 'paid') {
    let tier: string | null = null;
    let expiresAt: string | null = null;

    if (accountId) {
      const { data: account } = await supabase
        .from('accounts')
        .select('subscription_tier, subscription_expires_at')
        .eq('account_id', accountId)
        .maybeSingle();
      tier = account?.subscription_tier ?? null;
      expiresAt = account?.subscription_expires_at ?? null;
    }

    return NextResponse.json({
      status: 'paid',
      tier,
      expires_at: expiresAt,
      amount: invoice.amount,
      currency: invoice.currency,
    });
  }

  // 2. No invoice yet → ask Revolut directly. If they say COMPLETED, the
  //    webhook is just running late (or was lost) — surface that to the UI
  //    so it can keep polling instead of flipping to an error state.
  try {
    const order = await getOrder(orderId);
    const state = String(order?.state || '').toUpperCase();

    if (state === 'COMPLETED') {
      return NextResponse.json({
        status: 'pending',
        revolut_state: state,
        reason: 'Payment completed, waiting for webhook to provision your account',
      });
    }

    if (state === 'FAILED' || state === 'CANCELLED' || state === 'DECLINED') {
      return NextResponse.json({
        status: 'failed',
        revolut_state: state,
        reason: `Payment ${state.toLowerCase()}`,
      });
    }

    return NextResponse.json({
      status: 'pending',
      revolut_state: state || 'UNKNOWN',
      reason: 'Awaiting payment confirmation',
    });
  } catch (err) {
    console.error('[verify-order] revolut_lookup_failed', orderId, err);
    return NextResponse.json(
      {
        status: 'unknown',
        reason: 'Unable to look up order with Revolut',
      },
      { status: 200 },
    );
  }
}
