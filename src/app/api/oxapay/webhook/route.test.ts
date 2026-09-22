import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";

const OXAPAY_KEY = "oxapay-test-merchant-key";

function signed(body: Record<string, unknown>) {
  const raw = JSON.stringify(body);
  const hmac = crypto.createHmac("sha512", OXAPAY_KEY).update(raw).digest("hex");
  return new NextRequest("https://www.dopplervpn.org/api/oxapay/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", hmac },
    body: raw,
  });
}

describe("POST /api/oxapay/webhook type gate", () => {
  beforeEach(() => {
    process.env.OXAPAY_MERCHANT_API_KEY = OXAPAY_KEY;
  });

  it("ignores payout callbacks", async () => {
    const { POST } = await import("./route");
    const res = await POST(signed({ type: "payout", status: "Confirming", track_id: "1" }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("accepts white_label far enough to require order_id", async () => {
    const { POST } = await import("./route");
    const res = await POST(signed({ type: "white_label", status: "Paid", track_id: "1" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing order_id" });
  });
});
