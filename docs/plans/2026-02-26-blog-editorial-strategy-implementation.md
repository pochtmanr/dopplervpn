# Blog Editorial Strategy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Doppler blog from a single-template VPN blog into a 4-template, 3-posts/day tech news operation with source rotation, hybrid image pipeline, casual translation support, and performance tracking.

**Architecture:** Database-first approach — add tracking columns, update API routes to accept new fields, add casual translation prompt, then build n8n workflows for the new pipeline. Each task is independently deployable.

**Tech Stack:** Supabase (DB migration), Next.js API routes (TypeScript), OpenAI gpt-5-mini (translation), n8n (automation workflows on VPS 72.61.87.54), Gemini (image generation)

---

## Task 1: Database Migration — Add Tracking Columns

**Files:**
- Create: `supabase/migrations/002_blog_editorial_strategy.sql`

**Step 1: Write the migration SQL**

```sql
-- =====================================================
-- BLOG EDITORIAL STRATEGY — New tracking columns
-- Safe, idempotent, non-destructive
-- =====================================================

-- Add template_type column (quick-take, analysis, meme, roundup)
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS template_type VARCHAR(20) DEFAULT 'quick-take';

-- Add check constraint separately (IF NOT EXISTS not supported for constraints)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_template_type'
  ) THEN
    ALTER TABLE blog_posts
      ADD CONSTRAINT valid_template_type
      CHECK (template_type IN ('quick-take', 'analysis', 'meme', 'roundup'));
  END IF;
END $$;

-- Add source_combo column (tracks which source combination produced this post)
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS source_combo TEXT;

-- Add topic_category column (tracks which of the 9 categories)
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS topic_category VARCHAR(50);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_template_type ON blog_posts(template_type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_topic_category ON blog_posts(topic_category);
```

**Step 2: Run migration via Supabase MCP**

Run the SQL above against the Doppler Supabase project (ref: `fzlrhmjdjjzcgstaeblu`) using `mcp__supabase__execute_sql`.

Expected: Success, 0 rows affected (DDL).

**Step 3: Verify columns exist**

Run: `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name IN ('template_type', 'source_combo', 'topic_category');`

Expected: 3 rows returned.

**Step 4: Commit**

```bash
git add supabase/migrations/002_blog_editorial_strategy.sql
git commit -m "feat: add template_type, source_combo, topic_category columns to blog_posts"
```

---

## Task 2: Author Migration — Flora Bot to Doppler Team

**Files:**
- Modify: `src/app/api/blog/create/route.ts:49` (default author value)

**Step 1: Update existing posts in database**

Run via Supabase MCP:
```sql
UPDATE blog_posts SET author_name = 'Doppler Team' WHERE author_name = 'Flora Bot';
```

Expected: N rows updated (however many Flora Bot posts exist).

**Step 2: Verify migration**

Run: `SELECT DISTINCT author_name FROM blog_posts;`

Expected: No "Flora Bot" entries remain.

**Step 3: Update API create route default**

In `src/app/api/blog/create/route.ts`, change line 49:

```typescript
// Before:
    author = "Flora Bot",
// After:
    author = "Doppler Team",
```

**Step 4: Commit**

```bash
git add src/app/api/blog/create/route.ts
git commit -m "feat: change default author from Flora Bot to Doppler Team"
```

---

## Task 3: Update Blog Create API — Accept New Fields

**Files:**
- Modify: `src/app/api/blog/create/route.ts`

**Step 1: Add new fields to request body destructuring**

At the destructuring block (lines 36-50), add the 3 new fields:

```typescript
  const {
    title,
    content,
    slug: customSlug,
    meta_description,
    meta_keywords,
    featured_image,
    source_links,
    category,
    tags,
    auto_translate = true,
    author = "Doppler Team",
    excerpt,
    webhook_url,
    // New editorial strategy fields
    template_type = "quick-take",
    source_combo,
    topic_category,
  } = body;
```

**Step 2: Add validation for template_type**

After the `if (!title || !content)` check, add:

```typescript
  const validTemplateTypes = ["quick-take", "analysis", "meme", "roundup"];
  if (template_type && !validTemplateTypes.includes(template_type)) {
    return NextResponse.json(
      { error: `template_type must be one of: ${validTemplateTypes.join(", ")}` },
      { status: 400 }
    );
  }
```

**Step 3: Include new fields in the insert statement**

Update the `blog_posts` insert (lines 77-86) to include the new columns:

