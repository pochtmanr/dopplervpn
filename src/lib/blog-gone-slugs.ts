// Slugs permanently removed after the Feb–Apr 2026 AI-slop incident.
// When requested under any locale, middleware returns HTTP 410 Gone so
// Google de-indexes them faster than a 404 would. See GSC Coverage report
// 2026-04-17 for the source list of 157 affected URLs.
//
// Two legit topic slugs from the 404 list are intentionally NOT here:
//   - stay-safe-on-public-wifi
//   - why-vpn-matters-2025
// These are being re-published as new, high-quality evergreen posts.
//
// Nov 2026: publisher slugs with `--` (empty kebab segments) used to soft-404
// in GSC — middleware rejected them while sitemap/index still listed them.
// Listed here so they 410 and leave indexable surfaces; unpublish in Supabase when convenient.
//
// Nov 2026 index cleanup: low-value tech-news posts with no clicks and
// negligible impressions across all locales (see .local/blog-cleanup/).
export const GONE_BLOG_SLUGS = new Set([
  "ai-agent-deletes-production-database-exposing-risks-of-autonomous-systems",
  "ais-new-frontier-how-big-tech-startups-and-spacex-are-shaping-the-next-wave-of-intelligence",
  "amazon-deepens-anthropic-bet-with-5-billion-investment-and-100-billion-cloud-pact",
  "apple-march-2026-global-event-new-macbooks-ipads-and-privacy-first-ai-features-coming",
  "cisa-to-issue-directive-on-ai-executive-order-with-focus-on-vulnerability-management",
  "claude-opus-46-launches-why-privacy-first-ai-agents-matter-for-your-data-security",
  "cloudflare-says-ai-made-1100-jobs-obsolete-as-revenue-hits-record-high",
  "consolidation-and-acceleration-how-big-tech-ai-startups-and-space-players-are-reframing-the-next-wav",
  "eff-says-defend-ip-would-turn-copyright-allegations-into",
  "eu-says-meta-may-have-breached-child-safety-rules-on-instagram-and-facebook",
  "european-lawmaker-probing-pegasus-abuses-was-hacked-with-pegasus-report-says",
  "eus-digital-omnibus-package-tightens-tech-enforcement-in-2026-what-us-companies--mm13ayzw",
  "federal-state-ai-regulation-clash-heats-up-trumps-litigation-task-force-targets--mm0m5qmo",
  "first-documented-ransomware-operation-run-entirely-by-an-ai-agent-raises-new-security-concerns",
  "gm-settles-california-lawsuit-over-onstar-driving-data-sales",
  "google-agrees-to-pay-spacex-920-million-a-month-for-ai-compute",
  "google-to-invest-up-to-40-billion-in-anthropic-as-ai-compute-race-intensifies",
  "how-big-tech-ai-startups-and-spacex-are-reconfiguring-the-next-wave-of-intelligence",
  "i-need-the-event-how-to-get-a-timely-evidence-based-policy-analysis-from-me",
  "image-test-post",
  "nationwide-drone-restriction-sparks-first-amendment-concerns",
  "navigating-the-ai-landscape-insights-from-aws-chief-matt-garman",
  "need-the-tea-which-viral-moment-should-i-cover",
  "openai-and-broadcom-unveil-jalapeo-chip-for-large-language-model-inference",
  "openai-files-confidentially-for-ipo-as-ai-rivals-push-toward-public-markets",
  "openai-plans-desktop-superapp-to-streamline-user-experience",
  "pipeline-auth-test-1774099312",
  "quick-check-before-i-write-that-viral-roundup",
  "quick-check-which-viral-moment-do-you-mean",
  "quick-reality-check-on-that-research-blowup",
  "research-which-development-should-i-cover-today",
  "sonicwall-cve-2026-19868-who-is-exposed-and-what-to-do-now",
  "telecom-cyber-siege-salt-typhoon-ransomware-surges-and-why-your-data-is-the-new--mlyh0sji",
  "the-great-ai-regulation-showdown-how-states-are-forcing-a-constitutional-crisis--mm050aph",
  "the-openvpn-sunset-why-top-vpns-are-ditching-it-in-2026-and-what-you-need-to-do--mlyakeg8",
  "undefined",
  "washington-state-advances-ai-guardrails-amid-data-center-backlash-what-it-means--mma540sc",
  "which-research-blew-up-today",
  "which-research-moment-from-today-should-i-cover",
  "white-house-reportedly-pushes-openai-to-limit-gpt-56-release-over-safety-concerns",
]);

