import type { Language } from "@/contexts/LanguageContext";

// English is bundled inline for instant availability (default language)
export { default as en } from "./en";

// All other languages are lazy-loaded on demand
const loaders: Record<Exclude<Language, "en">, () => Promise<{ default: Record<string, string> }>> = {
  ja: () => import("./ja"),
  es: () => import("./es"),
  fr: () => import("./fr"),
  de: () => import("./de"),
  pt: () => import("./pt"),
  ko: () => import("./ko"),
  zh: () => import("./zh"),
};

const cache = new Map<string, Record<string, string>>();

export async function loadTranslations(lang: Language): Promise<Record<string, string>> {
  if (lang === "en") {
    const { default: en } = await import("./en");
    return en;
  }
  const cached = cache.get(lang);
  if (cached) return cached;
  const mod = await loaders[lang]();
  cache.set(lang, mod.default);
  return mod.default;
}
