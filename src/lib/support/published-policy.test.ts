import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  PUBLISHED_REFUND_POLICY_VERSION,
  publishedRefundPolicyLabel,
  refundAmountForPolicy,
} from "./published-policy";

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(HERE, "../../..");

describe("published refund policy", () => {
  it("cites one version from the refund page, checkout, and the approved article", () => {
    const catalog = JSON.parse(
      readFileSync(
        join(WEB_ROOT, "../doppler-support-bot/knowledge/articles/catalog.json"),
        "utf8",
      ),
    ) as {
      articles: Array<{ id: string; status: string; policyVersion: string | null; content: string }>;
    };
    const approved = catalog.articles.find((article) => article.id === "refund-requests");
    const draft = catalog.articles.find((article) => article.id === "refund-policy-draft-2026-09-28");
    expect(approved?.status).toBe("approved");
    expect(approved?.policyVersion).toBe(PUBLISHED_REFUND_POLICY_VERSION);
    expect(draft?.policyVersion).not.toBe(PUBLISHED_REFUND_POLICY_VERSION);
    expect(draft?.status).toBe("draft");

    const label = publishedRefundPolicyLabel();
    expect(label).toBe(`Policy version ${PUBLISHED_REFUND_POLICY_VERSION}`);
    for (const file of [
      "src/app/[locale]/refund/page.tsx",
      "src/app/checkout/checkout-form.tsx",
      "src/app/[locale]/account/subscribe-content.tsx",
      "src/components/account/dashboard/subscription-card.tsx",
    ]) {
      expect(readFileSync(join(WEB_ROOT, file), "utf8"), file).toContain("publishedRefundPolicyLabel");
    }

    const checkout = readFileSync(join(WEB_ROOT, "src/app/checkout/checkout-form.tsx"), "utf8");
    expect(checkout).toContain("14-day right to cancel");
    expect(checkout).toContain("30 days on the first purchase only");
    expect(checkout).not.toContain("6.84");

    const english = JSON.parse(readFileSync(join(WEB_ROOT, "messages/en.json"), "utf8")) as {
      refund: { sections: { euRights: { content: string }; goodwill: { content: string } } };
      subscribe: { footerNote: string };
    };
    expect(english.refund.sections.euRights.content).toContain("14 days");
    expect(english.refund.sections.goodwill.content).toContain("30 days");
    expect(english.subscribe.footerNote).toContain("14-day right to cancel");
    expect(english.subscribe.footerNote).toContain("30 days on the first purchase only");
    expect(JSON.stringify(english.refund)).not.toContain("6.84");
    expect(english.subscribe.footerNote).not.toContain(draft?.policyVersion ?? "refund-matrix");
  });

  it("sends an unknown or draft policy to review and does not guess an amount", () => {
    expect(refundAmountForPolicy(null)).toEqual({ needsReview: true, customerAmount: null });
    expect(refundAmountForPolicy("refund-matrix-2026-09-28")).toEqual({
      needsReview: true,
      customerAmount: null,
    });
    expect(refundAmountForPolicy("made-up")).toEqual({ needsReview: true, customerAmount: null });
    const published = refundAmountForPolicy(PUBLISHED_REFUND_POLICY_VERSION);
    expect(published.needsReview).toBe(false);
    expect(published.customerAmount).toBeNull();
  });
});
