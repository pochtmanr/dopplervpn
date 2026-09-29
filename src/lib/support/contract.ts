import fixture from "../../../contracts/support/v1/support-contract.fixture.json" with { type: "json" };

/**
 * Support contract v1. The JSON fixture is the canonical value list; this module
 * validates writes. `source` is ingress. `preferred_reply_channel` is where the
 * reply should go. There is no `channel` column.
 *
 * A pasted account code is stored for support context only. It never produces a
 * recovery-contact update (`accounts.contact_method` / `contact_value` /
 * `contact_verified`). `association_verified` is set only when the caller already
 * holds a trusted link, which the public web body cannot claim.
 */

export const supportContract = fixture;

export const SUPPORT_MIGRATION = fixture.migration;
export const SUPPORT_CAPABILITIES = fixture.capabilities;

const SOURCES = new Set<string>(fixture.source);
const CATEGORIES = new Set<string>(fixture.issueCategory);
const PLATFORMS = new Set<string>(fixture.devicePlatform);
const PREFERENCES = new Set<string>(fixture.preferredReplyChannel);
const LEGACY_TOPICS = new Set<string>(fixture.legacyTopics);
const TOPIC_VALUES = new Set<string>([
  ...fixture.legacyTopics,
  ...Object.values(fixture.categoryToTopic),
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCOUNT_CODE_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const USERNAME_REGEX = /^[A-Za-z0-9_]{5,32}$/;

export type SupportSource = "web" | "telegram";
export type PreferredReplyChannel = "telegram" | "email" | "whatsapp";

export interface SupportTicketFields {
  source: SupportSource;
  topic: string;
  issue_category: string | null;
  device_platform: string | null;
  preferred_reply_channel: PreferredReplyChannel | null;
  contact_email: string | null;
  telegram_user_id: number | null;
  telegram_username: string | null;
  whatsapp_e164: string | null;
  reply_contact_verified: boolean;
  association_verified: boolean;
  account_id: string | null;
  privacy_notice_version: string | null;
  privacy_notice_acknowledged_at: string | null;
  payment_provider: string | null;
  payment_order_ref: string | null;
  client_request_id: string | null;
}

export type ContractResult<T> = { ok: true; value: T } | { ok: false; error: string };

export interface TicketContractInput {
  source: SupportSource;
  topic?: unknown;
  issueCategory?: unknown;
  devicePlatform?: unknown;
  preferredReplyChannel?: unknown;
  contactEmail?: unknown;
  telegramUserId?: unknown;
  telegramUsername?: unknown;
  whatsappE164?: unknown;
  claimedAccountCode?: unknown;
  /** Server-side trusted link only. Public requests must pass false. */
  trustedAccountLink?: boolean;
  /** Bot sender id, kept even when the reply preference is email. */
  senderTelegramId?: number | null;
  privacyNoticeVersion?: unknown;
  privacyNoticeAcknowledgedAt?: unknown;
  paymentProvider?: unknown;
  paymentOrderRef?: unknown;
  clientRequestId?: unknown;
  /** Web intake rejects a destination the user did not select. */
  collectOnlySelected?: boolean;
}

/** Legacy topic → category. Unknown topics and `subscription_billing` map to null. */
export function mapLegacyTopic(topic: string | null | undefined): string | null {
  if (!topic || !Object.prototype.hasOwnProperty.call(fixture.legacyTopicMap, topic)) {
    return null;
  }
  return fixture.legacyTopicMap[topic as keyof typeof fixture.legacyTopicMap];
}

/** The stored topic string, including values this contract does not classify. */
export function displayLegacyTopic(topic: string | null | undefined): string {
  return typeof topic === "string" ? topic : "";
}

/** Explicit category when it is valid, otherwise the legacy map. Never throws. */
export function readIssueCategory(row: {
  issue_category?: string | null;
  topic?: string | null;
}): string | null {
  if (row.issue_category && CATEGORIES.has(row.issue_category)) return row.issue_category;
  return mapLegacyTopic(row.topic);
}

export function isIdempotentConflict(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}

export interface TicketWriteStore<T> {
  insert: (row: T) => Promise<{ error: { code?: string; message?: string } | null }>;
  findByClientRequest: (source: string, clientRequestId: string) => Promise<string | null>;
}

/**
 * Insert the ticket before any notification. A repeated client request id returns
 * the existing ticket number. The row is not stamped notified here.
 */
export async function saveTicketOnce<T extends SupportTicketFields & { ticket_number: string }>(
  store: TicketWriteStore<T>,
  row: T,
): Promise<{ ok: true; ticketNumber: string } | { ok: false; code?: string }> {
  const { error } = await store.insert(row);
  if (!error) return { ok: true, ticketNumber: row.ticket_number };
  if (isIdempotentConflict(error) && row.client_request_id) {
    const existing = await store.findByClientRequest(row.source, row.client_request_id);
    if (existing) return { ok: true, ticketNumber: existing };
  }
  return { ok: false, code: error?.code };
}

/** Public web body. Ignores any client attempt to mark the account or contact verified. */
export function assembleWebTicket(body: Record<string, unknown>): ContractResult<SupportTicketFields> {
  return assembleTicketContract({
    source: "web",
    topic: body.topic,
    issueCategory: body.issue_category,
    devicePlatform: body.device_platform,
    preferredReplyChannel: body.preferred_reply_channel,
    contactEmail: body.contact_email,
    telegramUserId: body.telegram_user_id,
    telegramUsername: body.telegram_username,
    whatsappE164: body.whatsapp_e164,
    claimedAccountCode: body.account_id,
    trustedAccountLink: false,
    privacyNoticeVersion: body.privacy_notice_version,
    privacyNoticeAcknowledgedAt: body.privacy_notice_acknowledged_at,
    paymentProvider: body.payment_provider,
    paymentOrderRef: body.payment_order_ref,
    clientRequestId: body.client_request_id,
    collectOnlySelected: true,
  });
}

export function assembleTicketContract(input: TicketContractInput): ContractResult<SupportTicketFields> {
  if (!SOURCES.has(input.source)) return fail("Invalid source");

  const categoryResult = optionalEnum(input.issueCategory, CATEGORIES, "Invalid category");
  if (!categoryResult.ok) return categoryResult;
  const platformResult = optionalEnum(input.devicePlatform, PLATFORMS, "Invalid platform");
  if (!platformResult.ok) return platformResult;

  const topicText = text(input.topic);
  if (topicText && !LEGACY_TOPICS.has(topicText) && !TOPIC_VALUES.has(topicText)) {
    return fail("Invalid topic");
  }
  if (topicText === "business" || categoryResult.value === "business") {
    if (input.source === "web" && input.collectOnlySelected) {
      return fail("Business inquiries use the business form");
    }
  }

  const mappedFromTopic = mapLegacyTopic(topicText);
  if (
    topicText &&
    categoryResult.value &&
    mappedFromTopic &&
    mappedFromTopic !== categoryResult.value
  ) {
    return fail("Category does not match topic");
  }

  const issueCategory = categoryResult.value ?? mappedFromTopic;
  const topic = resolveTopic(topicText, issueCategory);
  if (!topic) return fail("Topic is required");

  const preferenceResult = resolvePreference(input);
  if (!preferenceResult.ok) return preferenceResult;
  const preference = preferenceResult.value;

  const emailResult = optionalEmail(input.contactEmail);
  if (!emailResult.ok) return emailResult;
  const usernameResult = optionalUsername(input.telegramUsername);
  if (!usernameResult.ok) return usernameResult;
  const userIdResult = optionalTelegramId(input.telegramUserId);
  if (!userIdResult.ok) return userIdResult;
  const whatsappResult = optionalWhatsapp(input.whatsappE164);
  if (!whatsappResult.ok) return whatsappResult;

  const senderId = input.senderTelegramId ?? null;
  let email = emailResult.value;
  let username = usernameResult.value;
  let userId = userIdResult.value ?? senderId;
  let whatsapp = whatsappResult.value;

  if (input.collectOnlySelected && preference) {
    const extra = unselectedDestination(preference, {
      email,
      username,
      userId: userIdResult.value,
      whatsapp,
    });
    if (extra) return fail("Send only the selected contact");
    if (preference === "email") {
      username = null;
      userId = null;
      whatsapp = null;
    } else if (preference === "telegram") {
      email = null;
      whatsapp = null;
    } else {
      email = null;
      username = null;
      userId = null;
    }
  } else if (preference === "telegram") {
    email = null;
    whatsapp = null;
  } else if (preference === "email") {
    whatsapp = null;
  } else if (preference === "whatsapp") {
    email = null;
  }

  if (preference === "email" && !email) return fail("Invalid email");
  if (preference === "telegram" && userId == null && !username) return fail("Telegram contact is required");
  if (preference === "whatsapp" && !whatsapp) return fail("Invalid WhatsApp number");
  if (!email && userId == null && !username && !whatsapp) {
    return fail(input.source === "web" ? "Invalid email" : "A contact destination is required");
  }

  const accountResult = optionalAccountCode(input.claimedAccountCode);
  if (!accountResult.ok) return accountResult;
  const associationVerified = input.trustedAccountLink === true && accountResult.value != null;
  if (input.trustedAccountLink === true && accountResult.value == null) {
    return fail("Invalid account");
  }

  const noticeResult = optionalShort(
    input.privacyNoticeVersion,
    fixture.limits.privacyNoticeVersionMax,
    "Invalid notice version",
  );
  if (!noticeResult.ok) return noticeResult;
  const noticedAt = optionalTimestamp(input.privacyNoticeAcknowledgedAt);
  if (!noticedAt.ok) return noticedAt;
  const providerResult = optionalShort(
    input.paymentProvider,
    fixture.limits.paymentProviderMax,
    "Invalid payment provider",
  );
  if (!providerResult.ok) return providerResult;
  const orderResult = optionalShort(
    input.paymentOrderRef,
    fixture.limits.paymentOrderRefMax,
    "Invalid payment reference",
  );
  if (!orderResult.ok) return orderResult;
  const requestId = optionalUuid(input.clientRequestId);
  if (!requestId.ok) return requestId;

  const replyContactVerified =
    input.source === "telegram" && preference === "telegram" && userId != null;

  return {
    ok: true,
    value: {
      source: input.source,
      topic,
      issue_category: issueCategory,
      device_platform: platformResult.value,
      preferred_reply_channel: preference,
      contact_email: email,
      telegram_user_id: userId,
      telegram_username: username,
      whatsapp_e164: whatsapp,
      reply_contact_verified: replyContactVerified,
      association_verified: associationVerified && ACCOUNT_CODE_REGEX.test(accountResult.value ?? ""),
      account_id: accountResult.value,
      privacy_notice_version: noticeResult.value,
      privacy_notice_acknowledged_at: noticedAt.value,
      payment_provider: providerResult.value,
      payment_order_ref: orderResult.value,
      client_request_id: requestId.value,
    },
  };
}

function resolveTopic(topic: string | null, category: string | null): string | null {
  if (topic && (LEGACY_TOPICS.has(topic) || TOPIC_VALUES.has(topic))) return topic;
  if (!category) return null;
  const mapped = fixture.categoryToTopic[category as keyof typeof fixture.categoryToTopic];
  return mapped ?? null;
}

function resolvePreference(input: TicketContractInput): ContractResult<PreferredReplyChannel | null> {
  const raw = text(input.preferredReplyChannel);
  if (raw) {
    if (!PREFERENCES.has(raw)) return fail("Invalid reply preference");
    return { ok: true, value: raw as PreferredReplyChannel };
  }
  if (input.source === "web" && text(typeof input.contactEmail === "string" ? input.contactEmail : "")) {
    return { ok: true, value: "email" };
  }
  if (input.source === "telegram") return fail("Reply preference is required");
  return { ok: true, value: null };
}

function unselectedDestination(
  preference: PreferredReplyChannel,
  dest: { email: string | null; username: string | null; userId: number | null; whatsapp: string | null },
): boolean {
  if (preference === "email") return Boolean(dest.username || dest.userId || dest.whatsapp);
  if (preference === "telegram") return Boolean(dest.email || dest.whatsapp);
  return Boolean(dest.email || dest.username || dest.userId);
}

function optionalEnum(
  value: unknown,
  allowed: Set<string>,
  error: string,
): ContractResult<string | null> {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value !== "string" || !allowed.has(value)) return fail(error);
  return { ok: true, value };
}

function optionalEmail(value: unknown): ContractResult<string | null> {
  const email = text(value);
  if (!email) return { ok: true, value: null };
  if (email.length > fixture.limits.emailMax || !EMAIL_REGEX.test(email)) return fail("Invalid email");
  return { ok: true, value: email.toLowerCase() };
}

function optionalUsername(value: unknown): ContractResult<string | null> {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return fail("Invalid Telegram username");
  const handle = value.trim().replace(/^@+/, "");
  if (!handle) return { ok: true, value: null };
  if (!USERNAME_REGEX.test(handle)) return fail("Invalid Telegram username");
  return { ok: true, value: handle };
}

function optionalTelegramId(value: unknown): ContractResult<number | null> {
  if (value == null || value === "") return { ok: true, value: null };
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return fail("Invalid Telegram id");
  return { ok: true, value: parsed };
}

function optionalWhatsapp(value: unknown): ContractResult<string | null> {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return fail("Invalid WhatsApp number");
  const digits = value.trim().replace(/[\s()-]/g, "").replace(/^\+/, "");
  if (
    !/^[0-9]+$/.test(digits) ||
    digits.length < fixture.limits.whatsappMinDigits ||
    digits.length > fixture.limits.whatsappMaxDigits
  ) {
    return fail("Invalid WhatsApp number");
  }
  return { ok: true, value: digits };
}

function optionalAccountCode(value: unknown): ContractResult<string | null> {
  if (value == null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return fail("Invalid account");
  const code = value.trim();
  if (!code) return { ok: true, value: null };
  if (code.length > fixture.limits.accountCodeMax) return fail("Invalid account");
  return { ok: true, value: code };
}

function optionalShort(value: unknown, max: number, error: string): ContractResult<string | null> {
  const raw = text(value);
  if (!raw) return { ok: true, value: null };
  if (raw.length > max) return fail(error);
  return { ok: true, value: raw };
}

function optionalTimestamp(value: unknown): ContractResult<string | null> {
  const raw = text(value);
  if (!raw) return { ok: true, value: null };
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return fail("Invalid notice time");
  return { ok: true, value: parsed.toISOString() };
}

function optionalUuid(value: unknown): ContractResult<string | null> {
  const raw = text(value);
  if (!raw) return { ok: true, value: null };
  if (!UUID_REGEX.test(raw)) return fail("Invalid request id");
  return { ok: true, value: raw.toLowerCase() };
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function fail(error: string): ContractResult<never> {
  return { ok: false, error };
}
