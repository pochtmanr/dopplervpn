# Doppler VPN Landing — About Page, OG Fixes, Blog Tags, Automation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four improvements: About Us page (all 24 locales), fix localized OG previews (especially for Telegram), clean up blog tags to curated ~20 set, and document n8n automation plan.

**Architecture:** Server-rendered Next.js pages with next-intl for i18n. OG meta tags via Next.js `generateMetadata()` (server-side, SSR — critical for Telegram). Blog tags stored in Supabase `blog_tags` / `blog_post_tags` / `blog_tag_translations` tables. Admin panel at `/admin-dvpn`.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4, next-intl v3, Supabase, Framer Motion, TypeScript

---

## Chunk 1: About Us Page

### Task 1: Create About Page with generateMetadata

**Files:**
- Create: `src/app/[locale]/about/page.tsx`

- [ ] **Step 1: Create the about page with server-rendered metadata and JSON-LD**

The page needs:
- `generateMetadata()` returning localized title, description, OG tags, alternates, og:locale + og:locale:alternate
- JSON-LD Organization schema (reuse pattern from layout.tsx)
- Server component using `getTranslations({ locale, namespace: "about" })`
- Layout: Navbar, hero section (mission), trust signals grid (no-logs, encryption, server locations, open protocols), company info section (Simnetiq Ltd), CTA
- Use existing components: `<Navbar />`, `<Footer />`, `<Section />`
- Use existing ogLocaleMap from layout.tsx — extract to shared constant

