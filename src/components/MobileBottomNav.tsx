import { Link, useLocation } from "react-router-dom";
import { Compass, BookOpen, Palette, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense, useState } from "react";

const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));

const NAV_ITEMS = [
  { href: "/manga", label: "Browse", icon: Compass },
  { href: "/originals", label: "Originals", icon: BookOpen },
  { href: "/studio", label: "Studio", icon: Palette },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  // Hide on certain pages (admin, reader, etc.)
  const hiddenPaths = ["/admin", "/creator/dashboard"];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  const meHref = user ? "/settings" : undefined;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/30 safe-area-bottom"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[56px] min-w-[64px] transition-colors touch-manipulation active:scale-95",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* Me tab */}
          {user ? (
            <Link
              to="/settings"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[56px] min-w-[64px] transition-colors touch-manipulation active:scale-95",
                location.pathname === "/settings" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <User className="w-5 h-5" strokeWidth={location.pathname === "/settings" ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-tight">Me</span>
            </Link>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-h-[56px] min-w-[64px] text-muted-foreground transition-colors touch-manipulation active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content being hidden behind the nav */}
      <div className="md:hidden h-[calc(56px+env(safe-area-inset-bottom,0px))]" />

      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
        </Suspense>
      )}
    </>
  );
}
