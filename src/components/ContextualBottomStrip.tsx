import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const stripLinks = [
  { href: "/seasonal", label: "Seasonal" },
  { href: "/schedule", label: "Schedule" },
  { href: "/news", label: "News" },
  { href: "/rankings", label: "Rankings" },
  { href: "/seek", label: "Seek" },
];

export function ContextualBottomStrip() {
  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef(0);
  const location = useLocation();
  const pathname = location.pathname;
  const isHome = pathname === "/";
  const isAnimePage = pathname === "/anime";
  const isMangaPage = pathname === "/manga";
  const isAllowedPage = isHome || isAnimePage || isMangaPage;
  

  useEffect(() => {
    if (!isAllowedPage) return;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - scrollRef.current;

        if (isHome && currentScrollY < 200) {
          setIsVisible(true);
        } else if (scrollDelta < -3 && currentScrollY > 150) {
          setIsVisible(true);
        } else if (scrollDelta > 30) {
          setIsVisible(false);
        }

        scrollRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, isAllowedPage]);

  if (!isAllowedPage) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out transform-gpu",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-2">
        {stripLinks.map(({ href, label }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors duration-150",
                "bg-background/80 backdrop-blur-xl border border-border/15 shadow-sm",
                isActive
                  ? "text-foreground border-primary/30 bg-primary/10"
                  : "text-muted-foreground/70 hover:text-foreground/90"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
