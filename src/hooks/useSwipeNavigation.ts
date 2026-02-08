import { useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/** Ordered tab routes for swipe navigation */
const TAB_ROUTES = ["/anime", "/manga", "/news", "/rankings"];

interface SwipeNavConfig {
  /** Whether swipe navigation is enabled (auth-gated) */
  enabled: boolean;
  /** Minimum horizontal distance to trigger navigation (px) */
  threshold?: number;
  /** Maximum vertical distance before cancelling (px) */
  maxVertical?: number;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  startTime: number;
}

/**
 * Hook that enables buttery-smooth horizontal swipe navigation
 * between top-level tabs. Uses GPU-accelerated translate3d and
 * requestAnimationFrame for 60fps performance.
 */
export function useSwipeNavigation({
  enabled,
  threshold = 80,
  maxVertical = 60,
}: SwipeNavConfig) {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    startTime: 0,
  });
  const rafRef = useRef<number>(0);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const currentIndex = TAB_ROUTES.indexOf(location.pathname);
  const isSwipablePage = currentIndex !== -1;

  const applyTransform = useCallback((dx: number) => {
    if (!containerRef.current) return;
    // Rubber-band effect at edges
    const atLeftEdge = currentIndex === 0 && dx > 0;
    const atRightEdge = currentIndex === TAB_ROUTES.length - 1 && dx < 0;
    const dampened = (atLeftEdge || atRightEdge) ? dx * 0.2 : dx;

    containerRef.current.style.transform = `translate3d(${dampened}px, 0, 0)`;
    containerRef.current.style.willChange = "transform";
  }, [currentIndex]);

  const updateIndicator = useCallback((dx: number, direction: "left" | "right" | null) => {
    if (!indicatorRef.current) return;
    const absDx = Math.abs(dx);
    const progress = Math.min(absDx / threshold, 1);

    if (direction && progress > 0.15) {
      const targetIndex = direction === "left" ? currentIndex + 1 : currentIndex - 1;
      if (targetIndex >= 0 && targetIndex < TAB_ROUTES.length) {
        const tabName = TAB_ROUTES[targetIndex].replace("/", "").replace(/^./, c => c.toUpperCase());
        indicatorRef.current.textContent = tabName;
        indicatorRef.current.style.opacity = `${Math.min(progress * 1.5, 0.9)}`;
        indicatorRef.current.style.transform = `translate3d(${direction === "left" ? "-50%" : "-50%"}, 0, 0) scale(${0.8 + progress * 0.2})`;
        indicatorRef.current.style.display = "block";
        return;
      }
    }
    indicatorRef.current.style.opacity = "0";
    indicatorRef.current.style.display = "none";
  }, [currentIndex, threshold]);

  const resetTransform = useCallback((navigating = false) => {
    if (!containerRef.current) return;
    containerRef.current.style.transition = "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    containerRef.current.style.transform = navigating
      ? `translate3d(${navigating ? "0" : "0"}px, 0, 0)`
      : "translate3d(0, 0, 0)";

    // Clean up after transition
    const cleanup = () => {
      if (containerRef.current) {
        containerRef.current.style.transition = "";
        containerRef.current.style.willChange = "";
        containerRef.current.style.transform = "";
      }
    };
    setTimeout(cleanup, 310);

    if (indicatorRef.current) {
      indicatorRef.current.style.opacity = "0";
      setTimeout(() => {
        if (indicatorRef.current) indicatorRef.current.style.display = "none";
      }, 200);
    }
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || !isSwipablePage) return;

    // Don't intercept touches on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button, a, input, textarea, select, [role=dialog], [role=slider], .hide-scrollbar")
    ) return;

    const touch = e.touches[0];
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isDragging: false,
      startTime: Date.now(),
    };
  }, [enabled, isSwipablePage]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isSwipablePage) return;
    const state = stateRef.current;
    if (state.startX === 0) return;

    const touch = e.touches[0];
    const dx = touch.clientX - state.startX;
    const dy = touch.clientY - state.startY;

    // Cancel if vertical scroll dominates
    if (!state.isDragging && Math.abs(dy) > Math.abs(dx) * 0.7) {
      state.startX = 0;
      return;
    }

    if (Math.abs(dy) > maxVertical && !state.isDragging) {
      state.startX = 0;
      return;
    }

    // Start dragging after 10px horizontal movement
    if (!state.isDragging && Math.abs(dx) > 10) {
      state.isDragging = true;
    }

    if (state.isDragging) {
      e.preventDefault();
      state.currentX = touch.clientX;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        applyTransform(dx);
        const direction = dx < 0 ? "left" : dx > 0 ? "right" : null;
        updateIndicator(dx, direction);
      });
    }
  }, [enabled, isSwipablePage, maxVertical, applyTransform, updateIndicator]);

  const onTouchEnd = useCallback(() => {
    if (!enabled || !isSwipablePage) return;
    const state = stateRef.current;
    if (!state.isDragging) {
      state.startX = 0;
      return;
    }

    const dx = state.currentX - state.startX;
    const elapsed = Date.now() - state.startTime;
    const velocity = Math.abs(dx) / elapsed; // px/ms

    // Navigate if past threshold OR fast flick
    const shouldNavigate = Math.abs(dx) > threshold || (velocity > 0.5 && Math.abs(dx) > 30);
    const direction = dx < 0 ? 1 : -1; // 1 = next, -1 = prev
    const targetIndex = currentIndex + direction;

    if (shouldNavigate && targetIndex >= 0 && targetIndex < TAB_ROUTES.length) {
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(15);

      resetTransform(true);
      // Small delay for the spring-back animation to start
      setTimeout(() => {
        navigate(TAB_ROUTES[targetIndex]);
      }, 80);
    } else {
      resetTransform(false);
    }

    // Reset state
    stateRef.current = { startX: 0, startY: 0, currentX: 0, isDragging: false, startTime: 0 };
    cancelAnimationFrame(rafRef.current);
  }, [enabled, isSwipablePage, threshold, currentIndex, navigate, resetTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, onTouchStart, onTouchMove, onTouchEnd]);

  return { containerRef, indicatorRef, isSwipablePage };
}
