import { useState, useCallback, useRef, useEffect } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  minSwipeDistance?: number;
}

interface SwipeState {
  isSwiping: boolean;
  direction: "left" | "right" | null;
  progress: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  minSwipeDistance = 50,
}: SwipeGestureOptions) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    progress: 0,
  });

  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = e.touches[0].clientX;
    isHorizontalSwipe.current = false;
    setSwipeState({ isSwiping: false, direction: null, progress: 0 });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchX - startX.current;
    const diffY = touchY - startY.current;

    // Determine swipe direction on first significant movement
    if (!isHorizontalSwipe.current && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
      // If horizontal movement is greater than vertical, it's a horizontal swipe
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }

    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;

    currentX.current = touchX;

    // Check if swiping from edge (within 50px of screen edge)
    const isFromLeftEdge = startX.current < 50;
    const isFromRightEdge = startX.current > window.innerWidth - 50;

    if (isFromLeftEdge && diffX > minSwipeDistance) {
      // Swiping right from left edge = previous chapter
      const progress = Math.min(diffX / threshold, 1);
      setSwipeState({ isSwiping: true, direction: "right", progress });
    } else if (isFromRightEdge && diffX < -minSwipeDistance) {
      // Swiping left from right edge = next chapter
      const progress = Math.min(Math.abs(diffX) / threshold, 1);
      setSwipeState({ isSwiping: true, direction: "left", progress });
    } else {
      setSwipeState({ isSwiping: false, direction: null, progress: 0 });
    }
  }, [threshold, minSwipeDistance]);

  // Trigger haptic feedback
  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" = "medium") => {
    if ("vibrate" in navigator) {
      const patterns = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const { direction, progress } = swipeState;

    if (progress >= 1) {
      // Trigger haptic feedback on successful swipe
      triggerHaptic("medium");
      
      if (direction === "left" && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === "right" && onSwipeRight) {
        onSwipeRight();
      }
    }

    setSwipeState({ isSwiping: false, direction: null, progress: 0 });
    isHorizontalSwipe.current = false;
  }, [swipeState, onSwipeLeft, onSwipeRight, triggerHaptic]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    swipeState,
  };
}