```tsx
// src/app/[locale]/about/page.tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

// Shared OG locale map — same as layout.tsx
const ogLocaleMap: Record<string, string> = {
  en: "en_US", ru: "ru_RU", es: "es_ES", pt: "pt_BR", fr: "fr_FR",
  zh: "zh_CN", de: "de_DE", he: "he_IL", fa: "fa_IR", ar: "ar_SA",
  hi: "hi_IN", id: "id_ID", tr: "tr_TR", vi: "vi_VN", th: "th_TH",
  ms: "ms_MY", ko: "ko_KR", ja: "ja_JP", tl: "tl_PH", ur: "ur_PK",
  sw: "sw_KE", az: "az_AZ", pl: "pl_PL", uk: "uk_UA",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const baseUrl = "https://www.dopplervpn.org";

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: Object.fromEntries([
        ...routing.locales.map((loc) => [loc, `${baseUrl}/${loc}/about`]),
        ["x-default", `${baseUrl}/en/about`],
      ]),
    },
    openGraph: {
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
      url: `${baseUrl}/${locale}/about`,
      siteName: "Doppler VPN",
      locale: ogLocaleMap[locale] || "en_US",
      alternateLocales: routing.locales
        .filter((l) => l !== locale)
        .map((l) => ogLocaleMap[l] || l),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doppler VPN",
    legalName: "Simnetiq Ltd",
    url: "https://www.dopplervpn.org",
    logo: "https://www.dopplervpn.org/images/iosdopplerlogo.png",
    description: t("meta.description"),
    foundingDate: "2025",
    sameAs: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        {/* Hero / Mission */}
        <Section>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-text-muted leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Trust Signals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {(["noLogs", "encryption", "servers", "openProtocol"] as const).map((key) => (
              <div
                key={key}
                className="bg-bg-secondary border border-overlay/10 rounded-2xl p-6 text-center"
              >
                <div className="text-3xl mb-3">{t(`trust.${key}.icon`)}</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t(`trust.${key}.title`)}
                </h3>
                <p className="text-sm text-text-muted">
                  {t(`trust.${key}.description`)}
                </p>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-4">
              {t("mission.title")}
            </h2>
            <p className="text-text-muted leading-relaxed mb-6">
              {t("mission.description")}
            </p>
          </div>

          {/* Company Info */}
          <div className="max-w-3xl mx-auto bg-bg-secondary border border-overlay/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              {t("company.title")}
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-2">
                <dt className="text-text-muted font-medium min-w-[120px]">{t("company.nameLabel")}</dt>
                <dd className="text-text-primary">Simnetiq Ltd</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-muted font-medium min-w-[120px]">{t("company.websiteLabel")}</dt>
                <dd className="text-text-primary">dopplervpn.org</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-muted font-medium min-w-[120px]">{t("company.contactLabel")}</dt>
                <dd className="text-text-primary">support@simnetiq.store</dd>
              </div>
            </dl>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Add English translation keys**

Add `about` key to `messages/en.json`:

```json
"about": {
  "meta": {
    "title": "About Doppler VPN — Privacy-First VPN by Simnetiq Ltd",
    "description": "Learn about Doppler VPN, a privacy-first VPN built on VLESS-Reality by Simnetiq Ltd. No logs, no tracking, censorship-resistant.",
    "ogTitle": "About Doppler VPN — Privacy-First VPN",
    "ogDescription": "Learn about Doppler VPN, built on VLESS-Reality encryption. No logs, no tracking, censorship-resistant."
  },
  "hero": {
    "title": "About Doppler VPN",
    "subtitle": "We believe internet privacy is a fundamental right. Doppler VPN is built to protect your connection with cutting-edge VLESS-Reality encryption — making your traffic invisible to censors and surveillance."
  },
  "trust": {
    "noLogs": {
      "icon": "🔒",
      "title": "Strict No-Logs Policy",
      "description": "We never store, monitor, or sell your browsing data. Your activity is yours alone."
    },
    "encryption": {
      "icon": "🛡️",
      "title": "Military-Grade Encryption",
      "description": "VLESS-Reality protocol makes your VPN traffic indistinguishable from normal HTTPS."
    },
    "servers": {
      "icon": "🌍",
      "title": "Global Server Network",
      "description": "Servers across multiple countries for fast, reliable connections worldwide."
    },
    "openProtocol": {
      "icon": "⚡",
      "title": "Censorship Resistant",
      "description": "Built to work where other VPNs get blocked. Passes deep packet inspection undetected."
    }
  },
  "mission": {
    "title": "Our Mission",
    "description": "Doppler VPN was created with a simple goal: give everyone access to an open, private internet — regardless of where they live. Traditional VPNs are easily detected and blocked by governments and ISPs. Our VLESS-Reality protocol solves this by making VPN traffic look like regular web browsing, ensuring your connection stays private and accessible."
  },
  "company": {
    "title": "Company Information",
    "nameLabel": "Company",
    "websiteLabel": "Website",
    "contactLabel": "Contact"
  }
}
```

- [ ] **Step 3: Verify the page builds locally**

Run: `cd /Users/romanpochtman/Developer/doppler/landing && npm run build 2>&1 | tail -20`
Expected: Build succeeds, `/about` route appears in output

- [ ] **Step 4: Commit**

```bash
git add src/app/\[locale\]/about/page.tsx messages/en.json
git commit -m "feat: add About Us page with SEO meta and JSON-LD"
```

### Task 2: Add About translations to all 23 non-English locales

**Files:**
- Modify: `messages/ru.json`, `messages/es.json`, ... (23 files)

**IMPORTANT:** Translate ONE language at a time. Never parallel. Verify translations are in target language, not English.

- [ ] **Step 1: Translate about section for each locale sequentially**

For each of the 23 locales (ru, es, pt, fr, zh, de, he, fa, ar, hi, id, tr, vi, th, ms, ko, ja, tl, ur, sw, az, pl, uk), add the `about` key with properly translated content. Use the parallel-translator agent to translate one-by-one.

The locales are: ru, es, pt, fr, zh, de, he, fa, ar, hi, id, tr, vi, th, ms, ko, ja, tl, ur, sw, az, pl, uk

- [ ] **Step 2: Verify build with all locales**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds with all 24 locale variants of /about

- [ ] **Step 3: Commit**

```bash
git add messages/
git commit -m "feat: add About Us translations for all 24 locales"
```

### Task 3: Add About link to navigation

**Files:**
- Modify: `src/components/layout/desktop-nav.tsx` (add About link to desktop nav links)
- Modify: `src/components/layout/mobile-nav.tsx` (add About to navItems array)
- Modify: `messages/en.json` (add `nav.about` key if not present)
- Modify: all other locale files (add `nav.about` translation)

- [ ] **Step 1: Add `nav.about` key to en.json**

```json
// In nav section of en.json
"about": "About"
```

- [ ] **Step 2: Add About link to desktop nav**

In `desktop-nav.tsx`, after the Downloads link (~line 122-127), add:

```tsx
<Link
  href="/about"
  className="text-text-muted hover:text-text-primary transition-colors text-sm font-medium px-3 py-2"
>
  {t("about")}
