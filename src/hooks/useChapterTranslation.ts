import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TranslationBubble {
  id: number;
  type: "speech" | "thought" | "narration" | "sfx";
  original: string;
  translated: string;
  position: { x: number; y: number };
  size: "small" | "medium" | "large";
}

interface PageTranslation {
  bubbles: TranslationBubble[];
  sourceLanguage: string;
  fromCache: boolean;
}

export function useChapterTranslation(chapterId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [translations, setTranslations] = useState<Record<number, PageTranslation>>({});
  const [translatingPages, setTranslatingPages] = useState<Set<number>>(new Set());
  const [showTranslation, setShowTranslation] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState({ done: 0, total: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const translatePage = useCallback(async (pageIndex: number, imageUrl: string): Promise<PageTranslation | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("translate-manga-page", {
        body: { chapterId, pageIndex, imageUrl, userId: user?.id },
      });

      if (error) {
        console.error("Translation error:", error);
        return null;
      }

      if (data?.rateLimited) {
        toast({
          title: "Translation limit reached",
          description: data.error || "Daily limit of 5 translations reached.",
          variant: "destructive",
        });
        return null;
      }

      if (data?.error) {
        console.error("Translation failed:", data.error);
        return null;
      }

      return {
        bubbles: data.translated || [],
        sourceLanguage: data.sourceLanguage || "unknown",
        fromCache: data.fromCache || false,
      };
    } catch (err) {
      console.error("Translation request failed:", err);
      return null;
    }
  }, [chapterId, user?.id, toast]);

  const translateChapter = useCallback(async (pages: string[]) => {
    if (isTranslating) {
      abortRef.current?.abort();
      setIsTranslating(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsTranslating(true);
    setTranslationProgress({ done: 0, total: pages.length });

    let completedCount = 0;

    // Translate pages in batches of 3 for speed
    const batchSize = 3;
    for (let i = 0; i < pages.length; i += batchSize) {
      if (controller.signal.aborted) break;

      const batch = pages.slice(i, i + batchSize);
      const promises = batch.map((url, batchIdx) => {
        const pageIdx = i + batchIdx;
        
        // Skip already translated pages
        if (translations[pageIdx]) {
          completedCount++;
          setTranslationProgress(p => ({ ...p, done: completedCount }));
          return Promise.resolve();
        }

        setTranslatingPages(prev => new Set(prev).add(pageIdx));

        return translatePage(pageIdx, url).then(result => {
          if (result && !controller.signal.aborted) {
            setTranslations(prev => ({ ...prev, [pageIdx]: result }));
          }
          setTranslatingPages(prev => {
            const next = new Set(prev);
            next.delete(pageIdx);
            return next;
          });
          completedCount++;
          setTranslationProgress(p => ({ ...p, done: completedCount }));
        });
      });

      await Promise.all(promises);
    }

    setIsTranslating(false);

    if (!controller.signal.aborted) {
      const translatedCount = Object.keys(translations).length + completedCount;
      toast({
        title: "Translation complete! ✨",
        description: `${pages.length} pages translated to English.`,
      });
    }
  }, [isTranslating, translations, translatePage, toast]);

  const toggleTranslation = useCallback(() => {
    setShowTranslation(prev => !prev);
  }, []);

  const hasTranslations = Object.keys(translations).length > 0;

  return {
    translations,
    translatingPages,
    showTranslation,
    isTranslating,
    translationProgress,
    hasTranslations,
    translateChapter,
    toggleTranslation,
  };
}
