import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowGlyph, PLUS_BODY, PLUS_BTN_SM, PLUS_CARD_HOVER, PLUS_CHIP, PLUS_META, PLUS_TITLE_SM, PLUS_WELL } from '../plus-recipes';

export interface PlusPost {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string | null;
  tags: { slug: string; name: string }[];
}

/** As blog-card.tsx's formatDate. */
export function formatPostDate(date: string | null, locale: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * One post as a Calm+ card: the picture in a tray (still: no zoom on hover), two
 * tag chips, and a small "Read more" pill that brightens with the card. Shared by
 * the homepage's latest posts, the blog index and related posts.
 */
export function PlusBlogCard({
  post,
  locale,
  readMoreText,
  href = `/blog/${post.slug}`,
  headingLevel = 'h3',
}: {
  post: PlusPost;
  locale: string;
  readMoreText: string;
  href?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const Title = headingLevel;
  return (
    <article className="h-full">
      <Link href={href} className={`${PLUS_CARD_HOVER} !p-3`}>
        {post.imageUrl && (
          <div className={`${PLUS_WELL} aspect-[16/9]`}>
            <Image
              src={post.imageUrl}
              alt={post.imageAlt || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag.slug} className={`${PLUS_CHIP} bg-(--c-inset) text-(--c-muted)`}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <Title className={`line-clamp-2 ${PLUS_TITLE_SM}`}>{post.title}</Title>
          <p className={`mt-2 line-clamp-3 flex-1 ${PLUS_BODY}`}>{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <time dateTime={post.publishedAt || undefined} className={`min-w-0 ${PLUS_META}`}>
              {formatPostDate(post.publishedAt, locale)}
            </time>
            <span className={`${PLUS_BTN_SM} shrink-0 whitespace-nowrap`}>
              {readMoreText}
              <ArrowGlyph className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
