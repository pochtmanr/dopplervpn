import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { reportPurchase } from "./purchase-events";

const fetchMock = vi.fn<(url: string | URL | Request, init?: RequestInit) => Promise<Response>>(
  async () => new Response("{}", { status: 200 })
);

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-TEST");
  vi.stubEnv("GA_API_SECRET", "secret");
  vi.stubEnv("NEXT_PUBLIC_META_PIXEL_ID", "1420946916642647");
  vi.stubEnv("META_CAPI_ACCESS_TOKEN", "token");
});

afterEach(() => {
  fetchMock.mockClear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function calls() {
  return fetchMock.mock.calls.map(([url, init]) => ({
    url: String(url),
    body: JSON.parse(String(init?.body)),
  }));
}

const base = {
  orderId: "ord_1",
  amountMinor: 3999,
  currency: "usd",
  plan: "yearly",
  provider: "revolut" as const,
  accountId: "VPN-AAAA-BBBB-CCCC",
  email: "Buyer@Example.com",
};

describe("reportPurchase", () => {
  it("sends GA4 revenue in major units — the 100x bug must not return", async () => {
    await reportPurchase({ ...base, attribution: { ga_client_id: "1.2", ga_session_id: "99" } });
    const ga = calls().find((c) => c.url.includes("google-analytics.com"))!;
    const event = ga.body.events[0];
    expect(event.name).toBe("purchase");
    expect(event.params.value).toBe(39.99);
    expect(event.params.currency).toBe("USD");
    expect(event.params.transaction_id).toBe("ord_1");
    expect(event.params.session_id).toBe("99");
    expect(ga.body.client_id).toBe("1.2");
  });

  it("does not contact Meta without marketing consent", async () => {
    await reportPurchase({ ...base, attribution: { consent_marketing: false } });
    expect(calls().some((c) => c.url.includes("graph.facebook.com"))).toBe(false);
  });

  it("sends a hashed, deduplicable CAPI Purchase with marketing consent", async () => {
    await reportPurchase({
      ...base,
      attribution: { consent_marketing: true, fbp: "fb.1.1.2", ip: "203.0.113.7", user_agent: "UA" },
    });
    const capi = calls().find((c) => c.url.includes("graph.facebook.com"))!;
    const event = capi.body.data[0];
    expect(event.event_name).toBe("Purchase");
    expect(event.event_id).toBe("ord_1");
    expect(event.custom_data.value).toBe(39.99);
    expect(event.user_data.em[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(event)).not.toContain("Buyer@Example.com");
    expect(event.user_data.fbp).toBe("fb.1.1.2");
  });
});
