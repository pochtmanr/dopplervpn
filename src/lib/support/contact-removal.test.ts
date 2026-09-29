import { describe, expect, it } from "vitest";
import { contactRemovalEnabled, planContactRemoval, type StoredAccountContact } from "./contact-removal";

const ACCOUNT: StoredAccountContact = {
  id: "8d2a6c1e-1111-4222-8333-444455556666",
  account_id: "VPN-ABCD-EFGH-JKLM",
  contact_method: "email",
  contact_value: "ada@example.com",
  contact_verified: true,
};

describe("planContactRemoval", () => {
  it("records a pending request for the matched verified contact and nothing else", () => {
    const plan = planContactRemoval({
      account: ACCOUNT,
      accountCode: ACCOUNT.account_id,
      contactMethod: "email",
      contactValue: "Ada@Example.com",
    });
    expect(plan.write).toBe(true);
    if (!plan.write) return;
    expect(plan.row).toEqual({
      account_code: ACCOUNT.account_id,
      account_uuid: ACCOUNT.id,
      status: "pending",
      notice_version: null,
    });
    expect(plan.row).not.toHaveProperty("contact_value");
    expect(plan.row).not.toHaveProperty("contact_method");
    expect(JSON.stringify(plan.row)).not.toContain("delete_account");
  });

  it("does not write for a mismatched account, an unverified contact, or the wrong destination", () => {
    expect(
      planContactRemoval({
        account: { ...ACCOUNT, account_id: "VPN-ZZZZ-ZZZZ-ZZZZ" },
        accountCode: ACCOUNT.account_id,
        contactMethod: "email",
        contactValue: ACCOUNT.contact_value!,
      }).write,
    ).toBe(false);
    expect(
      planContactRemoval({
        account: { ...ACCOUNT, contact_verified: false },
        accountCode: ACCOUNT.account_id,
        contactMethod: "email",
        contactValue: ACCOUNT.contact_value!,
      }).write,
    ).toBe(false);
    expect(
      planContactRemoval({
        account: null,
        accountCode: ACCOUNT.account_id,
        contactMethod: "email",
        contactValue: ACCOUNT.contact_value!,
      }).write,
    ).toBe(false);
    expect(
      planContactRemoval({
        account: ACCOUNT,
        accountCode: ACCOUNT.account_id,
        contactMethod: "telegram",
        contactValue: "99",
      }).write,
    ).toBe(false);
  });

  it("stays off unless the environment flag is exactly true", () => {
    expect(contactRemovalEnabled({})).toBe(false);
    expect(contactRemovalEnabled({ SUPPORT_CONTACT_REMOVAL_ENABLED: "false" })).toBe(false);
    expect(contactRemovalEnabled({ SUPPORT_CONTACT_REMOVAL_ENABLED: "true" })).toBe(true);
  });
});
