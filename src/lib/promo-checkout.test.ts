import { describe, expect, it, vi } from "vitest";
import {
  discountedCents,
  promoChargeCents,
  recordPromoRedemption,
  type PromoRow,
} from "./promo-checkout";

const NOW = new Date("2026-09-22T12:00:00Z");

function promo(overrides: Partial<PromoRow> = {}): PromoRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    code: "DOPPLER20",
    discount_percent: 20,
    expires_at: null,
    max_redemptions: null,
    current_redemptions: 0,
    applicable_plans: null,
    ...overrides,
  };
}

describe("promoChargeCents", () => {
  it("uses the same rounded percent Revolut charges for a card", () => {
    const charge = promoChargeCents(699, "monthly", promo(), false, NOW);
    expect(charge.amount).toBe(discountedCents(699, 20));
    expect(charge.amount).toBe(559);
    expect(charge.promoId).toBe(promo().id);
    expect(charge.promoCode).toBe("DOPPLER20");
  });

  it("leaves a bad promo at the list price", () => {
    const expired = promo({ expires_at: "2020-01-01T00:00:00Z" });
    const full = promoChargeCents(699, "monthly", expired, false, NOW);
    expect(full.amount).toBe(699);
    expect(full.promoId).toBeNull();

    const exhausted = promo({ max_redemptions: 10, current_redemptions: 10 });
    expect(promoChargeCents(3999, "yearly", exhausted, false, NOW).amount).toBe(3999);

    const wrongPlan = promo({ applicable_plans: ["annual"] });
    expect(promoChargeCents(699, "monthly", wrongPlan, false, NOW).amount).toBe(699);

    const used = promoChargeCents(2999, "6month", promo({ discount_percent: 10 }), true, NOW);
    expect(used.amount).toBe(2999);
    expect(used.promoCode).toBeNull();
  });

  it("maps the 6-month checkout plan onto semiannual", () => {
    const row = promo({ discount_percent: 10, applicable_plans: ["semiannual"] });
    expect(promoChargeCents(2999, "6month", row, false, NOW).amount).toBe(2699);
  });
});

describe("recordPromoRedemption", () => {
  it("does not increment when this account already redeemed the code", async () => {
    const rpc = vi.fn();
    const insert = vi.fn();
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { id: "existing" } }),
            }),
          }),
        }),
        insert,
      }),
      rpc,
    };

    const outcome = await recordPromoRedemption(supabase, {
      promoId: promo().id,
      accountId: "VPN-AB12-CD34-EF56",
    });

    expect(outcome).toBe("already");
    expect(insert).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("inserts the redemption and then increments the counter", async () => {
    const rpc = vi.fn(async () => ({}));
    const insert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: (table: string) => {
        if (table === "promo_redemptions") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null }),
                }),
              }),
            }),
            insert,
          };
        }
        throw new Error(table);
      },
      rpc,
    };

    const outcome = await recordPromoRedemption(supabase, {
      promoId: promo().id,
      accountId: "VPN-AB12-CD34-EF56",
    });

    expect(outcome).toBe("recorded");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        promo_code_id: promo().id,
        account_id: "VPN-AB12-CD34-EF56",
      }),
    );
    expect(rpc).toHaveBeenCalledWith("increment_promo_redemptions", {
      p_promo_id: promo().id,
    });
  });

  it("does not increment when the unique redemption index rejects a duplicate", async () => {
    const rpc = vi.fn();
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null }),
            }),
          }),
        }),
        insert: async () => ({ error: { code: "23505", message: "duplicate" } }),
      }),
      rpc,
    };

    const outcome = await recordPromoRedemption(supabase, {
      promoId: promo().id,
      accountId: "VPN-AB12-CD34-EF56",
    });

    expect(outcome).toBe("already");
    expect(rpc).not.toHaveBeenCalled();
  });
});
