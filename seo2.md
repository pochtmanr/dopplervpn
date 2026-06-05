Ads.txt Validation Test
How to pass this test?
The ads.txt file is a public list of the advertising vendors authorized to sell your inventory programmatically. A correctly formatted ads.txt protects against domain spoofing in the ad supply chain and is required for inclusion in many premium advertising marketplaces. Fixing this issue means publishing a valid ads.txt at the site root with current authorized seller entries.

Example
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
example-ssp.com, 12345, RESELLER
contact=ads@example.com
Where to make the change
Raw HTML or static site: upload ads.txt to the site root so it is served at https://example.com/ads.txt.
WordPress: use a small plugin or upload the file via FTP. Some advertising plugins manage it automatically based on connected accounts.
Shopify: upload the file through the theme code editor as an asset, then expose it at the root via a route configuration.
Cloudflare or similar CDN: serve ads.txt from a worker if you do not have file-system access at the origin.
Common causes and how to resolve them
File missing: create one with at least your direct advertising relationships.
File at the wrong path: ads.txt must be at the domain root, not in a subdirectory.
Wrong relationship value: use DIRECT for direct seller relationships, RESELLER for authorized resellers. Other values are invalid.
Stale entries: partners change; remove relationships you no longer have so spoofers cannot exploit them.
Returning HTML instead of plain text: the file must be served as text/plain. A page that returns HTML or a 404 fails validation.
Best practices
Audit quarterly: stale entries are the main source of ads.txt vulnerabilities.
Mirror app-ads.txt for mobile inventory: apps use a parallel app-ads.txt file with the same syntax.
Add a contact line: include a contact=email@example.com line so vendors can reach the right person about ad-quality issues.

Custom 404 Error Page Test

How to pass this test?
This test fails when the site does not serve a branded, helpful page for missing URLs. A custom 404 keeps users on the site by offering navigation, search, and suggested links rather than dropping them at the browser's generic error screen. Fixing this issue means designing a 404 template, ensuring it returns the correct HTTP 404 status, and pointing your server at it.

Where to make the change
Server configuration: point your web server at a custom 404 page. In Nginx, use error_page 404 /404.html;. In Apache, use ErrorDocument 404 /404.html.
WordPress: create a 404.php template in your theme. WordPress invokes it automatically for missing URLs.
Shopify: edit the 404.liquid template in the theme code editor.
Wix or Squarespace: use the platform's built-in 404 page editor in site settings.
Headless or framework sites: Next.js uses not-found.js, Astro uses 404.astro, and similar frameworks all have a convention for the missing-route page.
Common causes and how to resolve them
No custom 404 at all: create one. The minimum is the site header, navigation, a clear "page not found" message, and links to popular sections.
404 page returns HTTP 200: a "soft 404" confuses search engines. Verify the response status with DevTools or curl, and configure the server to return 404 for missing routes.
404 page redirects to homepage: redirecting users to the homepage hides broken URLs from analytics and search engines. Show a real 404 instead.
Generic browser error visible: the server is not invoking the custom template. Check the configuration directive.
Best practices
Keep the site chrome: show the header, footer, and navigation so users do not feel lost.
Offer next steps: a search box, popular links, or category navigation help users get back on track.
Track 404s: log missing-URL hits in analytics so you can spot broken inbound links worth fixing or redirecting.
Be clear about the error: "Sorry, that page does not exist" is better than vague messaging that confuses users.

Plaintext Emails Test

How to pass this test?
This test fails when the page exposes one or more email addresses in plain text. Spam-harvesting bots scrape pages for plaintext addresses and add them to bulk mailing lists. Fixing this issue means obfuscating contact addresses, using a contact form, or rendering them via JavaScript so simple scrapers cannot read them.

Where to make the change
Application code or templates: replace plain contact@example.com text with one of the obfuscation techniques below.
WordPress: a contact form plugin handles email submissions without exposing the address. Some SEO and security plugins also offer email obfuscation.
Shopify, Wix, Squarespace: use the platform's built-in contact form blocks rather than displaying the email address directly.
Common causes and how to resolve them
Plain text address in a paragraph or footer: replace with a contact form, an obfuscated rendering (HTML entities, CSS reversal), or a JavaScript-built mailto link.
Mailto link with the address visible: the visible text is what bots read. Make the visible text a label like "Email us" while the href still works.
Address baked into images is fine for SEO but bad for accessibility: screen readers cannot read it. Pair an image with a contact form instead.
Best practices
Prefer contact forms: they reduce spam and make analytics easier.
Use HTML entity encoding: writing &#99;&#111;... for the address defeats the simplest scrapers, though sophisticated ones decode it.
Render via JavaScript: building the mailto link client-side blocks scrapers that only read static HTML.
Consider a Cloudflare-style email obfuscation: some CDNs automatically rewrite plaintext emails to obfuscated equivalents.

