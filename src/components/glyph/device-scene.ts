/**
 * The art on each /downloads platform card: the device the platform runs on,
 * drawn as that device, with the platform's own mark on its screen.
 *
 * Each one is the object someone pictures on hearing the platform's name. An
 * iPhone from the front: rounded body, Dynamic Island, the side buttons where
 * they really sit, home indicator. An Android phone of the same build with a
 * punch-hole camera and the `◁ ○ □` bar. A compact Macintosh — the all-in-one,
 * inset screen over the floppy slot and the badge. A Windows desktop: a
 * widescreen monitor on a neck and foot with its tower standing beside it.
 *
 * The mark on the screen is what keeps iOS and macOS apart, since they shared
 * one Apple glyph before and their two cards read as the same card twice.
 *
 * Words inside a screen are artwork and stay English lowercase, as everywhere
 * else in this language, and they stay true: Windows really is a full device
 * tunnel (`releaseNoteFullTunnel`), and "edge node" is the traffic scene's own
 * word for the same hop.
 *
 * EVERY PART MUST FIT. `stamp` clips silently on both axes, so a body one line
 * too tall loses its closing edge and the card just looks a little broken —
 * which is exactly what had happened to both phones, whose 14-line bodies were
 * dropping their `╰─────────╯` off the bottom of a 13-row grid. A scene is a
 * pure function of (frame, tMs): run `npx tsx scripts/preview-devices.ts [tMs]`
 * and read the frame instead of guessing.
 */
import { stamp, type Frame, type Scene } from "./glyph-scene";

/**
 * 40×13 ≈ 1.6:1. The host ADOPTS this aspect (see DEVICE_ASPECT) rather than
 * budgeting for a crop: a card runs from ~300px wide two-up on a phone to
 * ~370px four-up at 1600px, and a device cut off at one of those widths is not
 * a device. Adopting the aspect means nothing is ever clipped at any width.
 */
export const DEVICE_COLS = 40;
export const DEVICE_ROWS = 13;

/** The grid's shape. A host that does not adopt it will clip the lattice. */
export const DEVICE_ASPECT = (DEVICE_COLS * 0.6) / (DEVICE_ROWS * 1.15);

export type DeviceKind = "iphone" | "android" | "mac" | "pc";

/**
 * The one moving part, shared by all four devices: a signal meter filling and
 * starting over. Four characters wide however full it is, so the padded rows
 * around it keep their width and the noise never bleeds back through them.
 */
const BAR_STEPS = ["▁   ", "▁▃  ", "▁▃▅ ", "▁▃▅▇"] as const;
const BAR_STEP_MS = 420;

/** A block of pre-padded whole lines, placed at (top, left) on the grid. */
interface Part {
  top: number;
  left: number;
  lines: string[];
}

/* ── Phones ───────────────────────────────────────────────────────────
 * One 11-wide body filling all 13 rows, its side buttons stamped in the column
 * just outside it. `▐` and `▌` fill the half of their cell that faces the body,
 * so a button reads as a nub machined into the rail rather than as a character
 * parked next to the phone.
 */

const PHONE_W = 11;
const PHONE_LEFT = Math.floor((DEVICE_COLS - PHONE_W) / 2); // 14

/**
 * The Apple mark: two shoulders with the cleft open between them, the leaf
 * leaning up out of that cleft, the bite notched into the trailing side.
 *
 * The shoulders are TWO cells each. One-cell shoulders either side of a
 * one-cell cleft do not read as an apple at this size — the lobes vanish and
 * the whole mark comes out a mushroom.
 */
const APPLE = [
  "      ▄▖ ",
  "    ▄█▀  ",
  " ▄██ ██▄ ",
  "▐███████▌",
  "▐██████▛ ",
  " ███████ ",
  "  ██ ██  ",
];

/**
 * The droid: antennae off the shoulders of a domed head with teal eyes, then
 * the body with its arms held clear of it, then the legs.
 */
const DROID = [
  "  ╲   ╱  ",
  "  ▄███▄  ",
  " █●███●█ ",
  " ▀▀▀▀▀▀▀ ",
  "▐ █████ ▌",
  "▐ █████ ▌",
  "  ██ ██  ",
];

/**
 * Exactly 13 lines — top edge, status row, gap, the 7-row mark, meter, foot
 * bar, bottom edge. A mark of any other height silently costs the body an edge.
 */
function phoneBody(status: string, mark: string[], foot: string, bars: string): Part {
  return {
    top: 0,
    left: PHONE_LEFT,
    lines: [
      "╭─────────╮",
      `│${status}│`,
      "│         │",
      ...mark.map((line) => `│${line}│`),
      `│  ${bars}   │`,
      `│${foot}│`,
      "╰─────────╯",
    ],
  };
}

function sideButton(side: "left" | "right", top: number, rows: number): Part {
  return {
    top,
    left: side === "left" ? PHONE_LEFT - 1 : PHONE_LEFT + PHONE_W,
    lines: Array.from({ length: rows }, () => (side === "left" ? "▐" : "▌")),
  };
}

/* ── Compact Macintosh ─────────────────────────────────────────────────
 * The all-in-one, 19 wide over the full 13 rows — taller than it is wide, which
 * is most of what tells it apart from the PC's monitor: case, inset screen, and
 * a deep chin under it carrying the floppy slot and the badge.
 */

