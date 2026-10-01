import { describe, expect, it, vi } from "vitest";
import { deriveCtaAttribution, currentCtaAttribution } from "./cta-attribution";

describe("CTA attribution", () => {
  it("records organic article context without copying search terms or query strings", () => {
    const result = deriveCtaAttribution("https://www.dopplervpn.org/en/blog/test?private=secret", "https://www.google.com/search?q=private");
    expect(result.acquisition_source).toBe("organic_search");
    expect(result.landing_path).toBe("/en/blog/test");
    expect(result.article_path).toBe("/en/blog/test");
    expect(JSON.stringify(result)).not.toContain("private");
  });
  it("distinguishes Telegram campaigns and limits campaign parameters", () => {
    const result = deriveCtaAttribution("https://www.dopplervpn.org/ru/blog/test?utm_source=telegram&utm_medium=social&utm_campaign=editorial&email=secret", "");
    expect(result).toMatchObject({ acquisition_source: "campaign", campaign_source: "telegram", campaign_medium: "social", campaign_name: "editorial" });
    expect(JSON.stringify(result)).not.toContain("secret");
  });
  it("does not classify a spoofed search referrer as organic", () => {
    expect(deriveCtaAttribution("https://www.dopplervpn.org/en/blog/test", "https://google.com.evil.test/").acquisition_source).toBe("referral");
  });
});


describe("session acquisition retention", () => {
  it("preserves campaign landing across navigation and removes it after consent expires", () => {
    const stored = new Map<string, string>();
    const storage = { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value), removeItem: (key: string) => stored.delete(key) };
    let consent = JSON.stringify({ analytics: true, timestamp: new Date().toISOString() });
    const location = { href: "https://www.dopplervpn.org/en/blog/test?utm_source=telegram" };
    vi.stubGlobal("window", { location, sessionStorage: storage, localStorage: { getItem: () => consent } });
    vi.stubGlobal("document", { referrer: "" });
    try {
      currentCtaAttribution();
      location.href = "https://www.dopplervpn.org/en/downloads";
      expect(currentCtaAttribution()).toMatchObject({ landing_path: "/en/blog/test", article_path: "/en/blog/test", campaign_source: "telegram" });
      consent = JSON.stringify({ analytics: true, timestamp: "2020-01-01T00:00:00Z" });
      expect(currentCtaAttribution()).toMatchObject({ landing_path: "/en/downloads", campaign_source: "" });
      expect(stored.size).toBe(0);
    } finally { vi.unstubAllGlobals(); }
  });
});
