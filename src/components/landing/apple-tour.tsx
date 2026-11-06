"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import type { AppleDevice, AppleImage } from "@/config/platforms/apple";

export interface TourShot extends AppleImage {
  key: string;
  label: string;
  alt: string;
}

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

/**
 * Screen-hole geometry, measured by Screenshot Studio from Roman's mockups
 * (doppler-apple/fastlane/screenshot-studio/web.mjs IPHONE and MACBOOK, render.mjs
 * WATCH_MOCK), in each mockup's own pixel space. The capture runs 1 unit under the
 * frame on every side so no seam shows at the hole's edge.
 */
const IPHONE = {
  W: 410,
  H: 850,
  outer: { x: 1.4, y: 0.8, w: 407.4, h: 848.4, r: 62 }, // silver band
  body: { x: 5.8, y: 5.5, w: 396.8, h: 838.7, r: 57 }, // black bezel
  hole: { x: 15.9, y: 15.7, w: 376, h: 817.8, r: 50 }, // matches the 1206×2622 capture
  // Dynamic Island where iOS draws it (375×111 px at y 33 on the 1206 px capture), mapped into the hole.
  island: {
    x: 15.9 + ((1206 - 375) / 2) * (376 / 1206),
    y: 15.7 + 33 * (376 / 1206),
    w: 375 * (376 / 1206),
    h: 111 * (376 / 1206),
  },
  // Antenna breaks through the band: [x, y, w, h].
  ticks: [
    [81, 0, 4.5, 6],
    [325.5, 844, 4.5, 6],
    [0, 82, 6, 4.5],
    [0, 762, 6, 4.5],
    [404, 83, 6, 4.5],
    [404, 764, 6, 4.5],
  ],
} as const;

const MACBOOK = { src: "/images/apple/frame-macbook-pro-16.png", W: 1500, H: 1110, hole: { x: 172, y: 154, w: 1156, h: 747 } } as const;
/** Top-corner radius of the MacBook Pro display, in the frame's pixel space. */
const MAC_SCREEN_R = 16;
const WATCH = { src: "/images/apple/frame-watch-ultra.png", W: 600, H: 940, hole: { x: 95, y: 219, w: 410, h: 502 } } as const;

type Rect = { x: number; y: number; w: number; h: number; r?: number };

/** Absolute box for the capture: the hole grown by 1 unit, in % of the frame. */
function holeStyle(hole: Rect, W: number, H: number, radius?: string) {
  return {
    left: pct(hole.x - 1, W),
    top: pct(hole.y - 1, H),
    width: pct(hole.w + 2, W),
    height: pct(hole.h + 2, H),
    borderRadius: radius,
  };
}

function rr(r: Rect) {
  return { x: r.x, y: r.y, width: r.w, height: r.h, rx: r.r };
}

