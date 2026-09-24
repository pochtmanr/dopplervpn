import { en, type ChartCopy, type ChartCopyKey } from "./en";
import { ru } from "./ru";
import { fa } from "./fa";
import { zh } from "./zh";
import { ar } from "./ar";
import { tr } from "./tr";

export type { ChartCopy, ChartCopyKey };

/**
 * Chart prose by locale. Every module is imported statically, never with a
 * dynamic `import()`: the charts render from inside react-markdown's synchronous
 * `components` map, so the lookup cannot be async and cannot use next-intl.
 *
 * To add a locale: write ./<locale>.ts in the shape of ./en.ts (typecheck will
 * name any key you missed), add it here, and add the locale to
 * HOW_IT_WORKS_LOCALES in src/i18n/how-it-works-locales.ts.
 */
const COPY: Record<string, ChartCopy> = { en, ru, fa, zh, ar, tr };

export function chartCopy(locale: string): ChartCopy {
  return COPY[locale] ?? en;
}
