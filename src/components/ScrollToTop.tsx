import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Smart scroll management:
 * - PUSH navigation (clicking a link): scroll to top
 * - POP navigation (browser back/forward): restore saved scroll position
 * - Saves scroll position per pathname on scroll (throttled via rAF)
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const prevPathname = useRef(pathname);

  // Save scroll position before leaving a page — throttled to one write per frame
  useEffect(() => {
    let rafId = 0;
    let latestY = 0;

    const onScroll = () => {
      latestY = window.scrollY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          scrollPositions.current.set(prevPathname.current, latestY);
          rafId = 0;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      // Save final position synchronously when unmounting / route changing
      scrollPositions.current.set(prevPathname.current, window.scrollY);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // Handle scroll on navigation
  useEffect(() => {
    if (pathname === prevPathname.current) return;

    if (navigationType === "POP") {
      // Back/forward: restore saved position
      const saved = scrollPositions.current.get(pathname);
      if (saved !== undefined) {
        requestAnimationFrame(() => {
          window.scrollTo(0, saved);
        });
      }
    } else {
      // PUSH/REPLACE: scroll to top
      window.scrollTo(0, 0);
    }

    prevPathname.current = pathname;
  }, [pathname, navigationType]);

  return null;
}
