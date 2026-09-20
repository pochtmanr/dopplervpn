import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * These two functions are the whole authentication boundary on the payment
 * webhooks: everything downstream of them credits a subscription. A regression
 * here is a free-subscription bug, so the cases below cover forgery, tampering,
 * truncation and malformed input rather than just the happy path.
 */

const REVOLUT_SECRET = "revolut-test-secret";
const OXAPAY_KEY = "oxapay-test-merchant-key";

beforeEach(() => {
  process.env.REVOLUT_WEBHOOK_SECRET = REVOLUT_SECRET;
  process.env.OXAPAY_MERCHANT_API_KEY = OXAPAY_KEY;
});

afterEach(() => {
  delete process.env.REVOLUT_WEBHOOK_SECRET;
  delete process.env.OXAPAY_MERCHANT_API_KEY;
});

async function revolut() {
  return (await import("./revolut-webhook")).verifyRevolutSignature;
}
async function oxapay() {
  return (await import("./oxapay")).verifyWebhookSignature;
}

function revolutSign(body: string, timestamp: string, secret = REVOLUT_SECRET) {
  return crypto.createHmac("sha256", secret).update(`v1.${timestamp}.${body}`).digest("hex");
}
function oxapaySign(body: string, key = OXAPAY_KEY) {
  return crypto.createHmac("sha512", key).update(body).digest("hex");
}

describe("verifyRevolutSignature", () => {
  const body = JSON.stringify({ event: "ORDER_COMPLETED", order_id: "ord_123" });
  const ts = "1750000000";

  it("accepts a correctly signed payload", async () => {
    const verify = await revolut();
    expect(verify(body, `v1=${revolutSign(body, ts)}`, ts)).toBe(true);
  });

  it("accepts when one of several rotated signatures matches", async () => {
    const verify = await revolut();
    const header = `v1=${"0".repeat(64)},v1=${revolutSign(body, ts)}`;
    expect(verify(body, header, ts)).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const verify = await revolut();
    const sig = `v1=${revolutSign(body, ts)}`;
    const tampered = JSON.stringify({ event: "ORDER_COMPLETED", order_id: "ord_ATTACKER" });
    expect(verify(tampered, sig, ts)).toBe(false);
  });

  it("rejects a replayed signature bound to a different timestamp", async () => {
    const verify = await revolut();
    expect(verify(body, `v1=${revolutSign(body, ts)}`, "1750009999")).toBe(false);
  });

  it("rejects a signature made with the wrong secret", async () => {
    const verify = await revolut();
    expect(verify(body, `v1=${revolutSign(body, ts, "not-the-secret")}`, ts)).toBe(false);
  });

  it("rejects an unprefixed, empty or truncated signature", async () => {
    const verify = await revolut();
    const good = revolutSign(body, ts);
    expect(verify(body, good, ts)).toBe(false); // missing "v1="
    expect(verify(body, "", ts)).toBe(false);
    expect(verify(body, `v1=${good.slice(0, 32)}`, ts)).toBe(false);
    expect(verify(body, "v1=", ts)).toBe(false);
  });

  it("fails closed when the secret is not configured", async () => {
    delete process.env.REVOLUT_WEBHOOK_SECRET;
    const verify = await revolut();
    expect(() => verify(body, `v1=${revolutSign(body, ts)}`, ts)).toThrow();
  });
});

describe("verifyWebhookSignature (OxaPay)", () => {
  const body = JSON.stringify({ type: "invoice", status: "Paid", order_id: "ord_123" });

  it("accepts a correctly signed payload", async () => {
    const verify = await oxapay();
    expect(verify(body, oxapaySign(body))).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const verify = await oxapay();
    const sig = oxapaySign(body);
    expect(verify(JSON.stringify({ type: "invoice", status: "Paid", order_id: "x" }), sig)).toBe(
      false,
    );
  });

  it("rejects a signature made with the wrong merchant key", async () => {
    const verify = await oxapay();
    expect(verify(body, oxapaySign(body, "wrong-key"))).toBe(false);
  });

  it("rejects empty, truncated and non-hex signatures", async () => {
    const verify = await oxapay();
    expect(verify(body, "")).toBe(false);
    expect(verify(body, oxapaySign(body).slice(0, 64))).toBe(false);
    expect(verify(body, "zzzz")).toBe(false);
  });
});
