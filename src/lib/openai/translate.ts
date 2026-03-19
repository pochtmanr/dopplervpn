import { getOpenAI } from "./client";

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

const FORMAL_SYSTEM_PROMPT = (languageName: string) =>
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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function translateContent(
  source: TranslationInput,
  targetLocale: string,
  _templateType?: string
): Promise<TranslationOutput> {
  const openai = getOpenAI();
  const languageName = LANGUAGE_NAMES[targetLocale] || targetLocale;

  const systemPrompt = FORMAL_SYSTEM_PROMPT(languageName);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
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
    } catch (err) {
      console.error(`[translate] ${languageName} attempt ${attempt}/${MAX_RETRIES}:`, err);
      if (attempt === MAX_RETRIES) throw err;
      // Exponential backoff: 2s, 4s
      await sleep(2000 * attempt);
    }
  }

  throw new Error(`Translation to ${languageName} failed after ${MAX_RETRIES} attempts`);
}

export function getLanguageName(locale: string): string {
  return LANGUAGE_NAMES[locale] || locale;
}

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_NAMES);
