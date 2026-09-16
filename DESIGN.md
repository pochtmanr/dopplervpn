# Doppler Landing — Design Standard ("Glyph Terminal")

**The reference:** three home-page sections define how dopplervpn.org looks and moves. Every new or
redesigned element — a section, a page, a card, a button, the OG image — is built to match them.

| Reference | Files |
|---|---|
| Hero | `src/components/sections/hero.tsx`, `src/components/hero/dot-globe.tsx`, `hero-ctas.tsx` |
| "Available on" platform cards | `src/components/sections/platforms-available.tsx`, `src/components/glyph/platform-glyph-band.tsx` |
| "How Doppler VPN Protects Your Traffic" cards | `src/components/sections/technical-how-it-works.tsx`, `traffic-step-card.tsx`, `src/components/glyph/traffic-scene.ts` |
| Shared engine | `src/components/glyph/glyph-field.tsx`, `glyph-render.ts` (the pure frame maths — **not** a client module, so a server frame can be rendered from it), `glyph-scene.ts`, `use-mount-on-view.ts`, `src/components/ui/reveal.tsx`, `src/app/globals.css` |

When this file and the code disagree, the reference sections win — then fix this file.
It supersedes the motion rule in `docs/plans/2026-02-23-ui-polish-design.md` ("opacity-only, 200ms").

---

## 1. Identity in one paragraph

A quiet, near-black (or cool light-grey) flat surface with silver/graphite neutrals. **Teal is the only
live accent** — it marks the action, the hover, the verdict. Visual interest comes from **ASCII /
box-drawing glyph fields in a monospace lattice, animated at 20fps** so they read as a terminal, not as
video. No photos, no blurred colour blobs behind sections, no gradient headlines. Motion is short,
eased, once, and always has a still fallback.

## 2. Tokens (`src/app/globals.css` `@theme` + `.light`)

| Token | Dark | Light | Use |
|---|---|---|---|
| `bg-primary` | `#141414` | `#F5F5F7` | page |
| `bg-secondary` | `#1C1C1C` | `#EDEEF1` | cards (at `/40`–`/80`), bands (`/30`) |
| `bg-elevated` / `bg-pressed` | `#242424` / `#2E2E2E` | `#E3E4E8` / `#D8D9DE` | popovers, pressed |
| `text-primary` / `muted` / `tertiary` | `#F5F5F5` / `#C5C5C5` / `#8A8A8A` | `#1A1A1A` / `#5A5C63` / `#8A8A8A` | headings / body / eyebrows, meta, glyph grain |
| `accent-teal` / `teal-light` | `#008C8C` / `#00ABAB` | `#007070` / `#008080` | **the** accent |
| `accent-gold` | `#D4D6DB` silver | `#3A3D42` graphite | stars, rare neutral emphasis — not an accent colour despite the name |
| `overlay` | `#FFFFFF` | `#000000` | every border & hairline: `overlay/5`, `/10`, `/20` |
| violet / amber / danger / telegram | | | Pro tier / real warnings / destructive / Telegram only |
| `accent-blue` / `blue-light` | `#2AABEE` / `#5BC0F2` | `#0369A1` / `#0369A1` | Telegram's blue (same as the `telegram` token). **Business inquiries and the support Telegram card only** — the `/support` Business card and its modal (`CARD_BLUE`, `ROW_TILE_BLUE`, `.cta-key-blue` in `card-recipes.ts` / `globals.css`). Not a second site accent |

Rules:
- **Never** raw `white`/`black`/hex in components, and **no `dark:` variants** — tokens + `overlay/*` flip
  light mode automatically (next-themes puts `.light` on `<html>`).
- Radius: `rounded-xl` (24px) small cards, `rounded-2xl` big cards & logo tiles, `rounded-lg` buttons in
  the hero, `rounded-xl` standalone CTAs, `rounded-full` chips.
- Width: every section container is `mx-auto max-w-site` (1600px). Gutters `px-4 sm:px-6 lg:px-8`.

## 3. Typography

