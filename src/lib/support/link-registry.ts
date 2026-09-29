import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type LinkEntry = {
  id: string;
  title: string;
  localePath: string | null;
  externalUrl: string | null;
  anchor: string | null;
  verifyFile: string;
  verifyIncludes: string;
};

export type LinkRegistry = {
  version: string;
  siteUrl: string;
  entries: LinkEntry[];
};

const registryPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../contracts/support/v1/link-registry.json",
);

export function loadLinkRegistry(): LinkRegistry {
  return JSON.parse(readFileSync(registryPath, "utf8")) as LinkRegistry;
}

export function linkEntry(id: string, registry = loadLinkRegistry()): LinkEntry {
  const entry = registry.entries.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown link id ${id}`);
  return entry;
}

/** Locale-prefixed site URL, or the external URL when the entry is not on dopplervpn.org. */
export function localizedUrl(locale: string, id: string, registry = loadLinkRegistry()): string {
  const entry = linkEntry(id, registry);
  if (entry.externalUrl) return entry.externalUrl;
  if (!entry.localePath) throw new Error(`Link ${id} has no path`);
  if (entry.localePath === "/pricing" || entry.localePath.startsWith("/pricing")) {
    throw new Error("pricing is the homepage #pricing anchor");
  }
  return `${registry.siteUrl}/${locale}${entry.localePath}`;
}
