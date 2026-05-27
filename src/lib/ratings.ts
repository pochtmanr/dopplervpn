/**
 * Aggregate user rating sourced from the App Store + Google Play.
 *
 * Refresh these values from:
 *   - iOS:     https://apps.apple.com/app/id6744068438
 *   - Android: https://play.google.com/store/apps/details?id=org.dopplervpn.android
 *
 * Combine both stores (weighted average if you want, or just the higher-volume
 * one — Google's rich-results pipeline does not care which app the rating is
 * from, only that the number is honest and verifiable).
 *
 * Set to `null` to suppress AggregateRating in JSON-LD entirely (do this if
 * you don't yet meet Google's minimum review-count threshold or if the stores
 * are showing temporarily-inaccurate numbers).
 */
export const RATING_DATA: {
  ratingValue: string;
  ratingCount: string;
  bestRating: string;
  worstRating: string;
} | null = null;
// Example once you have real numbers:
//   ratingValue: "4.7",
//   ratingCount: "52",
//   bestRating: "5",
//   worstRating: "1",
