#!/usr/bin/env tsx
/**
 * IndexNow submitter — pushes URLs to Bing, Yandex, Seznam and Naver at once.
 *
 * IndexNow is a push protocol: instead of waiting for a crawler to rediscover a
 * page, we tell the engines "this URL changed, come look". Bing Webmaster Tools
 * lists it as our top open recommendation. Google does NOT participate — Google
 * discovery still comes from the sitemap + Search Console.
 *
 * The key is public by design: ownership is proven by hosting
 * /<key>.txt containing the key, which is why KEY below is not a secret.
 *
 * Usage:
 *   npm run indexnow                        # every URL in the sitemap shards
 *   npm run indexnow -- <url> [<url> ...]   # just these URLs (after publishing)
 *   npm run indexnow -- --dry-run           # print what would be sent
 */

const HOST = "www.dopplervpn.org";
const ORIGIN = `https://${HOST}`;
const KEY = "54458eddb12a50c4869163a0b5827b27";
const KEY_LOCATION = `${ORIGIN}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

// Protocol cap is 10,000 URLs per request.
const BATCH_SIZE = 10_000;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "doppler-indexnow" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.text();
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/**
 * Walk /sitemap.xml (a sitemap index) into its per-locale shards and collect
 * every page URL. Reads the live site rather than the local build so the list
 * always matches what the engines can actually fetch.
 */
async function urlsFromSitemap(): Promise<string[]> {
  const shards = extractLocs(await fetchText(`${ORIGIN}/sitemap.xml`));
  console.log(`sitemap index: ${shards.length} shards`);

  const urls = new Set<string>();
  for (const shard of shards) {
    try {
      for (const loc of extractLocs(await fetchText(shard))) urls.add(loc);
    } catch (err) {
      // One unreachable shard should not sink the whole submission.
      console.warn(`  skipped ${shard}: ${(err as Error).message}`);
    }
  }
  return [...urls];
}

async function submit(urlList: string[]): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  // 200 = accepted, 202 = accepted but key still being validated. Both are fine.
  const body = await res.text();
  console.log(`  -> HTTP ${res.status}${body ? ` ${body.slice(0, 200)}` : ""}`);
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow rejected the batch (HTTP ${res.status})`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const explicit = args.filter((a) => a.startsWith("http"));

  const urls = explicit.length > 0 ? explicit : await urlsFromSitemap();
  const offSite = urls.filter((u) => !u.startsWith(`${ORIGIN}/`));
  if (offSite.length > 0) {
    // IndexNow rejects the entire batch if any URL is off-host.
    throw new Error(`Refusing to submit URLs outside ${ORIGIN}: ${offSite.slice(0, 3).join(", ")}`);
  }

  console.log(`${urls.length} URLs to submit${dryRun ? " (dry run)" : ""}`);
  if (dryRun) {
    for (const u of urls.slice(0, 20)) console.log(`  ${u}`);
    if (urls.length > 20) console.log(`  … and ${urls.length - 20} more`);
    return;
  }
  if (urls.length === 0) return;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`batch ${i / BATCH_SIZE + 1}: ${batch.length} URLs`);
    await submit(batch);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
