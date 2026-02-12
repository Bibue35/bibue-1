import { useState, useEffect, useCallback } from "react";

/**
 * Hook that returns true once the target element is within `rootMargin`
 * of the viewport. Once triggered it stays true (no unobserving flicker).
 * Used to defer data-fetching for below-fold sections.
 */
export function useDeferredSection(rootMargin = "200px") {
  const [isVisible, setIsVisible] = useState(false);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  const setRef = useCallback((el: HTMLDivElement | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
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
  }, [node, isVisible, rootMargin]);

  return { ref: setRef, isVisible };
}
