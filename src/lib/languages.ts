export const localeConfig: Record<string, { label: string; countryCode: string; name: string }> = {
  en: { label: "EN", countryCode: "us", name: "English" },
  he: { label: "עב", countryCode: "il", name: "עברית" },
  ru: { label: "RU", countryCode: "ru", name: "Русский" },
  es: { label: "ES", countryCode: "es", name: "Español" },
  pt: { label: "PT", countryCode: "br", name: "Português" },
  fr: { label: "FR", countryCode: "fr", name: "Français" },
  zh: { label: "中文", countryCode: "cn", name: "中文" },
  de: { label: "DE", countryCode: "de", name: "Deutsch" },
  fa: { label: "فا", countryCode: "ir", name: "فارسی" },
  ar: { label: "عر", countryCode: "sa", name: "العربية" },
  hi: { label: "हि", countryCode: "in", name: "हिन्दी" },
  id: { label: "ID", countryCode: "id", name: "Bahasa" },
  tr: { label: "TR", countryCode: "tr", name: "Türkçe" },
  vi: { label: "VI", countryCode: "vn", name: "Tiếng Việt" },
  th: { label: "ไท", countryCode: "th", name: "ไทย" },
  ms: { label: "MS", countryCode: "my", name: "Bahasa Melayu" },
  ko: { label: "한", countryCode: "kr", name: "Korean" },
  ja: { label: "日", countryCode: "jp", name: "日本語" },
  tl: { label: "TL", countryCode: "ph", name: "Filipino" },
  ur: { label: "اُر", countryCode: "pk", name: "اردو" },
  sw: { label: "SW", countryCode: "ke", name: "Kiswahili" },
  az: { label: "AZ", countryCode: "az", name: "Azərbaycan" },
  pl: { label: "PL", countryCode: "pl", name: "Polski" },
  uk: { label: "УК", countryCode: "ua", name: "Українська" },
};

/** Circular flag image URL for a given country code */
export function getFlagUrl(countryCode: string): string {
  return `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`;
}
