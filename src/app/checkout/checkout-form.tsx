'use client';

import { useState } from 'react';

const PLANS = [
  { id: 'monthly', label: '1 Month', price: '$6.99', perMonth: '$6.99/mo', save: null, best: false },
  { id: '6month', label: '6 Months', price: '$29.99', perMonth: '$5.00/mo', save: 'Save 28%', best: false },
  { id: 'yearly', label: '1 Year', price: '$39.99', perMonth: '$3.33/mo', save: 'Save 52%', best: true },
] as const;

type PlanId = (typeof PLANS)[number]['id'];

const FEATURES = [
  'Unlimited bandwidth',
  'All server locations',
  'VLESS-Reality protocol',
  'Works on all your devices',
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

interface CheckoutFormProps {
  accountId: string | null;
}

export function CheckoutForm({ accountId }: CheckoutFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validAccountId = accountId && /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(accountId)
    ? accountId
    : null;

  async function handleSubscribe() {
    if (!validAccountId) {
      setError('No valid account ID found. Please open this page from the Doppler VPN app.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          accountId: validAccountId,
          locale: 'en',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || 'Failed to start checkout. Please try again.');
        return;
      }

      window.location.href = data.url;
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 mb-4">
            <ShieldIcon />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Doppler VPN Pro</h1>
          <p className="text-zinc-400 text-sm">Choose your plan and get instant access</p>
        </div>

        {/* Account ID badge */}
        {validAccountId ? (
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-zinc-400 text-sm">Account: </span>
            <span className="text-zinc-200 text-sm font-mono">{validAccountId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-red-300 text-sm">No account linked — open this page from the app</span>
          </div>
        )}

        {/* Plan cards */}
        <div className="flex flex-col gap-3 mb-6">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative w-full text-left rounded-xl border p-4 transition-all ${
                selectedPlan === plan.id
                  ? 'border-blue-500 bg-blue-600/10'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              {plan.best && (
                <span className="absolute -top-2.5 left-4 bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Best Value
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id ? 'border-blue-500' : 'border-zinc-600'
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{plan.label}</div>
                    <div className="text-zinc-400 text-sm">{plan.perMonth}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{plan.price}</div>
                  {plan.save && (
                    <div className="text-green-400 text-xs font-medium">{plan.save}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-2 mb-6">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="text-green-400"><CheckIcon /></span>
              {f}
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading || !validAccountId}
          className="w-full py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
        >
          {loading ? 'Redirecting to checkout…' : 'Subscribe Now'}
        </button>

        <p className="text-center text-zinc-500 text-xs mt-4">
          Secure payment via Stripe · One-time payment · No auto-renewal
        </p>
      </div>
    </div>
  );
}
