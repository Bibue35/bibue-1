import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

// Global in-memory cache: key = `${lang}:${textHash}` → translated string
const translationCache = new Map<string, string>();

function hashKey(text: string, lang: string): string {
  // Use first 100 chars + length as a simple cache key
  return `${lang}:${text.slice(0, 100)}:${text.length}`;
}

/**
 * Translates text to the user's selected language using Lovable AI.
 * Returns the original text for English or if translation fails.
 * Results are cached in memory to avoid redundant API calls.
 */
export function useTranslatedText(text: string | undefined | null): string {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<string>(text || "");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // No text or English — return original
    if (!text || language === "en") {
      setTranslated(text || "");
      return;
    }

    const key = hashKey(text, language);

    // Check cache first
    const cached = translationCache.get(key);
    if (cached) {
      setTranslated(cached);
      return;
    }

    // Show original while loading
    setTranslated(text);

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "translate-text",
          {
            body: { text, targetLanguage: language },
          }
        );

        if (controller.signal.aborted) return;

        if (error || !data?.translatedText) {
          console.warn("Translation failed, using original:", error);
          return;
        }

        translationCache.set(key, data.translatedText);
        setTranslated(data.translatedText);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn("Translation error:", err);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [text, language]);

  return translated;
}
