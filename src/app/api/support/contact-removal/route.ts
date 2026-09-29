import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { contactRemovalEnabled, planContactRemoval } from '@/lib/support/contact-removal';

const ACCOUNT_CODE_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

const GENERIC = {
  success: true,
  message: 'If the account and verified contact match, the request has been recorded.',
};

/**
 * Records a pending support-contact removal. It does not delete the account,
 * clear the recovery contact, or touch payment rows. Off until
 * SUPPORT_CONTACT_REMOVAL_ENABLED=true. There is no public page yet.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 3, windowMs: 3_600_000, prefix: 'support-contact-removal' });
  if (rl) return rl;

  if (!contactRemovalEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const accountCode = typeof body?.account_id === 'string' ? body.account_id.trim() : '';
    const contactMethod = typeof body?.contact_method === 'string' ? body.contact_method.trim() : '';
    const contactValue = typeof body?.contact_value === 'string' ? body.contact_value.trim() : '';

    if (!ACCOUNT_CODE_REGEX.test(accountCode) || !contactMethod || !contactValue) {
      return NextResponse.json(GENERIC);
    }

    const supabase = createUntypedAdminClient();
    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('id, account_id, contact_method, contact_value, contact_verified')
      .eq('account_id', accountCode)
      .maybeSingle();
    if (lookupError) {
      console.error('Contact removal lookup error', lookupError.code);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    const plan = planContactRemoval({
      account: account ?? null,
      accountCode,
      contactMethod,
      contactValue,
    });

    if (plan.write) {
      const { data: existing, error: pendingError } = await supabase
        .from('support_contact_removal_requests')
        .select('id')
        .eq('account_code', plan.row.account_code)
        .eq('status', 'pending')
        .maybeSingle();
      if (pendingError) {
        console.error('Contact removal lookup error', pendingError.code);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
      }

      if (!existing) {
        const { error } = await supabase.from('support_contact_removal_requests').insert(plan.row);
        if (error && error.code !== '23505') {
          console.error('Contact removal request error', error.code);
          return NextResponse.json({ error: 'Internal error' }, { status: 500 });
        }
      }
    }

    return NextResponse.json(GENERIC);
  } catch {
    console.error('Contact removal request error');
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
