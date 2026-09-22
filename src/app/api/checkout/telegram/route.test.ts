import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  inserted: null as Record<string, unknown> | null,
  createWhiteLabel: vi.fn(async (_params?: unknown) => ({
    track_id: "track",
    address: "TAddr",
    pay_amount: "7.01",
    pay_currency: "USDT",
    network: "TRC20",
    memo: null,
    qr_code: "https://qr.example/x",
    expired_at: 1_700_000_000,
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createUntypedAdminClient: () => ({
    from(table: string) {
      if (table === "accounts") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: "acct-uuid" }, error: null }),
            }),
          }),
        };
      }
      if (table === "vpn_invoices") {
        return {
          insert: async (row: Record<string, unknown>) => {
            h.inserted = row;
            return { error: null };
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  }),
}));

vi.mock("@/lib/oxapay", () => ({
  createWhiteLabel: (params: unknown) => h.createWhiteLabel(params),
}));

vi.mock("@/lib/revolut", () => ({
  createOrder: vi.fn(),
}));

import { POST } from "./route";

const SECRET = "checkout-test-secret";

function request(body: Record<string, unknown>) {
  return new NextRequest("https://www.dopplervpn.org/api/checkout/telegram", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "www.dopplervpn.org",
      "x-checkout-secret": SECRET,
    },
    body: JSON.stringify(body),
  });
}

const accountBody = {
  method: "crypto",
  account_id: "VPN-AB12-CD34-EF56",
  plan_id: "monthly",
  locale: "en",
};

describe("POST /api/checkout/telegram crypto", () => {
  beforeEach(() => {
    process.env.CHECKOUT_SHARED_SECRET = SECRET;
    h.inserted = null;
    h.createWhiteLabel.mockClear();
  });

  it("rejects a coin outside the allowlist", async () => {
    const res = await POST(request({ ...accountBody, coin: "doge" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid coin" });
    expect(h.createWhiteLabel).not.toHaveBeenCalled();
    expect(h.inserted).toBeNull();
  });

  it("creates a white-label payment and does not return a hosted url", async () => {
    const res = await POST(request({ ...accountBody, coin: "usdt_trc20" }));
    expect(res.status).toBe(200);
    const json = await res.json();

    expect(h.createWhiteLabel).toHaveBeenCalledWith(expect.objectContaining({
      amount: 6.99,
      currency: "USD",
      payCurrency: "USDT",
      network: "TRC20",
      callbackUrl: "https://www.dopplervpn.org/api/oxapay/webhook",
      lifetimeMinutes: 60,
    }));
    expect(json).toMatchObject({
      method: "crypto",
      address: "TAddr",
      pay_amount: "7.01",
      pay_currency: "USDT",
      network: "TRC20",
      memo: null,
      qr_code: "https://qr.example/x",
      expired_at: 1_700_000_000,
      amount: 699,
    });
    expect(json.payment_url).toBeUndefined();
    expect(h.inserted).toMatchObject({
      plan: "monthly:VPN-AB12-CD34-EF56",
      amount: 699,
      currency: "USD",
      status: "pending",
      provider: "oxapay",
      provider_payment_id: json.order_id,
    });
  });
});
