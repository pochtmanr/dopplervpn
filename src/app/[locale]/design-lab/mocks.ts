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

/** A post for the blog card rows (image from the blog's own remote host list). */
export const MOCK_POST = {
  slug: 'vless-reality-vs-wireguard',
  title: 'VLESS-Reality vs WireGuard: Why Fast Is Not the Same as Unblockable',
  excerpt: 'WireGuard is the faster protocol and it is blocked in minutes. The reason has nothing to do with encryption strength.',
  imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
  imageAlt: null,
  publishedAt: '2026-09-13T09:00:00.000Z',
  tags: [
    { slug: 'comparison', name: 'Comparison' },
    { slug: 'protocol', name: 'Protocol' },
  ],
};

/** Markdown that exercises every BlogContent renderer; the inline CTA lands after the third h2. */
export const MOCK_ARTICLE = `## What a censor looks at

A censorship system does not decrypt your traffic. It **classifies** it, and asks a cheaper question: *what kind of connection is this?* See [the VLESS guide](/en/vless-vpn).

- Packet sizes and timing
- Port numbers
- The opening handshake

## Why WireGuard stands out

> Its first packet is a fixed-size UDP message with a known structure.

Inline \`code\` and a block:

\`\`\`
vless://uuid@host:443?security=reality&sni=example.com
\`\`\`

## The trade

| Protocol | Speed | Survives DPI |
| --- | --- | --- |
| WireGuard | Fastest | No |
| VLESS-Reality | Fast | Yes |

That is the honest trade.
`;
