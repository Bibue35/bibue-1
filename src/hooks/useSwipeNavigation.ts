import { useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setSwipeNavFlag } from "@/lib/swipeNavFlag";

/** Ordered tab routes for swipe navigation */
const TAB_ROUTES = ["/anime", "/", "/manga"];

interface SwipeNavConfig {
  enabled: boolean;
  threshold?: number;
  maxVertical?: number;
}

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  isDragging: boolean;
  startTime: number;
}

export function useSwipeNavigation({
  enabled,
  threshold = 80,
  maxVertical = 60,
}: SwipeNavConfig) {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SwipeState>({
    startX: 0, startY: 0, currentX: 0, isDragging: false, startTime: 0,
  });
  const rafRef = useRef<number>(0);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const currentIndex = TAB_ROUTES.indexOf(location.pathname);
  const isSwipablePage = currentIndex !== -1;

  const applyTransform = useCallback((dx: number) => {
    if (!containerRef.current) return;
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
        const route = TAB_ROUTES[targetIndex];
        const tabName = route === "/" ? "Home" : route.replace("/", "").replace(/^./, c => c.toUpperCase());
        indicatorRef.current.textContent = tabName;
        indicatorRef.current.style.opacity = `${Math.min(progress * 1.5, 0.9)}`;
        indicatorRef.current.style.transform = `translate3d(-50%, 0, 0) scale(${0.8 + progress * 0.2})`;
        indicatorRef.current.style.display = "block";
        return;
      }
    }
    indicatorRef.current.style.opacity = "0";
    indicatorRef.current.style.display = "none";
  }, [currentIndex, threshold]);

  const resetTransform = useCallback((navigating = false, swipeDirection = 0) => {
    if (!containerRef.current) return;

    if (navigating && swipeDirection !== 0) {
      // Slide OFF-screen in the swipe direction
      const offscreenX = swipeDirection * -window.innerWidth;
      containerRef.current.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      containerRef.current.style.transform = `translate3d(${offscreenX}px, 0, 0)`;
    } else {
      // Snap back to center (cancelled swipe)
      containerRef.current.style.transition = "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      containerRef.current.style.transform = "translate3d(0, 0, 0)";
    }

    const cleanup = () => {
      if (containerRef.current) {
        containerRef.current.style.transition = "";
        containerRef.current.style.willChange = "";
        containerRef.current.style.transform = "";
      }
    };
    setTimeout(cleanup, 210);

    if (indicatorRef.current) {
      indicatorRef.current.style.opacity = "0";
      setTimeout(() => {
        if (indicatorRef.current) indicatorRef.current.style.display = "none";
      }, 150);
    }
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || !isSwipablePage) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [role=dialog], [role=slider], .hide-scrollbar")) return;

    const touch = e.touches[0];
    stateRef.current = {
      startX: touch.clientX, startY: touch.clientY,
      currentX: touch.clientX, isDragging: false, startTime: Date.now(),
    };
  }, [enabled, isSwipablePage]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isSwipablePage) return;
    const state = stateRef.current;
    if (state.startX === 0) return;

    const touch = e.touches[0];
    const dx = touch.clientX - state.startX;
    const dy = touch.clientY - state.startY;

    if (!state.isDragging && Math.abs(dy) > Math.abs(dx) * 0.7) { state.startX = 0; return; }
    if (Math.abs(dy) > maxVertical && !state.isDragging) { state.startX = 0; return; }
    if (!state.isDragging && Math.abs(dx) > 10) state.isDragging = true;

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
    if (!state.isDragging) { state.startX = 0; return; }

    const dx = state.currentX - state.startX;
    const elapsed = Date.now() - state.startTime;
    const velocity = Math.abs(dx) / elapsed;

    const shouldNavigate = Math.abs(dx) > threshold || (velocity > 0.5 && Math.abs(dx) > 30);
    const direction = dx < 0 ? 1 : -1; // 1 = next, -1 = prev
    const targetIndex = currentIndex + direction;

    if (shouldNavigate && targetIndex >= 0 && targetIndex < TAB_ROUTES.length) {
      if (navigator.vibrate) navigator.vibrate(15);

      // Slide off-screen, then navigate immediately
      resetTransform(true, direction);
      setSwipeNavFlag();
      navigate(TAB_ROUTES[targetIndex]);
    } else {
      resetTransform(false);
    }

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
