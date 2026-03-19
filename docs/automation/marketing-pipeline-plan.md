# Marketing Automation Pipeline Plan

## Overview

End-to-end content automation from creation to distribution, SEO indexing, and analytics. All workflows run on n8n (VPS #1: 72.61.87.54, https://n8n.dopplervpn.org).

---

## 1. Auto-Post to Telegram Channels on Blog Publish

### Trigger
Webhook fired by the blog create API after a post is published. The endpoint `POST https://www.dopplervpn.org/api/blog/create` with `auto_translate=true` returns:

```json
{
  "english_url": "https://www.dopplervpn.org/en/blog/slug",
  "russian_url": "https://www.dopplervpn.org/ru/blog/slug",
  "all_urls": { "en": "...", "ru": "...", "de": "...", ... }
}
```

### Workflow: `Blog Publish -> Telegram`

```
Webhook (POST /webhook/blog-published)
    |
    v
Validate payload (title, excerpt, image_url, english_url, russian_url)
    |
    +---> EN Channel Post (-1003716855563, @dopplervpnen)
    |     Format: Image + Title + Excerpt + Link
    |     Language: English
    |     Parse mode: HTML
    |
    +---> RU Channel Post (-1003525284412, @dopplervpn)
    |     Format: Image + Title + Excerpt + Link
    |     Language: Russian (from russian_url / blog_translations)
    |     Parse mode: HTML
    |
    v
Error Handler -> Telegram notification to @rpochtman (218545546)
```

### Message Format (EN example)

```html
<a href="{image_url}">&#8205;</a>
<b>{title}</b>

{excerpt}

<a href="{english_url}">Read more</a>
```

### Implementation Notes
- Use `sendPhoto` with `caption` for image posts (better preview than link)
- Caption limit: 1024 chars. If excerpt exceeds, truncate with "..."
- Fallback: if `sendPhoto` fails (bad image URL), use `sendMessage` with link preview
- Include UTM params on links: `?utm_source=telegram&utm_medium=channel&utm_campaign=blog`
- Rate limit: 1 message per channel per call (Telegram limit: 20 msg/min per bot in groups)

### Integration Point
Add a webhook call to the Next.js blog create API route (`/api/blog/create`) that fires after successful post creation:

```typescript
// After post is created and translated:
await fetch(process.env.N8N_BLOG_PUBLISH_WEBHOOK!, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title_en: post.title,
    title_ru: russianTranslation.title,
    excerpt_en: post.excerpt,
    excerpt_ru: russianTranslation.excerpt,
    image_url: post.image_url,
    english_url: englishUrl,
    russian_url: russianUrl,
    slug: post.slug,
    published_at: new Date().toISOString()
  })
});
```

---

## 2. Scheduled Content Distribution (Unpromoted Posts)

### Purpose
Find blog posts that were published but never posted to Telegram (e.g., manually created posts, failed webhook deliveries).

### Workflow: `Unpromoted Post Checker`

```
Cron (daily at 10:00 UTC)
    |
    v
Supabase Query: SELECT posts WHERE published = true
    AND created_at > NOW() - INTERVAL '7 days'
    AND id NOT IN (SELECT post_id FROM telegram_post_log)
    |
    v
IF unpromoted posts found
    |
    +---> For each post: trigger Blog Publish -> Telegram webhook
    |     (with 3-second delay between posts to respect Telegram rate limits)
    |
    +---> Summary notification to @rpochtman
          "{N} unpromoted posts found and queued for distribution"
```

### Requires
- New Supabase table: `telegram_post_log`
  ```sql
  CREATE TABLE telegram_post_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES blog_posts(id),
    channel TEXT NOT NULL,  -- 'en' or 'ru'
    message_id BIGINT,      -- Telegram message ID
    posted_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- The Blog Publish -> Telegram workflow should log successful posts to this table

---

## 3. SEO Ping on New Post Publish

### Workflow: `SEO Index Ping`

Triggered by the same blog-published webhook (or chained after Telegram posting).

```
Webhook data (english_url, all_urls)
    |
    +---> Google Indexing API
    |     POST https://indexing.googleapis.com/v3/urlNotifications:publish
    |     Body: { "url": "{english_url}", "type": "URL_UPDATED" }
    |     Auth: Google Service Account (OAuth2)
    |     Also submit: russian_url, de_url (top 3 locales)
    |
    +---> Bing URL Submission API
    |     POST https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl
    |     Params: apikey={BING_API_KEY}&siteUrl=https://www.dopplervpn.org
    |     Body: { "siteUrl": "https://www.dopplervpn.org", "url": "{english_url}" }
    |
    +---> Sitemap Ping (fallback)
    |     GET https://www.google.com/ping?sitemap=https://www.dopplervpn.org/sitemap.xml
    |     GET https://www.bing.com/ping?sitemap=https://www.dopplervpn.org/sitemap.xml
    |
    v
Log results + Error Handler
```

### Prerequisites
- **Google Indexing API:** Requires Google Search Console verified property + Service Account with Indexing API enabled. Store credentials as n8n Google Service Account credential.
- **Bing Webmaster API:** Register site at bing.com/webmasters, get API key. Store as n8n environment variable `BING_WEBMASTER_API_KEY`.
- **Sitemap:** Ensure `https://www.dopplervpn.org/sitemap.xml` is auto-generated and up-to-date (Next.js sitemap plugin).

---

## 4. Full Pipeline Overview

```
                    CONTENT CALENDAR
                         |
          +--------------+--------------+
          |                             |
    [Automated]                   [Manual]
    n8n Cron                    Admin Panel
    08:00 / 13:00 UTC           /admin-dvpn/posts
          |                             |
          v                             v
    Topic Discovery             Manual blog/create
    (Perplexity sonar)          API call
          |                             |
          v                             |
    Content Generation                  |
    (OpenAI gpt-5-mini)                 |
          |                             |
          v                             |
    Image Pipeline                      |
    (search/generate)                   |
          |                             |
          v                             v
    +-------------------------------------------+
    |  POST /api/blog/create                    |
    |  (auto_translate=true)                    |
    |  Returns: english_url, russian_url,       |
    |           all_urls, image_url             |
    +-------------------------------------------+
                         |
                         v
    +-------------------------------------------+
    |  n8n Webhook: blog-published              |
    |  (fired by API after successful create)   |
    +-------------------------------------------+
          |              |              |
          v              v              v
    Telegram EN    Telegram RU    SEO Index Ping
    @dopplervpnen  @dopplervpn    Google + Bing
    (-10037168..)  (-10035252..)  + Sitemap ping
          |              |              |
          v              v              v
    +-------------------------------------------+
    |  Log to telegram_post_log table           |
    |  Log to seo_ping_log table                |
    +-------------------------------------------+
                         |
                         v
    +-------------------------------------------+
    |  Daily Cron (10:00 UTC)                   |
    |  Check for unpromoted posts               |
    |  Re-trigger webhook for missed posts      |
    +-------------------------------------------+
                         |
                         v
    +-------------------------------------------+
    |  Analytics (future)                       |
    |  - Telegram post engagement tracking      |
    |  - Blog traffic via Vercel Analytics      |
    |  - Indexing status checks                 |
    +-------------------------------------------+
```

---

## 5. Implementation Phases

### Phase 1: Blog Publish -> Telegram (Priority: HIGH)
1. Create n8n workflow `Blog Publish -> Telegram` with webhook trigger
2. Add `N8N_BLOG_PUBLISH_WEBHOOK` env var to Vercel
3. Modify `/api/blog/create` to fire webhook after successful creation
4. Create `telegram_post_log` table in Supabase
5. Test with a draft post, verify both channels receive formatted messages
6. Activate workflow

### Phase 2: SEO Ping (Priority: HIGH)
1. Set up Google Search Console + Service Account for Indexing API
2. Register site on Bing Webmasters
3. Create n8n workflow `SEO Index Ping` (chain after Telegram posting)
4. Verify sitemap.xml is current and auto-updating
5. Test with a new post URL

### Phase 3: Unpromoted Post Checker (Priority: MEDIUM)
1. Create n8n cron workflow `Unpromoted Post Checker`
2. Query Supabase for posts not in `telegram_post_log`
3. Re-trigger the blog-published webhook for each
4. Add summary notification

### Phase 4: Analytics & Monitoring (Priority: LOW)
1. Track Telegram message engagement (views, forwards) via Bot API `getChat`
2. Weekly summary report to @rpochtman
3. Google Search Console API integration for indexing status
4. Dashboard in admin panel showing pipeline health

---

## 6. n8n Credentials Needed

| Credential | Type | Status |
|------------|------|--------|
| Telegram Bot | Telegram API | Exists (TELEGRAM_BOT_TOKEN env var) |
| Supabase | HTTP Header Auth | Exists (SUPABASE_URL + SUPABASE_KEY env vars) |
| Blog API | HTTP Header Auth | Exists (BLOG_API_KEY env var) |
| Google Indexing API | Google Service Account | NEW - needs setup |
| Bing Webmaster API | API Key | NEW - needs setup |

## 7. Supabase Schema Changes

```sql
-- Track Telegram channel posts
CREATE TABLE telegram_post_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id),
  channel TEXT NOT NULL CHECK (channel IN ('en', 'ru')),
  message_id BIGINT,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, channel)
);

-- Track SEO indexing pings
CREATE TABLE seo_ping_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('google', 'bing', 'sitemap')),
  status_code INT,
  response TEXT,
  pinged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for the unpromoted post checker query
CREATE INDEX idx_telegram_post_log_post_id ON telegram_post_log(post_id);
CREATE INDEX idx_seo_ping_log_url ON seo_ping_log(url);
```

## 8. Environment Variables to Add

| Variable | Where | Value |
|----------|-------|-------|
| N8N_BLOG_PUBLISH_WEBHOOK | Vercel (.env.local) | `https://n8n.dopplervpn.org/webhook/blog-published` |
| BING_WEBMASTER_API_KEY | n8n Docker env | From Bing Webmasters portal |
| GOOGLE_INDEXING_SA_JSON | n8n credential store | Service account JSON (stored as n8n credential, NOT env var) |
