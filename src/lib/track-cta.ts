import { track } from "@vercel/analytics";

import { gtagEvent } from "@/lib/ga";

/**
 * The site's single CTA event layer. Every call here is DUAL-EMITTED: once to
 * Vercel Analytics (`track`) and once to GA4 (`gtagEvent`). Keeping both means
 * the two sources can be compared before either is trusted, and an ad blocker
 * killing gtag.js does not leave us blind.
 *
 * GA4 naming follows Google's reserved/recommended names wherever one exists
 * (`file_download`, `begin_checkout`, `purchase`) so the built-in reports and
 * revenue attribution work without configuration. The rest are custom.
 *
 * IMPORTANT: GA4 collects event parameters but will not report on them until
 * each one is registered as an event-scoped custom dimension in
 * Admin -> Custom definitions. The params used below are: platform,
 * destination, cta_location, locale, variant, payment_method, provider, arch.
 */

export type CtaLocation =
  | "hero"
  | "blog-sticky"
  | "blog-inline"
  | "blog-bottom"
  | "bypass-censorship"
  | "no-registration-vpn"
  | "vless-vpn"
  | "vpn-for-ios"
  | "vpn-for-android"
  | "vpn-for-macos"
  | "vpn-for-windows"
  | "vpn-for-uae"
  | "vpn-for-iran"
  | "vpn-for-china"
  | "vpn-for-russia"
  | "vpn-for-turkey"
  | "vpn-for-telegram-calls-uae"
  | "vpn-for-whatsapp-calls-uae"
  | "vpn-for-instagram-russia"
  | "vpn-for-travelers-china"
  | "vpn-for-tiktok-ban"
  | "vpn-for-public-wifi-iphone"
  | "vless-vpn-android"
  | "footer"
  | "downloads"
  | "landing-cta"
  | "downloads-page"
  | "sticky-mobile"
  | "checkout-success";

/**
 * Which app build the click is for. "telegram" is a real acquisition channel
 * (the bot hands out configs), not a device, but it sits in the same union so
 * every store-facing CTA on the site reports through one field.
 */
export type CtaPlatform =
  | "ios"
  | "android"
  | "mac"
  | "windows"
  | "desktop"
  | "telegram";

export type CtaVariant =
  | "android-play"
  | "android-apk"
  | "android-apk-32"
  | "windows-x64";

/**
 * Where the click actually sends the visitor. Distinct from platform because
 * Android has two routes (Play vs sideload APK) and because "desktop" CTAs
 * point at our own /downloads page rather than off-site.
 */
export type CtaDestination =
  | "app_store"
  | "google_play"
  | "direct_exe"
  | "apk"
  | "telegram_bot"
  | "internal";

export function deriveDestination(
  platform: CtaPlatform,
  variant?: CtaVariant
): CtaDestination {
  if (variant === "android-apk" || variant === "android-apk-32") return "apk";
  if (variant === "windows-x64") return "direct_exe";
  switch (platform) {
    case "ios":
    case "mac":
      return "app_store";
    case "android":
      return "google_play";
    case "windows":
      return "direct_exe";
    case "telegram":
      return "telegram_bot";
    default:
      // "desktop" is the unresolved-UA fallback; those CTAs link to /downloads.
      return "internal";
  }
}

/** Real files we hand over directly, for GA4's recommended `file_download`. */
const FILE_DOWNLOADS: Partial<
  Record<CtaDestination, { file_name: string; file_extension: string }>
> = {
  direct_exe: { file_name: "DopplerVPN-Setup.exe", file_extension: "exe" },
  apk: { file_name: "doppler-vpn.apk", file_extension: "apk" },
};

function currentPath(): string {
  return typeof window !== "undefined" ? window.location.pathname : "";
}

export interface TrackCtaOptions {
  /** Override the platform/variant-derived destination. */
  destination?: CtaDestination;
  /** Absolute or relative href, reported as `link_url` on `file_download`. */
  href?: string;
}

