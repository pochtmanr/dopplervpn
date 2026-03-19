"use client";

import { useTranslations } from "next-intl";
import { BlogCard } from "./blog-card";
import { Section, SectionHeader } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
  tags: { slug: string; name: string }[];
}

interface HomeBlogSectionProps {
  posts: BlogPost[];
  locale: string;
}

export function HomeBlogSection({ posts, locale }: HomeBlogSectionProps) {
  const t = useTranslations("blog");

  if (posts.length === 0) return null;

  return (
    <Section id="blog">
      <SectionHeader
        title={t("latestPosts")}
        subtitle={t("latestPostsSubtitle")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {posts.slice(0, 3).map((post, i) => (
          <Reveal key={post.slug} delay={i * 50}>
            <BlogCard
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              imageUrl={post.imageUrl}
              imageAlt={post.imageAlt}
              publishedAt={post.publishedAt}
              tags={post.tags}
              locale={locale}
              readMoreText={t("readMore")}
            />
          </Reveal>
        ))}
      </div>

      <Reveal className="text-center" delay={150}>
        <Button href="/blog" variant="secondary" size="md" className="text-white">
          {t("viewAllPosts")}
        </Button>
      </Reveal>
    </Section>
  );
}
