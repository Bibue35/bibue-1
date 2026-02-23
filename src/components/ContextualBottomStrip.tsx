import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, Clock, Newspaper, Sparkles, Grid3X3, Globe, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const stripLinks = [
  { href: "/seasonal", icon: CalendarDays, labelKey: "Seasonal" },
  { href: "/schedule", icon: Clock, labelKey: "Schedule" },
  { href: "/news", icon: Newspaper, labelKey: "nav.news" },
  { href: "/recommendations", icon: Sparkles, labelKey: "nav.forYou" },
  { href: "/genres", icon: Grid3X3, labelKey: "Genres" },
  { href: "/map", icon: Globe, labelKey: "Galaxy" },
  { href: "/vibe", icon: Palette, labelKey: "Vibe" },
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

  const getLabel = (key: string) => {
    // Keys that exist in translations
    if (key.startsWith("nav.")) return t(key);
    return key;
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ease-out transform-gpu",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-2 px-1">
        {stripLinks.map(({ href, icon: Icon, labelKey }) => {
          const isActive = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 text-xs font-medium whitespace-nowrap",
                "liquid-glass-strong border border-border/30 shadow-md",
                isActive
                  ? "text-primary bg-primary/10 border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{getLabel(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
