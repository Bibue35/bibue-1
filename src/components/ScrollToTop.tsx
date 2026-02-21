import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Smart scroll management:
 * - PUSH navigation (clicking a link): scroll to top
 * - POP navigation (browser back/forward): restore saved scroll position
 * - Saves scroll position per pathname on every scroll event (throttled)
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const prevPathname = useRef(pathname);

  // Save scroll position before leaving a page
  useEffect(() => {
    const saveScroll = () => {
      scrollPositions.current.set(prevPathname.current, window.scrollY);
    };

    // Save on every scroll (passive, browser-optimized)
    window.addEventListener("scroll", saveScroll, { passive: true });

    return () => {
      // Save final position when unmounting / route changing
      saveScroll();
      window.removeEventListener("scroll", saveScroll);
    };
  }, [pathname]);

  // Handle scroll on navigation
  useEffect(() => {
    if (pathname === prevPathname.current) return;

    if (navigationType === "POP") {
      // Back/forward: restore saved position
      const saved = scrollPositions.current.get(pathname);
      if (saved !== undefined) {
        // Use rAF to ensure DOM has rendered before restoring
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
