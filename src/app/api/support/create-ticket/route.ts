import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TOPICS = [
  'connection_issues',
  'subscription_billing',
  'account',
  'feature_request',
  'other',
] as const;

export async function POST(req: NextRequest) {
  try {
    const { topic, subject, description, contact_email, account_id, priority } =
      await req.json();

    // Validate topic
    if (!topic || !VALID_TOPICS.includes(topic)) {
      return NextResponse.json(
        { error: `Invalid topic. Must be one of: ${VALID_TOPICS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate subject
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return NextResponse.json(
        { error: 'Subject must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Validate description
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

    // Validate email
    if (!contact_email || !EMAIL_REGEX.test(contact_email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    // Generate ticket number: count existing + 1, zero-padded
    const { count, error: countError } = await supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count tickets error:', countError);
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      );
    }

    const nextNumber = (count ?? 0) + 1;
    const ticketNumber = `TKT-${String(nextNumber).padStart(4, '0')}`;

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
        priority: priority === 'premium' ? 'premium' : 'normal',
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
