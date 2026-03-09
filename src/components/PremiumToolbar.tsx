import { useState, useRef, useEffect, useCallback } from "react";
import { Home, Search, User, Sun, Moon } from "lucide-react";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/seek" },
  { icon: User, label: "Profile", path: "/settings" },
] as const;

export function PremiumToolbar() {
  const { resolvedMode, setMode } = useThemeContext();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = resolvedMode === "dark";

  // Active index based on current route
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    if (item.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.path);
  });
  const currentActive = activeIndex === -1 ? 0 : activeIndex;

  // Indicator position
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const btn = buttonsRef.current[currentActive];
    const container = containerRef.current;
    if (!btn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setIndicatorStyle({
      left: bRect.left - cRect.left,
      width: bRect.width,
    });
  }, [currentActive]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  // Theme toggle bounce
  const [themeBounce, setThemeBounce] = useState(false);
  const handleThemeToggle = () => {
    setThemeBounce(true);
    setMode(isDark ? "light" : "dark");
    setTimeout(() => setThemeBounce(false), 400);
  };

  if (isMobile) return null;

  const indicatorSize = indicatorStyle.width + 8; // 4px padding each side

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      {/* Film grain noise overlay */}
      <div
        className="absolute inset-0 rounded-[28px] opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial ambient glow */}
      <div
        className="absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${isDark ? "hsl(0 0% 100% / 0.04)" : "hsl(0 0% 0% / 0.03)"} 0%, transparent 70%)`,
        }}
      />

      <div
        ref={containerRef}
        className={cn(
          "relative flex items-center gap-0 h-14 px-3 rounded-[28px] shadow-2xl border transition-colors duration-300",
          isDark
            ? "bg-[hsl(0,0%,5%)]/90 border-[hsl(0,0%,20%)]/40"
            : "bg-[hsl(0,0%,98%)]/90 border-[hsl(0,0%,80%)]/40"
        )}
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Sliding golden indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: indicatorStyle.left - 4,
            width: indicatorSize,
            height: indicatorSize,
            transition: "left 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), width 0.3s ease",
          }}
        >
          {/* Layer 1: Glow */}
          <div
            className="absolute inset-0 rounded-[18px]"
            style={{
              background: "#e8af48",
              opacity: 0.15,
              filter: "blur(12px)",
            }}
          />

          {/* Layer 2: Clip container with rotating conic gradient */}
          <div className="absolute inset-0 rounded-[18px] overflow-hidden">
            <div
              className="absolute inset-[-50%] w-[200%] h-[200%]"
              style={{
                animation: "spin-gold-ring 4.5s linear infinite",
                background: `conic-gradient(
                  from 0deg,
                  #533517 0%,
                  #c49746 12%,
                  #feeaa5 22%,
                  #ffffff 24%,
                  #feeaa5 27%,
                  #c49746 35%,
                  #533517 42%,
                  #c49746 48%,
                  #ffc0cb 49.5%,
                  #6495ed 51%,
                  #c49746 52.5%,
                  #feeaa5 58%,
                  #533517 65%,
                  #c49746 72%,
                  #feeaa5 82%,
                  #ffffff 84%,
                  #feeaa5 87%,
                  #c49746 92%,
                  #ffc0cb 96%,
                  #6495ed 97.5%,
                  #533517 100%
                )`,
              }}
            />
          </div>

          {/* Layer 3: Inner plate (covers center, shows 2px ring) */}
          <div
            className="absolute rounded-[16px]"
            style={{
              inset: "2px",
              background: isDark ? "hsl(0,0%,5%)" : "hsl(0,0%,98%)",
            }}
          />
        </div>

        {/* Nav buttons */}
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === currentActive;
          return (
            <div key={item.label} className="flex items-center">
              <button
                ref={(el) => { buttonsRef.current[i] = el; }}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative z-10 flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.label}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              {/* Divider (not after last nav item) */}
              {i < NAV_ITEMS.length - 1 && (
                <div
                  className={cn(
                    "w-px h-5 mx-1",
                    isDark ? "bg-[hsl(0,0%,20%)]" : "bg-[hsl(0,0%,85%)]"
                  )}
                />
              )}
            </div>
          );
        })}

        {/* Divider before theme toggle */}
        <div
          className={cn(
            "w-px h-5 mx-1",
            isDark ? "bg-[hsl(0,0%,20%)]" : "bg-[hsl(0,0%,85%)]"
          )}
        />

        {/* Theme toggle */}
        <button
          onClick={handleThemeToggle}
          className={cn(
            "relative z-10 flex items-center justify-center w-11 h-11 rounded-[14px] text-muted-foreground hover:text-foreground transition-all duration-200",
            themeBounce && "animate-theme-bounce"
          )}
          aria-label="Toggle theme"
        >
          <div className="relative w-[18px] h-[18px]">
            <Sun
              className={cn(
                "absolute inset-0 w-[18px] h-[18px] transition-all duration-300",
                isDark
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 rotate-90 scale-50"
              )}
              strokeWidth={1.5}
            />
            <Moon
              className={cn(
                "absolute inset-0 w-[18px] h-[18px] transition-all duration-300",
                isDark
                  ? "opacity-0 -rotate-90 scale-50"
                  : "opacity-100 rotate-0 scale-100"
              )}
              strokeWidth={1.5}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