const MAC_W = 19;
const MAC_LEFT = Math.floor((DEVICE_COLS - MAC_W) / 2); // 10

/**
 * The Finder mark: a rounded square split down the middle by the nose, the
 * leading half shaded, an eye either side, the smile crossing the join.
 *
 * It carries no top or bottom of its own — the screen's recess is its outline,
 * and these rows supply that recess's side walls. Giving the face its own
 * border nested three rounded rectangles and the case row read as five bars.
 */
const FINDER = [
  "│▒▒▒▒▒│     │",
  "│▒▒●▒▒│  ●  │",
  "│▒▒▒▒▒│     │",
  "│▒╲▁▁▁▁▁▁▁╱ │",
];

/**
 * Thirteen lines, and the shoulder at row 8 is the whole trick: the screen
 * housing is drawn a column narrower each side than the base, and `╭╯ … ╰╮`
 * steps the wall out between them. Without that step this is a rounded box
 * with a screen in it, which is also what the PC's monitor is — the two cards
 * came out reading as the same object.
 *
 * It gets no separate base flange either: a `▀` bar under a closed case sat a
 * clear gap below it and read as a shelf the machine was hovering over.
 */
function macCase(bars: string): string[] {
  return [
    " ╭───────────────╮ ",
    " │ ╭───────────╮ │ ",
    ...FINDER.map((line) => ` │ ${line} │ `),
    " │ ╰───────────╯ │ ",
    " │               │ ",
    "╭╯               ╰╮",
    // The chin: floppy slot, the meter beside it as a drive light, the badge.
    `│ ▂▂▂▂▂▂▂▂▂  ${bars} │`,
    "│                 │",
    "│   ▸ edge node   │",
    "╰─────────────────╯",
  ];
}

/* ── Windows desktop ───────────────────────────────────────────────────
 * Monitor on a neck and foot with the tower beside it, both standing on the
 * same line. The tower is the point of the card: it is what a Windows machine
 * has that a Mac all-in-one does not.
 *
 * The neck and foot are their own narrow parts rather than padded full-width
 * rows, so the lattice keeps drifting either side of the stand instead of
 * leaving a dead 27-cell band under the screen.
 */

const PC_LEFT = 2;
const PC_TOWER_LEFT = 31;
const PC_TOWER_TOP = 4;

/** The four panes of the Windows mark, 9 wide, gapped through both axes. */
const PANES = [
  "        ████ ████        ",
  "        ████ ████        ",
  "                         ",
  "        ████ ████        ",
  "        ████ ████        ",
];

function pcMonitor(bars: string): string[] {
  return [
    "┌─────────────────────────┐",
    "│                 ─  □  ✕ │",
    ...PANES.map((line) => `│${line}│`),
    "│                         │",
    `│  ▸ full tunnel    ${bars}  │`,
    "└────────────┬────────────┘",
  ];
}

/** Optical slot, teal power button, and a vent panel down the lower half. */
const TOWER = [
  "┌─────┐",
  "│ ═══ │",
  "│  ●  │",
  "│     │",
  "│ ▒▒▒ │",
  "│ ▒▒▒ │",
  "│     │",
  "└─────┘",
];

function parts(kind: DeviceKind, bars: string): Part[] {
  switch (kind) {
    case "iphone":
      // Action button, then the volume pair, with the side button opposite.
      return [
        phoneBody("  ▐███▌  ", APPLE, "  ═════  ", bars),
        sideButton("left", 3, 1),
        sideButton("left", 5, 2),
        sideButton("left", 8, 2),
        sideButton("right", 5, 3),
      ];
    case "android":
      // Volume over power, both on the trailing side, as Android puts them.
      return [
        phoneBody("    ○    ", DROID, " ◁  ○  □ ", bars),
        sideButton("right", 4, 2),
        sideButton("right", 7, 2),
      ];
    case "mac":
      return [{ top: 0, left: MAC_LEFT, lines: macCase(bars) }];
    case "pc":
      return [
        { top: 0, left: PC_LEFT, lines: pcMonitor(bars) },
        { top: PC_TOWER_TOP, left: PC_TOWER_LEFT, lines: TOWER },
        // Centred on the `┬` the monitor's bottom edge leaves for them.
        { top: 10, left: PC_LEFT + 12, lines: ["███"] },
        { top: 11, left: PC_LEFT + 6, lines: ["▄".repeat(15)] },
      ];
  }
}

export function deviceScene(kind: DeviceKind): Scene {
  return {
    cols: DEVICE_COLS,
    rows: DEVICE_ROWS,

    paint(f: Frame, tMs: number) {
      const bars = BAR_STEPS[Math.floor(tMs / BAR_STEP_MS) % BAR_STEPS.length];
      for (const part of parts(kind, bars)) {
        part.lines.forEach((line, i) => stamp(f, part.top + i, part.left, line));
      }
    },

    order(row, col) {
      // Left to right, as the terminal plates print — the device assembles
      // rather than fading up. The row term is small, just enough to stop the
      // sweep reading as a rigid wipe.
      const sweep =
        (col / (DEVICE_COLS - 1)) * 0.85 + (row / (DEVICE_ROWS - 1)) * 0.15;
      return Math.min(1, Math.max(0, sweep));
    },
  };
}