| Role | Recipe |
|---|---|
| Home hero headline **only** | Instrument Serif via inline `style={{ fontFamily: "var(--font-serif)" }}`; lead phrase *italic*, punch upright; `text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05]`. Locales in `FALLBACK_FONT_LOCALES` (hero.tsx:9) swap to `var(--font-body)` weight 300, no italic. **The only other use is price figures** (pricing section and the account paywall), which are digits and so safe in every locale. |
| Every other heading | nothing to add — h1–h6 get `--font-display` (SF Pro Rounded → Nunito 700) from the base layer. Non-heading tags that act as titles add `font-display`. |
| Section title / subtitle | `SectionHeader` (`.section-title` `text-3xl md:text-4xl lg:text-5xl font-semibold`, `.section-subtitle` `text-text-muted text-lg md:text-xl max-w-2xl mx-auto`), wrapper `mb-12 md:mb-16 text-center` |
| Band title (compact section) | eyebrow `text-xs md:text-sm uppercase tracking-wider text-text-tertiary mb-1` + `font-display text-xl md:text-2xl font-semibold text-text-primary` |
| Card title | `text-lg font-semibold text-text-primary` (large card) / `font-display text-base md:text-xl font-semibold leading-tight` (row card) |
| Body / description | `text-sm text-text-muted` in cards; `text-text-muted text-sm sm:text-base md:text-lg xl:text-xl` for hero sub |
| Meta / fine print | `text-xs text-text-muted` or `text-text-tertiary` |
| Glyphs & technical labels | mono stack `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` (inline style, never a proportional fallback) |

Body font is Space Grotesk (`--font-body`).

## 4. Surfaces & components

### Section shells
- **Full section:** `<Section id>` + `<SectionHeader>` (`.section` = `py-12 md:py-20 px-4 sm:px-6 lg:px-8`).
- **Band** (thin interstitial strip, e.g. platforms):
  `py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-bg-secondary/30 border-y border-overlay/5`.
