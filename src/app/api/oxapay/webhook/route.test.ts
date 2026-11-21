import crypto from "crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;

const h = vi.hoisted(() => ({
  tables: { vpn_invoices: [] as Row[], accounts: [] as Row[] } as Record<string, Row[]>,
  accountUpdates: 0,
  failAccountUpdate: false,
  alerts: [] as string[],
}));

// In-memory stand-in for the PostgREST builder: enough of eq/in/update/select/
// maybeSingle/single for the webhook's queries, with update-returning semantics.
function builder(table: string) {
  const filters: Array<(r: Row) => boolean> = [];
  let patch: Row | null = null;
  const rows = () => h.tables[table].filter((r) => filters.every((f) => f(r)));
  const run = () => {
    const matched = rows();
    if (patch) {
      if (table === "accounts") {
        if (h.failAccountUpdate) return { data: null, error: { message: "boom" } };
        h.accountUpdates += 1;
      }
      for (const r of matched) Object.assign(r, patch);
    }
    return { data: matched, error: null };
  };
  const b = {
    select: () => b,
    update: (p: Row) => {
      patch = p;
      return b;
    },
    eq: (c: string, v: unknown) => {
      filters.push((r) => r[c] === v);
      return b;
    },
    in: (c: string, vs: unknown[]) => {
      filters.push((r) => vs.includes(r[c]));
      return b;
    },
    maybeSingle: async () => {
      const res = run();
      if (res.error) return res;
      return { data: (res.data as Row[])[0] ?? null, error: null };
    },
    single: async () => {
      const res = run();
      const row = (res.data as Row[] | null)?.[0];
      return row ? { data: row, error: null } : { data: null, error: { message: "not found" } };
    },
    then: (resolve: (v: unknown) => void) => resolve(run()),
  };
  return b;
}

vi.mock("@/lib/supabase/admin", () => ({
  createUntypedAdminClient: () => ({ from: (t: string) => builder(t) }),
}));
vi.mock("next/server", async (orig) => ({
  ...(await orig<typeof import("next/server")>()),
  after: () => {},
}));
vi.mock("@/lib/postback", () => ({ firePostback: vi.fn() }));
vi.mock("@/lib/purchase-events", () => ({ reportPurchase: vi.fn() }));
vi.mock("@/lib/promo-checkout", () => ({ recordPromoRedemption: vi.fn(async () => "new") }));
vi.mock("@/lib/reporting/schedule", () => ({ observeOxapayPaid: vi.fn() }));
vi.mock("@/lib/ops-alert", () => ({ opsAlert: async (t: string) => void h.alerts.push(t) }));

import { POST } from "./route";

const KEY = "merchant-test-key";

function callback(body: Row, sign = true) {
  const raw = JSON.stringify(body);
  const hmac = crypto.createHmac("sha512", sign ? KEY : "wrong").update(raw).digest("hex");
  return new NextRequest("https://www.dopplervpn.org/api/oxapay/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", hmac },
    body: raw,
  });
}

const paid = (over: Row = {}) => ({
  type: "invoice",
  track_id: "t1",
  status: "Paid",
  order_id: "order-1",
  amount: 6.99,
  currency: "USD",
  ...over,
});

describe("POST /api/oxapay/webhook", () => {
  beforeEach(() => {
    process.env.OXAPAY_MERCHANT_API_KEY = KEY;
    h.accountUpdates = 0;
    h.failAccountUpdate = false;
    h.alerts = [];
    h.tables.accounts = [{ id: "acct-uuid", account_id: "VPN-AB12-CD34-EF56", subscription_expires_at: null }];
    h.tables.vpn_invoices = [
      {
        id: 1,
        provider: "oxapay",
        provider_payment_id: "order-1",
        status: "pending",
        plan: "monthly:VPN-AB12-CD34-EF56",
        amount: 699,
        currency: "USD",
        click_id: null,
        promo_id: null,
        promo_code: null,
      },
    ];
  });

  it("ignores payout callbacks", async () => {
    const res = await POST(callback({ type: "payout", status: "Confirming", track_id: "1" }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("accepts white_label far enough to require order_id", async () => {
    const res = await POST(callback({ type: "white_label", status: "Paid", track_id: "1" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing order_id" });
  });

  it("rejects a bad signature", async () => {
    const res = await POST(callback(paid(), false));
    expect(res.status).toBe(400);
    expect(h.accountUpdates).toBe(0);
  });

  it("credits a Paid callback exactly once across duplicate deliveries", async () => {
    const first = await POST(callback(paid()));
    const second = await POST(callback(paid()));
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(h.accountUpdates).toBe(1);
    expect(h.tables.vpn_invoices[0].status).toBe("paid");
    expect(h.tables.accounts[0].subscription_tier).toBe("pro");
  });

  it("credits concurrent duplicate deliveries exactly once", async () => {
    await Promise.all([POST(callback(paid())), POST(callback(paid()))]);
    expect(h.accountUpdates).toBe(1);
  });

  it("treats Manual_accept as paid", async () => {
    const res = await POST(callback(paid({ status: "Manual_accept" })));
    expect(res.status).toBe(200);
    expect(h.accountUpdates).toBe(1);
  });

  it("returns 404 and alerts when the invoice row is missing", async () => {
    const res = await POST(callback(paid({ order_id: "nope" })));
    expect(res.status).toBe(404);
    expect(h.alerts.join()).toMatch(/unknown order nope/);
    expect(h.accountUpdates).toBe(0);
  });

  it("holds the credit when the paid amount is below the invoice", async () => {
    const res = await POST(callback(paid({ amount: 1 })));
    expect(res.status).toBe(200);
    expect(h.accountUpdates).toBe(0);
    expect(h.tables.vpn_invoices[0].status).toBe("pending");
    expect(h.alerts.join()).toMatch(/Not credited/);
  });

  it("releases the claim when the account update fails, so the retry can credit", async () => {
    h.failAccountUpdate = true;
    const res = await POST(callback(paid()));
    expect(res.status).toBe(500);
    expect(h.tables.vpn_invoices[0].status).toBe("pending");
    h.failAccountUpdate = false;
    const retry = await POST(callback(paid()));
    expect(retry.status).toBe(200);
    expect(h.accountUpdates).toBe(1);
  });

  it("records Underpaid without credit, then credits a later Paid", async () => {
    await POST(callback(paid({ status: "Underpaid" })));
    expect(h.tables.vpn_invoices[0].status).toBe("underpaid");
    expect(h.accountUpdates).toBe(0);
    await POST(callback(paid()));
    expect(h.accountUpdates).toBe(1);
  });

  it("records a refund and alerts without revoking Pro", async () => {
    await POST(callback(paid()));
    const res = await POST(callback(paid({ status: "Refunded" })));
    expect(res.status).toBe(200);
    expect(h.tables.vpn_invoices[0].status).toBe("refunded");
    expect(h.tables.accounts[0].subscription_tier).toBe("pro");
    expect(h.alerts.join()).toMatch(/refunded/);
  });

  it("refuses an unknown plan instead of granting a default", async () => {
    h.tables.vpn_invoices[0].plan = "weird:VPN-AB12-CD34-EF56";
    const res = await POST(callback(paid()));
    expect(res.status).toBe(400);
    expect(h.accountUpdates).toBe(0);
    expect(h.tables.vpn_invoices[0].status).toBe("pending");
  });
});
