import type { AccountDevices, AccountInfo } from '@/components/account/types';

/** Fixed sample data for the lab. Not a real account. */
export const MOCK_ACCOUNT_ID = 'VPN-7K2Q-M4XD-9PLA';

const DAY = 86_400_000;
/** Kept as a fixed date so server and client render the same text. */
export const MOCK_EXPIRES_AT = '2027-03-14T12:00:00.000Z';
export const MOCK_EXPIRED_AT = '2026-08-02T12:00:00.000Z';

export const MOCK_ACCOUNT_INFO: AccountInfo = {
  accountId: MOCK_ACCOUNT_ID,
  tier: 'pro',
  rawTier: 'pro',
  expiresAt: MOCK_EXPIRES_AT,
  contactMethod: 'telegram',
  contactValue: '@doppler_sample',
  contactVerified: true,
  createdAt: '2025-11-20T09:00:00.000Z',
};

export function mockDevices(now: number): AccountDevices {
  return {
    maxDevices: 10,
    devices: [
      { name: 'iPhone 16 Pro', type: 'ios', isMain: true, lastActiveAt: new Date(now - 2 * 3_600_000).toISOString(), createdAt: '2025-11-20T09:00:00.000Z' },
      { name: 'MacBook Air', type: 'macos', isMain: false, lastActiveAt: new Date(now - 3 * DAY).toISOString(), createdAt: '2026-01-04T09:00:00.000Z' },
      { name: null, type: 'android', isMain: false, lastActiveAt: null, createdAt: '2026-06-11T09:00:00.000Z' },
    ],
  };
}
