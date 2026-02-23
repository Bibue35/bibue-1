import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const stripLinks = [
  { href: "/seasonal", label: "Seasonal" },
  { href: "/schedule", label: "Schedule" },
  { href: "/news", label: "News" },
  { href: "/recommendations", label: "For You" },
  { href: "/genre/action", label: "Ruthless MC" },
  { href: "/genre/psychological", label: "Cold-Hearted" },
  { href: "/genre/thriller", label: "Dark Thriller" },
  { href: "/genre/romance", label: "Slow Burn" },
  { href: "/genre/fantasy", label: "OP Protagonist" },
];

export function ContextualBottomStrip() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef(0);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - scrollRef.current;

        if (scrollDelta < -5 && currentScrollY > 200) {
          setIsVisible(true);
        } else if (scrollDelta > 10 || currentScrollY < 100) {
          setIsVisible(false);
        }

        scrollRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out transform-gpu max-w-[95vw]",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full liquid-glass-strong border border-border/20 shadow-lg overflow-x-auto hide-scrollbar"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {stripLinks.map(({ href, label }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "px-2.5 py-1 rounded-full transition-all duration-200 text-[11px] font-medium whitespace-nowrap",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{ scrollSnapAlign: "start" }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
