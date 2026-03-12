-- Blog Tag Cleanup Migration
-- Date: 2026-03-12
-- Purpose: Ensure all curated tags exist and identify orphan tags for manual review
--
-- Run steps:
-- 1. Run section 1 & 2 (safe inserts)
-- 2. Run section 3 to review orphan tags
-- 3. Manually map old tags → curated tags or delete associations
-- 4. Run section 4 to clean up orphan tags

-- 1. Ensure all curated tags exist in blog_tags
INSERT INTO blog_tags (slug) VALUES
  ('privacy'), ('vpn-guide'), ('security'), ('censorship'),
  ('streaming'), ('travel'), ('speed'), ('protocol'),
  ('setup-guide'), ('news'), ('comparison'), ('mobile'),
  ('desktop'), ('router'), ('business'), ('free-vpn'),
  ('no-logs'), ('encryption'), ('server-network'), ('tips-and-tricks')
ON CONFLICT (slug) DO NOTHING;

-- 2. Ensure English translations exist for all curated tags
INSERT INTO blog_tag_translations (tag_id, locale, name)
SELECT bt.id, 'en', CASE bt.slug
  WHEN 'privacy' THEN 'Privacy'
  WHEN 'vpn-guide' THEN 'VPN Guide'
  WHEN 'security' THEN 'Security'
  WHEN 'censorship' THEN 'Censorship'
  WHEN 'streaming' THEN 'Streaming'
  WHEN 'travel' THEN 'Travel'
  WHEN 'speed' THEN 'Speed'
  WHEN 'protocol' THEN 'Protocol'
  WHEN 'setup-guide' THEN 'Setup Guide'
  WHEN 'news' THEN 'News'
  WHEN 'comparison' THEN 'Comparison'
  WHEN 'mobile' THEN 'Mobile'
  WHEN 'desktop' THEN 'Desktop'
  WHEN 'router' THEN 'Router'
  WHEN 'business' THEN 'Business'
  WHEN 'free-vpn' THEN 'Free VPN'
  WHEN 'no-logs' THEN 'No-Logs'
  WHEN 'encryption' THEN 'Encryption'
  WHEN 'server-network' THEN 'Server Network'
  WHEN 'tips-and-tricks' THEN 'Tips & Tricks'
END
FROM blog_tags bt
WHERE bt.slug IN (
  'privacy', 'vpn-guide', 'security', 'censorship', 'streaming',
  'travel', 'speed', 'protocol', 'setup-guide', 'news',
  'comparison', 'mobile', 'desktop', 'router', 'business',
  'free-vpn', 'no-logs', 'encryption', 'server-network', 'tips-and-tricks'
)
ON CONFLICT (tag_id, locale) DO NOTHING;

-- 3. View existing non-curated tags and their post count (REVIEW before deleting)
SELECT bt.slug, bt.id, COUNT(bpt.post_id) as post_count
FROM blog_tags bt
LEFT JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
WHERE bt.slug NOT IN (
  'privacy', 'vpn-guide', 'security', 'censorship', 'streaming',
  'travel', 'speed', 'protocol', 'setup-guide', 'news',
  'comparison', 'mobile', 'desktop', 'router', 'business',
  'free-vpn', 'no-logs', 'encryption', 'server-network', 'tips-and-tricks'
)
GROUP BY bt.slug, bt.id
ORDER BY post_count DESC;

-- 4. AFTER manual review — delete orphan tag associations and tags
-- Uncomment and run after reviewing section 3 output:
--
-- DELETE FROM blog_post_tags
-- WHERE tag_id IN (
--   SELECT id FROM blog_tags
--   WHERE slug NOT IN (
--     'privacy', 'vpn-guide', 'security', 'censorship', 'streaming',
--     'travel', 'speed', 'protocol', 'setup-guide', 'news',
--     'comparison', 'mobile', 'desktop', 'router', 'business',
--     'free-vpn', 'no-logs', 'encryption', 'server-network', 'tips-and-tricks'
--   )
-- );
--
-- DELETE FROM blog_tag_translations
-- WHERE tag_id IN (
--   SELECT id FROM blog_tags
--   WHERE slug NOT IN (
--     'privacy', 'vpn-guide', 'security', 'censorship', 'streaming',
--     'travel', 'speed', 'protocol', 'setup-guide', 'news',
--     'comparison', 'mobile', 'desktop', 'router', 'business',
--     'free-vpn', 'no-logs', 'encryption', 'server-network', 'tips-and-tricks'
--   )
-- );
--
-- DELETE FROM blog_tags
-- WHERE slug NOT IN (
--   'privacy', 'vpn-guide', 'security', 'censorship', 'streaming',
--   'travel', 'speed', 'protocol', 'setup-guide', 'news',
--   'comparison', 'mobile', 'desktop', 'router', 'business',
--   'free-vpn', 'no-logs', 'encryption', 'server-network', 'tips-and-tricks'
-- );
