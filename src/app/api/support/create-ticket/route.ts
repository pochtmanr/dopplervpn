import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { randomUUID } from 'crypto';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TOPICS = [
  'connection_issues',
  'subscription_billing',
  'account',
  'feature_request',
  'other',
] as const;

export async function POST(req: NextRequest) {
  // Rate limit: 3 tickets per minute per IP
  const rl = rateLimit(req, { limit: 3, windowMs: 60_000, prefix: 'support-ticket' });
  if (rl) return rl;

  try {
    const { topic, subject, description, contact_email, account_id } =
      await req.json();

    if (!topic || !VALID_TOPICS.includes(topic)) {
      return NextResponse.json(
        { error: `Invalid topic. Must be one of: ${VALID_TOPICS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Subject must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (
      !description ||
      typeof description !== 'string' ||
      description.trim().length < 10
    ) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!contact_email || !EMAIL_REGEX.test(contact_email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Use UUID-based ticket number to avoid race condition
    const ticketNumber = `TKT-${randomUUID().slice(0, 8).toUpperCase()}`;

    // Determine priority from account subscription, not from request body
    let priority = 'normal';
    if (account_id) {
      const { data: account } = await supabase
        .from('accounts')
        .select('subscription_tier, subscription_expires_at')
        .eq('account_id', account_id)
        .single();

      if (
        account?.subscription_tier === 'pro' &&
        account.subscription_expires_at &&
        new Date(account.subscription_expires_at) > new Date()
      ) {
        priority = 'premium';
      }
    }

    const { error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        topic: topic,
        subject: subject.trim(),
        description: description.trim(),
        contact_email: contact_email.toLowerCase().trim(),
        account_id: account_id || null,
        status: 'open',
        priority,
      });

    if (insertError) {
      console.error('Insert ticket error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticket_number: ticketNumber });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
