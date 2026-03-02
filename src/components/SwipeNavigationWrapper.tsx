import { memo, useEffect } from "react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getTopManga,
  getRecentlyUpdatedManga,
  SupportedLanguage,
} from "@/lib/api";

interface SwipeNavigationWrapperProps {
  children: React.ReactNode;
}

/** Swipable tab routes — must match useSwipeNavigation */
const TAB_ROUTES = ["/", "/manga"];

/** Preload map: route → dynamic import for adjacent pages */
const PRELOAD_MAP: Record<string, () => void> = {
  "/": () => { import("@/pages/MangaPage"); },
  "/manga": () => { import("@/pages/Index"); },
};

/**
 * Wraps page content with swipe-between-tabs navigation.
 * Swipe right → Anime, swipe left → Manga.
 * Shows subtle edge vignettes on swipable pages (mobile only).
 */
export const SwipeNavigationWrapper = memo(function SwipeNavigationWrapper({
  children,
}: SwipeNavigationWrapperProps) {
  const { containerRef, indicatorRef, isSwipablePage } = useSwipeNavigation({
    enabled: true,
    threshold: 80,
  });
  const isMobile = useIsMobile();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const currentIndex = TAB_ROUTES.indexOf(location.pathname);

  // Preload adjacent page chunks AND prefetch their data
  useEffect(() => {
    const preload = PRELOAD_MAP[location.pathname];
    if (!preload) return;

    const prefetchData = () => {
      preload(); // JS chunks

      const lang = language as SupportedLanguage;
      const staleTime = 1000 * 60 * 10;

      // Only prefetch manga data for adjacent pages
      if (location.pathname === "/") {
        queryClient.prefetchQuery({ queryKey: ["topManga", 1, undefined, "popularity", lang], queryFn: () => getTopManga(1, 25, undefined, "popularity", lang), staleTime });
        queryClient.prefetchQuery({ queryKey: ["recentlyUpdatedManga", 1, lang], queryFn: () => getRecentlyUpdatedManga(1, 25, lang), staleTime });
      } else if (location.pathname === "/manga") {
        queryClient.prefetchQuery({ queryKey: ["topManga", 1, undefined, "popularity", lang], queryFn: () => getTopManga(1, 25, undefined, "popularity", lang), staleTime });
      }
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(prefetchData);
    } else {
      setTimeout(prefetchData, 100);
    }
  }, [location.pathname, queryClient, language]);
  const canSwipeRight = currentIndex > 0;
  const canSwipeLeft = currentIndex < TAB_ROUTES.length - 1 && currentIndex !== -1;

  return (
    <div ref={containerRef} className="relative min-h-screen" style={{ touchAction: "pan-y" }}>
      {children}




      {/* Navigation indicator pill */}
      <div
        ref={indicatorRef}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-foreground/90 text-background text-xs font-semibold shadow-lg pointer-events-none"
        style={{
          display: "none",
          opacity: 0,
          transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
          willChange: "opacity, transform",
        }}
      />
    </div>
  );
});
