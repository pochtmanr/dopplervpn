import { describe, it, expect } from "vitest";
import { parseBlogPage } from "./blog-pagination";
describe("blog archive query", () => {
  it("accepts positive whole page numbers", () => {
    expect(parseBlogPage("2")).toBe(2);
    expect(parseBlogPage("10")).toBe(10);
  });
  it("rejects malformed, negative and unsafe values", () => {
    for (const value of [undefined, "", "0", "-1", "2garbage", "1.5", "Infinity", "999999999999999999999"]) {
      expect(parseBlogPage(value)).toBe(1);
    }
  });
});
