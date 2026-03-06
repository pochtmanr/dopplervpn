# Blog Pipeline Rebuild — Professional AI/Tech News

**Date:** 2026-03-06
**Status:** Approved

## Problem Statement

1. OpenAI sometimes generates meta-commentary ("drop me a link") instead of articles when Perplexity research is weak
2. Telegram posts always get a laugh emoji (hardcoded for meme template type)
3. Two competing pipelines (new editorial + legacy) both post to same Telegram channels
4. Citation artifacts like `[1][6]` and `(Word count: X)` appear in published articles
5. Content scope too broad — needs to focus on AI/tech companies only

## Content Strategy

### Topic Focus (STRICT)
- AI companies: OpenAI, Anthropic, xAI/Grok, Mistral, Cohere, Stability AI, etc.
- Big tech: Apple, Microsoft, Amazon, Google, Meta
- SpaceX and Elon Musk ventures
- AI startups and product launches

### Excluded Topics
- Privacy/VPN news
- Cybersecurity incidents
- Government surveillance
- General internet freedom topics

### Templates (2 only)
- **quick-take** (280-420 words): Breaking news, concise analysis
- **analysis** (560-840 words): Deep dive with context and implications

### Schedule
- 2 posts/day
- 08:00 UTC: quick-take
- 13:00 UTC: analysis

### Brand Voice
- Author: "Doppler Team"
- Professional, journalistic tone
- Gentle CTA at the end: one simple sentence like "Stay connected and browse safely with Doppler VPN."

### Banned Artifacts
- No citation markers: `[1]`, `[2]`, `[6]`
- No word counts: `(Word count: 1,048)`
- No "Sources:" sections in body
- No meta-commentary asking for more information
- No fabricated quotes or Twitter handles

## Workflow Changes

### 1. Topic Discovery (M6Gm4TKM6YwGzygG) — MODIFY
- Update Perplexity prompt: focus on AI companies, big tech, AI startups ONLY
- Remove `meme` and `roundup` from template rotation
- Change schedule: 2x/day (08:00 quick-take, 13:00 analysis)

### 2. Content Generation (CoWsngJ0UMOjyzFL) — MODIFY
- Remove `meme` and `roundup` prompt nodes
- Update `quick-take` and `analysis` prompts:
  - Add: "NEVER ask for more information. Write the article with what you have."
  - Add: "NEVER include citation markers like [1], [2], [6] in the text"
  - Add: "NEVER include word counts"
  - Add: "End with a single gentle CTA sentence for Doppler VPN"
  - Scope: AI companies and big tech only

### 3. Publish & Distribute (4AdGcqTq1UPtZ6KS) — FIX
- Fix `templateType` passthrough (prevent undefined defaulting to meme)
- Remove meme/roundup emoji logic
- Professional emojis only: quick-take = lightning, analysis = chart
- Add HTML escaping for Telegram messages

### 4. Legacy Workflows — DISABLE
- Doppler Research + Blog Creation (e3eZTcjR5Ir7Zwgw) — deactivate
- Doppler Telegram Channel Posting (aXVg56pzAPWTw7VG) — deactivate

### 5. Image Pipeline (TOlX7e4jF16RWmrs) — NO CHANGES
- Already works for quick-take and analysis
- Meme skip logic becomes irrelevant (no meme posts)

### 6. Translation (landing codebase)
- Remove casual translation prompt (was for meme/roundup)
- All posts use formal translation prompt only

## What Stays The Same
- Blog API routes (create/translate/status)
- Supabase schema
- 21-language translation
- Image Pipeline workflow
