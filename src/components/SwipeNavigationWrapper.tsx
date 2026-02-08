import { memo } from "react";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SwipeNavigationWrapperProps {
  children: React.ReactNode;
}

/** Swipable tab routes — must match useSwipeNavigation */
const TAB_ROUTES = ["/anime", "/", "/manga"];

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

  const currentIndex = TAB_ROUTES.indexOf(location.pathname);
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