// Per-locale removals for posts we keep in at least one language (always
// retain English). Middleware returns 410; sitemap/hreflang omit these.
// Generated from Search Console keep/remove classification — do not hand-edit
// casually; regenerate from .local/blog-cleanup/classify_blog.py output.
export const GONE_BLOG_TRANSLATIONS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["1m-context-is-now-generally-available-for-opus-46-and-sonnet-46", new Set(["ar", "de", "es", "fa", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["ai-agents-are-becoming-a-new-identity-problem-for-enterprise-security-teams", new Set(["ar", "de", "fa", "fr", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["ai-chip-startup-cerebras-files-for-ipo-after-aws-and-openai-deals", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["ai-is-turning-bug-hunting-into-a-faster-costlier-arms-race", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["amazon-and-openai-announce-50b-multi-year-strategic-partnership", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "pt", "ru", "sw", "tr", "vi", "zh"])],
  ["anthropic-calls-for-a-global-slowdown-in-ai-development-over-fears-systems-could-build-successors", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["anthropic-previews-mythos-in-cybersecurity-push-with-amazon-apple-microsoft-and-others", new Set(["ar", "de", "es", "fr", "hi", "id", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["anthropic-releases-claude-opus-47-pushing-its-coding-and-vision-capabilities-further", new Set(["ar", "fr", "ja", "ko", "ms", "pt", "ru", "sw", "tl", "tr", "vi"])],
  ["anthropic-s-30b-raise-privacy-risks-and-vpn-protection", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apple-and-meta-push-back-on-canadian-bill-over-encryption-concerns", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apple-event-march-2026-privacy-first-m5-macbooks-and-enhanced-security-features", new Set(["es", "fa", "fr", "he", "hi", "pt", "ru", "sw", "vi"])],
  ["apple-faces-scrutiny-over-alleged-youtube-video-scraping-for-ai-training", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apple-kicks-off-a-three-day-spring-event", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apple-march-4-event-five-new-products-set-to-launch-what-privacy-conscious-users-need-to-know", new Set(["ar", "de", "es", "fa", "fr", "he", "ko", "ms", "pt", "ru", "tr", "zh"])],
  ["apple-march-4-event-global-media-experience-signals-major-product-launches-in-2026", new Set(["ar", "de", "es", "fr", "he", "pt", "ru", "zh"])],
  ["apple-patches-critical-zero-day-exploit-why-vpns-are-your-next-line-of-defense", new Set(["ar", "es", "fr", "he", "pt", "ru", "zh"])],
  ["apple-patches-ios-flaw-that-could-expose-deleted-notification-data-from-apps-like-signal", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["apple-pushes-back-on-eu-plan-that-could-force-android-open-to-rival-ai-services", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apple-s-ai-wearables-and-your-privacy-risks-protections-and-how-a-vpn-helps", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apple-smart-glasses-2026-the-end-of-anonymous-public-spaces", new Set(["es", "fr", "he", "pt", "ru", "zh"])],
  ["apple-vision-pro-successor-smart-glasses-could-transform-privacy-forever", new Set(["ar", "es", "fr", "he", "ko", "pt", "ru", "tl", "zh"])],
  ["apples-hide-my-email-change-could-make-anonymous-sign-ups-easier-to-spot", new Set(["ar", "de", "es", "fa", "he", "hi", "id", "ja", "ms", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["apples-hide-my-email-feature-may-be-exposing-real-addresses-researcher-says", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["apples-ios-27-could-let-users-pick-third-party-ai-models-for-iphone-tasks", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apples-march-3-drop-iphone-17e-and-m4-ipad-air-tighten-the-midrange-and-tablet-lines", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apples-march-4-2026-event-macbook-neo-iphone-17e-m4-ipad-air-and-n1-powered-macs", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "tl", "tr", "vi", "zh"])],
  ["apples-new-gen-ai-subdomain-points-to-major-wwdc-ai-push", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apples-new-siri-ai-features-will-skip-the-eu-over-regulatory-concerns", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apples-siri-revamp-may-lean-on-auto-deleting-chats-to-ease-privacy-concerns", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["apples-smart-glasses-could-be-privacys-biggest-challenge-yet", new Set(["ar", "de", "es", "he", "pt", "ru", "sw"])],
  ["apples-wwdc-2026-live-blog-returns-as-attention-turns-to-siri-and-ai", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["big-tech-ai-startups-and-spacex-mapping-the-competitive-and-strategic-landscape-of-ais-next-phase", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["blocking-the-internet-archive-wont-stop-ai-training-it-will-erase-the-webs-memory", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["breaking-the-blackout-iranian-protestors-use-bitchat-and-noghteha-to-bypass-crackdown", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["bret-taylor-says-ai-agents-are-set-to-replace-click-based-software-interfaces", new Set(["ar", "de", "es", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["canadian-privacy-regulators-say-openai-violated-federal-and-provincial-laws-in-ai-training-practices", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["censorship-protocol-history", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["chatgpt-expands-into-commerce-with-14-app-partners", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["choice-hotels-11th-mastery-tech-summit-ai-ctfs-and-make-a-thons", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["chromes-silent-gemini-nano-download-raises-privacy-concerns-over-on-device-ai", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["critical-cpanel-flaw-exploited-in-sorry-ransomware-attacks", new Set(["ar", "de", "fr", "he", "hi", "id", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["david-silvers-new-ai-lab-raises-11-billion-to-train-systems-without-human-data", new Set(["ar", "de", "es", "fr", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["discord-turns-on-end-to-end-encryption-for-voice-and-video-calls-by-default", new Set(["ar", "fa", "he", "hi", "ms", "ru", "th", "tl", "ur", "vi"])],
  ["doj-subpoenas-reddit-and-x-over-anonymous-ice-criticism-stoking-privacy-and-speech-fears", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["duckduckgo-installs-jump-as-users-push-back-on-googles-ai-heavy-search", new Set(["ar", "de", "es", "fa", "fr", "hi", "ko", "ms", "pt", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["elon-musks-orbital-data-centers-the-future-of-censorship-proof-computing", new Set(["de", "es", "fr", "he", "hi", "ja", "ko", "pt", "ru", "sw", "tl", "tr", "ur", "vi", "zh"])],
  ["encyclopdia-britannica-merriamwebster-sue-openai-over-copyright-and-trademark-claims", new Set(["de", "es", "fa", "fr", "he", "hi", "id", "ms", "pt", "ru", "th", "tr", "vi", "zh"])],
  ["eu-cyber-agency-warns-of-rising-threats-to-critical-infrastructure-in-2026", new Set(["ar", "de", "es", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["family-of-tumbler-ridge-shooting-victim-suing-openai", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["fbi-google-and-black-lotus-labs-disrupt-chinese-ai-phishing-network-behind-millions-of-scam-urls", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["fbi-used-iphone-notification-data-to-recover-deleted-signal-messages-raising-privacy-questions", new Set(["ar", "de", "fa", "fr", "he", "hi", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["five-eyes-warns-ai-threat-to-cybersecurity-is-moving-on-a-months-timeline", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["fortibleed-leak-exposes-fortinet-and-fortigate-vpn-credentials-for-more-than-73000-devices", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "ja", "pt", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["glm-5-and-the-new-era-of-agentic-ai-what-it-means", new Set(["ar", "fr", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["google-and-apple-begin-rolling-out-end-to-end-encrypted-rcs-texts-between-android-and-iphone", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "pt", "ru", "sw", "tl", "tr", "ur", "vi", "zh"])],
  ["google-expands-pentagon-ai-access-after-anthropic-rejects-surveillance-and-weapons-terms", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["google-led-operation-disrupts-residential-proxy-network-built-on-compromised-android-devices", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["google-warns-eu-rules-could-expose-search-data-and-android-to-hacking-risks", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["grapheneos-patches-android-vpn-leak-google-declined-to-fix", new Set(["ar", "es", "fa", "hi", "id", "ko", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["hackers-are-exploiting-newly-disclosed-windows-flaws-before-microsoft-patches-all-of-them", new Set(["ar", "de", "fa", "fr", "he", "hi", "id", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["hackers-used-metas-ai-support-chatbot-to-hijack-instagram-accounts", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["harvard-study-finds-ai-outperformed-two-doctors-in-emergency-room-diagnoses", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["home-depot-launches-real-time-tracker-for-big-bulky-deliveries", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "vi", "zh"])],
  ["how-to-bypass-internet-censorship-2026", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["huawei-challenges-nvidia-with-powerful-new-ai-accelerator-card", new Set(["ar", "fa", "he", "hi", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["huaweis-ai-native-home-broadband-solution-steals-the-mwc-spotlight", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["huaweis-mwc-industrial-intelligence-blitz-115-showcases-22-new-solutions", new Set(["ar", "de", "es", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["india-orders-temporary-telegram-block-over-exam-fraud-concerns", new Set(["ar", "de", "es", "fa", "fr", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["indias-telegram-block-sends-users-scrambling-to-vpns-as-privacy-worries-grow", new Set(["ar", "de", "es", "fa", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "ur", "vi", "zh"])],
  ["ionq-drops-a-major-qkd-network-in-romania-quantum-keys-national-scale-flex", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["ios-27-code-cleanup-better-battery-life-privacy-and-vpn-choices", new Set(["ar", "de", "fa", "fr", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["iran-internet-blackout-enters-23rd-day-netblocks-says", new Set(["ar", "de", "es", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["iran-threatens-us-linked-ai-data-centers-with-missile-strikes-as-regional-conflict-widens", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["kpmg-pulls-ai-report-after-claims-were-found-to-be-false", new Set(["ar", "es", "fa", "fr", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["law-enforcement-shuts-down-vpn-service-allegedly-used-by-ransomware-gangs", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["market-turmoil-and-your-data-why-investors-need-a-vpn-now", new Set(["de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["meta-debuts-muse-spark-as-the-first-model-from-its-ai-overhaul", new Set(["ar", "de", "es", "fa", "fr", "hi", "id", "ja", "ko", "pt", "ru", "sw", "th", "ur", "vi", "zh"])],
  ["meta-plans-to-record-employee-keystrokes-and-mouse-movements-for-ai-training", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["meta-unveils-muse-spark-a-new-ai-model-with-a-health-focused-contemplating-mode", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["microns-big-india-moment", new Set(["ar", "de", "es", "fa", "he", "hi", "id", "ja", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["microsoft-copilot-cowork-can-be-tricked-into-exfiltrating-sensitive-files-report-says", new Set(["ar", "fa", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "ur", "vi", "zh"])],
  ["microsoft-links-mastra-ai-npm-supply-chain-attack-to-north-koreas-sapphire-sleet", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["microsoft-locks-wireguard-developer-out-of-account-blocking-windows-updates", new Set(["ar", "es", "fa", "he", "hi", "id", "ja", "ms", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["microsoft-teams-ai-phishing-detection-what-it-means-for", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["microsoft-threatens-legal-action-after-researcher-publishes-unpatched-bugs-with-exploit-code", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["microsofts-copilot-terms-call-the-ai-for-entertainment-purposes-only", new Set(["ar", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "th", "tl", "tr", "ur", "vi"])],
  ["mozilla-urges-uk-regulators-not-to-restrict-vpns-in-online-safety-push", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["new-athr-platform-automates-ai-driven-vishing-attacks-to-steal-credentials", new Set(["ar", "fa", "he", "hi", "id", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["new-yorks-ai-regulation-takes-effect-what-tech-users-need-to-know-about-march-20-mm8po9k0", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["no-logs-vpn-explained", new Set(["ru"])],
  ["north-korean-hackers-hijacked-axios-in-a-supply-chain-attack-that-took-weeks-to-set-up", new Set(["ar", "de", "es", "fa", "fr", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["nsa-is-reportedly-using-anthropics-new-mythos-preview-ai-model", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["ntsb-blocks-docket-access-after-ai-recreates-dead-pilots-voices-from-cockpit-data", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["nvidia-halts-h200-production-as-china-backs-huawei-ai-chips", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["nvidia-nvda-stock-wells-fargo-and-bank-of-america-bullish-ahead-of-gtc", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "tl", "tr", "vi", "zh"])],
  ["nvidia-stakes-2b-on-lumentum-to-speed-ai-optics-and-us-manufacturing", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["nyc-health-hospitals-says-breach-exposed-medical-records-and-biometric-data-for-18-million-people", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-expands-chatgpt-into-personal-finance-with-bank-account-connections", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-launches-gpt-55-for-chatgpt-and-codex", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-limits-gpt-56-rollout-after-government-request-warns-against-lasting-restrictions", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-loses-key-leaders-as-it-trims-science-and-consumer-side-bets", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-model-disproves-long-standing-mathematical-conjecture-in-research-milestone", new Set(["ar", "de", "es", "fa", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-rolls-out-lockdown-mode-to-curb-prompt-injection-risks-in-chatgpt", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "ur", "vi", "zh"])],
  ["openai-strikes-getty-images-deal-to-bring-licensed-visuals-into-chatgpt", new Set(["ar", "de", "es", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-sued-over-chatgpt-drug-advice-in-teens-death", new Set(["ar", "de", "es", "fa", "fr", "hi", "id", "ja", "ko", "ms", "pt", "ru", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-to-integrate-gpt-56-sol-ultra-into-codex", new Set(["ar", "es", "fa", "fr", "he", "hi", "id", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openai-updates-codex-with-desktop-control-in-challenge-to-anthropic", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["openais-pentagon-deal-revisions-spark-urgent-debate-on-ai-surveillance-safeguard-mmczzuyr", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["openclaw-ai-agents-and-what-their-rise-means-for-privacy", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["orbital-data-centers-elon-musks-plan-to-bypass-digital-censorship", new Set(["de", "es", "fa", "fr", "he", "id", "pt", "ru", "sw", "th", "tl", "tr", "vi", "zh"])],
  ["palo-alto-networks-says-pan-os-globalprotect-flaw-is-being-actively-exploited", new Set(["ar", "de", "es", "fa", "fr", "hi", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["pentagon-expands-ai-deployment-with-nvidia-microsoft-aws-after-anthropic-dispute", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["pentagons-ai-ultimatum-to-anthropic-a-wake-up-call-for-tech-regulation-and-natio-mm1kgv37", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur"])],
  ["preparing-privacy-security-for-imminent-agi-what-to-know", new Set(["ar", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["public-backlash-against-ai-is-escalating-as-trust-in-the-industry-slips", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tr", "ur", "vi", "zh"])],
  ["quantum-safe-vpns-arqit-and-6wind-partner-to-protect-against-future-quantum-threats", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["report-says-anthropics-claude-code-may-be-adding-hidden-watermarks-to-code-requests", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["research-says-mullvads-shared-exit-ips-can-still-help-fingerprint-users", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["researchers-show-how-ai-coding-agents-can-be-lured-into-running-malware-from-clean-github-repos", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["researchers-warn-ai-powered-worms-could-spread-autonomously-across-networks", new Set(["de", "es", "fr", "he", "hi", "id", "ja", "ko", "ms", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["russian-hackers-hijacked-thousands-of-home-routers-to-steal-passwords-researchers-say", new Set(["ar", "de", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["samsung-galaxy-unpacked-2026-agentic-ai-gemini-3-preview-and-ondevice-privacy", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["section-702-surveillance-law-set-to-lapse-after-house-vote-falls-short", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["security-firm-says-chatgpt-for-google-sheets-add-on-could-exfiltrate-user-data", new Set(["ar", "de", "fa", "fr", "hi", "id", "ko", "ms", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["spain-orders-major-vpns-to-block-websites-what-this-means-for-digital-privacy", new Set(["ar", "he", "hi", "id", "ja", "ko", "ms", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["starlink-group-17-18-spacex-flies-25-v2-mini-satellites-as-falcon-9-booster-attempts-seventh-recover", new Set(["ar", "de", "fa", "fr", "he", "hi", "id", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["supreme-court-says-police-need-a-warrant-for-detailed-cellphone-location-data-in-privacy-win", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["the-future-of-siri-delays-and-privacy-concerns-in-ios-26-4-and-beyond", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["the-future-of-work-ai-unemployment-and-the-need-for-privacy", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["the-kimwolf-botnet-the-silent-invader-lurking-in-your-home-and-office-networks-mlx1kncq", new Set(["es", "he", "ja", "ms", "pt", "ru", "sw", "th", "tl", "ur"])],
  ["the-openvpn-exodus-why-top-vpn-providers-are-ditching-it-in-2026-and-what-it-mea-mlwv4gkh", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "ur", "vi", "zh"])],
  ["the-openvpn-sunset-why-top-vpn-providers-are-ditching-it-in-2026-and-what-you-mu-mly0xy4i", new Set(["de", "hi", "ru", "th", "vi", "zh"])],
  ["trumps-ai-executive-order-sparks-federal-state-showdown-what-it-means-for-tech-p-mlypk83y", new Set(["de", "es", "fr", "hi", "id", "ja", "ms", "pt", "ru", "tl", "tr"])],
  ["uk-enlists-openai-and-microsoft-in-global-ai-safety-coalition-what-it-means-for-online-privacy", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["uk-ico-launches-probe-into-xais-grok-a-wake-up-call-for-ai-data-privacy-and-glob-mm5ush7h", new Set(["ar", "de", "fa", "fr", "he", "hi", "id", "ms", "pt", "ru", "th", "tr", "vi", "zh"])],
  ["uk-orders-platforms-to-swiftly-remove-ai-generated-revenge-porn-what-it-means-fo-mlznuy4f", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["uk-proposes-vpn-age-restrictions-what-it-means-for-digital-privacy", new Set(["de", "es", "fr", "he", "hi", "ja", "ko", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["understanding-the-implications-of-telegram-restrictions-in-russia", new Set(["de", "es", "fa", "fr", "hi", "id", "ms", "pt", "ru", "th", "tl", "tr", "ur", "vi"])],
  ["unpatchable-apple-chip-flaw-could-open-the-door-to-iphone-jailbreaks", new Set(["ar", "es", "fa", "fr", "he", "hi", "id", "ms", "pt", "sw", "th", "tl", "ur", "vi", "zh"])],
  ["us-agencies-warn-of-iranian-hacking-campaign-targeting-energy-and-water-systems", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["us-diplomatic-push-against-foreign-data-sovereignty-laws-a-bold-move-for-ai-domi-mm2zwo56", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "vi"])],
  ["us-escalates-federal-state-ai-regulation-clash-doj-task-force-targets-california-mm4fcjlq", new Set(["ar", "de", "es", "fa", "fr", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["us-federal-state-ai-regulatory-clash-heats-up-will-february-2026-fragment-americ-mlz6pp3g", new Set(["de", "fr", "he", "hi", "ms", "pt", "tl", "tr", "ur", "vi", "zh"])],
  ["us-orders-anthropic-to-cut-off-access-to-fable-5-and-mythos-5-over-jailbreak-concerns", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["us-states-lead-2026-tech-regulation-charge-new-ai-and-privacy-laws-reshape-digit-mmbkjxtz", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["us-states-unleash-wave-of-tech-laws-in-2026-what-ai-privacy-and-app-users-need-t-mm7a8imq", new Set(["ar", "de", "es", "fr", "hi", "id", "ja", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["utahs-new-age-verification-law-raises-fresh-alarm-over-vpn-privacy", new Set(["ar", "de", "es", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "ur", "vi"])],
  ["vless-reality-explained", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["vless-reality-vs-wireguard", new Set(["ar", "de", "es", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "ur", "zh"])],
  ["vless-uri-format", new Set(["ar", "de", "es", "fr", "he", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tr", "ur", "vi", "zh"])],
  ["vless-vs-vmess-vs-trojan", new Set(["ar", "fa", "fr", "he", "hi", "id", "ja", "ko", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["vpn", new Set(["ar", "de", "es", "fa", "fr", "hi", "id", "ja", "ko", "ms", "pt", "sw", "th", "tl", "tr", "ur", "vi"])],
  ["vpn-vs-proxy-vs-tor", new Set(["ko", "ru"])],
  ["what-is-tls-fingerprinting-online-privacy", new Set(["ar", "de", "es", "fr", "he", "hi", "ja", "ko", "ms", "th", "tl", "ur", "vi", "zh"])],
  ["what-is-vless", new Set(["es", "he", "ms", "sw", "th", "tl", "tr", "ur"])],
  ["when-moscows-internet-falters-privacy-security-and-how-a-vpn-helps", new Set(["de", "es", "fr", "he", "hi", "id", "ms", "pt", "ru", "sw", "th", "tl", "tr", "ur", "vi", "zh"])],
  ["x-platform-hits-1-billion-milestone-as-musk-prepares-x-money-launch-for-vpn-conscious-users", new Set(["ar", "de", "es", "fr", "he", "ms", "pt", "ru"])],
  ["xai-unveils-grok-42-revolutionary-multi-agent-ai-slashes-hallucinations-by-65", new Set(["id", "ko", "sw", "th", "tl", "ur"])],
]);

/** Whole post gone, or this locale translation retired. */
export function isGoneBlogTranslation(slug: string, locale: string): boolean {
  if (GONE_BLOG_SLUGS.has(slug)) return true;
  return GONE_BLOG_TRANSLATIONS.get(slug)?.has(locale) ?? false;
}

/** Single-hyphen kebab only — consecutive `--` is an empty segment. */
export function isValidBlogSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/** Safe for sitemap / blog index (valid kebab, not permanently gone). */
export function isIndexableBlogSlug(slug: string): boolean {
  return isValidBlogSlug(slug) && !GONE_BLOG_SLUGS.has(slug);
}

// Extract slug from a blog path under any locale, e.g.
//   /en/blog/some-slug          → "some-slug"
//   /ru/blog/some-slug/         → "some-slug"
//   /fa/blog/nested/not-a-post  → null (only top-level blog posts)
export function parseBlogSlug(pathname: string): string | null {
  const match = pathname.match(/^\/[a-z]{2}(?:-[A-Za-z]+)?\/blog\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

