import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GUIDE_COVERS, iosApple, macosApple } from "@/config/platforms/apple";
import { GUIDE_SLUGS, GUIDES_LOCALES, nextGuideSlug, type GuideMeta } from "./guides";

const root = process.cwd();
const publicFile = (src: string) => path.join(root, "public", src);
const read = (slug: string, file: string) => readFileSync(path.join(root, "content", "guides", slug, file), "utf8");

describe("guides content", () => {
  for (const locale of GUIDES_LOCALES) {
    for (const slug of GUIDE_SLUGS) {
      describe(`${locale}/${slug}`, () => {
        const body = read(slug, `${locale}.md`);
        const meta = JSON.parse(read(slug, `${locale}.meta.json`)) as GuideMeta;

        it("has complete metadata", () => {
          for (const k of ["title", "metaTitle", "metaDescription", "excerpt", "navLabel"] as const) {
            expect(meta[k].length, k).toBeGreaterThan(0);
          }
          expect(meta.readingMinutes).toBeGreaterThan(0);
          expect(meta.faq.length).toBeGreaterThan(0);
          expect(meta.sources.length).toBeGreaterThan(0);
          for (const s of meta.sources) expect(s.url).toMatch(/^https:\/\//);
        });

        it("uses no em or en dashes (house style)", () => {
          expect(body + JSON.stringify(meta)).not.toMatch(/[–—]/);
        });

        it("references only images that exist in public/", () => {
          const inline = [...body.matchAll(/!\[[^\]]*\]\((\/[^\s)]+)/g)].map((m) => m[1]);
          const shots = [...body.matchAll(/```shots\n([\s\S]*?)```/g)].flatMap((m) =>
            m[1].split("\n").map((l) => l.split("|")[0].trim()).filter(Boolean),
          );
          for (const src of [...inline, ...shots]) expect(existsSync(publicFile(src)), src).toBe(true);
        });

        it("links internally only to guides and how-it-works pages that exist", () => {
          const links = [...body.matchAll(/\]\((\/(?:guides|how-it-works)\/[^)\s#]+)/g)].map((m) => m[1]);
          for (const href of links) {
            const [, section, slug2] = href.split("/");
            expect(existsSync(path.join(root, "content", section, slug2)), href).toBe(true);
          }
        });
      });
    }
  }
});

describe("guide order", () => {
  it("chains every guide and ends at the hub", () => {
    const seen = [GUIDE_SLUGS[0]];
    let next = nextGuideSlug(GUIDE_SLUGS[0]);
    while (next) {
      seen.push(next);
      next = nextGuideSlug(next);
    }
    expect(seen).toEqual([...GUIDE_SLUGS]);
  });
});

describe("Apple page images", () => {
  it("every config image and guide cover exists", () => {
    const srcs = [
      ...[iosApple, macosApple].flatMap((c) => [c.hero.src, ...c.tour.map((t) => t.image.src), ...c.chapters.map((ch) => ch.image.src)]),
      ...Object.values(GUIDE_COVERS).map((c) => c.src),
    ];
    for (const src of srcs) expect(existsSync(publicFile(src)), src).toBe(true);
  });
});
