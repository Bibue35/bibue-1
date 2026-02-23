import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Save scroll position of the page we're leaving
    sessionStorage.setItem(`scroll_${prevPathRef.current}`, window.scrollY.toString());
    prevPathRef.current = pathname;

    // On back/forward navigation, restore saved scroll position
    if (navType === "POP") {
      const saved = sessionStorage.getItem(`scroll_${pathname}`);
      if (saved) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(saved, 10));
        });
        return;
      }
    }

    // Normal navigation: scroll to top
    window.scrollTo(0, 0);
  }, [pathname, navType]);

  return null;
}
