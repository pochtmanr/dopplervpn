import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  assembleTicketContract,
  assembleWebTicket,
  displayLegacyTopic,
  mapLegacyTopic,
  readIssueCategory,
  saveTicketOnce,
  SUPPORT_CAPABILITIES,
  SUPPORT_MIGRATION,
  supportContract,
  type SupportTicketFields,
} from "./contract";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(HERE, "../../../contracts/support/v1/support-contract.fixture.json");
const SCHEMA_PATH = join(HERE, "../../../contracts/support/v1/support-contract.schema.json");

const REQUEST_ID = "6f1c0c3e-6b1a-4e0a-9c2d-0a0b1c2d3e4f";

describe("support contract fixture", () => {
  it("matches the published schema and the copies in admin and the support bot", () => {
    const ajv = new Ajv({ allErrors: true, strict: true });
    const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA_PATH, "utf8")));
    const fixture = JSON.parse(readFileSync(FIXTURE_PATH, "utf8"));
    expect(validate(fixture), JSON.stringify(validate.errors)).toBe(true);
    expect(supportContract.contractVersion).toBe(1);
    expect(SUPPORT_MIGRATION).toBe("20260928223000_support_contract_v1.sql");
    expect(SUPPORT_CAPABILITIES.whatsappDelivery).toBe(false);
    expect(SUPPORT_CAPABILITIES.whatsappManualPreference).toBe(true);
    expect(SUPPORT_CAPABILITIES.contactRemovalPublicUrl).toBeNull();

    for (const sibling of ["doppler-admin", "doppler-support-bot"]) {
      const path = join(HERE, `../../../../${sibling}/contracts/support/v1/support-contract.fixture.json`);
      if (!existsSync(path)) continue;
      expect(readFileSync(path, "utf8")).toBe(readFileSync(FIXTURE_PATH, "utf8"));
      const schema = join(HERE, `../../../../${sibling}/contracts/support/v1/support-contract.schema.json`);
      expect(readFileSync(schema, "utf8")).toBe(readFileSync(SCHEMA_PATH, "utf8"));
    }
  });
});

describe("legacy topics", () => {
  it("maps unambiguous topics and leaves subscription_billing unclassified", () => {
    expect(mapLegacyTopic("connection_issues")).toBe("connection");
    expect(mapLegacyTopic("account")).toBe("account");
    expect(mapLegacyTopic("feature_request")).toBe("feature_request");
    expect(mapLegacyTopic("other")).toBe("other");
    expect(mapLegacyTopic("business")).toBe("business");
    expect(mapLegacyTopic("subscription_billing")).toBeNull();
  });

  it("keeps an unknown legacy value readable and unmapped", () => {
    expect(mapLegacyTopic("made_up")).toBeNull();
    expect(displayLegacyTopic("made_up")).toBe("made_up");
    expect(readIssueCategory({ topic: "made_up", issue_category: null })).toBeNull();
    expect(readIssueCategory({ topic: "subscription_billing", issue_category: "payment" })).toBe("payment");
  });
});

