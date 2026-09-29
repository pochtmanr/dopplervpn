import { SUPPORT_CAPABILITIES } from "./contract";

/**
 * Public web ticket body. `source` is applied by `assembleWebTicket` and is
 * always `web`. A Telegram username is a manual contact, not a bot delivery
 * id, so this body never sends `telegram_user_id`, `reply_contact_verified`,
 * or `association_verified`.
 */

export const PRIVACY_NOTICE_VERSION = "support-contact-2026-09-28";

export const PUBLIC_ISSUE_CATEGORIES = [
  "account",
  "payment",
  "subscription",
  "connection",
  "performance",
  "app",
  "refund",
  "privacy",
  "feature_request",
  "other",
] as const;

export type PublicIssueCategory = (typeof PUBLIC_ISSUE_CATEGORIES)[number];

export const TECHNICAL_CATEGORIES = ["connection", "performance", "app"] as const;
export const BILLING_CATEGORIES = ["payment", "refund", "subscription"] as const;

export const DEVICE_PLATFORMS = ["ios", "android", "macos", "windows", "web", "unknown"] as const;
export type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

export const PAYMENT_PROVIDERS = [
  "revolut",
  "oxapay",
  "app_store",
  "google_play",
  "other",
  "unknown",
] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export type ReplyChannel = "telegram" | "email" | "whatsapp";

export interface WebTicketDraft {
  issueCategory: PublicIssueCategory;
  subject: string;
  description: string;
  devicePlatform: DevicePlatform | null;
  osVersion: string;
  appVersion: string;
  paymentProvider: PaymentProvider | null;
  paymentOrderRef: string;
  accountId: string;
  replyChannel: ReplyChannel;
  email: string;
  telegramUsername: string;
  whatsapp: string;
  clientRequestId: string;
  acknowledgedAt: string;
}

export interface WebTicketBody {
  subject: string;
  description: string;
  issue_category: PublicIssueCategory;
  device_platform: DevicePlatform | null;
  preferred_reply_channel: ReplyChannel;
  contact_email: string | null;
  telegram_username: string | null;
  whatsapp_e164: string | null;
  account_id: string | null;
  payment_provider: PaymentProvider | null;
  payment_order_ref: string | null;
  privacy_notice_version: string;
  privacy_notice_acknowledged_at: string;
  client_request_id: string;
}

const GUIDE_BY_CATEGORY: Partial<Record<PublicIssueCategory, string>> = {
  account: "/help/account-id",
  subscription: "/help/web-and-store",
  payment: "/help/restore-cancel-refund",
  refund: "/refund",
  connection: "/support#troubleshooting",
  performance: "/support#troubleshooting",
  app: "/support#troubleshooting",
};

export function isTechnicalCategory(category: PublicIssueCategory): boolean {
  return (TECHNICAL_CATEGORIES as readonly string[]).includes(category);
}

export function isBillingCategory(category: PublicIssueCategory): boolean {
  return (BILLING_CATEGORIES as readonly string[]).includes(category);
}

/** One optional guide. Never required before the customer can continue. */
export function guidePathForCategory(category: PublicIssueCategory | null): string | null {
  if (!category) return null;
  return GUIDE_BY_CATEGORY[category] ?? null;
}

export function whatsappChoiceEnabled(
  capabilities: { whatsappManualPreference: boolean } = SUPPORT_CAPABILITIES,
): boolean {
  return capabilities.whatsappManualPreference === true;
}

/** OS and app version have no columns. They ride along in the description. */
export function composeDescription(draft: Pick<
  WebTicketDraft,
  "issueCategory" | "description" | "osVersion" | "appVersion"
>): string {
  const base = draft.description.trim();
  if (!isTechnicalCategory(draft.issueCategory)) return base;
  const lines: string[] = [];
  const os = draft.osVersion.trim();
  const app = draft.appVersion.trim();
  if (os) lines.push(`OS: ${os}`);
  if (app) lines.push(`App: ${app}`);
  if (lines.length === 0) return base;
  return `${base}\n\n${lines.join("\n")}`;
}

export const SUBJECT_MIN = 3;
export const DESCRIPTION_MIN = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9_]{5,32}$/;

