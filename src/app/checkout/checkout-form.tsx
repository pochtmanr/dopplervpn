'use client';

import { useState, useRef, useCallback } from 'react';

const PLANS = [
  { id: 'monthly', label: '1 Month', price: '$6.99', perMonth: '$6.99/mo', save: null, best: false },
  { id: '6month', label: '6 Months', price: '$29.99', perMonth: '$5.00/mo', save: 'Save 28%', best: false },
  { id: 'yearly', label: '1 Year', price: '$39.99', perMonth: '$3.33/mo', save: 'Save 52%', best: true },
] as const;

type PlanId = (typeof PLANS)[number]['id'];
type PaymentMethod = 'card' | 'crypto';

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

function CardIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  );
}

function CryptoIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25h4.5a2.25 2.25 0 010 4.5H9m0 0h5a2.25 2.25 0 010 4.5H9m0-9v9m2-9V6m0 13.5V18" />
    </svg>
  );
}

interface CheckoutFormProps {
  accountId: string | null;
}

export function CheckoutForm({ accountId }: CheckoutFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAvailable, setWalletAvailable] = useState(false);
  const [cardInitialized, setCardInitialized] = useState(false);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);
  const walletContainerRef = useRef<HTMLDivElement>(null);
  const checkoutInstanceRef = useRef<{ destroy: () => void } | null>(null);
  const walletInstanceRef = useRef<{ destroy: () => void } | null>(null);

  const validAccountId = accountId && /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(accountId)
    ? accountId
    : null;

  const goToSuccess = useCallback(
    (orderId: string, planId: PlanId, account: string | null, provider: 'revolut' | 'oxapay') => {
      const params = new URLSearchParams({ order_id: orderId, plan: planId, provider });
      if (account) params.set('account_id', account);
      window.location.href = `/en/checkout/success?${params.toString()}`;
    },
    [],
  );

  const resetCardWidget = useCallback(() => {
    if (checkoutInstanceRef.current) {
      checkoutInstanceRef.current.destroy();
      checkoutInstanceRef.current = null;
    }
    if (walletInstanceRef.current) {
      walletInstanceRef.current.destroy();
      walletInstanceRef.current = null;
    }
    setWalletAvailable(false);
    setCardInitialized(false);
    if (checkoutContainerRef.current) checkoutContainerRef.current.innerHTML = '';
    if (walletContainerRef.current) walletContainerRef.current.innerHTML = '';
  }, []);

  const handleCardCheckout = useCallback(async () => {
    if (!validAccountId) {
      setError('No valid account ID found. Please open this page from the Doppler VPN app.');
      return;
    }

    setLoading(true);
    setError(null);
    resetCardWidget();

    try {
      const res = await fetch('/api/revolut/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: validAccountId,
          plan_id: selectedPlan,
          locale: 'en',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.order_token) {
        setError(data.error || 'Failed to start checkout. Please try again.');
        setLoading(false);
        return;
      }

      const { default: RevolutCheckout } = await import('@revolut/checkout');
      const instance = await RevolutCheckout(data.order_token, data.mode || 'sandbox');

      const orderId: string = data.order_id;

      if (walletContainerRef.current) {
        walletContainerRef.current.innerHTML = '';
        try {
          const pr = instance.paymentRequest({
            target: walletContainerRef.current,
            requestPayerEmail: false,
            requestPayerName: false,
            requestPayerPhone: false,
            requestShipping: false,
            onSuccess: () => goToSuccess(orderId, selectedPlan, validAccountId, 'revolut'),
            onError: (err) => {
              setError(err?.message || 'Wallet payment failed. Please try card.');
            },
            onCancel: () => {},
          });
          const supported = await pr.canMakePayment();
          if (supported) {
            await pr.render();
            setWalletAvailable(true);
            walletInstanceRef.current = pr;
          } else {
            pr.destroy();
          }
        } catch (walletErr) {
          console.warn('paymentRequest init failed', walletErr);
        }
      }

      if (checkoutContainerRef.current) {
        checkoutContainerRef.current.innerHTML = '';
        const card = instance.createCardField({
          target: checkoutContainerRef.current,
          onSuccess: () => goToSuccess(orderId, selectedPlan, validAccountId, 'revolut'),
          onError: (err) => {
            setError(err?.message || 'Payment failed. Please try again.');
            setLoading(false);
            const params = new URLSearchParams({
              order_id: orderId,
              plan: selectedPlan,
              provider: 'revolut',
              reason: err?.message || 'card_field_error',
            });
            if (validAccountId) params.set('account_id', validAccountId);
            window.location.href = `/en/checkout/success?${params.toString()}`;
          },
          onCancel: () => setLoading(false),
        });
        checkoutInstanceRef.current = card;
        setCardInitialized(true);
      }

      setLoading(false);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }, [validAccountId, selectedPlan, goToSuccess, resetCardWidget]);

  const handleCryptoCheckout = useCallback(async () => {
    if (!validAccountId) {
      setError('No valid account ID found. Please open this page from the Doppler VPN app.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/oxapay/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: validAccountId,
          plan_id: selectedPlan,
          locale: 'en',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.payment_url) {
        setError(data.error || 'Failed to create crypto invoice. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.payment_url;
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }, [validAccountId, selectedPlan]);

  const handleMethodChange = useCallback(
    (method: PaymentMethod) => {
      if (method === paymentMethod) return;
      setPaymentMethod(method);
      setError(null);
      resetCardWidget();
    },
    [paymentMethod, resetCardWidget],
  );

  const handleSubscribe = useCallback(() => {
    if (paymentMethod === 'card') {
      handleCardCheckout();
    } else {
      handleCryptoCheckout();
    }
  }, [paymentMethod, handleCardCheckout, handleCryptoCheckout]);

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

        {/* Payment method selector */}
        <div className="grid grid-cols-2 gap-2 mb-5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          <button
            type="button"
            onClick={() => handleMethodChange('card')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              paymentMethod === 'card'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CardIcon />
            Card
          </button>
          <button
            type="button"
            onClick={() => handleMethodChange('crypto')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              paymentMethod === 'crypto'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CryptoIcon />
            Crypto
          </button>
        </div>

        {/* Apple Pay / Google Pay (card only, when supported) */}
        <div
          ref={walletContainerRef}
          className={paymentMethod === 'card' && walletAvailable ? 'mb-3' : 'hidden'}
        />
        {paymentMethod === 'card' && walletAvailable && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-500 text-xs uppercase tracking-wide">or pay with card</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
        )}

        {/* Revolut card field (card only) */}
        <div
          ref={checkoutContainerRef}
          className={paymentMethod === 'card' && cardInitialized ? 'mb-4' : 'mb-4 hidden'}
        />

        {/* Crypto hint */}
        {paymentMethod === 'crypto' && (
          <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
            Pay with USDT (TRC20), BTC, TON and other crypto. You&apos;ll be redirected to OxaPay to
            complete the payment, then brought back here.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading || !validAccountId || (paymentMethod === 'card' && cardInitialized)}
          className="w-full py-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base"
        >
          {loading
            ? 'Processing...'
            : paymentMethod === 'card'
              ? cardInitialized
                ? 'Enter card details above'
                : 'Continue with Card'
              : 'Continue with Crypto'}
        </button>

        <p className="text-center text-zinc-500 text-xs mt-4">
          {paymentMethod === 'card'
            ? 'Secure payment via Revolut · One-time payment · No auto-renewal'
            : 'Secure crypto payment via OxaPay · One-time payment · No auto-renewal'}
        </p>
      </div>
    </div>
  );
}
