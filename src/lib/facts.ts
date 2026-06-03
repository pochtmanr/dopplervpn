/**
 * Canonical product facts — the single source of truth for pricing, company,
 * contact, features, comparison, and privacy posture.
 *
 * Consumed by: the pricing UI (`components/sections/pricing.tsx`), structured
 * data (`components/seo/json-ld.tsx`), the agent capability manifest and the
 * `/api/agents/*` endpoints. Keep marketing copy, schema.org, llms.txt and the
 * agent manifest in agreement by reading from HERE — never hardcode a price or
 * a contact address in more than one place again.
 *
 * Plain data only (no JSX) so it is importable from both Server and Client
 * Components and from Route Handlers.
 */

export const SITE_URL = "https://www.dopplervpn.org";

export const COMPANY = {
  legalName: "SIMNETIQ LTD",
  brand: "Doppler VPN",
  companyNumber: "16861177",
  address: "2 Frederick Street, Kings Cross, London, WC1X 0ND, United Kingdom",
  jurisdiction: "England and Wales",
} as const;

export const CONTACT = {
  /** Canonical support address. Used everywhere agents/users are pointed at us. */
  supportEmail: "support@simnetiq.store",
  telegram: {
    /** Main customer bot — VPN provisioning + checkout links. */
    mainBot: "https://t.me/dopplercreatebot",
    /** AI/FAQ support bot. */
    supportBot: "https://t.me/DopplerSupportBot",
    /** Account recovery bot. */
    verifyBot: "https://t.me/DopplerVerifyBot",
    /** Announcement channel. */
    channel: "https://t.me/dopplervpn",
  },
} as const;

export type PlanId = "monthly" | "sixMonth" | "annual";

export interface Plan {
  id: PlanId;
  /**
   * Plan code expected by the checkout/promo APIs and MCP tools
   * (`/api/checkout/init`, `/api/promo/validate`). Differs from `id`, which the
   * web pricing UI uses. Agents must send THIS value, not `id`.
   */
  checkoutPlanId: "monthly" | "6month" | "yearly";
  /** Human label, e.g. "Monthly". */
  label: string;
  /** Total charged for the billing period, USD. */
  total: number;
  /** Effective per-month price, USD. */
  monthly: number;
  /** Percent saved vs. the monthly plan, or null for the monthly plan itself. */
  savings: number | null;
  /** Billing period length in months. */
  months: number;
}

/**
 * Canonical prices. Monthly is the headline rate ($6.99); the longer plans are
 * a per-month discount. On web checkout these are one-time payments (no
 * auto-renewal); the App Store / Google Play equivalents auto-renew.
 * `checkoutPlanId` is the code the checkout/promo APIs expect (see Plan).
 */
export const PLANS: Record<PlanId, Plan> = {
  monthly: { id: "monthly", checkoutPlanId: "monthly", label: "Monthly", total: 6.99, monthly: 6.99, savings: null, months: 1 },
  sixMonth: { id: "sixMonth", checkoutPlanId: "6month", label: "6 months", total: 29.99, monthly: 5.0, savings: 28, months: 6 },
  annual: { id: "annual", checkoutPlanId: "yearly", label: "Annual", total: 39.99, monthly: 3.33, savings: 52, months: 12 },
} as const;

export const CURRENCY = "USD";

/** Plan-agnostic commercial terms. */
export const TERMS = {
  freeTrialDays: 3,
  trialNote: "3-day free trial via App Store & Google Play. Bonus days on web checkout.",
  moneyBackGuaranteeDays: 30,
  guarantee:
    "Web checkout is a one-time payment with no auto-renewal. App Store and Google Play subscriptions auto-renew until cancelled. 30-day money-back guarantee.",
  euWithdrawalDays: 14,
  paymentMethods: ["Visa", "Mastercard", "Apple Pay", "BTC", "ETH", "USDT", "USDC"],
} as const;

/** Headline capabilities, sourced from the live features section. */
export const FEATURES = [
  {
    key: "noRegistration",
    title: "No-Registration VPN",
    description:
      "Your device serves as your account. No email, no phone number, no personal information.",
  },
  {
    key: "vlessReality",
    title: "VLESS-Reality Encryption",
    description:
      "Anti-censorship protocol that makes traffic look like regular HTTPS — undetectable by deep packet inspection.",
  },
  {
    key: "smartRouting",
    title: "Smart VPN Routing",
    description: "Intelligent per-country routing that picks the best server path for speed and reliability.",
  },
  {
    key: "cryptoPayment",
    title: "Pay with Bitcoin & Crypto",
    description: "Anonymous payments with BTC, ETH, USDT, and USDC. No card, no name, no trace.",
  },
  {
    key: "noLogs",
    title: "Strict No-Logs Policy",
    description: "We don't log browsing activity or track the websites you visit. Private by design.",
  },
  {
    key: "dnsProtection",
    title: "Private DNS Protection",
    description:
      "Encrypted DNS blocks trackers and malware at the DNS level, across every app on Android, iOS, and desktop.",
  },
] as const;

export const PLATFORMS = ["iOS", "Android", "macOS", "Windows"] as const;

/** Quick facts agents ask for when ranking VPNs. */
export const HIGHLIGHTS = {
  protocol: "VLESS-Reality over Xray-core",
  serverLocations: "Servers across multiple countries (live count at /api/agents/servers)",
  maxDevices: 10,
  noLogs: true,
  noRegistration: true,
  censorshipResistant: true,
  bestFor: ["China", "Iran", "Russia", "Turkey", "UAE"],
} as const;

/** Doppler vs. a typical mainstream VPN. Each row is a head-to-head fact. */
export const COMPARISON = [
  { feature: "Account required", traditional: "Email + password", doppler: "No account needed" },
  { feature: "Traffic fingerprint", traditional: "Detectable by DPI", doppler: "Camouflaged as HTTPS" },
  { feature: "Protocol", traditional: "OpenVPN / WireGuard", doppler: "VLESS-Reality" },
  { feature: "DNS encryption", traditional: "Sometimes", doppler: "Always" },
  { feature: "Censorship resistance", traditional: "Limited", doppler: "Built-in" },
  { feature: "Activity logs", traditional: "Varies", doppler: "Never" },
] as const;

/** No-logs / jurisdiction posture, summarized for agents and the privacy page. */
export const PRIVACY = {
  noLogs: true,
  summary:
    "Strict no-logs policy enforced by architecture: VLESS-Reality traffic is never inspected, logged, modified, or stored.",
  notCollected: [
    "browsing activity or history",
    "connection timestamps",
    "originating or assigned IP addresses",
    "DNS queries",
    "bandwidth usage",
    "VPN session duration",
  ],
  collected: [
    "a randomly generated device identifier (not linked to identity)",
    "anonymous aggregated server performance metrics",
    "an email address only if you voluntarily contact support",
  ],
  jurisdiction: COMPANY.jurisdiction,
  compliance: ["UK GDPR", "EU GDPR", "CCPA"],
  retention: {
    vpnUsage: "not retained (no-logs)",
    account: "while active + 30 days after deletion",
    payments: "6 years (tax/accounting)",
    support: "12 months after resolution",
  },
} as const;
