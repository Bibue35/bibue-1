import { memo, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, BookOpen, Newspaper, Sparkles, Grid3X3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/schedule", icon: CalendarDays, label: "Schedule" },
  { href: "/guides", icon: BookOpen, label: "Guides" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/recommendations", icon: Sparkles, label: "For You" },
  { href: "/genres", icon: Grid3X3, label: "Genres" },
];

/**
 * Contextual footer strip — a slim horizontal bar of secondary nav links.
 * Appears when the user scrolls up (same logic as the top navbar),
 * sits just above the mobile bottom nav (or at the bottom on desktop).
 * Hidden when at the very top of the page to keep the initial view clean.
 */
export const FloatingPillTabs = memo(function FloatingPillTabs() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        // Show on scroll-up when past 200px, hide on scroll-down or near top
        if (delta < -5 && y > 200) setVisible(true);
        else if (delta > 10 || y < 100) setVisible(false);
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-40 flex justify-center transition-all duration-300 ease-out",
        isMobile ? "bottom-[60px]" : "bottom-4",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-background/70 backdrop-blur-xl border border-border/20 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors touch-manipulation",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {!isMobile && <span>{tab.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
});
