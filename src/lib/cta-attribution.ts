/** Retain acquisition context while a reader moves from an article to download. */
const STORAGE_KEY = "doppler_cta_acquisition_v1";
export interface CtaAttribution {
  landing_path: string;
  article_path: string;
  acquisition_source: string;
  campaign_source: string;
  campaign_medium: string;
  campaign_name: string;
}

export function deriveCtaAttribution(href: string, referrer: string): CtaAttribution {
  const url = new URL(href);
  let source = "direct";
  try {
    const host = new URL(referrer).hostname;
    if (host !== url.hostname) {
      source = /(^|\.)(google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(host)
        ? "organic_search" : "referral";
    }
  } catch { /* Direct visits have no referrer. */ }
  const campaign = (name: string) => (url.searchParams.get(name) ?? "").replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 80);
  const campaign_source = campaign("utm_source");
  return {
    landing_path: url.pathname,
    article_path: /\/blog\/[^/]+\/?$/.test(url.pathname) ? url.pathname : "",
    acquisition_source: campaign_source ? "campaign" : source,
    campaign_source,
    campaign_medium: campaign("utm_medium"),
    campaign_name: campaign("utm_campaign"),
  };
}

export function currentCtaAttribution(): CtaAttribution | Record<string, never> {
  if (typeof window === "undefined") return {};
  const current = deriveCtaAttribution(window.location.href, document.referrer);
  try {
    const consent = JSON.parse(window.localStorage.getItem("cookie-consent") ?? "null");
    const consentAt = Date.parse(consent?.timestamp ?? "");
    if (!consent?.analytics || !Number.isFinite(consentAt) || Date.now() - consentAt > 365 * 24 * 60 * 60 * 1000) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return current;
    }
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    const retained: CtaAttribution = stored ? JSON.parse(stored) : current;
    // Keep the original acquisition, but retain the article encountered en route.
    if (current.article_path) retained.article_path = current.article_path;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(retained));
    return retained;
  } catch {
    return current;
  }
}