describe("assembleWebTicket", () => {
  it("keeps a legacy email submission and does not verify the claimed account", () => {
    const result = assembleWebTicket({
      topic: "subscription_billing",
      contact_email: "Ada@Example.com",
      account_id: "VPN-ABCD-EFGH-JKLM",
      association_verified: true,
      reply_contact_verified: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      source: "web",
      topic: "subscription_billing",
      issue_category: null,
      preferred_reply_channel: "email",
      contact_email: "ada@example.com",
      telegram_user_id: null,
      whatsapp_e164: null,
      reply_contact_verified: false,
      association_verified: false,
      account_id: "VPN-ABCD-EFGH-JKLM",
      client_request_id: null,
    });
    expect(result.value).not.toHaveProperty("telegram_notified_at");
    expect(Object.keys(result.value)).not.toEqual(
      expect.arrayContaining(["contact_method", "contact_value", "contact_verified"]),
    );
  });

  it("stores a WhatsApp preference without an email and without delivery", () => {
    const result = assembleWebTicket({
      issue_category: "payment",
      preferred_reply_channel: "whatsapp",
      whatsapp_e164: "+44 7700 900123",
      payment_provider: "revolut",
      payment_order_ref: "ord_123",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.topic).toBe("payment");
    expect(result.value.issue_category).toBe("payment");
    expect(result.value.preferred_reply_channel).toBe("whatsapp");
    expect(result.value.whatsapp_e164).toBe("447700900123");
    expect(result.value.contact_email).toBeNull();
    expect(result.value.reply_contact_verified).toBe(false);
    expect(SUPPORT_CAPABILITIES.whatsappDelivery).toBe(false);
  });

  it("rejects invalid enums, mixed destinations, and a client-claimed verified link", () => {
    expect(assembleWebTicket({ topic: "nope", contact_email: "a@b.co" }).ok).toBe(false);
    expect(assembleWebTicket({ issue_category: "subscription_billing", contact_email: "a@b.co" }).ok).toBe(false);
    expect(
      assembleWebTicket({
        topic: "connection_issues",
        issue_category: "payment",
        contact_email: "a@b.co",
      }).ok,
    ).toBe(false);
    expect(
      assembleWebTicket({
        preferred_reply_channel: "whatsapp",
        whatsapp_e164: "+44 7700 900123",
        contact_email: "a@b.co",
      }).ok,
    ).toBe(false);
    expect(assembleWebTicket({ preferred_reply_channel: "sms", contact_email: "a@b.co" }).ok).toBe(false);
    expect(assembleWebTicket({ topic: "account", contact_email: "not-an-email" }).ok).toBe(false);
  });

  it("accepts a new category on an ambiguous legacy topic without rewriting the topic", () => {
    const result = assembleWebTicket({
      topic: "subscription_billing",
      issue_category: "subscription",
      device_platform: "ios",
      preferred_reply_channel: "telegram",
      telegram_username: "@DopplerUser",
      client_request_id: REQUEST_ID,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.topic).toBe("subscription_billing");
    expect(result.value.issue_category).toBe("subscription");
    expect(result.value.device_platform).toBe("ios");
    expect(result.value.preferred_reply_channel).toBe("telegram");
    expect(result.value.telegram_username).toBe("DopplerUser");
    expect(result.value.telegram_user_id).toBeNull();
    expect(result.value.reply_contact_verified).toBe(false);
    expect(result.value.client_request_id).toBe(REQUEST_ID);
  });
});

describe("telegram intake", () => {
  it("keeps the sender id when email is the reply preference and does not verify a pasted account", () => {
    const result = assembleTicketContract({
      source: "telegram",
      topic: "account",
      preferredReplyChannel: "email",
      contactEmail: "a@b.co",
      senderTelegramId: 42,
      telegramUsername: "vasya",
      claimedAccountCode: "VPN-ABCD-EFGH-JKLM",
      trustedAccountLink: false,
      collectOnlySelected: false,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.preferred_reply_channel).toBe("email");
    expect(result.value.contact_email).toBe("a@b.co");
    expect(result.value.telegram_user_id).toBe(42);
    expect(result.value.reply_contact_verified).toBe(false);
    expect(result.value.association_verified).toBe(false);
    expect(result.value.issue_category).toBe("account");
  });

  it("marks a bot telegram reply verified only when the account link was already trusted", () => {
    const pasted = assembleTicketContract({
      source: "telegram",
      topic: "connection_issues",
      preferredReplyChannel: "telegram",
      senderTelegramId: 7,
      claimedAccountCode: "VPN-ABCD-EFGH-JKLM",
      trustedAccountLink: false,
    });
    const linked = assembleTicketContract({
      source: "telegram",
      topic: "connection_issues",
      preferredReplyChannel: "telegram",
      senderTelegramId: 7,
      claimedAccountCode: "VPN-ABCD-EFGH-JKLM",
      trustedAccountLink: true,
    });
    expect(pasted.ok && pasted.value.reply_contact_verified).toBe(true);
    expect(pasted.ok && pasted.value.association_verified).toBe(false);
    expect(pasted.ok && pasted.value.issue_category).toBe("connection");
    expect(linked.ok && linked.value.association_verified).toBe(true);
    expect(linked.ok && linked.value).not.toHaveProperty("contact_method");
  });
});

describe("saveTicketOnce", () => {
  const fields = (): SupportTicketFields & { ticket_number: string } => ({
    source: "web",
    topic: "other",
    issue_category: "other",
    device_platform: null,
    preferred_reply_channel: "email",
    contact_email: "a@b.co",
    telegram_user_id: null,
    telegram_username: null,
    whatsapp_e164: null,
    reply_contact_verified: false,
    association_verified: false,
    account_id: null,
    privacy_notice_version: null,
    privacy_notice_acknowledged_at: null,
    payment_provider: null,
    payment_order_ref: null,
    client_request_id: REQUEST_ID,
    ticket_number: "TKT-NEW",
  });

  it("returns the stored ticket when the same request id is submitted again", async () => {
    const inserted: Array<SupportTicketFields & { ticket_number: string }> = [];
    const first = await saveTicketOnce(
      {
        insert: async (row) => {
          inserted.push(row);
          return { error: null };
        },
        findByClientRequest: async () => null,
      },
      fields(),
    );
    expect(first).toEqual({ ok: true, ticketNumber: "TKT-NEW" });
    expect(inserted[0]).not.toHaveProperty("telegram_notified_at");

    const duplicate = await saveTicketOnce(
      {
        insert: async () => ({ error: { code: "23505", message: "duplicate" } }),
        findByClientRequest: async (source, id) => (source === "web" && id === REQUEST_ID ? "TKT-OLD" : null),
      },
      fields(),
    );
    expect(duplicate).toEqual({ ok: true, ticketNumber: "TKT-OLD" });
  });

  it("does not invent a ticket when the database rejects a row that has no request id", async () => {
    const result = await saveTicketOnce(
      {
        insert: async () => ({ error: { code: "23505" } }),
        findByClientRequest: async () => "TKT-SHOULD-NOT-USE",
      },
      { ...fields(), client_request_id: null },
    );
    expect(result.ok).toBe(false);
  });
});
