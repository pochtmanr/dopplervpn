import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;

const h = vi.hoisted(() => ({
  tables: { vpn_invoices: [] as Row[], accounts: [] as Row[] } as Record<string, Row[]>,
  accountUpdates: 0,
  failAccountUpdate: false,
  nextId: 1,
}));

// In-memory stand-in for the PostgREST builder, with the one constraint the
// webhook relies on: vpn_invoices.provider_payment_id is unique (23505).
function builder(table: string) {
  const filters: Array<(r: Row) => boolean> = [];
  let patch: Row | null = null;
  let insertRow: Row | null = null;
  let del = false;
  const rows = () => h.tables[table].filter((r) => filters.every((f) => f(r)));
  const run = () => {
    if (insertRow) {
      const dup = h.tables[table].some(
        (r) => table === "vpn_invoices" && r.provider_payment_id === insertRow!.provider_payment_id,
      );
      if (dup) return { data: null, error: { code: "23505", message: "duplicate key" } };
      const row = { id: h.nextId++, ...insertRow };
      h.tables[table].push(row);
      return { data: [row], error: null };
    }
    const matched = rows();
    if (del) {
      h.tables[table] = h.tables[table].filter((r) => !matched.includes(r));
      return { data: matched, error: null };
    }
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
    insert: (r: Row) => {
      insertRow = r;
      return b;
    },
    update: (p: Row) => {
      patch = p;
      return b;
    },
    delete: () => {
      del = true;
      return b;
    },
    eq: (c: string, v: unknown) => {
      filters.push((r) => r[c] === v);
      return b;
    },
    maybeSingle: async () => {
      const res = run();
      if (res.error) return res;
      return { data: (res.data as Row[])[0] ?? null, error: null };
    },
    single: async () => {
      const res = run();
      if (res.error) return res;
      const row = (res.data as Row[] | null)?.[0];
      return row ? { data: row, error: null } : { data: null, error: { message: "not found" } };
    },
    then: (resolve: (v: unknown) => void) => resolve(run()),
  };
  return b;
}

vi.mock("@/lib/supabase/admin", () => ({
  createUntypedAdminClient: () => ({
    from: (t: string) => builder(t),
    rpc: async () => ({ data: null, error: null }),
  }),
}));
vi.mock("next/server", async (orig) => ({
  ...(await orig<typeof import("next/server")>()),
  after: () => {},
}));
vi.mock("@/lib/revolut-webhook", () => ({ verifyRevolutSignature: () => true }));
vi.mock("@/lib/revolut", () => ({
  getOrder: async (id: string) => ({
    id,
    state: "COMPLETED",
    amount: 699,
    currency: "USD",
    metadata: { account_id: "VPN-AB12-CD34-EF56", plan_id: "monthly" },
  }),
}));
vi.mock("@/lib/postback", () => ({ firePostback: vi.fn() }));
vi.mock("@/lib/purchase-events", () => ({ reportPurchase: vi.fn() }));
vi.mock("@/lib/reporting/schedule", () => ({ observeRevolutCompleted: vi.fn() }));
vi.mock("@/lib/ops-alert", () => ({ opsAlert: vi.fn(async () => {}) }));

import { POST } from "./route";

function completed(orderId = "rev-1") {
  return new NextRequest("https://www.dopplervpn.org/api/revolut/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "revolut-signature": "v1=test",
      "revolut-request-timestamp": String(Date.now()),
    },
    body: JSON.stringify({ event: "ORDER_COMPLETED", order_id: orderId }),
  });
}

describe("POST /api/revolut/webhook", () => {
  beforeEach(() => {
    h.accountUpdates = 0;
    h.failAccountUpdate = false;
    h.nextId = 1;
    h.tables.accounts = [{ id: "acct-uuid", account_id: "VPN-AB12-CD34-EF56", subscription_expires_at: null }];
    h.tables.vpn_invoices = [];
  });

  it("credits a completed order once and records it as paid", async () => {
    const res = await POST(completed());
    expect(res.status).toBe(200);
    expect(h.accountUpdates).toBe(1);
    expect(h.tables.vpn_invoices).toHaveLength(1);
    expect(h.tables.vpn_invoices[0]).toMatchObject({
      status: "paid",
      provider: "revolut",
      provider_payment_id: "rev-1",
      plan: "monthly:VPN-AB12-CD34-EF56",
    });
  });

  it("credits two concurrent deliveries of the same order only once", async () => {
    const [a, b] = await Promise.all([POST(completed()), POST(completed())]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(h.accountUpdates).toBe(1);
    expect(h.tables.vpn_invoices).toHaveLength(1);
  });

  it("skips a retry after the order was credited", async () => {
    await POST(completed());
    const res = await POST(completed());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ deduplicated: true });
    expect(h.accountUpdates).toBe(1);
  });

  it("releases the claim when the account update fails, so the retry credits", async () => {
    h.failAccountUpdate = true;
    const first = await POST(completed());
    expect(first.status).toBe(500);
    expect(h.tables.vpn_invoices).toHaveLength(0);

    h.failAccountUpdate = false;
    const retry = await POST(completed());
    expect(retry.status).toBe(200);
    expect(h.accountUpdates).toBe(1);
    expect(h.tables.vpn_invoices).toHaveLength(1);
  });
});
