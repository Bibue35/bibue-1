import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const stripLinks = [
  { href: "/seasonal", label: "Seasonal" },
  { href: "/schedule", label: "Schedule" },
  { href: "/news", label: "News" },
  { href: "/rankings", label: "Rankings" },
];

export function ContextualBottomStrip() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollRef = useRef(0);
  const location = useLocation();

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
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out transform-gpu",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-background/80 backdrop-blur-xl border border-border/15 shadow-sm">
        {stripLinks.map(({ href, label }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-colors duration-150",
                isActive
                  ? "text-foreground bg-foreground/8"
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
