import { describe, expect, it } from "vitest";
import { withQuery } from "./with-query";

describe("withQuery", () => {
  it("appends params with ? when the URL has no query string", () => {
    expect(
      withQuery("https://apps.apple.com/us/app/doppler-vpn/id123", {
        utm_source: "organic",
        utm_medium: "seo",
        utm_campaign: "vpn-for-uae",
      }),
    ).toBe(
      "https://apps.apple.com/us/app/doppler-vpn/id123?utm_source=organic&utm_medium=seo&utm_campaign=vpn-for-uae",
    );
  });

  it("appends with & when a query string already exists (no second ?)", () => {
    const href = withQuery(
      "https://play.google.com/store/apps/details?id=org.dopplervpn.android",
      {
        utm_source: "organic",
        utm_medium: "seo",
        utm_campaign: "vpn-for-uae",
      },
    );
    expect(href).toBe(
      "https://play.google.com/store/apps/details?id=org.dopplervpn.android&utm_source=organic&utm_medium=seo&utm_campaign=vpn-for-uae",
    );
    expect(href).not.toContain("android?utm_");
    expect(href.match(/\?/g)).toHaveLength(1);
  });
});
