import { describe, expect, it } from "vitest";
import { resolveBlogCtaTarget } from "./blog-cta-target";

describe("resolveBlogCtaTarget", () => {
  it("defaults to downloads when tags and slug are unmapped", () => {
    expect(resolveBlogCtaTarget({ slug: "random-post", tagSlugs: ["news"] })).toEqual({
      href: "/downloads",
      kind: "downloads",
    });
  });

  it("routes censorship and country tags to matching landings", () => {
    expect(resolveBlogCtaTarget({ slug: "x", tagSlugs: ["china"] })).toEqual({
      href: "/vpn-for-china",
      kind: "landing",
    });
    expect(resolveBlogCtaTarget({ slug: "x", tagSlugs: ["russia", "news"] })).toEqual({
      href: "/vpn-for-russia",
      kind: "landing",
    });
  });

  it("routes install / how-to tags to /install", () => {
    expect(resolveBlogCtaTarget({ slug: "x", tagSlugs: ["how-to", "vpn"] })).toEqual({
      href: "/install",
      kind: "install",
    });
  });

  it("routes protocol posts to the VLESS product page", () => {
    expect(
      resolveBlogCtaTarget({ slug: "what-is-vless", tagSlugs: ["protocols"] }),
    ).toEqual({ href: "/vless-vpn", kind: "product" });
  });

  it("prefers slug overrides over tags", () => {
    expect(
      resolveBlogCtaTarget({
        slug: "how-to-bypass-internet-censorship-2026",
        tagSlugs: ["news"],
      }),
    ).toEqual({ href: "/bypass-censorship", kind: "product" });
  });
});
