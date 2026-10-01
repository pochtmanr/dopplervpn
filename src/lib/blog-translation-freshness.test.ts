import { describe, expect, it } from "vitest";
import { currentBlogTranslations } from "./supabase/public-blog";

const correction = "Body.\n\n**Correction, September 30, 2026:** Reviewed factual repair.";

describe("advertised translation versions", () => {
  it("excludes an old translation after an English correction and restores a refreshed locale", () => {
    const translations = [
      { locale: "en", updated_at: "2026-09-30T10:00:00Z" },
      { locale: "ru", updated_at: "2026-04-01T10:00:00Z" },
      { locale: "de", updated_at: "2026-09-30T10:01:00Z" },
    ];
    expect(currentBlogTranslations(translations, correction).map((row) => row.locale)).toEqual(["en", "de"]);
    translations[1].updated_at = "2026-09-30T10:00:00Z";
    expect(currentBlogTranslations(translations, correction).map((row) => row.locale)).toEqual(["en", "ru", "de"]);
  });
  it("preserves legacy alternatives when timestamps alone suggest possible divergence", () => {
    expect(currentBlogTranslations([
      { locale: "en", updated_at: "2026-09-30T10:00:00Z" },
      { locale: "ru", updated_at: "2026-04-01T10:00:00Z" },
    ], "Ordinary article without a reviewed revision notice.")).toHaveLength(2);
  });
  it("normalizes timezone offsets rather than comparing date strings", () => {
    expect(currentBlogTranslations([
      { locale: "en", updated_at: "2026-09-30T10:00:00+02:00" },
      { locale: "ru", updated_at: "2026-09-30T08:00:01Z" },
    ], correction)).toHaveLength(2);
  });
  it("does not advertise unknown version alignment", () => {
    expect(currentBlogTranslations([
      { locale: "en", updated_at: "invalid" },
      { locale: "ru", updated_at: "2026-09-30T08:00:01Z" },
    ], correction).map((row) => row.locale)).toEqual(["en"]);
    expect(currentBlogTranslations([{ locale: "ru", updated_at: null }], correction)).toEqual([]);
  });
});
