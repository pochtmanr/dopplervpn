import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const MESSAGES = join(dirname(fileURLToPath(import.meta.url)), "../../messages");

type FaqItems = {
  noLogs: { answer: string };
  platforms: { answer: string };
  trial: { answer: string };
};

function loadFaq(name: string): FaqItems {
  const data = JSON.parse(readFileSync(join(MESSAGES, name), "utf8")) as {
    faq: { items: FaqItems };
  };
  return data.faq.items;
}

describe("homepage FAQ vs published policies", () => {
  const locales = readdirSync(MESSAGES).filter((name) => name.endsWith(".json"));

  it("lists Windows on every locale", () => {
    expect(locales.length).toBe(44);
    for (const name of locales) {
      expect(loadFaq(name).platforms.answer, name).toMatch(/Windows/i);
    }
  });

  it("does not claim absolute no-IP logging on English", () => {
    const answer = loadFaq("en.json").noLogs.answer;
    expect(answer).not.toMatch(
      /don't track, store, or share any of your browsing activity, connection timestamps, IP addresses, or any other personal data/i,
    );
    expect(answer).toMatch(/authentication/i);
    expect(answer).toMatch(/90 days/i);
  });

  it("does not promise a blanket 30-day money-back on all plans", () => {
    for (const name of locales) {
      const trial = loadFaq(name).trial.answer;
      expect(trial, name).not.toMatch(/30-day money-back guarantee applies to all plans/i);
      expect(trial, name).not.toMatch(/На все тарифы действует 30-дневная гарантия возврата/i);
      expect(trial, name).not.toMatch(/Für alle Tarife gilt eine 30-Tage-Geld-zurück-Garantie/i);
      expect(trial, name).not.toMatch(/所有套餐均适用 30 天退款保证/i);
      expect(trial, name).not.toMatch(/ويسري ضمان استرداد الأموال خلال 30 يومًا على جميع الخطط/i);
      expect(trial, name).toMatch(
        /refund|Refund|возврат|повернен|Rückerstatt|退款|استرداد|remboursement|reembolso|rimborso|返金|환불|iade|İade|restitui|pengembalian|Refusion|refusjon|Terugbetaling|Återbetal|Hyvity|Vrácení|visszatér|Bayaran balik|Geri ödəniş|Політик|Polityk/i,
      );
    }
  });

  it("mentions authentication retention in English-aligned no-logs answers", () => {
    for (const name of ["en.json", "ru.json", "de.json", "zh.json", "ar.json"]) {
      const answer = loadFaq(name).noLogs.answer;
      expect(answer, name).toMatch(/90|authentication|аутентификац|Authentifiz|认证|مصادقة/i);
    }
  });
});

describe("speedComparison honesty", () => {
  it("does not claim zero DPI detections as a hard fact on English", () => {
    const en = JSON.parse(readFileSync(join(MESSAGES, "en.json"), "utf8")) as {
      speedComparison: {
        note: string;
        methodologyCta: string;
        stats: { detection: { value: string; label: string } };
      };
    };
    expect(en.speedComparison.stats.detection.value).not.toBe("0");
    expect(en.speedComparison.note).toMatch(/illustrative|editorial|relative/i);
    expect(en.speedComparison.methodologyCta.length).toBeGreaterThan(0);
  });
});