export function trackCta(
  location: CtaLocation,
  platform: CtaPlatform,
  variant?: CtaVariant,
  pagePath?: string,
  locale?: string,
  options?: TrackCtaOptions
) {
  const page_path = pagePath ?? currentPath();
  const destination = options?.destination ?? deriveDestination(platform, variant);

  track("cta_click", {
    location,
    platform,
    variant: variant ?? "",
    page_path,
    locale: locale ?? "",
  });

  gtagEvent("app_download_click", {
    platform,
    destination,
    cta_location: location,
    variant: variant ?? "",
    page_path,
    locale: locale ?? "",
  });

  // GA4's own recommended event, so the "File downloads" report is populated for
  // the two cases where a click really does fetch a binary. Store links are not
  // file downloads — Apple and Google own that step and we cannot observe it.
  const file = FILE_DOWNLOADS[destination];
  if (file) {
    gtagEvent("file_download", {
      ...file,
      link_url: options?.href ?? "",
      platform,
      cta_location: location,
      page_path,
      locale: locale ?? "",
    });
  }
}

export type GetProLocation =
  | "pricing"
  | "nav-desktop"
  | "nav-mobile"
  | "account-paywall";

export function trackGetPro(
  location: GetProLocation,
  pagePath?: string,
  locale?: string
) {
  const page_path = pagePath ?? currentPath();

  track("subscribe_cta_click", {
    location,
    page_path,
    locale: locale ?? "",
  });

  gtagEvent("get_pro_click", {
    cta_location: location,
    page_path,
    locale: locale ?? "",
  });
}

export function trackAccountIdentified(
  mode: "new" | "existing",
  locale?: string
) {
  const page_path = currentPath();

  track("account_identified", {
    mode,
    page_path,
    locale: locale ?? "",
  });

  gtagEvent("account_identified", { mode, page_path, locale: locale ?? "" });
}

export function trackCheckoutStarted(
  plan: string,
  paymentMethod: "card" | "crypto",
  hasPromo: boolean,
  locale?: string,
  /** Plan price in `currency`, so GA4 can value the funnel step. */
  value?: number,
  currency = "USD"
) {
  const page_path = currentPath();

  track("checkout_started", {
    plan,
    payment_method: paymentMethod,
    promo: hasPromo,
    page_path,
    locale: locale ?? "",
  });

  // GA4 standard ecommerce event — populates the purchase-journey funnel.
  gtagEvent("begin_checkout", {
    currency,
    value,
    payment_method: paymentMethod,
    coupon: hasPromo ? "promo" : "",
    page_path,
    locale: locale ?? "",
    items: [{ item_id: plan, item_name: plan, price: value, quantity: 1 }],
  });
}

export interface PurchaseDetails {
  /** Order id — GA4 dedupes `purchase` on this, so it must be the real one. */
  transactionId?: string | null;
  value?: number | null;
  currency?: string | null;
}

export function trackPurchaseResult(
  status: "paid" | "failed",
  plan: string | null,
  provider: string | null,
  reason?: string,
  details?: PurchaseDetails
) {
  track(status === "paid" ? "purchase_completed" : "purchase_failed", {
    plan: plan ?? "",
    provider: provider ?? "",
    ...(status === "failed" ? { reason: reason ?? "" } : {}),
  });

  if (status === "failed") {
    gtagEvent("purchase_failed", {
      plan: plan ?? "",
      provider: provider ?? "",
      reason: reason ?? "",
    });
    return;
  }

  // GA4 standard `purchase`. Without transaction_id/value/currency the event is
  // accepted but contributes nothing to revenue reporting, which is the only
  // reason to send it.
  const value = details?.value ?? undefined;
  gtagEvent("purchase", {
    transaction_id: details?.transactionId ?? "",
    value,
    currency: details?.currency ?? "USD",
    provider: provider ?? "",
    items: [
      { item_id: plan ?? "", item_name: plan ?? "", price: value, quantity: 1 },
    ],
  });
}
