import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeToggle } from "./ThemeToggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/anime", label: "Anime" },
  { href: "/manga", label: "Manga" },
  { href: "/rankings", label: "Rankings" },
  { href: "/community", label: "Community" },
];

export function CollapsibleNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const location = useLocation();
  const collapseTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      // Auto-collapse nav when scrolled down
      if (currentScrollY > 200) {
        setIsNavExpanded(false);
      } else {
        setIsNavExpanded(true);
      }
      
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
        className="fixed top-4 left-4 z-[60] flex items-center gap-2"
      >
        <span className="text-2xl font-sacred font-semibold tracking-wide">
          Bibue
        </span>
      </Link>

      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "liquid-glass-strong py-2"
            : "bg-transparent py-4",
          !isVisible && "transform -translate-y-full opacity-0"
        )}
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
                  "flex items-center gap-1 transition-all duration-500",
                  isNavExpanded ? "opacity-100" : "opacity-0"
                )}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
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

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Expand/Collapse button for desktop */}
              {isScrolled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNavExpanded(!isNavExpanded)}
                  className="hidden md:flex rounded-full hover:bg-foreground/5 transition-all duration-300"
                >
                  {isNavExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full hover:bg-foreground/5"
              >
                <Search className="w-5 h-5" />
              </Button>

              <ThemeToggle />

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
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed top-16 left-0 right-0 z-[55] liquid-glass-strong border-t border-border/30 animate-fade-in"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
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
        )}
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
