import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import bibueTower from "@/assets/bibue-tower.png";

export function CollapsibleNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const scrollRef = useRef(0);
  const { t } = useLanguage();

  const navLinks = [
    { href: "/anime", label: t("nav.anime") },
    { href: "/manga", label: t("nav.manga") },
    { href: "/news", label: t("nav.news") },
    { href: "/rankings", label: "Rankings" },
  ];

  // When mobile menu opens, ensure navbar stays visible
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsVisible(true);
    }
  }, [isMobileMenuOpen]);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    requestAnimationFrame(() => {
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
    });
  }, [isMobileMenuOpen]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          isScrolled ? "liquid-glass-strong py-2" : "bg-transparent py-3",
          !isVisible && "transform -translate-y-full pointer-events-none"
        )}
        style={{
          transitionProperty: "transform, opacity, background-color, padding",
        }}
      >
        <div className="container mx-auto px-3 sm:px-4">
          {/* 3-column grid: left (logo) | center (nav) | right (actions) */}
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            {/* Left: hamburger (mobile) + Logo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>

              <Link to="/" className="flex items-center gap-1.5">
                <div className="h-8 sm:h-10 w-auto flex items-center justify-center">
                  <img
                    src={bibueTower}
                    alt="Bibue Tower"
                    className="h-full w-auto object-contain dark:brightness-0 dark:invert logo-stable"
                    loading="eager"
                    decoding="sync"
                  />
                </div>
                <span className="text-lg sm:text-xl font-sacred font-semibold tracking-wide">
                  Bibue
                </span>
              </Link>
            </div>

            {/* Center: nav links — desktop/tablet only, truly centered */}
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

            {/* Right: actions — balanced with left side */}
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

              {/* Theme toggle — desktop/tablet only */}
              <div className="hidden sm:block">
                <ThemeSelector />
              </div>

              <UserMenu />
            </div>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-[54] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Theme toggle in mobile menu */}
            <div className="sm:hidden flex items-center justify-between px-4 py-3 rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
