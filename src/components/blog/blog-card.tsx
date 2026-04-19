"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { isRtlLocale } from "@/i18n/routing";

interface BlogTag {
  slug: string;
  name: string;
}

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
  tags: BlogTag[];
  locale: string;
  readMoreText: string;
}

function formatDate(dateString: string | null, locale: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogCard({
  slug,
  title,
  excerpt,
  imageUrl,
  imageAlt,
  publishedAt,
  tags,
  locale,
  readMoreText,
}: BlogCardProps) {
  const isRtl = isRtlLocale(locale);

  return (
    <article>
      <Link href={`/blog/${slug}`} className="group block h-full">
        <Card
          padding="none"
          hover
          className="h-full overflow-hidden flex flex-col"
        >
          {imageUrl && (
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={imageUrl}
                alt={imageAlt || title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            </div>
          )}

          <div className="flex flex-col flex-1 p-5">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.slice(0, 2).map((tag) => (
                  <Badge key={tag.slug} variant="auto" seed={tag.slug} className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-accent-teal transition-colors">
              {title}
            </h3>

            <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-1">
              {excerpt}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-overlay/5">
              <time
                dateTime={publishedAt || undefined}
                className="text-xs text-text-muted"
              >
                {formatDate(publishedAt, locale)}
              </time>

              <span className="text-sm text-accent-teal font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {readMoreText}
                <svg
                  className={`w-4 h-4 transition-transform ${isRtl ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </article>
  );
}