Render Blocking Resources Test
How to pass this test?
This test fails when JavaScript or CSS resources block the browser from rendering visible content. Each render-blocking file delays the first paint, and on slower networks the cumulative impact can be severe. Fixing this issue means inlining the truly critical CSS, deferring or asynchronously loading non-essential scripts, and removing unused code.

Example
<head>
  <!-- Inline only above-the-fold critical CSS -->
  <style>/* critical styles here */</style>

  <!-- Load full stylesheet asynchronously -->
  <link rel="preload" href="/styles/main.css" as="style"
        onload="this.onload=null;this.rel='stylesheet'">

  <!-- Defer non-critical scripts -->
  <script src="/scripts/app.js" defer></script>
</head>
Where to make the change
Application code or templates: identify the CSS and JavaScript needed for the initial render and load only those synchronously. Defer the rest.
Build pipeline: use a critical CSS extractor (such as critical or penthouse) to generate the above-the-fold styles automatically.
WordPress: performance plugins offer "delay JS execution" and "load CSS asynchronously" options that handle most of this without code changes.
Headless or framework sites: use the framework's preload and code-splitting hints to control what blocks rendering.
Common causes and how to resolve them
Single large stylesheet blocking render: inline critical CSS for the first viewport, load the full stylesheet asynchronously.
Synchronous third-party scripts in the head: add defer or async, or move them to the end of the body.
Web fonts blocking text rendering: add font-display: swap in @font-face rules so the fallback font shows immediately.
Render-blocking @import in CSS: replace with separate <link rel="stylesheet"> tags so the browser can fetch them in parallel.
Best practices
Use defer for scripts that need the DOM: they execute after parsing but before DOMContentLoaded.
Use async for fully independent scripts: they execute as soon as they download, in any order.
Preload the critical request chain: tell the browser early about fonts and key assets with <link rel="preload">.
Audit with Lighthouse: the Render-blocking resources audit lists every offending file with the estimated time saved by deferring it.

CDN Usage Test
How to pass this test?
A Content Delivery Network serves static assets from edge locations close to the user, reducing latency, improving cache hit rates, and offloading traffic from the origin server. Fixing this issue means routing your images, JavaScript, CSS, and fonts through a CDN so visitors anywhere in the world get fast, consistent delivery.

