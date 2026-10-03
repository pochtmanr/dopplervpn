import { BlogCard } from "@/components/blog";
import { Reveal } from "@/components/ui/reveal";
// Calm+ card for the `plus` branch.
import { PlusBlogCard } from "../design-lab/plus/blog";

/** Pagination classes: shipped, and the Calm+ preview's round inset pills. */
const PAGER = {
  shipped: {
    nav: "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-overlay/15 text-text-primary hover:bg-overlay/5 transition-colors",
    navOff: "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-overlay/10 text-text-muted/40 cursor-not-allowed",
    on: "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg bg-accent-teal text-bg-primary font-medium",
    off: "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-lg border border-overlay/15 text-text-primary hover:bg-overlay/5 transition-colors",
  },
  plus: {
    nav: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-(--c-inset) text-(--c-text) hover:bg-(--c-accent-tint) hover:text-(--c-accent) transition-colors",
    navOff: "inline-flex items-center justify-center w-10 h-10 rounded-full bg-(--c-inset) text-(--c-tert) opacity-50 cursor-not-allowed",
    on: "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-full bg-(--c-accent-fill) text-white font-bold",
    off: "inline-flex items-center justify-center min-w-10 h-10 px-3 rounded-full bg-(--c-inset) text-(--c-text) font-bold hover:bg-(--c-accent-tint) hover:text-(--c-accent) transition-colors",
  },
};


interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
  tags: { slug: string; name: string }[];
}

interface BlogIndexContentProps {
  posts: BlogPost[];
  locale: string;
  currentPage: number;
  totalPages: number;
  tagSlug: string | null;
  translations: {
    readMore: string;
    noPosts: string;
    noPostsDescription: string;
  };
  /** Calm+ preview, decided on the server page. */
  plus?: boolean;
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
  currentPage,
  totalPages,
  tagSlug,
  plus = false,
}: BlogIndexContentProps) {
  const pager = plus ? PAGER.plus : PAGER.shipped;
  const pagePosts = posts;

  const pageItems = getPageItems(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      {pagePosts.length > 0 && plus ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pagePosts.map((post) => (
            <PlusBlogCard key={post.slug} post={post} locale={locale} readMoreText={translations.readMore} headingLevel="h2" />
          ))}
        </div>
      ) : pagePosts.length > 0 ? (
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
              aria-label="Previous page"
              rel="prev"
              className={pager.nav}
            >
              <ChevronStart />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className={pager.navOff}
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
                aria-label={`Page ${item}`}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? pager.on : pager.off}
              >
                {item}
              </a>
            );
          })}

          {hasNext ? (
            <a
              href={buildPageHref(locale, currentPage + 1, tagSlug)}
              aria-label="Next page"
              rel="next"
              className={pager.nav}
            >
              <ChevronEnd />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className={pager.navOff}
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
