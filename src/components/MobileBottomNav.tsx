import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/__search__", icon: Search, label: "Search" },
  { href: "/seasonal", icon: Calendar, label: "Seasonal" },
  { href: "/watchlist", icon: Bookmark, label: "Watchlist" },
  { href: "/settings", icon: User, label: "Profile" },
] as const;

interface MobileBottomNavProps {
  onSearchOpen?: () => void;
}

export const MobileBottomNav = memo(function MobileBottomNav({ onSearchOpen }: MobileBottomNavProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href === "/__search__") return false;
    return location.pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/20 safe-area-bottom"
    >
      <div className="flex items-center justify-around h-14 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          if (tab.href === "/__search__") {
            return (
              <button
                key={tab.href}
                onClick={onSearchOpen}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 text-muted-foreground"
                aria-label={tab.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          const href = tab.href === "/settings" && user
            ? `/user/${user.id}`
            : tab.href;

          return (
            <Link
              key={tab.href}
              to={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("w-5 h-5", active && "text-primary")} />
              <span className={cn("text-[10px] font-medium", active && "text-primary")}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