export type DetailBlocker = "subject" | "description" | "platform" | "provider";
export type ReplyBlocker = "channel" | "email" | "telegram" | "whatsapp";

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "");
}

export function detailBlockers(
  draft: Pick<
    WebTicketDraft,
    "issueCategory" | "subject" | "description" | "devicePlatform" | "paymentProvider"
  >,
): DetailBlocker[] {
  const blockers: DetailBlocker[] = [];
  if (draft.subject.trim().length < SUBJECT_MIN) blockers.push("subject");
  if (draft.description.trim().length < DESCRIPTION_MIN) blockers.push("description");
  if (isTechnicalCategory(draft.issueCategory) && !draft.devicePlatform) blockers.push("platform");
  if (isBillingCategory(draft.issueCategory) && !draft.paymentProvider) blockers.push("provider");
  return blockers;
}

export function replyBlockers(
  draft: Pick<WebTicketDraft, "email" | "telegramUsername" | "whatsapp"> & {
    replyChannel: ReplyChannel | null;
  },
  capabilities: { whatsappManualPreference: boolean } = SUPPORT_CAPABILITIES,
): ReplyBlocker[] {
  if (!draft.replyChannel) return ["channel"];
  if (draft.replyChannel === "email") {
    const email = draft.email.trim();
    return email.length <= 254 && EMAIL_REGEX.test(email) ? [] : ["email"];
  }
  if (draft.replyChannel === "telegram") {
    return USERNAME_REGEX.test(normalizeUsername(draft.telegramUsername)) ? [] : ["telegram"];
  }
  if (!capabilities.whatsappManualPreference) return ["whatsapp"];
  const digits = draft.whatsapp.trim().replace(/[\s()-]/g, "").replace(/^\+/, "");
  return /^[0-9]{8,15}$/.test(digits) ? [] : ["whatsapp"];
}

/** What the receipt should name. Empty until the selected destination is usable. */
export function replyDestination(
  draft: Pick<WebTicketDraft, "email" | "telegramUsername" | "whatsapp"> & {
    replyChannel: ReplyChannel | null;
  },
): string {
  if (draft.replyChannel === "email") return draft.email.trim();
  if (draft.replyChannel === "telegram") {
    const handle = normalizeUsername(draft.telegramUsername);
    return handle ? `@${handle}` : "";
  }
  if (draft.replyChannel === "whatsapp") return draft.whatsapp.trim();
  return "";
}

export interface ClientRequest {
  id: string;
  at: string;
}

/**
 * One id for the whole attempt, including a retry after a dropped response.
 * A second claim while the first is in flight returns null.
 */
export function createRequestTracker() {
  let current: ClientRequest | null = null;
  let busy = false;
  return {
    claim(create: () => ClientRequest): ClientRequest | null {
      if (busy) return null;
      busy = true;
      if (!current) current = create();
      return current;
    },
    settle(): void {
      busy = false;
    },
    reset(): void {
      busy = false;
      current = null;
    },
  };
}

export function buildWebTicketBody(draft: WebTicketDraft): WebTicketBody {
  const technical = isTechnicalCategory(draft.issueCategory);
  const billing = isBillingCategory(draft.issueCategory);
  const account = draft.accountId.trim();
  const order = draft.paymentOrderRef.trim();

  return {
    subject: draft.subject.trim(),
    description: composeDescription(draft),
    issue_category: draft.issueCategory,
    device_platform: technical ? draft.devicePlatform : null,
    preferred_reply_channel: draft.replyChannel,
    contact_email: draft.replyChannel === "email" ? draft.email.trim() : null,
    telegram_username: draft.replyChannel === "telegram" ? draft.telegramUsername.trim() : null,
    whatsapp_e164: draft.replyChannel === "whatsapp" ? draft.whatsapp.trim() : null,
    account_id: account || null,
    payment_provider: billing ? draft.paymentProvider : null,
    payment_order_ref: billing && order ? order : null,
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    privacy_notice_acknowledged_at: draft.acknowledgedAt,
    client_request_id: draft.clientRequestId,
  };
}
