import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { linkEntry, loadLinkRegistry, localizedUrl } from "./link-registry";

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(HERE, "../../..");

describe("link registry", () => {
  it("keeps pricing on the homepage anchor and matches the bot copy", () => {
    const registry = loadLinkRegistry();
    expect(linkEntry("pricing", registry).localePath).toBe("#pricing");
    expect(localizedUrl("en", "pricing", registry)).toBe("https://www.dopplervpn.org/en#pricing");
    expect(localizedUrl("de", "pricing", registry).includes("/pricing")).toBe(false);
    expect(localizedUrl("en", "refund_card", registry)).toBe(
      "https://www.dopplervpn.org/en/refund#revolut-card",
    );
    expect(localizedUrl("en", "apple_refund_instructions", registry)).toBe(
      "https://support.apple.com/en-gb/118223",
    );
    const raw = readFileSync(join(WEB_ROOT, "contracts/support/v1/link-registry.json"), "utf8");
    const bot = readFileSync(
      join(WEB_ROOT, "../doppler-support-bot/contracts/support/v1/link-registry.json"),
      "utf8",
    );
    expect(bot).toBe(raw);
    expect(existsSync(join(WEB_ROOT, "src/app/[locale]/pricing/page.tsx"))).toBe(false);
    for (const locale of ["en", "de", "ru"]) {
      for (const entry of registry.entries) {
        if (entry.externalUrl || !entry.localePath) continue;
        const url = localizedUrl(locale, entry.id, registry);
        expect(url, entry.id).not.toMatch(/\/pricing(?:$|\?)/);
        expect(url, entry.id).toContain(`${locale}${entry.localePath}`);
        if (entry.localePath.includes("#")) {
          expect(url, entry.id).toContain(entry.localePath.slice(entry.localePath.indexOf("#")));
        }
      }
    }
  });

  it("finds every registered anchor in the page that owns it", () => {
    const registry = loadLinkRegistry();
    for (const entry of registry.entries) {
      const source = readFileSync(join(WEB_ROOT, entry.verifyFile), "utf8");
      expect(source, entry.id).toContain(entry.verifyIncludes);
    }
  });
});
