import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { createOrder } from '@/lib/revolut';
import { createInvoice } from '@/lib/oxapay';
import { rateLimit } from '@/lib/rate-limit';
import { resolveSiteUrl } from '@/lib/site-url';
import { routing } from '@/i18n/routing';
import { parseDeviceCredentials, verifyDeviceToken } from '@/lib/device-auth';
import {
  ACCOUNT_ID_REGEX,
  CHECKOUT_PLANS,
  insertPendingOxapayInvoice,
  markOxapayInvoiceAbandoned,
} from '@/lib/oxapay-orders';

/**
 * One-hop checkout for the desktop apps (Windows today).
 *
 * The app has already shown the plans and the buyer has picked card or crypto,
 * so this returns the provider's own hosted page and the app opens it directly:
 * no second plan picker on dopplervpn.org. The buyer lands on
 * `/{locale}/checkout/success?…&app=<platform>` afterwards, which hands them
 * back to the app through the `dopplervpn://` link.
 *
 * Auth is the install's device token (see lib/device-auth.ts), not the bare
 * account code. Pro is still granted only by the provider webhooks.
 */
const APPS = new Set(['windows']);

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'checkout-desktop' });
  if (rl) return rl;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const creds = parseDeviceCredentials(body);
  if (!creds || !ACCOUNT_ID_REGEX.test(creds.accountId)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const planId = typeof body.plan === 'string' ? body.plan : '';
  const plan = CHECKOUT_PLANS[planId];
  if (!plan) return NextResponse.json({ error: 'invalid-plan' }, { status: 400 });
  const method = body.method === 'card' ? 'card' : body.method === 'crypto' ? 'crypto' : null;
  if (!method) return NextResponse.json({ error: 'invalid-method' }, { status: 400 });
  const rawLocale = typeof body.locale === 'string' ? body.locale : 'en';
  const locale = (routing.locales as readonly string[]).includes(rawLocale) ? rawLocale : 'en';
  const app = typeof body.app === 'string' && APPS.has(body.app) ? body.app : 'windows';

  try {
    const supabase = createUntypedAdminClient();
    if (!(await verifyDeviceToken(supabase, creds))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const site = resolveSiteUrl(req);
    const successUrl = (provider: string, orderId: string | null) => {
      const u = new URL(`${site}/${locale}/checkout/success`);
      u.searchParams.set('provider', provider);
      if (orderId) u.searchParams.set('order_id', orderId);
      u.searchParams.set('plan', planId);
      u.searchParams.set('account_id', creds.accountId);
      u.searchParams.set('app', app);
      return u.toString();
    };

    if (method === 'card') {
      // The redirect URL is fixed before Revolut assigns the order id, so it
      // carries none. Revolut redirects only after a successful payment, and the
      // success page's app branch waits on the account's Pro state instead of
      // the order (see success-client.tsx). The app polls on its own as well.
      const order = await createOrder(
        plan.amount,
        'USD',
        plan.name,
        { account_id: creds.accountId, plan_id: planId, locale, source: app },
        { redirectUrl: successUrl('revolut', null) },
      );
      if (!order.checkout_url) {
        console.error('[checkout-desktop] revolut_no_checkout_url', order.id);
        return NextResponse.json({ error: 'provider-error' }, { status: 502 });
      }
      return NextResponse.json({ url: order.checkout_url, orderId: order.id, provider: 'revolut' });
    }

    const orderId = randomUUID();
    // Pending row first: without it the webhook cannot credit the payment.
    await insertPendingOxapayInvoice(supabase, {
      orderId,
      planId,
      accountId: creds.accountId,
      amountMinor: plan.amount,
      promoId: null,
      promoCode: null,
    });
    let invoice;
    try {
      invoice = await createInvoice({
        amount: plan.amount / 100,
        currency: 'USD',
        orderId,
        callbackUrl: `${site}/api/oxapay/webhook`,
        returnUrl: successUrl('oxapay', orderId),
        description: `${plan.name} for ${creds.accountId}`,
        lifetimeMinutes: 60,
      });
    } catch (err) {
      await markOxapayInvoiceAbandoned(supabase, orderId);
      throw err;
    }
    return NextResponse.json({ url: invoice.payment_url, orderId, provider: 'oxapay' });
  } catch (error: unknown) {
    console.error('[checkout-desktop]', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
