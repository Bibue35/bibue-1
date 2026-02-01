import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { IncognitoToggle } from "./IncognitoToggle";
import { UserMenu } from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export function CollapsibleNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const location = useLocation();
  const collapseTimer = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef(0);
  const { t } = useLanguage();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/anime", label: t("nav.anime") },
    { href: "/manga", label: t("nav.manga") },
    { href: "/rankings", label: t("nav.rankings") },
  ];

  // Debounced scroll handler for smoother performance
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      // Calculate scroll direction with threshold to prevent jitter
      const scrollDelta = currentScrollY - scrollRef.current;
      
      // Only hide when scrolling down significantly (>10px) and past header
      if (scrollDelta > 10 && currentScrollY > 150) {
        setIsVisible(false);
      } else if (scrollDelta < -5 || currentScrollY < 50) {
        setIsVisible(true);
      }
      
      // Smooth collapse transition
      if (currentScrollY > 200) {
        setIsNavExpanded(false);
      } else if (currentScrollY < 100) {
        setIsNavExpanded(true);
      }
      
      setIsScrolled(currentScrollY > 30);
      scrollRef.current = currentScrollY;
      setLastScrollY(currentScrollY);
    });
  }, []);

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

  // Auto-collapse after inactivity
  const handleNavHover = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
    }
    setIsNavExpanded(true);
  };

  const handleNavLeave = () => {
    if (window.scrollY > 200) {
      collapseTimer.current = setTimeout(() => {
        setIsNavExpanded(false);
      }, 2000);
    }
  };

  return (
    <>
      {/* Fixed Logo - Always Visible */}
      <Link 
        to="/" 
        className={cn(
          "fixed top-4 left-4 z-[60] flex items-center gap-2 transition-all duration-300",
          !isVisible && "opacity-0 pointer-events-none"
        )}
      >
        <span className="text-2xl font-sacred font-semibold tracking-wide">
          Bibue
        </span>
      </Link>

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          isScrolled
            ? "liquid-glass-strong py-2"
            : "bg-transparent py-4",
          !isVisible && "transform -translate-y-full pointer-events-none"
        )}
        style={{
          transitionProperty: "transform, opacity, background-color, padding",
        }}
        onMouseEnter={handleNavHover}
        onMouseLeave={handleNavLeave}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            {/* Left spacer - matches right side width */}
            <div className="flex-1" />

            {/* Desktop Navigation - Collapsible */}
            <Collapsible
              open={isNavExpanded}
              onOpenChange={setIsNavExpanded}
              className="hidden md:block"
            >
              <CollapsibleContent
                className={cn(
                  "flex items-center gap-1 transition-all duration-300 ease-out",
                  isNavExpanded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                )}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                      location.pathname === link.href
                        ? "text-foreground bg-foreground/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Right side - flex-1 to match left spacer */}
            <div className="flex-1 flex items-center justify-end gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full hover:bg-foreground/5"
                aria-label={t("nav.search")}
              >
                <Search className="w-5 h-5" />
              </Button>

              <LanguageSelector />
              <IncognitoToggle />
              <ThemeSelector />
              <UserMenu />

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

        {/* Mobile Menu - Fixed positioning to prevent overlap */}
        <div
          className={cn(
            "md:hidden fixed top-16 left-0 right-0 z-[55] liquid-glass-strong border-t border-border/30 transition-all duration-300 ease-out",
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === link.href
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