Where to make the change
Cloud platforms: Cloudflare, Fastly, AWS CloudFront, Bunny.net, and similar providers offer free or low-cost CDN tiers. Sign up, point your domain through the CDN, and enable caching for static asset paths.
WordPress: use a CDN integration plugin or sign up directly with Cloudflare and update the site's nameservers.
Shopify: Shopify serves storefront assets through its own CDN automatically; the failure usually points at custom assets uploaded outside the platform.
Headless or framework sites: deploying to Vercel, Netlify, or Cloudflare Pages puts the entire site behind a global CDN by default.
Common causes and how to resolve them
No CDN at all: add one. Even a free Cloudflare account in front of an existing host produces measurable speed gains.
CDN configured but bypassed for some assets: ensure all img, script, link, and font URLs use the CDN hostname rather than the origin.
Cache headers prevent caching: long-lived assets need cache-control headers like public, max-age=31536000, immutable. Without them, the CDN cannot cache effectively.
Origin-only third-party scripts: many vendors already serve their scripts via their own CDN. Use the URL the vendor provides rather than self-hosting.
Best practices
Use a versioned asset path: filenames like app.a3f9.css let you set far-future cache headers without ever serving stale files. Update the filename when content changes.
Enable Brotli at the edge: most CDNs can compress responses on the fly, including text formats.
Pre-warm caches for new launches: after a major release, request key URLs through every region (or use the CDN's purge-and-prefetch tools) so users do not hit cold caches.
Page Objects Test
7% of top 100 sites passed
This webpage is using more than 20 http requests, which can slow down page loading and negatively impact user experience!
Content size by content type
Content type
Percent
Size
other
51.0 %
632.27 Kb
javascript
19.0 %
235.75 Kb
font
10.3 %
127.91 Kb
image
9.7 %
120.03 Kb
html
8.4 %
104.72 Kb
css
1.6 %
20.02 Kb
TOTAL
100%
1.21 Mb
Requests by content type
Content type
Percent
Requests
image
57.8 %
52
javascript
22.2 %
20
other
8.9 %
8
font
7.8 %
7
css
2.2 %
2
html
1.1 %
1
TOTAL
100%
90
Content size by domain
Domain
Percent
Size
dopplervpn.org
100.0 %
1.21 Mb
TOTAL
100%
1.21 Mb
Requests by domain
Domain
Percent
Requests
dopplervpn.org
100.0 %
90
TOTAL
100%
90

Google Analytics Test

How to pass this test?
Google Analytics 4 is a free measurement platform that records visitor behavior, traffic sources, and conversion data. Installing it does not directly affect rankings, but the data it produces is essential for measuring SEO performance, identifying high-value pages, and prioritizing future optimization work. Fixing this issue means installing the GA4 tag site-wide and confirming events appear in your reports.

Example
<!-- Place inside <head> on every page -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
Where to make the change
Raw HTML: paste the GA4 snippet into the <head> of every page. A shared layout file is the cleanest place.
WordPress: use a site-kit or analytics plugin, or paste the snippet into your theme's header file. Avoid duplicating the tag across multiple plugins.
Shopify: add the GA4 measurement ID under Online Store, Preferences, Google Analytics, or install the official Google channel app.
Wix or Squarespace: both platforms offer a GA4 measurement ID field in their analytics settings panel.
Headless or framework sites: install via Google Tag Manager or use the framework's analytics integration so the tag fires on every route change.
Common causes and how to resolve them
Tag not installed at all: install GA4 using the snippet above or the platform-specific path.
Universal Analytics tag still in place: Universal Analytics stopped processing data on July 1, 2024. Replace any UA tag (UA-...) with a GA4 measurement ID (G-...).
Tag fires only on the homepage: ensure the snippet is in a shared template loaded by every page, not pasted into one post.
Cookie banner blocks the tag before consent: integrate Consent Mode v2 so GA4 receives anonymized signals before consent and full data after.
Tag duplicated: two snippets on the same page double-count sessions. Audit with the Tag Assistant browser extension and remove duplicates.
Best practices
Verify with real-time reports: after installing, open GA4's Realtime view and load the site to confirm events arrive.
Use Google Tag Manager: for any site beyond the simplest, GTM gives you a single place to manage analytics, conversion tags, and third-party scripts without code changes.
Configure key events: mark conversions (purchase, lead, signup) as key events so reports highlight what matters for SEO ROI.
Link to Search Console: connecting GA4 to Search Console surfaces organic queries alongside on-site behavior in the same reports.
Image Aspect Ratio Test
How to pass this test?
This test fails when one or more images are rendered at an aspect ratio meaningfully different from the source file's native ratio, producing stretched or squashed visuals. Fixing this issue means either using width and height attributes that match the file's real dimensions or replacing the source with a correctly proportioned crop.

Example
<!-- Source file is 1600 x 900 (16:9). Set matching attributes: -->
<img src="/images/marathon-1600.jpg"
     alt="Marathon runners at sunrise"
     width="1600" height="900"
     style="max-width: 100%; height: auto;">
Where to make the change
Raw HTML and CSS: set the width and height attributes to the source file's native dimensions. Use CSS height: auto when scaling responsively so the browser preserves the ratio.
WordPress: when inserting an image via the block editor, choose the image's intended size rather than overriding dimensions in custom CSS.
Shopify, Wix, or Squarespace: use the platform's built-in image cropper so the displayed crop matches the source file you upload.
Headless or framework sites: components like next/image require both width and height, which prevents distortion when the layout scales.
Common causes and how to resolve them
Hard-coded width and height that do not match the file: recompute them from the source dimensions or remove them and rely on the file's intrinsic ratio.
Container has a fixed height that crops the image: use CSS object-fit: cover if cropping is intentional, or change the container so the image keeps its natural ratio.
Wrong source file uploaded: swap in a correctly proportioned crop rather than stretching the wrong file in CSS.
Best practices
Always set both width and height: the browser uses these to reserve space and avoid layout shift before the image loads, which helps CLS.
Use object-fit when cropping is intentional: cover fills the container without distortion; contain letterboxes to preserve the full image.
Standardize on a few aspect ratios: picking one or two ratios per template makes it easier to crop assets consistently and avoid one-off distortions.
This webpage contains too many H2 tags! H2 tags should re-inforce the related content of your page to search engines - too many tags may make the topic less clear, or look like spam tactics. Consider using less than 10 H2 tags.
H1 tags
Doppler VPN — Works where other VPNs get blocked.
H2 tags
Doppler VPN on every device
How Doppler VPN Protects Your Traffic
Why Doppler Is the Best VPN for Privacy
Faster than the rest
Built to Bypass Government Censorship
Doppler vs. Traditional VPNs
Who Uses Doppler
Global Server Network
Simple, transparent pricing
Premium protection, fair price
What We Don't Store
Get started in seconds
Frequently asked questions
Download Doppler VPN
Latest from Our Blog

Meta Description Test
92% of top 100 sites passed
This webpage is using a meta description tag with a length of 136 characters. We recommend using well-written and inviting meta descriptions with a length between 150 and 220 characters (spaces included).
Text: Doppler VPN — fast, private VPN with VLESS-Reality encryption. No logs, bypasses censorship. Available on iOS, Android, macOS & Windows.
Length: 136 characters
