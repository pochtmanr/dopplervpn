-- =====================================================
-- ROLLBACK for 005_vless_cluster_posts.sql
-- =====================================================
-- Removes the five hand-written VLESS cluster posts and everything
-- attached to them. Scoped strictly to those five slugs.
--
-- blog_post_translations, blog_post_tags and blog_internal_links all
-- declare ON DELETE CASCADE against blog_posts, so deleting the posts
-- is sufficient. The explicit deletes below are belt-and-braces and
-- make the intent readable; they are no-ops if the cascade already ran.
--
-- Safe to run more than once.
--
-- WARNING: if these posts have since been published and translated,
-- this also destroys every translation of them. Check first:
--
--   SELECT p.slug, p.status, count(t.locale) AS locales
--   FROM blog_posts p
--   LEFT JOIN blog_post_translations t ON t.post_id = p.id
--   WHERE p.slug IN ('what-is-vless','vless-vs-vmess-vs-trojan',
--                    'vless-reality-vs-wireguard','vless-uri-format',
--                    'censorship-protocol-history')
--   GROUP BY p.slug, p.status;
--
-- If any row is status='published', prefer unpublishing over deleting —
-- a live URL that starts 404ing loses whatever ranking it has earned:
--
--   UPDATE blog_posts SET status = 'draft'
--   WHERE slug IN (...);
--
-- Deleting a published post also leaves its URL live in the sitemap
-- until the 24h ISR cycle turns over. If you must delete one that has
-- been indexed, add its slug to landing/src/lib/blog-gone-slugs.ts so
-- middleware returns 410 rather than a soft 404.
-- =====================================================

BEGIN;

-- Internal links in both directions (source or target)
DELETE FROM blog_internal_links
WHERE source_post_id IN (
        SELECT id FROM blog_posts WHERE slug IN (
          'what-is-vless', 'vless-vs-vmess-vs-trojan',
          'vless-reality-vs-wireguard', 'vless-uri-format',
          'censorship-protocol-history'))
   OR target_post_id IN (
        SELECT id FROM blog_posts WHERE slug IN (
          'what-is-vless', 'vless-vs-vmess-vs-trojan',
          'vless-reality-vs-wireguard', 'vless-uri-format',
          'censorship-protocol-history'));

DELETE FROM blog_post_tags
WHERE post_id IN (
  SELECT id FROM blog_posts WHERE slug IN (
    'what-is-vless', 'vless-vs-vmess-vs-trojan',
    'vless-reality-vs-wireguard', 'vless-uri-format',
    'censorship-protocol-history'));

DELETE FROM blog_post_translations
WHERE post_id IN (
  SELECT id FROM blog_posts WHERE slug IN (
    'what-is-vless', 'vless-vs-vmess-vs-trojan',
    'vless-reality-vs-wireguard', 'vless-uri-format',
    'censorship-protocol-history'));

DELETE FROM blog_posts
WHERE slug IN (
  'what-is-vless', 'vless-vs-vmess-vs-trojan',
  'vless-reality-vs-wireguard', 'vless-uri-format',
  'censorship-protocol-history');

COMMIT;

-- Verify: expect 0 rows.
--   SELECT slug FROM blog_posts WHERE slug IN (
--     'what-is-vless','vless-vs-vmess-vs-trojan',
--     'vless-reality-vs-wireguard','vless-uri-format',
--     'censorship-protocol-history');
