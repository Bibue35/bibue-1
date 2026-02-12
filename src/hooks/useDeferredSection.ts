import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook that returns true once the target element is within `rootMargin`
 * of the viewport. Once triggered it stays true (no unobserving flicker).
 * Used to defer data-fetching for below-fold sections.
 */
export function useDeferredSection(rootMargin = "200px") {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return { ref: setRef, isVisible };
}
