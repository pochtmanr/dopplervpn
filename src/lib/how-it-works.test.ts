import { describe, it, expect } from "vitest";
import { headingId, createHeadingIdFactory, extractH2s } from "./how-it-works";

/**
 * The English anchors below are live, indexed URLs. `headingId` became
 * Unicode-aware so that translated articles get real ids instead of "", and
 * these cases pin the half of that change which must NOT be observable.
 */
describe("headingId", () => {
  it("leaves the shipped English anchors byte-identical", () => {
    const shipped: Array<[string, string]> = [
      ["Why isn't encryption enough?", "why-isnt-encryption-enough"],
      ["How did we get from Shadowsocks to Reality?", "how-did-we-get-from-shadowsocks-to-reality"],
      ["What is VLESS?", "what-is-vless"],
      ["How does Reality work?", "how-does-reality-work"],
      ["How does it compare with other protocols?", "how-does-it-compare-with-other-protocols"],
      ["Is VLESS-Reality undetectable?", "is-vless-reality-undetectable"],
      ["What does this mean for you?", "what-does-this-mean-for-you"],
      ["What does your device reveal before you connect?", "what-does-your-device-reveal-before-you-connect"],
      ["Who can see what?", "who-can-see-what"],
      ["Why do internet providers care what you do online?", "why-do-internet-providers-care-what-you-do-online"],
      ["Why is asking for your email a privacy risk?", "why-is-asking-for-your-email-a-privacy-risk"],
      ["How does Doppler connect without an account?", "how-does-doppler-connect-without-an-account"],
      ["What happens next?", "what-happens-next"],
      ["What does an edge node actually do?", "what-does-an-edge-node-actually-do"],
      ["Why does the distance to the server matter?", "why-does-the-distance-to-the-server-matter"],
      ['What does "zero-log" really mean?', "what-does-zero-log-really-mean"],
      ["What does a Doppler edge node keep?", "what-does-a-doppler-edge-node-keep"],
      ["How do edge nodes help with censorship?", "how-do-edge-nodes-help-with-censorship"],
      ["Where does your traffic go next?", "where-does-your-traffic-go-next"],
    ];
    for (const [heading, id] of shipped) expect(headingId(heading)).toBe(id);
  });

  it("keeps the letters of every script the articles ship in", () => {
    expect(headingId("Почему шифрования недостаточно?")).toBe("почему-шифрования-недостаточно");
    expect(headingId("چرا رمزگذاری کافی نیست؟")).toBe("چرا-رمزگذاری-کافی-نیست");
    expect(headingId("ما الذي يكشفه جهازك؟")).toBe("ما-الذي-يكشفه-جهازك");
    expect(headingId("边缘节点到底做什么？")).toBe("边缘节点到底做什么");
    // Turkish did not collapse before this change, it silently mangled:
    // ş, ğ and ı were dropped mid-word.
    expect(headingId("Şifreleme neden yeterli değil?")).toBe("şifreleme-neden-yeterli-değil");
  });

  it("never returns an empty id", () => {
    expect(headingId("???")).toBe("section");
    expect(headingId("")).toBe("section");
  });
});

describe("createHeadingIdFactory", () => {
  it("suffixes collisions in document order and leaves the first one bare", () => {
    const next = createHeadingIdFactory();
    expect(next("结论")).toBe("结论");
    expect(next("结论")).toBe("结论-2");
    expect(next("结论")).toBe("结论-3");
  });

  it("gives the table of contents and the renderer the same sequence", () => {
    const markdown = ["## 结论", "text", "## 结论", "more"].join("\n");
    const toc = extractH2s(markdown).map((h) => h.id);
    const renderer = (() => {
      const next = createHeadingIdFactory();
      return ["结论", "结论"].map(next);
    })();
    expect(toc).toEqual(renderer);
  });
});

describe("extractH2s", () => {
  it("ignores headings inside fenced blocks", () => {
    const markdown = ["## Real", "```chart", "## Not a heading", "```", "## Also real"].join("\n");
    expect(extractH2s(markdown).map((h) => h.text)).toEqual(["Real", "Also real"]);
  });
});