</Link>
```

- [ ] **Step 3: Add About link to mobile nav**

In `mobile-nav.tsx`, add to `navItems` array (~line 65-68):

```ts
const navItems = [
  { href: "/downloads", label: t("downloads"), isPage: true },
  { href: "/about", label: t("about"), isPage: true },
  { href: "/support", label: t("support"), isPage: true },
];
```

- [ ] **Step 4: Add `nav.about` translations to all 23 other locales**

Translate the word "About" to each locale. Simple one-word translations.

- [ ] **Step 5: Verify navigation renders**

Run: `npm run dev` and check both desktop and mobile nav show the About link.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/desktop-nav.tsx src/components/layout/mobile-nav.tsx messages/
git commit -m "feat: add About link to desktop and mobile navigation"
```

---

## Chunk 2: Fix Localized OG Previews

### Task 4: Fix og:locale on blog post pages

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

Currently, blog post `generateMetadata()` hardcodes `locale: locale === "he" ? "he_IL" : "en_US"` (line 110). It should use the full `ogLocaleMap`.

- [ ] **Step 1: Fix og:locale mapping in blog post metadata**

In `src/app/[locale]/blog/[slug]/page.tsx`, replace the `openGraph` section in `generateMetadata()`:

Replace:
```tsx
locale: locale === "he" ? "he_IL" : "en_US",
```

With:
```tsx
locale: ogLocaleMap[locale] || "en_US",
```

Also import or define `ogLocaleMap` (same map as layout.tsx).

- [ ] **Step 2: Add og:locale:alternate to blog posts**

In the same `generateMetadata()`, add `alternateLocales` to the openGraph config:

```tsx
alternateLocales: routing.locales
  .filter((l) => l !== locale)
  .map((l) => ogLocaleMap[l] || l),
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\[locale\]/blog/\[slug\]/page.tsx
git commit -m "fix: use correct og:locale per language on blog posts"
```

### Task 5: Add og:locale:alternate to layout.tsx (landing page)

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

Currently the layout's `generateMetadata()` sets `locale` but not `alternateLocales` in openGraph.

- [ ] **Step 1: Add alternateLocales to landing page OG**

In `layout.tsx` `generateMetadata()`, add to the `openGraph` object:

```tsx
alternateLocales: routing.locales
  .filter((l) => l !== locale)
  .map((l) => ogLocaleMap[l] || l),
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\[locale\]/layout.tsx
git commit -m "fix: add og:locale:alternate for all 24 languages on landing"
```

### Task 6: Extract ogLocaleMap to shared constant

**Files:**
- Create: `src/lib/og-locale-map.ts`
- Modify: `src/app/[locale]/layout.tsx` (import from shared)
- Modify: `src/app/[locale]/blog/[slug]/page.tsx` (import from shared)
- Modify: `src/app/[locale]/about/page.tsx` (import from shared)

- [ ] **Step 1: Create shared ogLocaleMap**

```ts
// src/lib/og-locale-map.ts
export const ogLocaleMap: Record<string, string> = {
  en: "en_US", ru: "ru_RU", es: "es_ES", pt: "pt_BR", fr: "fr_FR",
  zh: "zh_CN", de: "de_DE", he: "he_IL", fa: "fa_IR", ar: "ar_SA",
  hi: "hi_IN", id: "id_ID", tr: "tr_TR", vi: "vi_VN", th: "th_TH",
  ms: "ms_MY", ko: "ko_KR", ja: "ja_JP", tl: "tl_PH", ur: "ur_PK",
  sw: "sw_KE", az: "az_AZ", pl: "pl_PL", uk: "uk_UA",
};
```

- [ ] **Step 2: Update imports in all three pages**

Replace local `ogLocaleMap` definitions with:
```ts
import { ogLocaleMap } from "@/lib/og-locale-map";
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -20`

- [ ] **Step 4: Commit**

```bash
git add src/lib/og-locale-map.ts src/app/\[locale\]/layout.tsx src/app/\[locale\]/blog/\[slug\]/page.tsx src/app/\[locale\]/about/page.tsx
git commit -m "refactor: extract ogLocaleMap to shared constant"
```

### Task 7: Verify OG tags are server-rendered (Telegram compatibility)

- [ ] **Step 1: Build and check HTML output**

Run: `npm run build && npm run start` (background), then:
```bash
curl -s http://localhost:3000/en | grep -i 'og:' | head -10
curl -s http://localhost:3000/ru | grep -i 'og:' | head -10
curl -s http://localhost:3000/ar | grep -i 'og:' | head -10
```

Expected: `<meta property="og:locale" content="en_US">`, `<meta property="og:locale" content="ru_RU">`, `<meta property="og:locale" content="ar_SA">` respectively, all in the initial HTML (not injected by JS).

