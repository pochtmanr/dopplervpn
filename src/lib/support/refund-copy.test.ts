import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MESSAGES = join(dirname(fileURLToPath(import.meta.url)), "../../../messages");

const FORBIDDEN = [
  /AI[- ]powered video/i,
  /video generation tool/i,
  /network fees are not covered/i,
  /amount we received/i,
  /Cancel anytime/,
  /5–10 business/,
  /5-10 business/,
  /proportional deduction/i,
];

describe("refund copy release", () => {
  const locales = readdirSync(MESSAGES).filter((name) => name.endsWith(".json"));

  it("gives every locale the same refund and help shape without the old fee promises", () => {
    expect(locales.length).toBe(44);
    for (const name of locales) {
      const data = JSON.parse(readFileSync(join(MESSAGES, name), "utf8")) as {
        refund: { sections: Record<string, { title: string }> };
        helpAccountId: { title: string };
        helpWebAndStore: { title: string };
        helpRestoreCancelRefund: { title: string };
        privacy: { sections: { supportContact: { content: string } } };
        checkout: { footerNote: string };
        support: { guides: { accountId: string } };
        terms: unknown;
      };
      expect(data.refund.sections.revolutCard.title, name).toBeTruthy();
      expect(data.refund.sections.oxapay, name).toBeTruthy();
      expect(data.refund.sections.appStore, name).toBeTruthy();
      expect(data.refund.sections.googlePlay, name).toBeTruthy();
      expect(data.refund.sections.webSubscriptions, name).toBeUndefined();
      expect(data.helpAccountId.title, name).toBeTruthy();
      expect(data.helpWebAndStore.title, name).toBeTruthy();
      expect(data.helpRestoreCancelRefund.title, name).toBeTruthy();
      expect(data.privacy.sections.supportContact.content, name).toBeTruthy();
      expect(data.support.guides.accountId, name).toBeTruthy();
      expect(data.checkout.footerNote, name).not.toMatch(/Cancel anytime/);
      const blob = JSON.stringify({
        refund: data.refund,
        terms: data.terms,
        privacy: data.privacy,
        checkout: data.checkout,
      });
      for (const pattern of FORBIDDEN) {
        expect(blob, `${name} ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
