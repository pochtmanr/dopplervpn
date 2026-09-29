import { describe, expect, it } from "vitest";
import { assembleWebTicket, saveTicketOnce } from "./contract";
import {
  buildWebTicketBody,
  createRequestTracker,
  composeDescription,
  detailBlockers,
  guidePathForCategory,
  PRIVACY_NOTICE_VERSION,
  PUBLIC_ISSUE_CATEGORIES,
  replyBlockers,
  replyDestination,
  whatsappChoiceEnabled,
  type ReplyChannel,
  type WebTicketDraft,
} from "./web-ticket-draft";
import { supportContract } from "./contract";

const REQUEST_ID = "6f1c0c3e-6b1a-4e0a-9c2d-0a0b1c2d3e4f";
const NOTICED_AT = "2026-09-28T21:00:00.000Z";

function draft(overrides: Partial<WebTicketDraft> = {}): WebTicketDraft {
  return {
    issueCategory: "connection",
    subject: "Drops on Wi-Fi",
    description: "The tunnel drops after a minute.",
    devicePlatform: "ios",
    osVersion: "18.6",
    appVersion: "2.4.1",
    paymentProvider: "revolut",
    paymentOrderRef: "ord_should_not_leak",
    accountId: "VPN-ABCD-EFGH-JKLM",
    replyChannel: "telegram",
    email: "ada@example.com",
    telegramUsername: "@doppler_user",
    whatsapp: "+44 7700 900123",
    clientRequestId: REQUEST_ID,
    acknowledgedAt: NOTICED_AT,
    ...overrides,
  };
}

