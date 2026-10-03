"use client";

import { BlogCard } from "./blog-card";
import { Reveal } from "@/components/ui/reveal";
// Calm+ card for the `plus` branch.
import { PlusBlogCard } from "@/app/[locale]/design-lab/plus/blog";

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
}

interface BlogRelatedPostsProps {
  posts: RelatedPost[];
  locale: string;
  title: string;
  readMoreText: string;
  /** Calm+ preview, decided on the server page. */
  plus?: boolean;
}

export function BlogRelatedPosts({
  posts,
  locale,
  title,
  readMoreText,
  plus = false,
}: BlogRelatedPostsProps) {
  if (posts.length === 0) return null;

  if (plus) {
    return (
      <section className="mt-16 pt-12 border-t border-(--c-separator)">
        <h2 className="mb-6 font-display text-[22px] font-bold leading-tight text-(--c-text)">{title}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PlusBlogCard key={post.slug} post={{ ...post, tags: [] }} locale={locale} readMoreText={readMoreText} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 pt-12 border-t border-overlay/10">
      <h2 className="text-2xl font-semibold text-text-primary mb-8">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 50}>
            <BlogCard
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              imageUrl={post.imageUrl}
              imageAlt={post.imageAlt}
              publishedAt={post.publishedAt}
              tags={[]}
              locale={locale}
              readMoreText={readMoreText}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