```typescript
  const { data: post, error: postError } = await db
    .from("blog_posts")
    .insert({
      slug,
      author_name: author,
      status: "published",
      published_at: new Date().toISOString(),
      image_url: featured_image || null,
      template_type,
      source_combo: source_combo || null,
      topic_category: topic_category || null,
    })
    .select("id")
    .single();
```

**Step 4: Include template_type in the response**

Update the response object (lines 215-225) to include `template_type`:

```typescript
  const response = {
    blog_id: post.id,
    slug,
    english_url: englishUrl,
    russian_url: `${baseUrl}/ru/blog/${slug}`,
    all_urls: translationResults,
    all_languages: Object.keys(translationResults),
    status: "published",
    template_type,
    translation_complete: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
```

**Step 5: Verify build passes**

Run: `npm run build`

Expected: Build succeeds with no errors.

**Step 6: Commit**

```bash
git add src/app/api/blog/create/route.ts
git commit -m "feat: accept template_type, source_combo, topic_category in blog create API"
```

---

## Task 4: Casual Translation Prompt

**Files:**
- Modify: `src/lib/openai/translate.ts`

**Step 1: Add the casual translation system prompt**

After the existing `LANGUAGE_NAMES` constant (line 24), add a new constant:

```typescript
const FORMAL_SYSTEM_PROMPT = (languageName: string) =>
  `You are a professional translator for a VPN/privacy technology blog. Translate the following blog post content to ${languageName}.

Rules:
- Maintain all markdown formatting exactly
- Keep technical terms in English: VPN, DNS, IP, HTTPS, SSL, TLS, Wi-Fi, iOS, Android, macOS, Windows
- Keep brand names in English: Doppler VPN, Simnetiq, Apple, Google
- Adapt cultural references and idioms naturally
- For RTL languages (Hebrew, Arabic, Farsi, Urdu): ensure the text reads naturally in RTL
- Return valid JSON with these exact keys: title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description
- If a field is null in the input, set it to null in the output
- Do NOT add commentary — return ONLY the JSON object`;

const CASUAL_SYSTEM_PROMPT = (languageName: string) =>
  `You are translating a casual, internet-culture tech blog post to ${languageName}. This is NOT a formal article — it's written like a real person talking to friends about tech news, memes, and viral moments.

Rules:
- Maintain all markdown formatting exactly
- Keep technical terms in English: VPN, DNS, IP, HTTPS, SSL, TLS, Wi-Fi, iOS, Android, macOS, Windows
- Keep brand names in English: Doppler VPN, Simnetiq, Apple, Google
- PRESERVE the casual, conversational tone — do NOT make it more formal or professional
- Keep internet slang, meme references, and humor intact
- If a meme or cultural reference doesn't translate well, keep the original reference and add brief context if needed
- Adapt jokes and humor naturally to ${languageName} culture where possible
- For RTL languages (Hebrew, Arabic, Farsi, Urdu): ensure the text reads naturally in RTL
- Return valid JSON with these exact keys: title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description
- If a field is null in the input, set it to null in the output
- Do NOT add commentary — return ONLY the JSON object`;
```

**Step 2: Update the `translateContent` function signature**

Add an optional `templateType` parameter:

```typescript
export async function translateContent(
  source: TranslationInput,
  targetLocale: string,
  templateType?: string
): Promise<TranslationOutput> {
```

**Step 3: Use the correct prompt based on template type**

Replace the hardcoded system prompt in the `openai.chat.completions.create` call (lines 56-71) with:

```typescript
      const isCasual = templateType === "meme" || templateType === "roundup";
      const systemPrompt = isCasual
        ? CASUAL_SYSTEM_PROMPT(languageName)
        : FORMAL_SYSTEM_PROMPT(languageName);

      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              title: source.title,
              excerpt: source.excerpt,
              content: source.content,
              image_alt: source.image_alt,
              meta_title: source.meta_title,
              meta_description: source.meta_description,
              og_title: source.og_title,
              og_description: source.og_description,
            }),
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 16000,
      }, { timeout: 120_000 });
```

