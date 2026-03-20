import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit } from '@/lib/rate-limit';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

export async function GET(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'checkout-status' });
  if (rl) return rl;

  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Validate session_id format (Stripe session IDs start with cs_)
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.json({ error: 'Invalid session_id format' }, { status: 400 });
    }

    // Require account_id to prevent session enumeration
    const accountId = req.nextUrl.searchParams.get('account_id');
    if (!accountId || !/^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(accountId)) {
      return NextResponse.json({ error: 'Missing or invalid account_id' }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to the requesting account
    if (session.metadata?.account_id !== accountId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      paid: session.payment_status === 'paid',
      account_id: session.metadata?.account_id || '',
      plan: session.metadata?.plan_id || '',
    });
  } catch (error: unknown) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
}
