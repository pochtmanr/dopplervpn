import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { randomUUID } from 'crypto';
import { assembleWebTicket, saveTicketOnce } from '@/lib/support/contract';

const ACCOUNT_CODE_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export async function POST(req: NextRequest) {
  // Rate limit: 3 tickets per minute per IP
  const rl = rateLimit(req, { limit: 3, windowMs: 60_000, prefix: 'support-ticket' });
  if (rl) return rl;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    if (subject.length < 3) {
      return NextResponse.json({ error: 'Subject must be at least 3 characters' }, { status: 400 });
    }
    if (description.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 },
      );
    }

    const contract = assembleWebTicket(body as Record<string, unknown>);
    if (!contract.ok) {
      return NextResponse.json({ error: contract.error }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();
    const ticketNumber = `TKT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const priority = await priorityForAccount(supabase, contract.value.account_id);

    const saved = await saveTicketOnce(
      {
        insert: async (row) => {
          const { error } = await supabase.from('support_tickets').insert(row);
          return { error: error ? { code: error.code, message: error.message } : null };
        },
        findByClientRequest: async (source, clientRequestId) => {
          const { data, error } = await supabase
            .from('support_tickets')
            .select('ticket_number')
            .eq('source', source)
            .eq('client_request_id', clientRequestId)
            .maybeSingle();
          if (error || !data?.ticket_number) return null;
          return data.ticket_number;
        },
      },
      {
        ...contract.value,
        ticket_number: ticketNumber,
        subject,
        description,
        status: 'open',
        priority,
      },
    );

    if (!saved.ok) {
      console.error('Insert ticket error', saved.code ?? '');
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    return NextResponse.json({ ticket_number: saved.ticketNumber });
  } catch {
    console.error('Create ticket error');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function priorityForAccount(
  supabase: ReturnType<typeof createUntypedAdminClient>,
  accountCode: string | null,
): Promise<'normal' | 'premium'> {
  if (!accountCode || !ACCOUNT_CODE_REGEX.test(accountCode)) return 'normal';
  const { data: account } = await supabase
    .from('accounts')
    .select('subscription_tier, subscription_expires_at')
    .eq('account_id', accountCode)
    .maybeSingle();

  if (
    account?.subscription_tier === 'pro' &&
    account.subscription_expires_at &&
    new Date(account.subscription_expires_at) > new Date()
  ) {
    return 'premium';
  }
  return 'normal';
}
