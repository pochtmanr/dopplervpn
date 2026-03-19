import { getOpenAI } from "./client";

export async function extractFromUrl(url: string): Promise<{
  title: string;
  excerpt: string;
  content: string;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  tokensUsed: number;
}> {
  // Use Jina Reader API to scrape and extract clean text
  const jinaUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(jinaUrl, {
    headers: {
      "Accept": "text/plain",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL via Jina Reader: ${res.status} ${res.statusText}`);
  }

  const textContent = (await res.text()).slice(0, 15000); // Limit to avoid token overflow

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are a technology news editor. Adapt source articles into well-structured blog posts for a tech-savvy audience.

Rules:
- Preserve the original article's topic, facts, claims, and meaning exactly
- Use only information present in the source material
- Keep the original article's tone and subject matter
- Structure with markdown: ## for main sections, ### for subsections, bullet points where appropriate
- Title must accurately reflect the article's actual subject
- Match the source length — a 500-word source becomes a ~500-700 word post
- Write for SEO: use the article's real keywords naturally in headings and throughout the text
- If the article covers internet censorship, surveillance, geo-blocking, or online privacy, add a short hook at the end (1-2 sentences) about how a VPN like Doppler VPN can help — this is the only context where Doppler VPN appears

Return valid JSON with keys: title, excerpt, content, meta_title, meta_description, og_title, og_description
- title: accurate article title preserving original meaning (max 80 chars)
- excerpt: factual 1-2 sentence summary (max 200 chars)
- content: full article in markdown
- meta_title: SEO title with primary keyword from the actual topic (max 70 chars)
- meta_description: factual summary for search results (max 160 chars)
- og_title: social sharing title (max 70 chars)
- og_description: social sharing description (max 200 chars)`,
      },
      {
        role: "user",
        content: `Source URL: ${url}\n\nExtracted text:\n${textContent}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content || "{}";
  const parsed = JSON.parse(raw);

  return {
    title: parsed.title || "Untitled Article",
    excerpt: parsed.excerpt || "",
    content: parsed.content || "",
    meta_title: parsed.meta_title || "",
    meta_description: parsed.meta_description || "",
    og_title: parsed.og_title || "",
    og_description: parsed.og_description || "",
    tokensUsed: response.usage?.total_tokens || 0,
  };
}
