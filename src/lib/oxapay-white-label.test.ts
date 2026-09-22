import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const KEY = "oxapay-test-merchant-key";

beforeEach(() => {
  process.env.OXAPAY_MERCHANT_API_KEY = KEY;
  process.env.OXAPAY_SANDBOX = "true";
});

afterEach(() => {
  delete process.env.OXAPAY_MERCHANT_API_KEY;
  delete process.env.OXAPAY_SANDBOX;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("createWhiteLabel", () => {
  it("posts /payment/white-label without a return url and drops a blank memo", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        data: {
          track_id: "t1",
          address: "TAddr",
          pay_amount: 12.5,
          pay_currency: "USDT",
          network: "TRC20",
          memo: "  ",
          qr_code: "https://qr.example/x",
          expired_at: 99,
        },
        error: {},
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { createWhiteLabel } = await import("./oxapay");
    const result = await createWhiteLabel({
      amount: 6.99,
      currency: "USD",
      payCurrency: "USDT",
      network: "TRC20",
      orderId: "order-1",
      callbackUrl: "https://www.dopplervpn.org/api/oxapay/webhook",
      description: "Doppler VPN Pro — Monthly for VPN-AB12-CD34-EF56",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.oxapay.com/v1/payment/white-label",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ merchant_api_key: KEY }),
      }),
    );
    const init = fetchMock.mock.calls[0][1];
    const payload = JSON.parse(String(init?.body));
    expect(payload).toMatchObject({
      amount: 6.99,
      currency: "USD",
      pay_currency: "USDT",
      network: "TRC20",
      order_id: "order-1",
      callback_url: "https://www.dopplervpn.org/api/oxapay/webhook",
      lifetime: 60,
      fee_paid_by_payer: 1,
      sandbox: true,
    });
    expect(payload.return_url).toBeUndefined();
    expect(result).toEqual({
      track_id: "t1",
      address: "TAddr",
      pay_amount: "12.5",
      pay_currency: "USDT",
      network: "TRC20",
      memo: null,
      qr_code: "https://qr.example/x",
      expired_at: 99,
    });
  });

  it("omits network when the coin has only one chain", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
      ok: true,
      json: async () => ({
        data: {
          track_id: "t2",
          address: "bc1q",
          pay_amount: "0.0001",
          pay_currency: "BTC",
          network: "Bitcoin",
          qr_code: "",
          expired_at: 100,
        },
        error: {},
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const { createWhiteLabel } = await import("./oxapay");
    const result = await createWhiteLabel({
      amount: 6.99,
      currency: "USD",
      payCurrency: "BTC",
      orderId: "order-2",
      callbackUrl: "https://www.dopplervpn.org/api/oxapay/webhook",
      description: "btc",
    });

    const init = fetchMock.mock.calls[0][1];
    const payload = JSON.parse(String(init?.body));
    expect(payload.network).toBeUndefined();
    expect(result.memo).toBeNull();
    expect(result.qr_code).toBe("");
    expect(result.pay_amount).toBe("0.0001");
  });
});
