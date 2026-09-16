/**
 * Print the /downloads device art as text: `npx tsx scripts/preview-devices.ts [tMs]`
 *
 * A glyph scene is a pure function of (frame, tMs), so its exact lattice can be
 * rendered without a browser. Box art is easy to get wrong by a cell — a row
 * padded to the wrong width silently overruns its frame, and the only symptom
 * in the page is a device that looks slightly broken. Run this after editing
 * device-scene.ts and read the frame.
 */
import { createFrame } from "@/components/glyph/glyph-scene";
import {
  DEVICE_COLS,
  DEVICE_ROWS,
  deviceScene,
  type DeviceKind,
} from "@/components/glyph/device-scene";

const kinds: DeviceKind[] = ["iphone", "android", "mac", "pc"];
const tMs = Number(process.argv[2] ?? 1600);

for (const kind of kinds) {
  const frame = createFrame(DEVICE_COLS, DEVICE_ROWS);
  deviceScene(kind).paint(frame, tMs);
  console.log(`\n${"─".repeat(DEVICE_COLS)}  ${kind}`);
  for (const row of frame.cells) {
    // "" means "draw noise here" at runtime; · stands in for the grain so the
    // device's own solid interior is visible.
    console.log(row.map((cell) => (cell === "" ? "·" : cell)).join(""));
  }
}
