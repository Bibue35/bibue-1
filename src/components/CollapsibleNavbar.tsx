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
        className="absolute top-0 left-0 w-full z-50"
      >
        <div className="container mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={bibueTower}
              alt=""
              width={36}
              height={36}
              className="h-9 w-auto object-contain dark:brightness-0 dark:invert logo-stable"
              loading="eager"
              decoding="sync"
            />
            <span className="text-xl font-sacred font-semibold tracking-wide text-foreground">
              Bibue
            </span>
          </Link>

          {/* Center: Nav links — desktop only */}
          {!isMobile && (
            <div className="flex items-center gap-8">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-base font-normal tracking-wide transition-colors duration-150",
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right: Search + Theme + Auth */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-foreground/60 hover:text-foreground transition-colors duration-150"
              aria-label={t("nav.search")}
            >
              <Search className="w-5 h-5" />
            </button>

            <ThemeSelector />

            {!isMobile && <UserMenu />}

            {isMobile && !user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 text-base text-foreground/60 hover:text-foreground transition-colors duration-150"
                aria-label={t("auth.signIn")}
              >
                <User className="w-5 h-5" />
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
