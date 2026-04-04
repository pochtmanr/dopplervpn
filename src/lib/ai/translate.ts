import "server-only";
import { getOpenAI } from "../openai/client";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const LANGUAGE_NAMES: Record<string, string> = {
  he: "Hebrew",
  ru: "Russian",
  es: "Spanish",
  pt: "Portuguese (Brazilian)",
  fr: "French",
  zh: "Chinese (Simplified)",
  de: "German",
  fa: "Farsi (Persian)",
  ar: "Arabic",
  hi: "Hindi",
  id: "Indonesian",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  ms: "Malay",
  ko: "Korean",
  ja: "Japanese",
  tl: "Filipino (Tagalog)",
  ur: "Urdu",
  sw: "Swahili",
};

const TRANSLATION_PROMPT = (languageName: string) =>
  `You are a professional translator for a VPN/privacy technology blog. Translate the following blog post content to ${languageName}.

Rules:
- Translate ALL text including ## headings, ### subheadings, and bold/italic text — nothing stays in English except the terms listed below
- Maintain all markdown formatting (##, ###, **, *, -, links) exactly — only translate the text, not the syntax
- Keep technical terms in English: VPN, DNS, IP, HTTPS, SSL, TLS, Wi-Fi, iOS, Android, macOS, Windows
- Keep brand names in English: Doppler VPN, Simnetiq, Apple, Google
- Adapt cultural references and idioms naturally
- For RTL languages (Hebrew, Arabic, Farsi, Urdu): ensure the text reads naturally in RTL
- Return valid JSON with these exact keys: title, excerpt, content, image_alt, meta_title, meta_description, og_title, og_description
- If a field is null in the input, set it to null in the output
- Do NOT add commentary — return ONLY the JSON object`;

interface TranslationInput {
  title: string;
  excerpt: string;
  content: string;
  image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
}

interface TranslationOutput extends TranslationInput {
  tokensUsed: number;
}

const MAX_RETRIES = 3;

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("429") || msg.includes("rate limit") || msg.includes("quota");
  }
  return false;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateWithGemini(
  source: TranslationInput,
  targetLocale: string
): Promise<TranslationOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const languageName = LANGUAGE_NAMES[targetLocale] || targetLocale;
  const systemPrompt = TRANSLATION_PROMPT(languageName);
  const userContent = JSON.stringify({
    title: source.title,
    excerpt: source.excerpt,
    content: source.content,
    image_alt: source.image_alt,
    meta_title: source.meta_title,
    meta_description: source.meta_description,
    og_title: source.og_title,
    og_description: source.og_description,
  });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        maxOutputTokens: 16000,
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }

  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as TranslationInput;
  const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

  return {
    title: parsed.title || source.title,
    excerpt: parsed.excerpt || source.excerpt,
    content: parsed.content || source.content,
    image_alt: parsed.image_alt ?? source.image_alt,
    meta_title: parsed.meta_title ?? source.meta_title,
    meta_description: parsed.meta_description ?? source.meta_description,
    og_title: parsed.og_title ?? source.og_title,
    og_description: parsed.og_description ?? source.og_description,
    tokensUsed,
  };
}

async function translateWithOpenAI(
  source: TranslationInput,
  targetLocale: string
): Promise<TranslationOutput> {
  const openai = getOpenAI();
  const languageName = LANGUAGE_NAMES[targetLocale] || targetLocale;
  const systemPrompt = TRANSLATION_PROMPT(languageName);

  const response = await openai.chat.completions.create(
    {
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
    },
    { timeout: 120_000 }
  );

  const raw = response.choices[0].message.content || "{}";
  const parsed = JSON.parse(raw) as TranslationInput;

  return {
    title: parsed.title || source.title,
    excerpt: parsed.excerpt || source.excerpt,
    content: parsed.content || source.content,
    image_alt: parsed.image_alt ?? source.image_alt,
    meta_title: parsed.meta_title ?? source.meta_title,
    meta_description: parsed.meta_description ?? source.meta_description,
    og_title: parsed.og_title ?? source.og_title,
    og_description: parsed.og_description ?? source.og_description,
    tokensUsed: response.usage?.total_tokens || 0,
  };
}

export async function translateContent(
  source: TranslationInput,
  targetLocale: string,
  _templateType?: string
): Promise<TranslationOutput> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await translateWithGemini(source, targetLocale);
    } catch (error) {
      console.error(
        `[translate] Gemini attempt ${attempt}/${MAX_RETRIES} for ${targetLocale}:`,
        error
      );

      // On rate limit, fall back to OpenAI immediately
      if (isRateLimitError(error)) {
        console.log(`[translate] Gemini rate limited, falling back to OpenAI for ${targetLocale}`);
        return await translateWithOpenAI(source, targetLocale);
      }

      // On last attempt, fall back to OpenAI
      if (attempt === MAX_RETRIES) {
        console.log(`[translate] Gemini failed after ${MAX_RETRIES} attempts, falling back to OpenAI for ${targetLocale}`);
        return await translateWithOpenAI(source, targetLocale);
      }

      await sleep(2000 * attempt);
    }
  }

  throw new Error(`Translation to ${targetLocale} failed after all attempts`);
}

export function getLanguageName(locale: string): string {
  return LANGUAGE_NAMES[locale] || locale;
}

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_NAMES);
