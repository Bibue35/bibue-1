import { useState, useEffect } from "react";
import { Home, BookOpen, Compass, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";

function GlowBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <div className="relative group/badge">
      <div className="absolute -inset-1 rounded-full opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle,rgba(29,161,242,0.25)_0%,transparent_70%)]" />
      <div
        className="relative flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums"
        style={{
          background: "linear-gradient(135deg, #D1D1D1 0%, #A8A8A8 50%, #E0E0E0 100%)",
          color: "#0a0a0a",
          boxShadow: "0 2px 8px rgba(168,168,168,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        <Sparkles className="w-3 h-3" />
        {count}
      </div>
    </div>
  );
}

export function GlassPillToolbar() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { watchlist } = useWatchlist();
  const seriesCount = watchlist?.length ?? 0;

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/manga", icon: BookOpen, label: "Browse" },
    { href: "/originals", icon: Compass, label: "Originals" },
  ];

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[52] transition-all duration-500 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-6 pointer-events-none"
      )}
    >
      <div
        className="flex items-center gap-1 px-2 h-14 rounded-full"
        style={{
          background: "rgba(15, 15, 15, 0.65)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(192, 192, 192, 0.35)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}
      >
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isActive
                  ? "text-foreground bg-foreground/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}

        {user && seriesCount > 0 && (
          <>
            <div className="w-px h-6 bg-[rgba(192,192,192,0.2)] mx-1" />
            <Link to="/library" className="flex items-center">
              <GlowBadge count={seriesCount} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
