/**
 * Shape returned by `GET /api/subscribe/account-info`.
 *
 * Declared here rather than inside subscribe-content.tsx so that AuthPanel can
 * hand a fetched account back to whichever page mounted it (/login, /signup or
 * /account) without importing from that 1,600-line component.
 */
export interface AccountInfo {
  accountId: string;
  tier: string;
  rawTier: string | null;
  expiresAt: string | null;
  contactMethod: string | null;
  contactValue: string | null;
  contactVerified: boolean;
  createdAt: string;
  linkedAccountsCount?: number;
}

/** One row of `GET /api/account/devices`. `type` is the app's `device_type` (ios, android, macos, windows, …). */
export interface AccountDevice {
  name: string | null;
  type: string | null;
  isMain: boolean;
  lastActiveAt: string | null;
  createdAt: string;
}

export interface AccountDevices {
  maxDevices: number;
  devices: AccountDevice[];
}
