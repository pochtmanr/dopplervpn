import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit } from '@/lib/rate-limit';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
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

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

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
