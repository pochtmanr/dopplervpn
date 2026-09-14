/**
 * Plates for the no-registration SEO page. Terminal words stay English
 * lowercase — they are artwork; the translated claim sits beside them.
 *
 * How-it-works reuses the traffic plates for tunnel / open-internet, and prints
 * two quieter identity plates for install and device-key.
 */
import { kv, plateScene, trafficScene } from "./traffic-scene";

const INSTALL = {
  label: "install",
  cursor: true as const,
  lines: () => [kv("store", "app / play"), kv("signup", "none"), kv("email", "none")],
};

const DEVICE = {
  label: "device",
  cursor: true as const,
  lines: () => [kv("account", "none"), kv("email", "none"), kv("keys", "on-device")],
};

export function noRegHowScene(index: number) {
  if (index === 2) return trafficScene(1);
  if (index === 3) return trafficScene(3);
  return plateScene(index === 0 ? INSTALL : DEVICE);
}
