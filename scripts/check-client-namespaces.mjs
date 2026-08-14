#!/usr/bin/env node
/**
 * Guards src/i18n/client-namespaces.ts.
 *
 * The layout passes only CLIENT_NAMESPACES into NextIntlClientProvider, which keeps
 * ~240 KB of message JSON out of every page's RSC payload. The catch is that a
 * namespace used by a Client Component but missing from that list does not fail
 * `tsc` — next-intl throws MISSING_MESSAGE in the browser instead, so the page
 * renders broken in production. This script turns that into a build failure.
 *
 * It scans every "use client" file for next-intl hook calls and asserts that each
 * top-level namespace they reference is declared. It also reports declared
 * namespaces nothing uses any more, so the list can be trimmed back down.
 *
 * Run: node scripts/check-client-namespaces.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = join(ROOT, "src");
const LIST_FILE = join(SRC, "i18n", "client-namespaces.ts");
const MESSAGES_FILE = join(ROOT, "messages", "en.json");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

// Declared list — parsed from the string literals in the `as const` array.
const listSource = readFileSync(LIST_FILE, "utf8");
const arrayBody = listSource.match(
  /export const CLIENT_NAMESPACES = \[([\s\S]*?)\] as const;/
);
if (!arrayBody) {
  console.error("✗ Could not parse CLIENT_NAMESPACES from src/i18n/client-namespaces.ts");
  process.exit(1);
}
const declared = new Set([...arrayBody[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]));

// Used namespaces — every next-intl hook call inside a "use client" file.
// Only useTranslations takes a namespace; the others are listed so that a no-arg
// or computed call is still caught below.
const HOOK_CALL = /\buseTranslations\s*\(\s*(?:(["'`])([^"'`]*)\1)?\s*\)/g;
const READS_WHOLE_TREE = /\buseMessages\s*\(/;

const used = new Map(); // top-level namespace -> Set(files)
const problems = [];

for (const file of walk(SRC)) {
  const source = readFileSync(file, "utf8");
  if (!/^\s*(["'])use client\1/m.test(source)) continue;
  const rel = relative(ROOT, file);

  if (READS_WHOLE_TREE.test(source)) {
    problems.push(`${rel}: calls useMessages(), which needs the entire bundle — the pick cannot be narrowed while this exists.`);
  }

  for (const match of source.matchAll(HOOK_CALL)) {
    const namespace = match[2];
    if (namespace === undefined) {
      problems.push(`${rel}: useTranslations() with no namespace resolves against the whole bundle.`);
      continue;
    }
    const top = namespace.split(".")[0];
    if (!used.has(top)) used.set(top, new Set());
    used.get(top).add(rel);
  }

  // A computed namespace cannot be checked statically.
  for (const match of source.matchAll(/\buseTranslations\s*\(\s*([^"'`)\s][^)]*)\)/g)) {
    problems.push(`${rel}: useTranslations(${match[1].trim()}) uses a computed namespace — cannot be verified statically.`);
  }
}

const missing = [...used.keys()].filter((ns) => !declared.has(ns)).sort();
const unused = [...declared].filter((ns) => !used.has(ns)).sort();

// A declared namespace that does not exist in the message files is a typo that
// would silently pick nothing.
let absent = [];
try {
  const messages = JSON.parse(readFileSync(MESSAGES_FILE, "utf8"));
  absent = [...declared].filter((ns) => !(ns in messages)).sort();
} catch {
  console.warn("! Could not read messages/en.json; skipped the typo check.");
}

for (const problem of problems) console.error(`✗ ${problem}`);

for (const ns of missing) {
  console.error(
    `✗ Namespace "${ns}" is used by a Client Component but is not in CLIENT_NAMESPACES ` +
      `(${[...used.get(ns)].join(", ")}). It will throw MISSING_MESSAGE at runtime.`
  );
}

for (const ns of absent) {
  console.error(`✗ Namespace "${ns}" is declared but does not exist in messages/en.json — likely a typo.`);
}

if (unused.length) {
  console.warn(
    `! Declared but unused by any Client Component, safe to remove: ${unused.join(", ")}`
  );
}

if (problems.length || missing.length || absent.length) process.exit(1);

console.log(
  `✓ All ${used.size} client-side namespaces are declared in CLIENT_NAMESPACES.`
);
