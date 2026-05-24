import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { routing } from '@/i18n/routing';
import { CheckoutForm } from './checkout-form';

export const metadata: Metadata = {
  title: 'Subscribe — Doppler VPN',
  description: 'Get Doppler VPN Pro access',
  robots: { index: false, follow: false },
};

const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const VALID_PLANS = ['monthly', '6month', 'yearly'] as const;
type Plan = (typeof VALID_PLANS)[number];
const TOKEN_REGEX = /^[a-f0-9]{48}$/;

interface PageProps {
  searchParams: Promise<{
    account_id?: string;
    plan?: string;
    t?: string;
    l?: string;
  }>;
}

// Server-side token resolution. Mirrors /api/checkout/resolve but skips the
// HTTP round-trip — we're already on the server. Returns null on any failure
// so the caller can decide between the legacy ?account_id= fallback and an
// expired-link error screen.
async function resolveToken(token: string): Promise<{ accountId: string; plan: Plan } | 'expired' | null> {
  if (!TOKEN_REGEX.test(token)) return null;
  const supabase = createUntypedAdminClient();
  const { data: row, error } = await supabase
    .from('checkout_tokens')
    .select('account_id, plan, expires_at')
    .eq('token', token)
    .maybeSingle();
  if (error || !row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    void supabase.from('checkout_tokens').delete().eq('token', token);
    return 'expired';
  }
  const plan = row.plan as Plan;
  if (!(VALID_PLANS as readonly string[]).includes(plan)) return null;
  return { accountId: row.account_id, plan };
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Token path (preferred). Falls back to ?account_id=&plan= for one
  // release cycle so sideload APKs predating the token rollout still work.
  // Remove the fallback after sideload v1.7 is on every active install.
  let accountId: string | null = null;
  let initialPlan: Plan = 'yearly';
  let expiredLink = false;

  if (params.t) {
    const resolved = await resolveToken(params.t);
    if (resolved === 'expired') {
      expiredLink = true;
    } else if (resolved) {
      accountId = resolved.accountId;
      initialPlan = resolved.plan;
    }
  } else if (params.account_id && ACCOUNT_ID_REGEX.test(params.account_id)) {
    accountId = params.account_id;
    if (params.plan && (VALID_PLANS as readonly string[]).includes(params.plan)) {
      initialPlan = params.plan as Plan;
    }
  }

  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country') || '';

  if (EU_COUNTRIES.has(country.toUpperCase())) {
    const rawLocale = params.l ?? 'en';
    const safeLocale = (routing.locales as readonly string[]).includes(rawLocale) ? rawLocale : 'en';
    redirect(`/${safeLocale}/account`);
  }

  if (expiredLink) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600/20 text-amber-400 mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM3.998 19.5h16.004c1.155 0 1.876-1.25 1.299-2.25L13.299 3.75c-.577-1-2.02-1-2.598 0L2.7 17.25c-.577 1 .144 2.25 1.299 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Checkout link expired</h1>
          <p className="text-zinc-400 mb-8">
            Return to the Doppler VPN app and tap your plan again to start a fresh checkout.
          </p>
        </div>
      </div>
    );
  }

  return <CheckoutForm accountId={accountId} initialPlan={initialPlan} />;
}
