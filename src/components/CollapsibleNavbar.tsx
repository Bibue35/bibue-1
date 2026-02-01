import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    { href: "/watchlist", label: t("nav.watchlist") },
    { href: "/recommendations", label: t("nav.forYou") },
    { href: "/rankings", label: t("nav.rankings") },
  ];

  const mangaTypes = [
    { href: "/manga", label: "All Manga", texture: "default" },
    { href: "/manga?filter=manga", label: "Manga", texture: "default" },
    { href: "/manga?filter=manhwa", label: "Manhwa", texture: "light" },
    { href: "/manga?filter=manhua", label: "Manhua", texture: "light" },
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
          <div className="flex items-center justify-between">
            {/* Spacer for logo */}
            <div className="w-20" />

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
                {navLinks.map((link) => {
                  // Insert Manga dropdown after Anime
                  if (link.href === "/anime") {
                    return (
                      <>
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
                        
                        {/* Manga Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={cn(
                                "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1",
                                location.pathname === "/manga"
                                  ? "text-foreground bg-foreground/10"
                                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                              )}
                            >
                              {t("nav.manga")}
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="min-w-[140px]">
                            {mangaTypes.map((type) => (
                              <DropdownMenuItem key={type.href} asChild>
                                <Link
                                  to={type.href}
                                  className={cn(
                                    "w-full cursor-pointer",
                                    type.texture === "light" && "bg-accent/50 font-medium"
                                  )}
                                >
                                  {type.label}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    );
                  }
                  
                  return (
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
                  );
                })}
              </CollapsibleContent>
            </Collapsible>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
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
              <ThemeToggle />
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
            {navLinks.map((link) => {
              // Insert Manga section after Anime
              if (link.href === "/anime") {
                return (
                  <div key="anime-manga-section">
                    <Link
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
                    
                    {/* Manga with sub-types */}
                    <div className="space-y-0.5">
                      <Link
                        to="/manga"
                        className={cn(
                          "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          location.pathname === "/manga" && !location.search
                            ? "bg-foreground/10 text-foreground"
                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {t("nav.manga")}
                      </Link>
                      <div className="ml-4 flex gap-2">
                        {mangaTypes.slice(1).map((type) => (
                          <Link
                            key={type.href}
                            to={type.href}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                              type.texture === "light" 
                                ? "bg-accent text-accent-foreground hover:bg-accent/80" 
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {type.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
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
              );
            })}
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