**Step 4: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/lib/openai/translate.ts
git commit -m "feat: add casual translation prompt for meme and roundup templates"
```

---

## Task 5: Pass template_type Through Translation Pipeline

**Files:**
- Modify: `src/app/api/blog/create/route.ts` (translation call)
- Modify: `src/app/api/blog/translate/route.ts` (re-translation endpoint)

**Step 1: Update create route to pass template_type to translateContent**

In `src/app/api/blog/create/route.ts`, find the translation loop (line 187-213). Update the `translateContent` call:

```typescript
  for (const locale of SUPPORTED_LOCALES) {
    try {
      const result = await translateContent(enSource, locale, template_type);
```

**Step 2: Update translate route to read template_type from the post**

In `src/app/api/blog/translate/route.ts`, after resolving the post (around line 57), fetch the template_type:

```typescript
  // Fetch template_type for translation prompt selection
  const { data: postData } = await db
    .from("blog_posts")
    .select("template_type")
    .eq("id", postId)
    .single();
  const templateType = postData?.template_type || "quick-take";
```

Then update the `translateContent` call inside the batch loop (line 91):

```typescript
        const result = await translateContent(enTranslation, locale, templateType);
```

**Step 3: Verify build passes**

Run: `npm run build`

Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/api/blog/create/route.ts src/app/api/blog/translate/route.ts
git commit -m "feat: pass template_type to translation pipeline for prompt selection"
```

---

## Task 6: Update Blog Status API — Include New Fields

**Files:**
- Modify: `src/app/api/blog/status/route.ts`

**Step 1: Read the current status route**

Read the file to understand the current response format.

**Step 2: Add template_type stats to the response**

Add a query for template type distribution:

```typescript
  // Template type distribution
  const { data: templateStats } = await db
    .from("blog_posts")
    .select("template_type")
    .eq("status", "published");

  const templateDistribution = (templateStats || []).reduce((acc: Record<string, number>, row) => {
    const type = row.template_type || "quick-take";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
```

Include `template_distribution` in the response `stats` object.

**Step 3: Verify build passes**

Run: `npm run build`

**Step 4: Commit**

```bash
git add src/app/api/blog/status/route.ts
git commit -m "feat: add template distribution stats to blog status endpoint"
```

---

## Task 7: n8n Workflow — Topic Discovery & Scheduling

**Context:** This workflow originally ran on VPS 72.61.87.54; n8n has since moved to n8n.dopplervpn.org (185.203.240.174). Credentials redacted 2026-07-14 — the values previously committed here are rotated/dead. Get current access from the password manager.

**IMPORTANT:** n8n Code nodes use sandbox — `$env.X` not `process.env`, `require('https')` not `fetch`, `URL` constructor not available.

**Step 1: Design the workflow structure**

Nodes:
1. **Cron Trigger** — 3 cron expressions: 08:00 UTC (morning), 13:00 UTC (midday), 18:00 UTC (afternoon)
2. **Source Rotation Code Node** — Picks source combo based on time slot + randomization. Outputs: `sources` array, `timeSlot` string
3. **Template Assignment Code Node** — Based on time slot and day of week, assigns template type. Logic:
   - Morning: always `quick-take`
   - Midday: alternates `analysis` / `meme` (based on day parity)
   - Afternoon: rotates `quick-take` / `meme` / `roundup` (roundup only Fri)
   - Weekend: favor `meme` and `roundup`
4. **Perplexity Research HTTP Node** — Sends source combo + topic constraints to Perplexity API for trending topic discovery
5. **Dedup Code Node** — Fetches last 10 titles from Supabase, compares with proposed topic, rejects duplicates
6. **Output Node** — Passes `{ topic, templateType, sourceSources, research, tweetQuotes }` to Content Generation workflow via webhook

**Step 2: Create the workflow via n8n API**

Use the n8n API at `http://localhost:5678/api/v1/workflows` on the VPS to create the workflow. Set it to active with the 3 cron triggers.

**Step 3: Test each node**

Manually trigger the workflow and verify:
- Source rotation produces valid combos
- Perplexity returns relevant trending topics
- Dedup correctly filters recent titles
- Output contains all required fields

**Step 4: Document the workflow ID in MEMORY.md**

Add the new workflow ID to the n8n workflows section.

---

## Task 8: n8n Workflow — Content Generation (Template-Aware)

**Step 1: Design template-specific system prompts**

Four system prompts, one per template type. Each stored as a Code node that selects the right prompt based on `templateType` input:

**Quick-Take prompt:**
```
You are a tech journalist writing for Doppler, a tech blog run by VPN nerds. Write a 400-600 word quick-take news article.

Structure:
1. Punchy headline (include the key news)
2. What happened (2-3 paragraphs, factual)
3. Include 2-3 real tweets/quotes as markdown blockquotes with attribution
4. "Why it matters" paragraph (only if naturally relevant to privacy/digital freedom — DO NOT force a VPN angle)
5. Source links at the bottom

Tone: Neutral-journalistic. You're reporting, not selling. Write like a tech nerd explaining news to other tech nerds.
Do NOT mention Doppler VPN or push any product.
```

**Analysis prompt:**
```
You are a tech analyst writing for Doppler, a tech blog run by VPN nerds. Write an 800-1200 word analysis piece.

Structure:
1. Compelling headline
2. Opening that hooks the reader with why this matters
3. Context and background (what led to this)
4. Deep analysis with multiple perspectives
5. Include 3-5 real tweets/quotes as markdown blockquotes with attribution
6. Use cases or implications for users
7. Privacy/VPN angle ONLY if the topic naturally connects — never forced
8. Source links at the bottom

Tone: Expert analyst. Measured but opinionated. Evidence-based verdicts.
Do NOT mention Doppler VPN or push any product.
```

**Meme/Internet Is Losing It prompt:**
```
You are a person writing for Doppler, a tech blog. Write a 300-400 word casual post about a viral moment in tech.

Structure:
1. Fun, clickable headline (internet-speak welcome)
2. What went viral and why (1-2 short paragraphs)
3. The best reactions — include 4-6 tweets/quotes as markdown blockquotes
4. Optional one-liner closing thought

Tone: Casual like texting a group chat. Humor, internet slang, meme energy. NOT professional journalism. NOT AI-sounding. Write like a real person who finds this genuinely funny or wild.
Do NOT mention Doppler VPN. This is just a fun post.
```

**Hot Take Roundup prompt:**
```
You are a person writing for Doppler, a tech blog. Write a 500-700 word roundup of the spiciest tech debates this week.

Structure:
1. Catchy headline ("This Week in Tech Discourse: ...")
2. Pick 3-4 mini-topics that had heated debate
3. For each topic: brief setup (1-2 sentences) + 2-3 opposing tweets as blockquotes
4. Brief witty commentary between topics
5. Optional closing thought

Tone: Casual, witty, like a friend recapping what happened on tech Twitter. Take no sides — present the discourse.
Do NOT mention Doppler VPN.
```

**Step 2: Build the workflow**

Nodes:
1. **Webhook Trigger** — Receives payload from Topic Discovery workflow
2. **Template Router Switch Node** — Routes to correct prompt based on `templateType`
3. **Content Generation HTTP Node** — Calls OpenAI/Perplexity with template prompt + topic + research data
4. **Tag Extraction Code Node** — Analyzes content, generates relevant tags
5. **Output Node** — Passes `{ title, content, excerpt, tags, meta_description, templateType, sourceSources, topicCategory }` to Image Pipeline

**Step 3: Test with each template type**

Create 4 test payloads (one per template) and verify output matches the expected format and word count.

---

## Task 9: n8n Workflow — Image Pipeline (Hybrid + Rule-Based)

**Step 1: Build the press kit lookup table**

Create a Code node with a company-to-image mapping:

```javascript
const PRESS_KIT_URLS = {
  "apple": "https://www.apple.com/newsroom/images/",
  "google": "https://blog.google/static/blogv2/images/",
  "openai": "https://openai.com/brand/",
  "anthropic": "https://www.anthropic.com/images/",
  "meta": "https://about.meta.com/brand/resources/",
  "microsoft": "https://news.microsoft.com/",
  "nvidia": "https://nvidianews.nvidia.com/",
  "tesla": "https://www.tesla.com/presskit",
};
```

Note: These are starting points. The actual image URLs will need to be fetched/searched per article. For v1, this serves as a flag — if the company is in this list, the image prompt to Gemini should explicitly include the company name and product context.

**Step 2: Build the decision logic**

```
Input: title, templateType, content
  |
  ├─ templateType === "meme"?
  │   └─ YES → Skip image generation (meme posts are text-focused, or use placeholder)
  │
  ├─ Title contains known company name?
  │   └─ YES → Generate image with Gemini using company-specific prompt:
  │            "Create a blog header image about [topic] featuring [company] products/branding.
  │             Style: modern tech blog, 16:9 aspect ratio"
  │
  └─ NO → Generate generic topic image with Gemini:
          "Create a blog header image about [topic]. Style: modern tech blog, 16:9 aspect ratio"
```

**Step 3: Build the workflow**

Nodes:
1. **Webhook Trigger** — Receives post data from Content Generation
2. **Company Detection Code Node** — Checks title against PRESS_KIT_URLS keys
3. **Image Prompt Builder Code Node** — Builds Gemini prompt (company-specific or generic)
4. **Gemini API HTTP Node** — Generates image (existing pattern from current workflow)
5. **Supabase Upload Code Node** — Uploads to `blog-images` bucket
6. **Output Node** — Returns `{ imageUrl, ...postData }` to Publish workflow

**Step 4: Test with different scenarios**

- Article about Apple → verify prompt includes Apple context
- Article about general privacy → verify generic prompt
- Meme post → verify image is skipped or uses placeholder

---

## Task 10: n8n Workflow — Publish & Distribute (Updated)

**Step 1: Update the existing Telegram Channel Posting workflow**

The existing workflow (ID: `aXVg56pzAPWTw7VG`) needs to accept the new fields and pass them through.

**Step 2: Update the HTTP Node that calls blog create API**

Ensure the POST body includes the new fields:

```json
{
  "title": "{{$json.title}}",
  "content": "{{$json.content}}",
  "featured_image": "{{$json.imageUrl}}",
  "tags": "{{$json.tags}}",
  "source_links": "{{$json.sourceLinks}}",
  "template_type": "{{$json.templateType}}",
  "source_combo": "{{$json.sourceSources}}",
  "topic_category": "{{$json.topicCategory}}",
  "author": "Doppler Team",
  "webhook_url": "{{$json.webhookUrl}}"
}
```

**Step 3: Update Telegram message formatting**

Different templates should have different Telegram message formats:
- Quick-Take / Analysis: Standard format with headline + excerpt + link
- Meme: Shorter, more casual emoji-heavy format
- Roundup: "Weekly roundup" framing

**Step 4: Test end-to-end**

Trigger Topic Discovery → verify Content Generation fires → verify Image Pipeline fires → verify Publish creates post → verify Telegram messages sent to both channels.

---

## Task 11: Update Admin Panel — Show Template Type

**Files:**
- Modify: `src/app/admin-dvpn/(dashboard)/posts/page.tsx`

**Step 1: Read the current admin posts page**

Understand the current table structure and data fetching.

**Step 2: Add template_type to the fetch query**

Add `template_type` to the Supabase select query.

**Step 3: Add template_type column to the table**

Add a new column showing the template type with color-coded badges:
- `quick-take` → blue badge
- `analysis` → purple badge
- `meme` → yellow badge
- `roundup` → green badge

**Step 4: Verify build passes**

Run: `npm run build`

**Step 5: Commit**

```bash
git add src/app/admin-dvpn/
git commit -m "feat: show template type in admin posts table"
```

---

## Task 12: Verify and Deploy

**Step 1: Run full build**

```bash
npm run build
```

Expected: No errors.

**Step 2: Test blog create API locally**

```bash
curl -X POST http://localhost:3000/api/blog/create \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quick Take Post",
    "content": "This is a test quick take about AI news.",
    "template_type": "quick-take",
    "source_combo": "twitter+google-trends",
    "topic_category": "ai-product-launches",
    "auto_translate": false
  }'
```

Expected: 201 response with `template_type: "quick-take"`.

**Step 3: Test template_type validation**

```bash
curl -X POST http://localhost:3000/api/blog/create \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Invalid Template",
    "content": "Test content",
    "template_type": "invalid-type"
  }'
```

Expected: 400 response with validation error.

**Step 4: Deploy to Vercel**

```bash
git push origin main
```

Vercel auto-deploys from main.

**Step 5: Verify production**

Test the blog status endpoint: `GET https://www.dopplervpn.org/api/blog/status`

Expected: Response includes template distribution stats.

---

## Execution Order Summary

| Task | What | Depends On | Type |
|------|------|-----------|------|
| 1 | DB migration (new columns) | Nothing | Supabase SQL |
| 2 | Author migration (Flora Bot → Doppler Team) | Task 1 | SQL + code |
| 3 | Blog create API (accept new fields) | Task 1 | TypeScript |
| 4 | Casual translation prompt | Nothing | TypeScript |
| 5 | Pass template_type through translation | Task 3, 4 | TypeScript |
| 6 | Blog status API (template stats) | Task 1 | TypeScript |
| 7 | n8n: Topic Discovery workflow | Task 3 deployed | n8n/VPS |
| 8 | n8n: Content Generation workflow | Task 7 | n8n/VPS |
| 9 | n8n: Image Pipeline workflow | Task 8 | n8n/VPS |
| 10 | n8n: Publish & Distribute (update) | Task 9 | n8n/VPS |
| 11 | Admin panel (show template type) | Task 1 | TypeScript |
| 12 | Verify and deploy | All above | Testing |

**Parallelizable groups:**
- Tasks 1-6 can be done in sequence quickly (all code changes)
- Tasks 7-10 are sequential (each workflow feeds the next)
- Task 11 can run parallel to Tasks 7-10