- [ ] **Step 2: Check blog post OG tags**

```bash
curl -s http://localhost:3000/ru/blog/<any-slug> | grep -i 'og:title'
```

Expected: Russian title in the og:title meta tag.

- [ ] **Step 3: Document verification results**

No commit needed — this is a verification step.

---

## Chunk 3: Blog Tag Cleanup

### Task 8: Define curated tag list as a constant

**Files:**
- Create: `src/lib/blog-tags.ts`

- [ ] **Step 1: Create the curated tag list**

```ts
// src/lib/blog-tags.ts

/** Curated set of allowed blog tags. Slugs must match Supabase blog_tags.slug. */
export const CURATED_BLOG_TAGS = [
  { slug: "privacy", name: "Privacy" },
  { slug: "vpn-guide", name: "VPN Guide" },
  { slug: "security", name: "Security" },
  { slug: "censorship", name: "Censorship" },
  { slug: "streaming", name: "Streaming" },
  { slug: "travel", name: "Travel" },
  { slug: "speed", name: "Speed" },
  { slug: "protocol", name: "Protocol" },
  { slug: "setup-guide", name: "Setup Guide" },
  { slug: "news", name: "News" },
  { slug: "comparison", name: "Comparison" },
  { slug: "mobile", name: "Mobile" },
  { slug: "desktop", name: "Desktop" },
  { slug: "router", name: "Router" },
  { slug: "business", name: "Business" },
  { slug: "free-vpn", name: "Free VPN" },
  { slug: "no-logs", name: "No-Logs" },
  { slug: "encryption", name: "Encryption" },
  { slug: "server-network", name: "Server Network" },
  { slug: "tips-and-tricks", name: "Tips & Tricks" },
] as const;

export const CURATED_TAG_SLUGS = CURATED_BLOG_TAGS.map((t) => t.slug);

export function isValidTagSlug(slug: string): boolean {
  return CURATED_TAG_SLUGS.includes(slug);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/blog-tags.ts
git commit -m "feat: define curated blog tag list"
```

### Task 9: Validate tags in blog create API

**Files:**
- Modify: `src/app/api/blog/create/route.ts`

- [ ] **Step 1: Add tag validation to blog create**

Import and use the curated tag list. In the tag attachment loop (~line 170-186), validate each tag slug against the curated list before upserting.

After the tag assignment section, add validation:

```ts
import { CURATED_TAG_SLUGS } from "@/lib/blog-tags";

// Replace the tag handling section (lines ~170-186) with:
if (tags && tags.length > 0) {
  const invalidTags: string[] = [];
  for (const tagName of tags) {
    const tagSlug = slugify(tagName);
    if (!CURATED_TAG_SLUGS.includes(tagSlug)) {
      invalidTags.push(tagName);
      continue;
    }
    const { data: tag } = await db
      .from("blog_tags")
      .upsert({ slug: tagSlug }, { onConflict: "slug" })
      .select("id")
      .single();

    if (tag) {
      await db.from("blog_post_tags").insert({
        post_id: post.id,
        tag_id: tag.id,
      });
    }
  }
  if (invalidTags.length > 0) {
    console.warn(`[blog/create] Skipped invalid tags: ${invalidTags.join(", ")}`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/blog/create/route.ts
git commit -m "feat: validate blog tags against curated list in create API"
```

### Task 10: Migrate existing blog tags in Supabase

This is a database operation. Cannot be done in code — needs to be run via Supabase SQL editor or migration.

- [ ] **Step 1: Write migration SQL**

