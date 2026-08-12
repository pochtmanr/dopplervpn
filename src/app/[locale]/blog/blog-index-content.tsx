"use client";

import { useEffect, useMemo, useState } from "react";
import { BlogCard } from "@/components/blog";
import { Reveal } from "@/components/ui/reveal";

const PAGE_SIZE = 18;

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
  tags: { slug: string; name: string }[];
}

/**
 * `posts` is the FULL post list for the locale — tag filtering and pagination
 * happen here, on the client, rather than on the server.
 *
 * Why: reading `searchParams` in the server page opted the whole /[locale]/blog
 * route into dynamic rendering, so it answered `no-store` and re-ran both
 * Supabase queries on every single request across 21 blog locales. Keeping the
 * query string on this side of the boundary lets the page prerender and serve
 * from the CDN. The cost is a larger RSC payload (~100 posts of title/excerpt
 * instead of 18) — a good trade against a per-request origin hit.
 *
 * The query string is read from `window.location` in an effect rather than via
 * `useSearchParams()`. That hook would force Next to skip prerendering this
 * subtree and emit only the Suspense fallback, so the static HTML would ship
 * with zero links to any post — bad for search engines and for the citation
 * agents that don't run JS. With plain state the server renders page 1
 * unfiltered (which is what the canonical URL means anyway) and the client
 * corrects it after hydration.
 */
interface BlogIndexContentProps {
  posts: BlogPost[];
  locale: string;
  translations: {
    readMore: string;
    noPosts: string;
    noPostsDescription: string;
  };
}

function parsePageParam(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function buildPageHref(locale: string, page: number, tagSlug: string | null): string {
  const params = new URLSearchParams();
  if (tagSlug) params.set("tag", tagSlug);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/${locale}/blog?${qs}` : `/${locale}/blog`;
}

// Show page 1, current ±1, last — plus ellipses. Always ≤ 7 items.
function getPageItems(
  current: number,
  total: number,
): (number | "ellipsis-start" | "ellipsis-end")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("ellipsis-start");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("ellipsis-end");
  items.push(total);
  return items;
}

export function BlogIndexContent({
  posts,
  locale,
  translations,
}: BlogIndexContentProps) {
  // Server render (and first client render) is always page 1, unfiltered.
  const [tagSlug, setTagSlug] = useState<string | null>(null);
  const [requestedPage, setRequestedPage] = useState(1);

  // Adopt any ?tag= / ?page= from a deep link once mounted. Nothing in the app
  // links to ?tag= (post tags are plain badges, not links), and pagination is
  // handled by the click handler below, so a mount-time read is sufficient.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setTagSlug(params.get("tag"));
    setRequestedPage(parsePageParam(params.get("page")));
  }, []);

  const filteredPosts = useMemo(
    () =>
      tagSlug
        ? posts.filter((post) => post.tags.some((tag) => tag.slug === tagSlug))
        : posts,
    [posts, tagSlug],
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  // Clamp rather than 404 on an out-of-range ?page= — the server can no longer
  // notFound() on it, and robots.ts Disallows ?page= so no thin duplicate is
  // ever indexed.
  const currentPage = Math.min(requestedPage, totalPages);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const pageItems = getPageItems(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Paging is local state, not navigation — the route is a single prerendered
  // document per locale. The anchors keep a real href so middle-click,
  // open-in-new-tab and screen readers all still work; the handler just avoids
  // a pointless round trip and syncs the URL.
  const goToPage = (page: number) => {
    setRequestedPage(page);
    window.history.replaceState(null, "", buildPageHref(locale, page, tagSlug));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {pagePosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagePosts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 30}>
              <BlogCard
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                imageUrl={post.imageUrl}
                imageAlt={post.imageAlt}
                publishedAt={post.publishedAt}
                tags={post.tags}
                locale={locale}
                readMoreText={translations.readMore}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-text-primary mb-2">{translations.noPosts}</p>
          <p className="text-text-muted">{translations.noPostsDescription}</p>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-12 flex justify-center items-center gap-2"
        >
          {hasPrev ? (
            <a
              href={buildPageHref(locale, currentPage - 1, tagSlug)}
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage - 1);
              }}
              aria-label="Previous page"
              rel="prev"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-overlay/15 text-text-primary hover:bg-overlay/5 transition-colors"
            >
              <ChevronStart />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-overlay/10 text-text-muted/40 cursor-not-allowed"
            >
              <ChevronStart />
            </span>
          )}

          {pageItems.map((item, idx) => {
            if (item === "ellipsis-start" || item === "ellipsis-end") {
              return (
                <span
                  key={`${item}-${idx}`}
                  aria-hidden="true"
                  className="inline-flex items-center justify-center w-10 h-10 text-text-muted"
                >
                  …
                </span>
              );
            }
            const isActive = item === currentPage;
            return (
              <a
                key={item}
                href={buildPageHref(locale, item, tagSlug)}
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(item);
                }}
                aria-label={`Page ${item}`}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg bg-accent-teal text-bg-primary font-medium"
                    : "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg border border-overlay/15 text-text-primary hover:bg-overlay/5 transition-colors"
                }
              >
                {item}
              </a>
            );
          })}

          {hasNext ? (
            <a
              href={buildPageHref(locale, currentPage + 1, tagSlug)}
              onClick={(e) => {
                e.preventDefault();
                goToPage(currentPage + 1);
              }}
              aria-label="Next page"
              rel="next"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-overlay/15 text-text-primary hover:bg-overlay/5 transition-colors"
            >
              <ChevronEnd />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-overlay/10 text-text-muted/40 cursor-not-allowed"
            >
              <ChevronEnd />
            </span>
          )}
        </nav>
      )}
    </>
  );
}

function ChevronStart() {
  return (
    <svg
      className="w-4 h-4 rtl:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronEnd() {
  return (
    <svg
      className="w-4 h-4 rtl:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
