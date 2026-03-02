import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Users, LogIn } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));
import bibueTower from "@/assets/bibue-tower.png";

export function CollapsibleNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const scrollRef = useRef(0);
  const { t } = useLanguage();
  const { user } = useAuth();

  const navLinks = [
    { href: "/manga", label: "Browse Manga" },
    { href: "/originals", label: "Originals" },
    { href: "/studio", label: "Studio" },
    { href: "/community", label: t("nav.community") },
  ];

  // Mobile menu only shows non-swipable pages
  const mobileMenuLinks = [
    { href: "/seasonal", label: "Seasonal" },
    { href: "/schedule", label: "Schedule" },
    { href: "/news", label: t("nav.news") },
    { href: "/recommendations", label: t("nav.forYou") },
    { href: "/manga", label: "Browse by Genre" },
    { href: "/for-creators", label: "For Creators" },
    { href: "/support", label: "Support" },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsVisible(true);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - scrollRef.current;

        if (!isMobileMenuOpen) {
          if (scrollDelta > 10 && currentScrollY > 150) {
            setIsVisible(false);
          } else if (scrollDelta < -5 || currentScrollY < 50) {
            setIsVisible(true);
          }
        }

        setIsScrolled(currentScrollY > 30);
        scrollRef.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <nav
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out transform-gpu",
          isScrolled ? "liquid-glass-strong py-2" : "bg-transparent py-3",
          !isVisible && "-translate-y-full pointer-events-none"
        )}
        style={{
          transitionProperty: "transform, opacity, background-color, padding",
          willChange: "transform",
        }}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-1.5">
              <div className="h-8 sm:h-10 w-auto flex items-center justify-center">
                <img
                  src={bibueTower}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-auto object-contain dark:brightness-0 dark:invert logo-stable"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              <span className="text-lg sm:text-xl font-sacred font-semibold tracking-wide">
                Bibue
              </span>
            </Link>

            {/* Center: nav links — desktop only */}
            <div className="hidden md:flex items-center justify-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    location.pathname === link.href
                      ? "text-foreground bg-foreground/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right: search + desktop actions + hamburger (mobile) */}
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full hover:bg-foreground/5 h-9 w-9"
                aria-label={t("nav.search")}
              >
                <Search className="w-5 h-5" />
              </Button>

              <NotificationBell />

              <div className="hidden md:block">
                <ThemeSelector />
              </div>

              <div className="hidden md:block">
                <UserMenu />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden fixed top-14 left-3 right-3 z-[55] bg-popover/95 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg",
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="p-3 space-y-0.5">
            {mobileMenuLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "text-foreground bg-foreground/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Theme toggle */}
            <ThemeSelector variant="text" />

            {user && (
              <Link
                to="/settings"
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === "/settings"
                    ? "text-foreground bg-foreground/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.settings")}
              </Link>
            )}

            {!user && (
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                {t("auth.signIn")}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[49] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </Suspense>
      )}
    </>
  );
}