Create a SQL script (don't run automatically — Roman needs to review):

```sql
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
WHERE bt.slug IN ('privacy', 'vpn-guide', 'security', 'censorship', 'streaming', 'travel', 'speed', 'protocol', 'setup-guide', 'news', 'comparison', 'mobile', 'desktop', 'router', 'business', 'free-vpn', 'no-logs', 'encryption', 'server-network', 'tips-and-tricks')
ON CONFLICT (tag_id, locale) DO NOTHING;

-- 3. View existing non-curated tags and their post count (for manual review before deletion)
SELECT bt.slug, bt.id, COUNT(bpt.post_id) as post_count
FROM blog_tags bt
LEFT JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
WHERE bt.slug NOT IN ('privacy', 'vpn-guide', 'security', 'censorship', 'streaming', 'travel', 'speed', 'protocol', 'setup-guide', 'news', 'comparison', 'mobile', 'desktop', 'router', 'business', 'free-vpn', 'no-logs', 'encryption', 'server-network', 'tips-and-tricks')
GROUP BY bt.slug, bt.id
ORDER BY post_count DESC;
```

Save to: `docs/migrations/2026-03-12-curated-blog-tags.sql`

**NOTE:** After reviewing the orphan tags query output, Roman will need to manually map old tags → curated tags or delete the associations. This cannot be automated safely.

- [ ] **Step 2: Commit the migration script**

```bash
git add docs/migrations/2026-03-12-curated-blog-tags.sql
git commit -m "docs: add blog tag migration SQL for curated tag cleanup"
```

### Task 11: Update admin panel tag selector to use curated list

**Files:**
- Modify: `src/app/admin-dvpn/(dashboard)/posts/new/page.tsx`
- Modify: `src/app/admin-dvpn/(dashboard)/posts/[id]/page.tsx`

Currently both pages fetch tags from Supabase with `getTags()`. After migration, Supabase will only have curated tags, so no code change is strictly needed. However, to be defensive, we can filter the tags client-side.

- [ ] **Step 1: Add curated tag filtering to PostForm**

In `src/components/admin/post-form.tsx`, import and filter:

```ts
import { CURATED_TAG_SLUGS } from "@/lib/blog-tags";

// In the component, filter availableTags:
const filteredTags = availableTags.filter((tag) =>
  CURATED_TAG_SLUGS.includes(tag.slug)
);
```

Then use `filteredTags` instead of `availableTags` in the tag rendering section.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/post-form.tsx
git commit -m "feat: filter admin tag selector to curated tags only"
```

---

## Chunk 4: SEO/Marketing Automation Plan

### Task 12: Audit n8n workflows on VPS

This is an infrastructure task, not a code task. Use the vps-ops or n8n-automation-manager agent.

- [ ] **Step 1: SSH to VPS and list n8n workflows**

Connect to VPS 72.61.87.54, check n8n status, list active workflows.

- [ ] **Step 2: Document findings**

Create `docs/automation/n8n-audit-2026-03-12.md` with:
- List of existing workflows and their status
- What triggers they use
- What they do (Telegram posting, etc.)

- [ ] **Step 3: Create marketing automation plan**

Create `docs/automation/marketing-pipeline-plan.md` with the plan for:
1. **Auto-post to Telegram channels** — n8n workflow triggered by Supabase webhook on blog_posts status change to "published"
   - Post to @dopplervpn (RU channel) with Russian translation
   - Post to @dopplervpnen (EN channel) with English content
   - Include image, title, excerpt, link
2. **Scheduled content distribution** — n8n cron workflow that checks for unpromoted posts
3. **SEO ping** — n8n workflow that pings Google Indexing API and Bing URL Submission API when a new post is published
4. **Full pipeline overview:**
   ```
   Content Calendar (manual/Supabase)
   → AI Generation (POST /api/blog/create with auto_translate=true)
   → Published in Supabase
   → n8n webhook fires
   → Post to Telegram RU + EN channels
   → Ping Google + Bing indexing APIs
   → Track in analytics
   ```

- [ ] **Step 4: Commit docs**

```bash
git add docs/automation/
git commit -m "docs: add n8n audit and marketing automation pipeline plan"
```

---

## Execution Order

1. **Task 6** (extract ogLocaleMap) — do first since other tasks depend on it
2. **Task 1** (About page) — depends on ogLocaleMap
3. **Task 4-5** (fix OG locales) — depends on ogLocaleMap
4. **Task 3** (nav links) — depends on About page existing
5. **Task 2** (About translations) — can run after Task 1
6. **Task 7** (verify OG) — after Tasks 4-5
7. **Task 8** (curated tag list) — independent
8. **Task 9** (validate in API) — depends on Task 8
9. **Task 10** (migration SQL) — depends on Task 8
10. **Task 11** (admin filter) — depends on Task 8
11. **Task 12** (n8n audit) — fully independent, can run in parallel

## Parallelization Opportunities

These groups can run simultaneously:
- **Group A:** Tasks 6 → 1 → 4 → 5 → 3 → 7 (About page + OG fixes)
- **Group B:** Tasks 8 → 9 → 10 → 11 (Blog tags)
- **Group C:** Task 12 (n8n audit — fully independent)

After Group A tasks 1+6 are done:
- **Group D:** Task 2 (translations — sequential by memory constraint but independent of other groups)
