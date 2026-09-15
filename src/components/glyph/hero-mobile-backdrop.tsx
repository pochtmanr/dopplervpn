import { HeroMobileBackdropField } from "./pricing-glyphs";
import { backdropScene, HERO_MOBILE_COLS, HERO_MOBILE_ROWS } from "./price-scene";
import { frameZero } from "./glyph-render";

/**
 * Server half of the mobile hero backdrop. Its only job is to compute the t=0
 * frame — the scene itself has methods and so cannot cross the RSC boundary,
 * but the five strings it renders to can.
 *
 * Module scope, not per-request: `backdropScene` and `render` are pure, so this
 * is evaluated once per server process and then shared by every locale and
 * every page that mounts the hero.
 */
const FRAME_ZERO = frameZero(backdropScene(HERO_MOBILE_COLS, HERO_MOBILE_ROWS));

export function HeroMobileBackdrop() {
  return <HeroMobileBackdropField initialFrame={FRAME_ZERO} />;
}