- **Hero:** on `lg+` no background of its own, no glow. Two-column `grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`, text `text-center lg:text-start`, globe right. **Below `lg` there is no globe**: the copy sits centred in a `min-h-svh` section over `<HeroMobileBackdrop />` (recipe C's `backdropScene` on a portrait 90×100 grid at **5fps** (`frameMs={200}`), static top/bottom `.glyph-edge-fade` mask — **no animated mask**, it re-rasterised the whole viewport every frame — at a flat `.hero-backdrop` 0.55, 0.32 in light) plus a `bg-primary` radial scrim behind the text.

  The headline is plain static text: `headlinePart1a` (italic unless the locale is in `FALLBACK_FONT_LOCALES`) + `headlinePart1b` on line 1, `headlinePart2` on line 2. Line 2 is still split into one span per word, which is the only word-splitting left anywhere — `bg-clip-text` paints its gradient across the element's whole background box, so a single span that wrapped onto two lines would stretch one ramp over both. The platform heroes split the same way for the same reason (last word only).

  **The hero backdrop is the exception to the `useMediaQuery` mount gate, and is server-rendered.** It is full-bleed over a `min-h-svh` section, which makes it the LCP element on a phone; gated on JS it could not paint until the bundle had downloaded, hydrated and run an effect, which put LCP at 2.8s (2.79s of it "element render delay"). So `hero-mobile-backdrop.tsx` (a Server Component) computes the t=0 frame with `frameZero` (`glyph-render.ts`) and passes it to `<GlyphField initialFrame>`, which renders it as the `<pre>` children — the lattice is in the HTML and paints at FCP. The wrapper is hidden at lg+ with plain `lg:hidden`; that is safe here because with `initialFrame` set the mount does no fbm work, and a `display:none` host never intersects, so the rAF loop never starts. It also no longer fades in: `.hero-backdrop-in` existed only to mask the post-hydration pop, and there is no longer a pop to mask.

  Grid constants for a server-rendered field must live in a plain module (`price-scene.ts`), never in the `"use client"` file beside the component — a Server Component importing a constant from a client module gets a proxy that coerces to `NaN`, and the frame comes out silently empty instead of throwing.

  `DesktopGlobe` still mounts only at lg+ and `PricingBackdrop` only at md+ (`useMediaQuery`, `src/lib/use-media-query.ts`): a CSS-hidden component still runs its setup during hydration, and neither of those ships a server frame.

### Card recipe A — Glyph-strip row card (platforms-available.tsx:52)
```
group relative flex h-[104px] md:h-[112px] flex-row overflow-hidden rounded-xl
border border-overlay/10 bg-bg-secondary/40 hover:bg-bg-secondary/70 hover:border-accent-teal/30 transition-colors
```
- Leading strip `relative w-[38%] md:w-1/3 shrink-0 overflow-hidden border-e border-overlay/5` holding a
  looping `GlyphField` (`hover`, phase-offset per sibling). The field bleeds to the card edges — padding
  belongs to the text zone only.
- **Glass logo tile** centred on the strip:
  `w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-bg-secondary/80 backdrop-blur-sm border border-accent-teal/20 text-accent-teal group-hover:bg-accent-teal/15 group-hover:border-accent-teal/40 transition-colors`
- Text zone `px-3 md:px-5 py-3 text-start`; trailing chevron
  `hidden md:block me-4 w-4 h-4 text-text-tertiary transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5`.

### Recipe B variant — Plain download card (downloads/page.tsx)
- **Since 2026-09-16 the downloads cards carry no artwork** — no screenshot, no device stage. The app is
  shown once, in the setup card below them. A card is: the platform name (`h2`), the keycap download with the
  **platform mark** as its icon (Apple / Android / Windows), Android's APK and 32-bit APK as `.cta-flat`
  buttons with the download glyph (they are files), quiet caveat lines (Windows' SmartScreen with an amber
  icon), then the release date and "Learn more" pinned to the foot. No hover orb. The visitor's own platform
  (`downloads/detected-platform.tsx`, resolved after mount) gets a teal border + ring — colour only.

### Downloads ↔ support: one set of class lists (ui/card-recipes.ts)
- Since 2026-09-16 the support page is built from the same recipes as downloads, imported from
  `src/components/ui/card-recipes.ts` (`CARD`, `CARD_HAIRLINE`, `CARD_TITLE`, `ROW_CARD`, `ROW_TILE`,
  `ROW_TITLE`, `ROW_TEXT`, `HERO_*`, `splitHeadline`). Change a recipe there, not in either page.
- Support (reworked 2026-09-16) = the downloads hero → **one action grid** (`support/action-buttons.tsx`,
  `lg:grid-cols-12`) holding every control on the page, in priority order: Submit a Request (8), with a settle-once terminal plate at
  the foot (`glyph/ticket-plate.tsx`, `plateScene` on a grid widened per breakpoint), + Telegram (4), with the
  bare Telegram mark (no tile) and a looping chat at the foot (`support/telegram-chat.tsx`: question bubble →
  typing dots → answer, using the translated "VPN won't connect" troubleshooting entry; paused off screen, still
  under reduced motion). The Telegram card is Telegram blue at rest (border, gradient, hairline, question bubble, `.cta-key-telegram`), with a bare-grain `GlyphField tone="telegram"` behind the bubbles; Business shares the same blue via the `accent-blue` tokens → Restore | Email | Business (4 each, plain recipe B, no plate) → Delete account as a
  quiet full-width recipe A row with a danger tile, linking to `/delete-account`. md is 2-up (ticket and delete
  span both), phones 1-up. Artwork only on the featured row: it is the hierarchy.
- **Act vs read:** FAQ | Troubleshooting sit below in a full-bleed band (`bg-bg-secondary/30 border-y`) with
  **no card chrome** — a heading over a hairline rule, then the accordion. Glass card = you can act on it;
  flat text on the band = you read it. Don't put either back in cards.
- **Action card control:** the title is the card's one `<button>`/`<a>`, stretched over the card with
  `after:absolute after:inset-0 after:z-10` (a `<button>` cannot contain the plate's block content); the card
  shows focus with `has-[:focus-visible]:ring-2`. The foot pill is the navbar's CTA key as a `<span>`, one per
  card; the Email card's pill is the revealed `ObfuscatedEmail` mailto itself, flat (`cta-flat`).
- **Submit-a-request dialog** (support/ticket-modal.tsx): `CARD_SURFACE` (recipe B without the hover — a dialog
  is not a hover target) over `bg-bg-secondary`, bottom sheet below `sm`. Two steps with a 2-segment teal bar:
  topic cards → details with live minimum-length hints matching the API. Success is a mono receipt plate
  (ticket / topic / reply-to, dashed CSS rules rather than counted box art, copy pill, `terminal-cursor`).
  Step and row entrances transition `opacity,translate` — in Tailwind v4 `translate-*` sets the `translate`
  property, so `transition-[opacity,transform]` would snap the movement.

### Device stage (glyph/device-scene.ts, device-stage.tsx) — not used on downloads any more
- Recipe B's card with the plate moved from the foot to the **head**: a
  `relative -mx-6 -mt-6 mb-5 border-b border-overlay/5` block (the negative margins must track the
  card's `p-6`) holding `<DeviceStage>`, then the platform's name as the card's `<h2>` under it.
- The stage **adopts the grid's aspect** (`DEVICE_ASPECT`, 40×13 ≈ 1.6:1) rather than taking a fixed
  height, so nothing is ever cover-cropped: a card runs from ~300px wide two-up on a phone to ~370px
  four-up at 1600px, and a device cut off at one of those widths is not a device.
- **Each device is drawn as itself, and the mark on its screen names the platform.** An iPhone from
  the front (rounded body, Dynamic Island, side buttons stamped in the column outside the frame with
  `▐`/`▌` so they read as nubs on the rail, home indicator) and an Android phone of the same build
  (punch-hole, `◁ ○ □`, buttons on the trailing side only); a compact Macintosh and a Windows desktop
  of a monitor on a neck and foot **with its tower beside it**. The screens carry the Apple mark, the
  droid, the Finder face and the four Windows panes — which is what finally keeps iOS and macOS
  apart, since they share one Apple glyph everywhere else.
- **Two silhouettes in the same family read as the same object.** The Mac was a rounded box with a
  screen in it, which is what the PC's monitor also is. What separates them is the compact Mac's
  stepped shoulder — the screen housing drawn a column narrower each side than the base, with
  `╭╯ … ╰╮` stepping the wall out between them — and the PC's tower. Keep both.
- One live element, shared: a four-cell signal meter filling and starting over every 420ms. It is
  always four characters wide however full it is, so the padded rows around it keep their width and
  the noise never bleeds back through the device's interior. On the Mac it rides in the chin beside
  the floppy slot, where a drive light belongs.
- **Box art is easy to get wrong by one cell, and `stamp` clips in silence on both axes** — a row
  padded to the wrong width overruns its frame, and a body one line too tall simply loses its closing
  edge, which is what had happened to both phones: 14-line bodies dropping their `╰─────────╯` off
  the bottom of a 13-row grid, so neither phone had a bottom. A scene is a pure function of
  `(frame, tMs)`, so run `npx tsx scripts/preview-devices.ts [tMs]` and read the frame — and for how
  the blocks actually join in a mono face, render the frame to a page and look at it. Counting
  characters proves the widths; it does not tell you a one-cell lobe either side of a one-cell cleft
  comes out a mushroom rather than an apple.

### Card recipe B — Glass gradient card with terminal plate (traffic-step-card.tsx:49)
```
group relative flex h-full flex-col rounded-2xl border border-overlay/10
bg-gradient-to-br from-accent-teal/[0.08] via-bg-secondary/60 to-accent-gold/[0.04]
p-6 overflow-hidden backdrop-blur-sm hover:border-accent-teal/30 transition-colors duration-300
```
- Top hairline: `absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-teal/50 to-transparent`.
  **Not** `inset-inline-start-0 inset-inline-end-0`: Tailwind v4 has no such utilities, so the line collapses to
  0px. That broken pair is still in ~12 older files (pricing, cta, traffic-step-card, comparison-accordion,
  auth-panel, setup-section, …).
- Hover orb (the **only** allowed blur glow — inside a card, hover-only):
  `absolute -top-12 -end-12 w-32 h-32 rounded-full bg-accent-teal/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`
- Content `relative`; then the plate pinned to the foot, edge to edge:
  `mt-auto -mx-6 -mb-6 pt-5` → host with `aspectRatio` = the scene's grid aspect
  (`cols*0.6 / rows*1.15`) so nothing clips, lazy-mounted `GlyphField loop={false} hover`.
- Plate art uses box-drawing (`┌─ label ─┐ │ └ ┘`), accent glyphs `✓ ▸ ●` in `teal-light`.
- Flow arrows between cards: `w-5 h-5 text-accent-teal/40`, right on desktop (`rtl:rotate-180`), down on mobile.

### Recipe C — Glyph spotlight section + serif price (pricing.tsx, glyph/pricing-glyphs.tsx)
- **Section ground:** `<PricingBackdrop />` as the first child of a `relative overflow-hidden` section, content in a
  `relative` wrapper. It draws a full-bleed grain field (`backdropScene`: dim grain, ~4.5% bright "spark"
  symbols fading in and out one at a time, sparse teal `+` plotting marks). `.glyph-spotlight` masks it: ~30%
  everywhere, full strength in a 24rem circle that trails the pointer via transitioned `@property --spot-x/--spot-y`
  (700ms, the hero easing), fading out at the top and bottom edges. Hidden below `md`.
  `backdropScene(cols, rows)` takes its grid size, so the mobile hero reuses it (see Hero above).
- **Glass over it:** recipe B's shell with a translucent fill
  (`from-accent-teal/[0.08] via-bg-primary/60 to-bg-primary/75 backdrop-blur-md`) so the grain reads through. No hover orb.
- **Card (restored 2026-09-14 to the wide layout):** full `max-w-site` width, glass shell over the backdrop,
  `lg:grid-cols-5` — left 3/5: "Doppler Pro" badge, title, duration selector, big serif price with Save/Best
  badges and the billing line, then **payment icons (Visa/Mastercard | BTC/ETH/USDT/USDC), the crypto
  "Learn more" line and the tax note under the price**. Right 2/5 (`bg-bg-secondary/30`): feature rows with
  teal icon tiles, the CTA, then the trial and guarantee notes under the CTA.
- **The price** copies the account paywall (`account/subscribe-content.tsx`): Instrument Serif upright,
  `text-6xl sm:text-7xl font-semibold tracking-tight leading-none`, then `/mo` in `text-lg sm:text-xl text-text-muted`
  and the struck-through monthly price. It fades in again on each plan switch and is `aria-live`.

### Recipe C variant — Notched download card (cta.tsx)
- Recipe C's section ground (`<PricingBackdrop />`, `bg-bg-secondary/30`) and glass shell, holding **one** card:
  `lg:grid-cols-[6fr_5fr]`. The copy column has the heading, subtitle, ratings and four store buttons. The image column bleeds to the card edges,
  and an invisible `aspect-[1009/794]` spacer sizes it, so the image crops only sideways.
- **Notch:** `.notch-card` (globals.css) clips the bottom-end corner at 45° (`--notch` 3.5rem, 5.5rem at lg; mirrored under `[dir=rtl]`).
  clip-path eats the border, so `<span class="notch-edge">` redraws a teal hairline along the cut.
- Heading: "Download Doppler VPN", no icon. The product name is `text-text-muted whitespace-nowrap`. Size is `lg:text-[clamp(2.25rem,3.3vw,3rem)]`, so it holds one line from ~1280px up.

### Recipe D — Terminal accordion (comparison-table.tsx, comparison-accordion.tsx, glyph/comparison-scene.ts)
- **Shell:** recipe B's glass, with no orb, around a receipt header (mono uppercase, dashed bottom rule, md+ only).
- **Rows:** `<h3><button aria-expanded aria-controls>`, styled by `.cmp-*` classes in `@layer components`
  (six rows on ~4,900 pages, so no long inline lists). The desktop grid is `1.15fr 1fr 1fr 2rem`. Below md, each row stacks
  with mono column tags. Every value carries an sr-only column name. Arrow keys, Home and End move focus between rows.
- **Open state:** one row at a time, the first open on load. The open row gets a teal `::before` bar on the start edge, a
  `bg-bg-secondary/60` fill, and a teal `−` tile. The panel animates `grid-template-rows 0fr→1fr` over 300ms with the hero easing.
  Panels stay in the DOM, and closed ones are `inert`.
- **The print:** the panel reuses the row's grid. The feature column holds a diff plate (`- traditional`,
  teal `+ doppler ✓`, one live line). It mounts on open and unmounts on close, so every open prints it again from the left.
  The trad+doppler columns hold three receipt notes (`01 · what it means / 02 · what we keep / 03 · why`) that stagger in
  150/210/270ms behind the plate.

### Recipe A variant: query-plate rows, "data that isn't there" (privacy-model.tsx, glyph/privacy-void-band.tsx, glyph/void-scene.ts)
- Recipe A's row card, with the leading strip (`sm:w-[46%]`, `border-e`) holding a query plate instead of a logo tile.
  No icons. The card uses `min-h-[120px]` rather than a fixed height, because the text is a sentence. Below `sm` the plate stacks on top
  at the grid's aspect-ratio.
- The plate (settle-once, lazy-mounted) types a command, scans its record slots with `░▒` for 900ms, then answers `∅ …`
  with a blinking `▌`. It runs an 8s cycle, staggered per card. The slot interiors are **cleared to `""`**, so only grain
  shows through: a record frame with nothing in it. Before the loop starts the plate shows its answered state, which is also what
  reduced motion paints.
- Grid 50×10 with 6 columns and 2 rows of margin, so cover-cropping in a stretched strip never cuts the plate.
- Words in a plate must stay true to the privacy policy (e.g. `grep site= auth.log → 0 matches`: the auth log holds IPs,
  never activity).

### Legacy card (do not use for new work)
`rounded-2xl border border-overlay/10 bg-bg-secondary/50 p-6` with a `w-10 h-10 rounded-xl bg-accent-teal/10` icon
tile and no glyphs. Existing sections using it are migration targets (§9).

### Buttons, chips, small parts
- **Primary CTA:** `px-5 py-3 bg-accent-teal text-white hover:bg-accent-teal/90 rounded-lg text-sm font-medium` (+ `pulse-glow-once` once per page, on the hero). Standalone section CTA: `px-6 py-3 rounded-xl text-sm font-semibold bg-accent-teal text-white` with a trailing arrow `group-hover:translate-x-0.5 rtl:rotate-180`.
- **Secondary:** `border border-overlay/20 text-text-muted hover:text-text-primary hover:border-overlay/40 rounded-lg`.
- **Chip / pill:** `inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-accent-teal/10 text-accent-teal border border-accent-teal/20 hover:bg-accent-teal/20 hover:border-accent-teal/40`.
- **Check list items:** `text-xs text-text-muted` with `w-4 h-4 text-accent-teal` stroke-2 check icons.
- **Stars / ratings:** `text-accent-gold w-3.5 h-3.5` + `text-sm font-semibold text-text-primary`.
- Icons are inline heroicons-style SVG (`stroke="currentColor"`, strokeWidth 1.75–2.5), `aria-hidden`.
- **The keycap pair** (globals.css:260-355): `.cta-key` is the solid-teal primary as a physical key
  (cap gradient, inset bevel, hard `0 4px 0` skirt, contact shadow; `:active` bottoms it out).
  `.cta-flat` is its counterpart — filled but flat and unpressable. **At most one key per surface**,
  with its neighbours flat: that contrast is what makes the key read as raised. Chips and quick-jump
  pills take `.cta-flat` for the same reason.
- The `ui/button.tsx` `.btn-primary` (silver fill, shadow) predates this standard — prefer the teal recipes above.

## 5. Motion

No animation library (no framer-motion). CSS keyframes/transitions, IntersectionObserver, and
throttled `requestAnimationFrame` only.

| Pattern | Spec | Where |
|---|---|---|
| **Heroes do not animate in. At all.** | Removed 2026-09-16, and not to be reinstated. The home hero, the four platform heroes, support and downloads all used to run `hero-word` (per-word blur-up, 22px rise) over `hero-animate` (8px rise on a 100/300/420/540/660ms stagger). Two overlapping staggers meant the whole column visibly shifted while it settled — it read as the page still loading, not as an entrance. Heroes are fully server-rendered, so with nothing to animate they are simply there in the first paint, which is also the fastest they can be | globals.css:208-247 |
| Hero primary CTA — the one exception | Its label and icon depend on UA platform detection, so it is held at Tailwind `opacity-0` until that resolves, then `.hero-cta-in` (opacity fade + one `pulse-glow`) so the label never visibly swaps. **Opacity only, no transform** — it must not move either. Button-sized and mid-page, so never the LCP element | globals.css:230-247 |
| **Never `opacity: 0`, never a rise, on anything in a hero** | Chrome will not treat an element at `opacity: 0` as an LCP candidate, so fading a hero in from zero disqualifies the one part of the page that is server-rendered and free to paint, and hands LCP to something slower. A rise moves the layout around after paint. If something in a hero really must animate, animate colour, or opacity from a non-zero value — never position, and never on the `<h1>` or the mobile glyph backdrop | globals.css:208-227 |
| Scroll reveal | `<Reveal delay>`: opacity + translateY 6px, 200ms ease-out, fires once at `rootMargin -100px`; siblings stagger `delay={i * 50}`, trailing CTA ~200ms | reveal.tsx, use-in-view.ts |
| CTA attention | `pulse-glow-once`: teal box-shadow 0→20px/4px→0, 1.5s, once | globals.css:292-299 |
| Hover | `transition-colors` (cards/tiles, default or 300ms), arrow nudge `translate-x-0.5`, orb fade 500ms; glyph layers warm to teal over 300ms `ease-out` | cards, glyph-field.tsx:287 |
| Glyph field | 20fps (`FRAME_MS 50`); looping scenes: resolve 1200 / hold 5600 / dissolve 600ms (7400 cycle), cells resolve radially (`SPREAD 0.45`); siblings get `phaseOffsets(n)` (keep `CYCLE_MS/n > 1800`); settle-once scenes (`loop={false}`) sweep in over 1200ms then keep small live motion (scramble ~110ms, cursor/node ~450–520ms ticks) | glyph-scene.ts, traffic-scene.ts |
| Lazy mount | expensive fields mount at IntersectionObserver `rootMargin 120px`, one-way, then host fades `transition-opacity duration-700` | traffic-step-card.tsx:30-72 |
| Canvas artwork (globe) | 20fps, glyphs `R·0.055·GLYPH_SCALE` (0.6) with the lat/lon pitch scaled by the same factor, ASCII ramp `" .:-=+*#▒▓█"`, slow idle rotation (0.06 rad/s), no pointer tilt (removed 2026-09-14), teal hover halo 60px, start via `requestIdleCallback`, colours read from CSS vars + MutationObserver for theme | dot-globe.tsx |

Contract for anything animated:
1. **Reduced motion:** CSS is covered by the global rule (globals.css:334); **every rAF/canvas loop must
   check `matchMedia("(prefers-reduced-motion: reduce)")` itself** and paint one resolved still frame.
2. **Never burn CPU unseen:** loops run only while on screen (IntersectionObserver) **and** `!document.hidden`.
3. Transition `color`/`opacity`/`transform` specifically — never `transition-all` on glyph hosts.
4. Glyph hosts are `aria-hidden`, `dir="ltr"` (bidi would break box art), `select-none`, and the parent
   supplies a resolved height (`[container-type:size]`).
5. Hover only **adds** teal; the verdict/accent layer never changes.
6. **Measure CPU** for any new loop: Playwright + CDP `Performance.getMetrics` `TaskDuration` delta over 10s with the
   section in view, compared with the footer, on the dev server at 1440px dark. Readings from 2026-09-14, in % of one core:
   hero globe 14.3 (after the glyph shrink; it was 9.9), pricing 16.5 (backdrop only after the simplification), comparison (one open plate) 9.0,
   privacy rows (four query plates) 12.8.

## 6. Glyph-field language (how to make a new scene)

- Engine: `GlyphField` renders 5 stacked `<pre>` layers written via `textContent` (grain / hot grain /
  accent grain / content / accent marks). React never re-renders after mount. Font size is derived from
  the grid via container queries, so choose a grid whose aspect matches the box.
- New scene = a new file modelled on `glyph-scene.ts` (`platformScene`) or `traffic-scene.ts`:
  export `cols`, `rows`, an aspect constant, `paint(frame, tMs)` using `stamp()`, and `order(r, c)` for
  the reveal direction (radial for ambient, left→right for "printing" plates).
- Content vocabulary: noise ramp `" .:-=+*#%@"`, box-drawing plates with a lowercase label in the top
  border, short lowercase terminal words (`device`, `tunnel`, `edge node`), accent marks `✓ ▸ ●`.
- A Scene has methods, so it can't cross the Server→Client boundary: pass an `index` from the server
  component into a small client wrapper (see `platform-glyph-band.tsx`).
- Layer colours: grain `text-text-tertiary opacity-40`; accent grain `text-accent-teal opacity-60`;
  content `text-text-muted`; marks `text-accent-teal-light`.

## 7. Do / Don't

**Do**
- Give a section its visual interest with a glyph scene, a glass logo tile, or a terminal plate.
- Use teal as the single signal for action and hover.
- Use logical properties (`ps/pe`, `ms/me`, `start/end`, `border-e`) and `rtl:` flips on directional icons.
- Keep class lists static and short-ish — pages are serialised twice across ~4,900 prerendered pages
  (globals.css:356-371). Repeated long lists belong in a component or `@layer components` class.
- Check: dark, light, one RTL locale (ar/he), one fallback-font locale (ru/zh), reduced motion, 360px width.

**Don't**
- Blurred colour orbs/glows behind sections (`bg-accent-gold/10 blur-3xl`, radial teal washes) — removed
  site-wide; blur glows live only inside cards, on hover.
- Gradient text, gold/amber as decoration, new hex colours, `dark:` variants.
- Instrument Serif outside the home hero and price figures.
- framer-motion or any animation library; 60fps character animation; looping motion that never pauses.
- Stock photos or generic illustration.

## 8. Static media — OG image & social cards

Translate the live look into a still:
- 1200×630, flat `#141414` ground; optional 1px teal hairline across the top (card recipe B's hairline).
- Top-left: wave logo + "Doppler VPN" in the rounded display face, `#F5F5F5`.
- Headline in the hero treatment: Instrument Serif, lead phrase italic / punch upright, `#F5F5F5`, large.
- Supporting line in `#C5C5C5`; at most three teal-check facts.
- Artwork: a **frozen frame** of the glyph language — an ASCII globe or a box-drawn terminal plate —
  set in monospace, grain in `#8A8A8A` at ~40% opacity, a few cells and marks (`✓ ▸ ●`) in `#00ABAB`.
- Footer: monospace `dopplervpn.org` in `#8A8A8A`.
- Never: radial glows, grid backgrounds, gradients as the main visual.

Current state: `public/images/og-banner.jpg` is a static file referenced from `src/app/[locale]/layout.tsx`
and ~20 page metadata blocks; it predates this standard (radial teal glow, grid). When redesigning, choose
between a `next/og` `opengraph-image.tsx` (glyph frame as text spans in a mono font) and regenerating the
static JPG at the same path so existing references keep working.

## 9. Migration backlog (not yet in this style)

- ~~`pricing.tsx`~~ — done 2026-09-14 (recipe C).
- ~~`comparison-table.tsx`~~ — done 2026-09-14 (recipe D, terminal accordion).
- ~~`privacy-model.tsx`~~ — done 2026-09-14 (recipe A variant, query-plate rows).
- ~~`cta.tsx`~~ — done 2026-09-14 (recipe C variant, notched card).
- Home: `features.tsx`, `use-cases.tsx`,
  `how-it-works.tsx`, `servers.tsx`, `speed-comparison.tsx`, `price-comparison.tsx`
  (legacy cards); `censorship-resistance.tsx` (recipe B without a plate); `faq.tsx`,
  `blog/home-blog-section.tsx`.
- Layout: `layout/footer.tsx`, `navbar.tsx`, `mobile-sticky-cta.tsx`.
- `components/landing/seo-landing-page.tsx` (~20 SEO pages): orbs, shadowed buttons, no Reveal/glyphs.
- ~~`downloads`~~ — done 2026-09-16, reworked the same day for conversion: plain hero (no glyph backdrop),
  four plain download cards (see recipe B variant above), then the setup steps
  in **recipe C's notched card** (`downloads/setup-section.tsx`): platform tabs opening on the visitor's
  own, the steps playing through (a teal bar under the active step is the clock — its `animationend`
  advances; paused off screen / hidden tab; any step click stops it for good; never under reduced motion),
  the platform's keycap download + ratings, and on the right the home CTA card's own picture
  (`dopplerdownload.avif`, the same for every tab). The two recipe-A link rows (censorship, support) sit above it, so the card closes the page.
  No new translation keys — headings are the platform pages' `howItWorks.title`/`subtitle`.
- `vpn-for-{ios,android,macos,windows}`: CSS dot-field backdrop instead of glyph artwork.
- ~~`tools`~~ — done 2026-09-16. Hub: plain hero (no `PricingBackdrop`), `GlyphPlateCard` with its optional
  `icon` (a `ROW_TILE` above the title; icons in `components/tools/tool-icons.tsx`). What-is-my-IP: plain hero with
  a text breadcrumb, recipe B widget (address + keycap Refresh left, mono `whois` receipt right — ISP/ASN from
  ipinfo Lite via `IPINFO_TOKEN`, IPv4/IPv6 from ipify under a route-scoped CSP in next.config.ts), recipe B
  explainer cards, recipe B checklist, native `<details>` FAQ in one glass card, recipe A related rows, CTA.
  WebRTC and DNS leak pages still old.
- ~~Support~~ (done 2026-09-16, see "Downloads ↔ support"); about, security, legal, giveaway, blog, account, checkout, cn-check.
- OG image (§8).
