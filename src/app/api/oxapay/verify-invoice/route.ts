import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

/**
 * GET /api/oxapay/verify-invoice?order_id=<uuid>&account_id=<VPN-…>
 *
 * Returns the current post-checkout state for an OxaPay invoice, mirroring
 * the Revolut verify-order endpoint. The success page polls this until it
 * flips to 'paid' or 'failed', or the timeout fires.
 *
 * Response shape:
 *   { status: 'paid'    , tier: 'pro' , expires_at: ISO }
 *   { status: 'pending' , reason?: string }
 *   { status: 'failed'  , reason: string }
 *   { status: 'unknown' , reason: string }
 */
export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 60, windowMs: 60_000, prefix: 'oxapay-verify' });
  if (rl) return rl;

  const orderId = req.nextUrl.searchParams.get('order_id');
  const accountId = req.nextUrl.searchParams.get('account_id');

  if (!orderId) {
    return NextResponse.json({ status: 'unknown', reason: 'Missing order_id' }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  const { data: invoice } = await supabase
    .from('vpn_invoices')
    .select('status, amount, currency')
    .eq('provider_payment_id', orderId)
    .eq('provider', 'oxapay')
    .maybeSingle();

  if (!invoice) {
    return NextResponse.json({ status: 'pending', reason: 'Invoice not yet registered' });
  }

  if (invoice.status === 'paid') {
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

  if (invoice.status === 'failed' || invoice.status === 'expired') {
    return NextResponse.json({
      status: 'failed',
      reason: `Payment ${invoice.status}`,
    });
  }

  return NextResponse.json({
    status: 'pending',
    reason: 'Awaiting blockchain confirmation',
  });
}
