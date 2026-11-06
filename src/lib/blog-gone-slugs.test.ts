import { describe, expect, it } from "vitest";
import {
  GONE_BLOG_SLUGS,
  isIndexableBlogSlug,
  isValidBlogSlug,
  parseBlogSlug,
} from "./blog-gone-slugs";

describe("isValidBlogSlug", () => {
  it("accepts single-hyphen kebab slugs", () => {
    expect(isValidBlogSlug("what-is-vless")).toBe(true);
    expect(isValidBlogSlug("vless-reality-vs-wireguard")).toBe(true);
  });

  it("rejects empty segments from consecutive hyphens", () => {
    expect(
      isValidBlogSlug(
        "the-openvpn-sunset-why-top-vpns-are-ditching-it-in-2026-and-what-you-need-to-do--mlyakeg8",
      ),
    ).toBe(false);
  });

  it("rejects oversized or empty slugs", () => {
    expect(isValidBlogSlug("")).toBe(false);
    expect(isValidBlogSlug("a".repeat(201))).toBe(false);
  });
});

describe("isIndexableBlogSlug", () => {
  it("excludes permanently removed and double-hyphen slugs", () => {
    expect(isIndexableBlogSlug([...GONE_BLOG_SLUGS][0])).toBe(false);
    expect(
      isIndexableBlogSlug(
        "eus-digital-omnibus-package-tightens-tech-enforcement-in-2026-what-us-companies--mm13ayzw",
      ),
    ).toBe(false);
  });

  it("keeps normal published VPN posts", () => {
    expect(isIndexableBlogSlug("what-is-vless")).toBe(true);
  });
});

describe("parseBlogSlug", () => {
  it("extracts the top-level blog slug", () => {
    expect(parseBlogSlug("/en/blog/what-is-vless")).toBe("what-is-vless");
    expect(parseBlogSlug("/ru/blog/what-is-vless/")).toBe("what-is-vless");
    expect(parseBlogSlug("/en/blog/nested/path")).toBeNull();
  });
});