describe("buildWebTicketBody", () => {
  it("stores category, platform, and a manual Telegram username without email", () => {
    const body = buildWebTicketBody(draft());
    expect(body.client_request_id).toBe(REQUEST_ID);
    expect(buildWebTicketBody(draft()).client_request_id).toBe(REQUEST_ID);
    expect(body.description).toBe("The tunnel drops after a minute.\n\nOS: 18.6\nApp: 2.4.1");
    expect(body).not.toHaveProperty("association_verified");
    expect(body).not.toHaveProperty("reply_contact_verified");
    expect(body).not.toHaveProperty("telegram_user_id");
    expect(body).not.toHaveProperty("contact_method");
    expect(body).not.toHaveProperty("contact_value");
    expect(body).not.toHaveProperty("contact_verified");

    const stored = assembleWebTicket({ ...body });
    expect(stored.ok).toBe(true);
    if (!stored.ok) return;
    expect(stored.value).toMatchObject({
      source: "web",
      topic: "connection_issues",
      issue_category: "connection",
      device_platform: "ios",
      preferred_reply_channel: "telegram",
      telegram_username: "doppler_user",
      telegram_user_id: null,
      contact_email: null,
      whatsapp_e164: null,
      reply_contact_verified: false,
      association_verified: false,
      account_id: "VPN-ABCD-EFGH-JKLM",
      payment_provider: null,
      payment_order_ref: null,
      privacy_notice_version: PRIVACY_NOTICE_VERSION,
      privacy_notice_acknowledged_at: NOTICED_AT,
      client_request_id: REQUEST_ID,
    });
    expect(stored.value).not.toHaveProperty("contact_method");
  });

  it("stores a WhatsApp preference and payment fields without an email", () => {
    expect(whatsappChoiceEnabled()).toBe(true);
    const body = buildWebTicketBody(
      draft({
        issueCategory: "payment",
        devicePlatform: "android",
        osVersion: "15",
        appVersion: "2.4.1",
        paymentProvider: "revolut",
        paymentOrderRef: " ord_123 ",
        replyChannel: "whatsapp",
        whatsapp: "+44 7700 900123",
      }),
    );
    expect(composeDescription(draft({ issueCategory: "payment", osVersion: "15" }))).not.toContain("OS:");
    const stored = assembleWebTicket({ ...body });
    expect(stored.ok).toBe(true);
    if (!stored.ok) return;
    expect(stored.value).toMatchObject({
      source: "web",
      topic: "payment",
      issue_category: "payment",
      device_platform: null,
      preferred_reply_channel: "whatsapp",
      contact_email: null,
      telegram_username: null,
      whatsapp_e164: "447700900123",
      reply_contact_verified: false,
      payment_provider: "revolut",
      payment_order_ref: "ord_123",
      client_request_id: REQUEST_ID,
    });
  });

  it("keeps the same client request id when the insert conflicts", async () => {
    const body = buildWebTicketBody(draft({ replyChannel: "email", email: "Ada@Example.com" }));
    const stored = assembleWebTicket({ ...body });
    expect(stored.ok).toBe(true);
    if (!stored.ok) return;
    const row = {
      ...stored.value,
      ticket_number: "TKT-SYNTH01",
      subject: body.subject,
      description: body.description,
      status: "open",
      priority: "normal" as const,
    };
    const saved = await saveTicketOnce(
      {
        insert: async () => ({ error: { code: "23505" } }),
        findByClientRequest: async (source, clientRequestId) => {
          expect(source).toBe("web");
          expect(clientRequestId).toBe(REQUEST_ID);
          return "TKT-SYNTH01";
        },
      },
      row,
    );
    expect(saved).toEqual({ ok: true, ticketNumber: "TKT-SYNTH01" });
    expect(row.issue_category).toBe("connection");
    expect(row.device_platform).toBe("ios");
    expect(row.preferred_reply_channel).toBe("email");
    expect(row.contact_email).toBe("ada@example.com");
  });

  it("keeps an incomplete draft from submitting and still names a manual destination", () => {
    expect(detailBlockers(draft({ subject: "No", devicePlatform: null }))).toEqual([
      "subject",
      "platform",
    ]);
    expect(detailBlockers(draft({ issueCategory: "refund", paymentProvider: null }))).toEqual([
      "provider",
    ]);
    expect(replyBlockers(draft({ replyChannel: "telegram", telegramUsername: "ab" }))).toEqual([
      "telegram",
    ]);
    expect(replyBlockers(draft())).toEqual([]);
    const tracker = createRequestTracker();
    const created = { id: REQUEST_ID, at: NOTICED_AT };
    expect(tracker.claim(() => created)).toEqual(created);
    expect(tracker.claim(() => ({ id: "other", at: NOTICED_AT }))).toBeNull();
    tracker.settle();
    expect(tracker.claim(() => ({ id: "other", at: NOTICED_AT }))).toEqual(created);
    expect(replyDestination(draft())).toBe("@doppler_user");
    expect(replyBlockers(draft({ replyChannel: "email", email: "ada@example.com" }))).toEqual([]);
  });

  it("stores every public category and reply method with source kept separate", () => {
    const channels: ReplyChannel[] = ["telegram", "email", "whatsapp"];
    const topics = supportContract.categoryToTopic;
    expect(PUBLIC_ISSUE_CATEGORIES).toHaveLength(10);

    for (const issueCategory of PUBLIC_ISSUE_CATEGORIES) {
      for (const replyChannel of channels) {
        const body = buildWebTicketBody(
          draft({
            issueCategory,
            replyChannel,
            email: "Ada@Example.com",
            telegramUsername: "@doppler_user",
            whatsapp: "+44 7700 900123",
          }),
        );
        const stored = assembleWebTicket({ ...body });
        expect(stored.ok, `${issueCategory}/${replyChannel}`).toBe(true);
        if (!stored.ok) continue;
        const technical = issueCategory === "connection" || issueCategory === "performance" || issueCategory === "app";
        const billing = issueCategory === "payment" || issueCategory === "refund" || issueCategory === "subscription";
        expect(stored.value.source).toBe("web");
        expect(stored.value.issue_category).toBe(issueCategory);
        expect(stored.value.topic).toBe(topics[issueCategory]);
        expect(stored.value.preferred_reply_channel).toBe(replyChannel);
        expect(stored.value.device_platform).toBe(technical ? "ios" : null);
        expect(stored.value.payment_provider).toBe(billing ? "revolut" : null);
        expect(stored.value).not.toHaveProperty("telegram_notified_at");
        expect(stored.value.reply_contact_verified).toBe(false);
        expect(stored.value.association_verified).toBe(false);
        if (replyChannel === "email") {
          expect(stored.value.contact_email).toBe("ada@example.com");
          expect(stored.value.telegram_username).toBeNull();
          expect(stored.value.whatsapp_e164).toBeNull();
        } else if (replyChannel === "telegram") {
          expect(stored.value.contact_email).toBeNull();
          expect(stored.value.telegram_username).toBe("doppler_user");
          expect(stored.value.telegram_user_id).toBeNull();
          expect(stored.value.whatsapp_e164).toBeNull();
        } else {
          expect(stored.value.contact_email).toBeNull();
          expect(stored.value.telegram_username).toBeNull();
          expect(stored.value.whatsapp_e164).toBe("447700900123");
        }
      }
    }

    const business = assembleWebTicket({
      issue_category: "business",
      preferred_reply_channel: "email",
      contact_email: "a@b.co",
    });
    expect(business.ok).toBe(false);
  });

  it("offers one guide and does not require it", () => {
    expect(guidePathForCategory("account")).toBe("/help/account-id");
    expect(guidePathForCategory("refund")).toBe("/refund");
    expect(guidePathForCategory("other")).toBeNull();
    expect(guidePathForCategory(null)).toBeNull();
  });
});
