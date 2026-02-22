import { useState, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { UserMenu } from "./UserMenu";
import { ThemeSelector } from "./ThemeSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));
import bibueTower from "@/assets/bibue-tower.png";

export function CollapsibleNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const primaryLinks = [
    { href: "/anime", label: t("nav.anime") },
    { href: "/manga", label: t("nav.manga") },
    { href: "/seasonal", label: "Seasonal" },
    { href: "/schedule", label: "Schedule" },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <nav
        aria-label="Main navigation"
        className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/10"
      >
        <div className="container mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <img
              src={bibueTower}
              alt=""
              width={32}
              height={32}
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert logo-stable"
              loading="eager"
              decoding="sync"
            />
            <span className="text-base font-sacred font-semibold tracking-wide">
              Bibue
            </span>
          </Link>

          {/* Center: Nav links — desktop only */}
          {!isMobile && (
            <div className="flex items-center gap-0.5">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                    location.pathname === link.href
                      ? "text-foreground bg-foreground/8"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right: Search + Auth */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("nav.search")}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <ThemeSelector />

            {!isMobile && <UserMenu />}

            {isMobile && !user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("auth.signIn")}
              >
                <User className="w-[18px] h-[18px]" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </Suspense>
      )}
    </>
  );
}
