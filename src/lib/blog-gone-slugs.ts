// Slugs permanently removed after the Feb–Apr 2026 AI-slop incident.
// When requested under any locale, middleware returns HTTP 410 Gone so
// Google de-indexes them faster than a 404 would. See GSC Coverage report
// 2026-04-17 for the source list of 157 affected URLs.
//
// Two legit topic slugs from the 404 list are intentionally NOT here:
//   - stay-safe-on-public-wifi
//   - why-vpn-matters-2025
// These are being re-published as new, high-quality evergreen posts.
export const GONE_BLOG_SLUGS = new Set<string>([
  "ais-new-frontier-how-big-tech-startups-and-spacex-are-shaping-the-next-wave-of-intelligence",
  "apple-march-2026-global-event-new-macbooks-ipads-and-privacy-first-ai-features-coming",
  "claude-opus-46-launches-why-privacy-first-ai-agents-matter-for-your-data-security",
  "consolidation-and-acceleration-how-big-tech-ai-startups-and-space-players-are-reframing-the-next-wav",
  "how-big-tech-ai-startups-and-spacex-are-reconfiguring-the-next-wave-of-intelligence",
  "i-need-the-event-how-to-get-a-timely-evidence-based-policy-analysis-from-me",
  "image-test-post",
  "need-the-tea-which-viral-moment-should-i-cover",
  "pipeline-auth-test-1774099312",
  "quick-check-before-i-write-that-viral-roundup",
  "quick-check-which-viral-moment-do-you-mean",
  "quick-reality-check-on-that-research-blowup",
  "research-which-development-should-i-cover-today",
  "undefined",
  "which-research-blew-up-today",
  "which-research-moment-from-today-should-i-cover",
]);

// Extract slug from a blog path under any locale, e.g.
//   /en/blog/some-slug          → "some-slug"
//   /ru/blog/some-slug/         → "some-slug"
//   /fa/blog/nested/not-a-post  → null (only top-level blog posts)
export function parseBlogSlug(pathname: string): string | null {
  const match = pathname.match(/^\/[a-z]{2}(?:-[A-Za-z]+)?\/blog\/([^/]+)\/?$/);
  return match ? match[1] : null;
}
