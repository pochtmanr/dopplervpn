'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function SuccessContent() {
  const t = useTranslations('subscribeSuccess');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const accountIdParam = searchParams.get('account_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [accountId, setAccountId] = useState(accountIdParam || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    fetch(`/api/checkout/status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.paid) {
          setStatus('success');
          if (data.account_id) setAccountId(data.account_id);
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [sessionId]);

  const copyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center pt-24 pb-16">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent-teal border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary text-lg">{t('verifying')}</p>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-bg-primary flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">{t('errorTitle')}</h1>
          <p className="text-text-secondary">{t('errorDesc')}</p>
        </div>
      </main>
    );
  }

  const platforms = [
    {
      key: 'ios',
      title: t('iosTitle'),
      desc: t('iosDesc'),
      buttonText: t('appStore'),
      url: 'https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ),
    },
    {
      key: 'android',
      title: t('androidTitle'),
      desc: t('androidDesc'),
      buttonText: t('downloadApk'),
      url: '/downloads/doppler-vpn-v1.2.0.apk',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 00-.83.22l-1.88 3.24a11.463 11.463 0 00-8.94 0L5.65 5.67a.643.643 0 00-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 001 18h22a10.78 10.78 0 00-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
        </svg>
      ),
    },
    {
      key: 'mac',
      title: t('macTitle'),
      desc: t('macDesc'),
      buttonText: t('macAppStore'),
      url: 'https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v10h16V6H4zm2 12h12v2H6v-2z" />
        </svg>
      ),
    },
    {
      key: 'windows',
      title: t('windowsTitle'),
      desc: t('windowsDesc'),
      buttonText: t('downloadV2rayN'),
      url: 'https://github.com/2dust/v2rayN/releases/latest',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22l-10-1.91V13.1l10 .15z" />
        </svg>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-bg-primary pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Success heading */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent-teal/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{t('title')}</h1>
          <p className="text-text-secondary text-lg">{t('subtitle')}</p>
        </div>

        {/* Account ID box */}
        {accountId && (
          <div className="bg-accent-teal/10 border border-accent-teal/20 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-medium text-text-secondary mb-2">{t('accountTitle')}</h2>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-xl font-mono font-bold text-text-primary tracking-wide">
                {accountId}
              </code>
              <button
                onClick={copyAccountId}
                className="px-4 py-2 bg-accent-teal text-white text-sm font-medium rounded-lg hover:bg-accent-teal/90 transition-colors shrink-0"
              >
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <p className="text-sm text-text-secondary mt-3">{t('accountNote')}</p>
          </div>
        )}

        {/* Download cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">{t('downloadTitle')}</h2>
          <div className="grid gap-3">
            {platforms.map((platform) => (
              <a
                key={platform.key}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-bg-secondary border border-border-primary rounded-xl p-4 hover:border-accent-teal/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-teal/10 flex items-center justify-center text-accent-teal shrink-0">
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text-primary">{platform.title}</div>
                  <div className="text-sm text-text-secondary">{platform.desc}</div>
                </div>
                <span className="text-xs font-medium text-accent-teal bg-accent-teal/10 px-3 py-1.5 rounded-lg shrink-0 group-hover:bg-accent-teal/20 transition-colors">
                  {platform.buttonText}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Email note */}
        <p className="text-center text-sm text-text-secondary">{t('emailSent')}</p>
      </div>
    </main>
  );
}
