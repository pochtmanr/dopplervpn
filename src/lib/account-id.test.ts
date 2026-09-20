import { describe, expect, it } from "vitest";
import { generateAccountId } from "./account-id";

const FORMAT = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

describe("generateAccountId", () => {
  it("matches the format every client and route validates against", () => {
    // The same regex guards /api/doppler/send-code and the account dashboard.
    for (let i = 0; i < 200; i++) {
      expect(generateAccountId()).toMatch(FORMAT);
    }
  });

  it("never emits the ambiguous characters I, O, 0 or 1", () => {
    // Account IDs get read aloud to support and copied off screens.
    const body = Array.from({ length: 500 }, generateAccountId).join("").replace(/VPN|-/g, "");
    expect(body).not.toMatch(/[IO01]/);
  });

  it("does not repeat across a large sample", () => {
    // A weak generator (the old Math.random one) would not fail this, but a
    // catastrophically broken one — a fixed seed, a constant — would.
    const ids = new Set(Array.from({ length: 5000 }, generateAccountId));
    expect(ids.size).toBe(5000);
  });

  it("uses the whole alphabet rather than a biased subset", () => {
    const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const seen = new Set(
      Array.from({ length: 2000 }, generateAccountId).join("").replace(/VPN|-/g, "").split(""),
    );
    expect(seen.size).toBe(ALPHABET.length);
    for (const ch of seen) expect(ALPHABET).toContain(ch);
  });
});
