import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  promo: null as Record<string, unknown> | null,
  redeemed: false,
  inserted: null as Record<string, unknown> | null,
  createInvoice: vi.fn(async (params: { amount: number }) => ({
    track_id: "track",
    payment_url: "https://pay.oxapay.example/invoice",
    expired_at: 1,
    date: 1,
    charged: params.amount,
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createUntypedAdminClient: () => ({
    from(table: string) {
      if (table === "accounts") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: "acct-uuid" }, error: null }),
            }),
          }),
        };
      }
      if (table === "promo_codes") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  single: async () => ({ data: h.promo }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === "promo_redemptions") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: h.redeemed ? { id: "row" } : null }),
              }),
            }),
          }),
          insert: async () => ({ error: null }),
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
  createInvoice: (params: { amount: number }) => h.createInvoice(params),
}));

import { POST } from "./route";

const PROMO_ID = "11111111-1111-1111-1111-111111111111";

function request(body: Record<string, unknown>) {
  return new NextRequest("https://www.dopplervpn.org/api/oxapay/create-invoice", {
    method: "POST",
    headers: { "content-type": "application/json", host: "www.dopplervpn.org" },
    body: JSON.stringify(body),
  });
}

const accountBody = {
  account_id: "VPN-AB12-CD34-EF56",
  plan_id: "monthly",
  locale: "en",
  promo_code: "doppler20",
  promo_id: PROMO_ID,
};

describe("POST /api/oxapay/create-invoice promo", () => {
  beforeEach(() => {
    h.promo = null;
    h.redeemed = false;
    h.inserted = null;
    h.createInvoice.mockClear();
  });

  it("charges the discounted amount when the promo would also discount a card", async () => {
    h.promo = {
      id: PROMO_ID,
      code: "DOPPLER20",
      discount_percent: 20,
      expires_at: null,
      max_redemptions: null,
      current_redemptions: 0,
      applicable_plans: null,
    };

    const res = await POST(request(accountBody));
    expect(res.status).toBe(200);
    expect(h.createInvoice).toHaveBeenCalledWith(expect.objectContaining({ amount: 5.59 }));
    expect(h.inserted).toMatchObject({
      amount: 559,
      promo_id: PROMO_ID,
      promo_code: "DOPPLER20",
    });
  });

  it("charges the list price when the promo is not valid", async () => {
    h.promo = {
      id: PROMO_ID,
      code: "DOPPLER20",
      discount_percent: 20,
      expires_at: "2020-01-01T00:00:00Z",
      max_redemptions: null,
      current_redemptions: 0,
      applicable_plans: null,
    };

    const res = await POST(request(accountBody));
    expect(res.status).toBe(200);
    expect(h.createInvoice).toHaveBeenCalledWith(expect.objectContaining({ amount: 6.99 }));
    expect(h.inserted).toMatchObject({ amount: 699, promo_id: null, promo_code: null });
  });
});
