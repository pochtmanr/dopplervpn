'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

function CheckoutSuccessContent() {
  const t = useTranslations('checkout');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'loading' | 'confirmed' | 'error'>(
    sessionId ? 'loading' : 'confirmed'
  );
  const [closeFailed, setCloseFailed] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.paid ? 'confirmed' : 'error');
      })
      .catch(() => {
        // Even on fetch error, show success — the webhook handles fulfillment
        setStatus('confirmed');
      });
  }, [sessionId]);

  const handleReturn = useCallback(() => {
    try {
      window.close();
    } catch {
      // window.close() may be blocked outside WebView
    }
    // If window didn't close, show fallback message
    setTimeout(() => setCloseFailed(true), 300);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Checkmark icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-semibold text-text-primary">
          {status === 'loading'
            ? t('verifying')
            : status === 'error'
              ? t('errorTitle')
              : t('successTitle')}
        </h1>

        {/* Description */}
        <p className="text-text-muted text-lg leading-relaxed">
          {status === 'loading'
            ? t('verifyingDescription')
            : status === 'error'
              ? t('errorDescription')
              : t('successDescription')}
        </p>

        {/* Loading spinner for verification */}
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-text-muted border-t-brand-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Return button */}
        {status !== 'loading' && (
          <button
            onClick={handleReturn}
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-brand-primary text-white font-semibold text-lg hover:bg-brand-primary/90 transition-colors"
          >
            {t('returnToApp')}
          </button>
        )}

        {/* Fallback message if window.close() didn't work */}
        {closeFailed && (
          <p className="text-text-muted text-sm">{t('closeTab')}</p>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-base">
          <div className="w-8 h-8 border-2 border-text-muted border-t-brand-primary rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