/** An iPhone 17 Pro drawn as vector around a raw capture: silver band, black bezel, Dynamic Island. */
export function PhoneFrame({
  image,
  alt,
  sizes,
  className = "",
  priority = false,
  shadow = true,
}: {
  image: AppleImage;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Off in the tour rail, where neighbouring shadows muddy the gaps. */
  shadow?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { W, H, outer: o, body: b, hole: h, island: i, ticks } = IPHONE;
  const r = h.r + 1;
  return (
    <div
      className={`relative ${shadow ? "drop-shadow-[0_22px_28px_rgba(0,0,0,0.35)]" : ""} ${className}`}
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <div className="absolute overflow-hidden bg-black" style={holeStyle(h, W, H, `${pct(r, h.w + 2)} / ${pct(r, h.h + 2)}`)}>
        <Image src={image.src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`band${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#D4D5D7" />
            <stop offset=".5" stopColor="#C2C3C6" />
            <stop offset="1" stopColor="#D8D9DB" />
          </linearGradient>
          <mask id={`cut${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill="#fff" />
            <rect {...rr(h)} fill="#000" />
          </mask>
          <clipPath id={`shape${uid}`}>
            <rect {...rr(o)} />
          </clipPath>
        </defs>
        <g mask={`url(#cut${uid})`}>
          <rect {...rr(o)} fill={`url(#band${uid})`} />
          <rect
            {...rr({ x: o.x + 0.8, y: o.y + 0.8, w: o.w - 1.6, h: o.h - 1.6, r: o.r - 0.8 })}
            fill="none"
            stroke="#8E9094"
            strokeWidth="1.4"
          />
          <g clipPath={`url(#shape${uid})`}>
            {ticks.map(([x, y, w, hh]) => (
              <rect key={`${x}-${y}`} x={x} y={y} width={w} height={hh} fill="#3A3B3E" />
            ))}
          </g>
          <rect {...rr(b)} fill="#050505" />
        </g>
        <rect x={i.x} y={i.y} width={i.w} height={i.h} rx={i.h / 2} fill="#000" />
      </svg>
    </div>
  );
}

/** The MacBook Pro 16" mockup around a raw Mac capture (the capture holds its own wallpaper). */
export function MacFrame({
  image,
  alt,
  sizes,
  priority = false,
}: {
  image: AppleImage;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const { W, H, hole, src } = MACBOOK;
  return (
    <div className="relative mx-auto w-full drop-shadow-[0_24px_30px_rgba(0,0,0,0.3)]" style={{ aspectRatio: `${W} / ${H}` }}>
      <div className="absolute bg-black" style={holeStyle(hole, W, H)}>
        {/* A MacBook Pro display has rounded top corners; the frame's hole is square, so the
            capture is rounded inside a black box and the bezel shows in the corners. */}
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: `${pct(MAC_SCREEN_R, hole.w + 2)} ${pct(MAC_SCREEN_R, hole.w + 2)} 0 0 / ${pct(MAC_SCREEN_R, hole.h + 2)} ${pct(MAC_SCREEN_R, hole.h + 2)} 0 0` }}>
          <Image src={image.src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
        </div>
      </div>
      <Image src={src} alt="" fill sizes={sizes} className="pointer-events-none select-none" />
    </div>
  );
}

/** The Apple Watch Ultra (Alpine Loop) mockup around a raw watch capture. */
export function WatchFrame({
  image,
  alt,
  sizes,
  className = "",
}: {
  image: AppleImage;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const { W, H, hole, src } = WATCH;
  const r = hole.w * 0.22;
  return (
    <div className={`relative drop-shadow-[0_18px_24px_rgba(0,0,0,0.3)] ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <div className="absolute overflow-hidden bg-black" style={holeStyle(hole, W, H, `${pct(r, hole.w + 2)} / ${pct(r, hole.h + 2)}`)}>
        <Image src={image.src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
      <Image src={src} alt="" fill sizes={sizes} className="pointer-events-none select-none" />
    </div>
  );
}


const ARROW = "M8.25 4.5 15.75 12l-7.5 7.5";

/**
 * The "see it" section. iPhone: a snap-scrolling rail of
 * framed screens with a two-word label under each. Mac: a segmented control that
 * swaps the screen inside the MacBook frame. Labels and alt text come in translated from the server page.
 */
export function AppleTour({
  device,
  shots,
  prevLabel,
  nextLabel,
}: {
  device: AppleDevice;
  shots: TourShot[];
  prevLabel: string;
  nextLabel: string;
}) {
  return device === "phone" ? (
    <PhoneRail shots={shots} prevLabel={prevLabel} nextLabel={nextLabel} />
  ) : (
    <MacSwitcher shots={shots} />
  );
}

function PhoneRail({ shots, prevLabel, nextLabel }: { shots: TourShot[]; prevLabel: string; nextLabel: string }) {
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = (card?.getBoundingClientRect().width ?? 240) + 40;
    // RTL rails scroll toward negative scrollLeft.
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: step * dir * (rtl ? -1 : 1), behavior: "smooth" });
  };
  const btn =
    "plus-btn inline-flex h-11 w-11 items-center justify-center rounded-full bg-(--c-card) text-(--c-text) shadow-sm hover:text-(--c-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent)";

  return (
    <div>
      <ul
        ref={rail}
        className="-mx-4 flex snap-x snap-mandatory gap-10 overflow-x-auto scroll-smooth px-4 pt-2 pb-8 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((s) => (
          <li key={s.key} className="w-[min(62vw,230px)] shrink-0 snap-start sm:w-[230px] lg:w-[250px]">
            <figure>
              <PhoneFrame image={s} alt={s.alt} sizes="(min-width: 1024px) 250px, 62vw" shadow={false} />
              <figcaption className="mt-4 text-center text-[15px] font-bold text-(--c-text)">{s.label}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="mt-2 hidden justify-end gap-2 sm:flex">
        <button type="button" onClick={() => scroll(-1)} className={btn} aria-label={prevLabel}>
          <svg className="h-5 w-5 rotate-180 rtl:rotate-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={ARROW} />
          </svg>
        </button>
        <button type="button" onClick={() => scroll(1)} className={btn} aria-label={nextLabel}>
          <svg className="h-5 w-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={ARROW} />
          </svg>
        </button>
      </div>
    </div>
  );
}

function MacSwitcher({ shots }: { shots: TourShot[] }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const current = shots[active];

  return (
    <div>
      <div
        role="tablist"
        aria-label={shots.map((s) => s.label).join(", ")}
        className="mx-auto mb-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-(--c-inset) p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            id={`${uid}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${uid}-panel`}
            onClick={() => setActive(i)}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-accent) ${
              i === active ? "bg-(--c-card) text-(--c-text) shadow-sm" : "text-(--c-muted) hover:text-(--c-text)"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        className="rounded-[32px] bg-(--c-card) px-[8%] pt-[6%] pb-[5%]"
      >
        <div className="mx-auto max-w-5xl">
          <MacFrame key={current.key} image={current} alt={current.alt} sizes="(min-width: 1100px) 960px, 84vw" />
        </div>
      </div>
    </div>
  );
}
