import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";

const NAV_ITEMS = [
  { href: "/manga", label: "Browse" },
  { href: "/originals", label: "Originals" },
  { href: "/watchlist", label: "Library", requiresAuth: true },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const scrollRef = useRef(0);

  const hiddenPaths = ["/admin", "/creator/dashboard"];
  const shouldHide = hiddenPaths.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - scrollRef.current;
        if (delta > 10 && currentScrollY > 100) setIsVisible(false);
        else if (delta < -5 || currentScrollY < 50) setIsVisible(true);
        scrollRef.current = currentScrollY;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (shouldHide) return null;

  return (
    <>
      <nav
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-2xl border-t border-border/10",
          "transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.filter(item => !('requiresAuth' in item && item.requiresAuth) || user).map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-center py-3 px-2 min-h-[48px] text-[11px] font-medium tracking-widest uppercase",
                  "transition-all duration-200 touch-manipulation btn-press",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {user && (
            <Link
              to="/settings"
              className={cn(
                "flex items-center justify-center py-3 px-2 min-h-[48px] text-[11px] font-medium tracking-widest uppercase",
                "transition-all duration-200 touch-manipulation btn-press",
                location.pathname === "/settings" ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Me
            </Link>
          )}
        </div>
      </nav>
      <div className="md:hidden h-[calc(48px+env(safe-area-inset-bottom,0px))]" />
    </>
  );
}
