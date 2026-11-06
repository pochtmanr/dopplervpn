import Image from "next/image";
import { MacFrame, PhoneFrame, WatchFrame } from "@/components/landing/apple-tour";
import { renderBg } from "@/config/platforms/apple";

/**
 * Images inside article markdown. Sizes are known from the Screenshot Studio
 * export names (doppler-apple/fastlane/screenshot-studio/scripts/web-shots.mjs),
 * so next/image can reserve the box and serve a smaller width:
 *   iphone-*-1000.avif  1000×2174   mac-*-1920.avif  1920×1200
 *   watch-*-422.avif     422×514    *-1800.avif      1800×1200 (photo mockups)
 */
type Kind = "phone" | "mac" | "watch" | "photo";

const KNOWN: Array<{ test: RegExp; kind: Kind; width: number; height: number }> = [
  { test: /\/iphone-[a-z]+-1000\.avif$/, kind: "phone", width: 1000, height: 2174 },
  { test: /\/mac-[a-z]+-1920\.avif$/, kind: "mac", width: 1920, height: 1200 },
  { test: /\/watch-[a-z]+-422\.avif$/, kind: "watch", width: 422, height: 514 },
  { test: /-1800\.avif$/, kind: "photo", width: 1800, height: 1200 },
];

function sizeOf(src: string) {
  return KNOWN.find((k) => k.test.test(src)) ?? null;
}

/**
 * `![alt](src "caption")`, for renders only. Rendered with spans: react-markdown
 * puts images inside a <p>, where the framed screens' divs would be invalid HTML,
 * so a capture as an inline image fails the build and belongs in a ```shots block.
 */
export function ArticleImage({
  src,
  alt,
  caption,
  plus = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  plus?: boolean;
}) {
  const found = sizeOf(src);
  const known = found ? { src, width: found.width, height: found.height, kind: found.kind } : null;
  const radius = plus ? "rounded-[22px]" : "rounded-2xl";
  const captionCls = plus ? "text-[14px] text-(--c-tert)" : "text-sm text-text-tertiary";
  return (
    <span className="not-prose my-10 block">
      {known && known.kind !== "photo" ? (
        (() => {
          throw new Error(`guides: put app screens in a \`\`\`shots block, not an inline image: ${src}`);
        })()
      ) : known ? (
        <Image
          src={src}
          alt={alt}
          width={known.width}
          height={known.height}
          sizes="(min-width: 1024px) 720px, 100vw"
          className={`h-auto w-full ${radius}`}
          style={{ backgroundColor: renderBg(src) }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- size unknown; markdown authors use the studio exports above
        <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-auto w-full ${radius}`} />
      )}
      {caption && <span className={`mt-3 block text-center ${captionCls}`}>{caption}</span>}
    </span>
  );
}

/** A row of app screens from a ```shots block: one `src | label | alt` per line. */
export function ArticleShots({ spec, plus = false }: { spec: string; plus?: boolean }) {
  const shots = spec
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([src]) => Boolean(src))
    .map(([src, label = "", alt = label]) => {
      const known = sizeOf(src);
      if (!known) throw new Error(`guides: shots block has an image of unknown size: ${src}`);
      // Plain values only: these props cross into the client frame components, and the
      // table entry's RegExp cannot be serialised.
      return { src, label, alt, kind: known.kind, width: known.width, height: known.height };
    });
  const kind = shots[0]?.kind ?? "phone";
  const cols =
    shots.length === 1
      ? "grid-cols-1"
      : kind === "mac"
      ? "grid-cols-1 sm:grid-cols-2"
      : shots.length >= 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2";
  const labelCls = plus ? "text-[14px] font-bold text-(--c-text)" : "text-sm font-semibold text-text-primary";

  return (
    <div className={`not-prose my-10 grid gap-5 rounded-[28px] ${plus ? "bg-(--c-card)" : "bg-bg-secondary/40"} p-6 sm:p-8 ${cols}`}>
      {shots.map((s) => (
        <figure key={s.src} className="text-center">
          {s.kind === "phone" ? (
            <PhoneFrame image={{ src: s.src, width: s.width, height: s.height }} alt={s.alt} sizes="(min-width: 640px) 220px, 45vw" className="mx-auto max-w-[220px]" />
          ) : s.kind === "watch" ? (
            <WatchFrame image={{ src: s.src, width: s.width, height: s.height }} alt={s.alt} sizes="180px" className="mx-auto max-w-[180px]" />
          ) : s.kind === "mac" ? (
            <MacFrame image={{ src: s.src, width: s.width, height: s.height }} alt={s.alt} sizes={shots.length === 1 ? "(min-width: 1024px) 640px, 90vw" : "(min-width: 640px) 360px, 100vw"} />
          ) : (
            <Image
              src={s.src}
              alt={s.alt}
              width={s.width}
              height={s.height}
              sizes="(min-width: 640px) 360px, 100vw"
              className={`h-auto w-full ${plus ? "rounded-[18px]" : "rounded-xl"}`}
            />
          )}
          {s.label && <figcaption className={`mt-3 ${labelCls}`}>{s.label}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
