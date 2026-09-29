import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import { assertMatrixExamples, loadRefundMatrix } from "./refund-matrix";

const HERE = dirname(fileURLToPath(import.meta.url));
const MATRIX_PATH = join(HERE, "../../../contracts/refund/v1/refund-decision-matrix.json");
const SCHEMA_PATH = join(HERE, "../../../contracts/refund/v1/refund-decision-matrix.schema.json");

describe("refund decision matrix", () => {
  it("matches the schema and the support-bot copy", () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA_PATH, "utf8")));
    const raw = readFileSync(MATRIX_PATH, "utf8");
    const matrix = JSON.parse(raw);
    expect(validate(matrix), JSON.stringify(validate.errors)).toBe(true);
    const botCopy = join(HERE, "../../../../doppler-support-bot/contracts/refund/v1/refund-decision-matrix.json");
    expect(readFileSync(botCopy, "utf8")).toBe(raw);
    const botSchema = join(HERE, "../../../../doppler-support-bot/contracts/refund/v1/refund-decision-matrix.schema.json");
    expect(readFileSync(botSchema, "utf8")).toBe(readFileSync(SCHEMA_PATH, "utf8"));
  });

  it("resolves the $6.99 / $0.15 example without deducting the gateway cost", () => {
    const matrix = loadRefundMatrix();
    const amounts = assertMatrixExamples(matrix);
    expect(matrix.example.grossPaid.amount).toBe("6.99");
    expect(matrix.example.gatewayCost.amount).toBe("0.15");
    expect(matrix.example.forbiddenDefaultCustomerAmount).toBe("6.84");
    expect(amounts.uk_statutory_cancellation).toBe("6.99");
    expect(amounts.uk_reg36_use_deduction).toBeNull();
    expect(amounts.service_failure).toBe("6.99");
    expect(amounts.duplicate_charge).toBe("6.99");
    expect(amounts.missing_activation).toBe("6.99");
    expect(amounts.voluntary_goodwill).toBe("6.99");
    expect(amounts.revolut_card_and_web_wallets).toBe("6.99");
    expect(amounts.oxapay_crypto).toBe("6.99");
    expect(amounts.app_store).toBeNull();
    expect(amounts.google_play).toBeNull();
    expect(amounts.eu_historic_or_store).toBe("6.99");
    expect(amounts.telegram_stars).toBeNull();
    expect(amounts.microsoft_store).toBeNull();
    expect(amounts.balance_topup).toBeNull();
    expect(Object.values(amounts)).not.toContain("6.84");

    const goodwill = matrix.branches.find((branch) => branch.id === "voluntary_goodwill");
    expect(goodwill?.publishedAsCustomerPromise).toBe(false);
    const use = matrix.branches.find((branch) => branch.id === "uk_reg36_use_deduction");
    expect(use?.example.withoutRequiredEvidenceCustomerAmount).toBe("6.99");
    expect(matrix.law.ukSubscriptionRegime.inForceOn).toBeNull();
  });
});
