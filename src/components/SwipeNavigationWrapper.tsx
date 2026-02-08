import { memo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

interface SwipeNavigationWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with swipe-between-tabs navigation.
 * Only active for authenticated users on swipable tab pages.
 */
export const SwipeNavigationWrapper = memo(function SwipeNavigationWrapper({
  children,
}: SwipeNavigationWrapperProps) {
  const { user } = useAuth();
  const { containerRef, indicatorRef, isSwipablePage } = useSwipeNavigation({
    enabled: !!user,
    threshold: 80,
  });

  // For non-auth users or non-swipable pages, just render children
  if (!user) return <>{children}</>;

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
