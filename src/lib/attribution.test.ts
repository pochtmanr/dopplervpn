import { describe, expect, it } from "vitest";
import {
  attributionFromMetadata,
  attributionToMetadata,
  landingTouchFromRequest,
  readCheckoutAttribution,
  serializeLandingTouch,
  sessionIdFromGaSessionCookie,
} from "./attribution";

const HOST = "www.dopplervpn.org";

function req(cookies: Record<string, string>, headers: Record<string, string> = {}) {
  return {
    cookies: { get: (n: string) => (n in cookies ? { value: cookies[n] } : undefined) },
    headers: { get: (n: string) => headers[n.toLowerCase()] ?? null },
  };
}

describe("landingTouchFromRequest", () => {
  it("records UTM tags and the external referrer", () => {
    const touch = landingTouchFromRequest(
      new URL(`https://${HOST}/en?utm_source=google&utm_medium=cpc&utm_campaign=ru%20launch`),
      "https://www.google.com/",
      null,
      HOST
    );
    expect(touch).toMatchObject({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "ru launch",
      referrer_host: "www.google.com",
      landing_path: "/en",
    });
  });

  it("does not let an untagged internal page load overwrite a stored touch", () => {
    const existing = { utm_source: "meta", at: 1 };
    const touch = landingTouchFromRequest(
      new URL(`https://${HOST}/en/pricing`),
      `https://${HOST}/en`,
      existing,
      HOST
    );
    expect(touch).toBeNull();
  });

  it("lets a new tagged visit overwrite (last non-direct touch)", () => {
    const touch = landingTouchFromRequest(
      new URL(`https://${HOST}/ru?fbclid=IwAR0abc-_1`),
      null,
      { utm_source: "google", at: 1 },
      HOST
    );
    expect(touch?.fbclid).toBe("IwAR0abc-_1");
    expect(touch?.utm_source).toBeUndefined();
  });

  it("drops values with characters that could break a cookie or URL", () => {
    const touch = landingTouchFromRequest(
      new URL(`https://${HOST}/en?utm_source=${encodeURIComponent('x";<script>')}`),
      null,
      null,
      HOST
    );
    expect(touch?.utm_source).toBeUndefined();
  });
});

describe("readCheckoutAttribution", () => {
  const touch = serializeLandingTouch({ utm_source: "meta", fbclid: "abc", fbclid_at: 1700000000000 });
  const cookies = {
    dp_attr: touch,
    _ga: "GA1.1.123456789.1700000000",
    _ga_ABC123: "GS2.1.s1726000000$o3$g1$t1726000100$j0$l0$h0",
    _fbp: "fb.1.1700000000000.987",
  };
  const headers = { "x-forwarded-for": "203.0.113.7, 10.0.0.1", "user-agent": "UA/1.0" };

  it("keeps only the campaign touch without consent", () => {
    const attr = readCheckoutAttribution(req(cookies, headers), { analytics: false, marketing: false }, "G-ABC123");
    expect(attr.utm_source).toBe("meta");
    expect(attr.ga_client_id).toBeUndefined();
    expect(attr.fbp).toBeUndefined();
    expect(attr.ip).toBeUndefined();
    expect(attr.fbclid).toBeUndefined();
  });

  it("adds GA ids with analytics consent and Meta ids with marketing consent", () => {
    const attr = readCheckoutAttribution(req(cookies, headers), { analytics: true, marketing: true }, "G-ABC123");
    expect(attr.ga_client_id).toBe("123456789.1700000000");
    expect(attr.ga_session_id).toBe("1726000000");
    expect(attr.fbp).toBe("fb.1.1700000000000.987");
    expect(attr.fbc).toBe("fb.1.1700000000000.abc");
    expect(attr.ip).toBe("203.0.113.7");
    expect(attr.user_agent).toBe("UA/1.0");
  });

  it("round-trips through Revolut's flat string metadata", () => {
    const attr = readCheckoutAttribution(req(cookies, headers), { analytics: true, marketing: true }, "G-ABC123");
    const meta = attributionToMetadata(attr);
    expect(Object.values(meta).every((v) => typeof v === "string" && v.length <= 450)).toBe(true);
    expect(attributionFromMetadata({ ...meta, account_id: "VPN-XXXX" })).toEqual(attr);
  });
});

describe("sessionIdFromGaSessionCookie", () => {
  it("reads both live cookie formats", () => {
    expect(sessionIdFromGaSessionCookie("GS1.1.1726000000.3.1.1726000100.0.0.0")).toBe("1726000000");
    expect(sessionIdFromGaSessionCookie("GS2.1.s1726000000$o3$g1")).toBe("1726000000");
    expect(sessionIdFromGaSessionCookie("garbage")).toBeNull();
  });
});
