import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import bibueTower from "@/assets/bibue-tower.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/anime", label: "Anime" },
  { href: "/manga", label: "Manga" },
  { href: "/rankings", label: "Rankings" },
];

export function FloatingNav() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      {/* Desktop navbar - top */}
      <nav
        className={cn(
          "hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-border/10" 
            : "bg-transparent"
        )}
      >
        <div className="w-full px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - left side */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={bibueTower} 
                alt="Bibue Tower" 
                className="h-12 sm:h-14 w-auto object-contain brightness-0 dark:brightness-0 dark:invert"
              />
              <span className="text-2xl sm:text-3xl font-sacred font-semibold tracking-wide">
                Bibue
              </span>
            </Link>

            {/* Center nav links */}
            <div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full hover:bg-foreground/10"
              >
                <Search className="w-5 h-5" />
              </Button>

              <ThemeSelector />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile navbar - bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/20 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground transition-all duration-200"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs font-medium">Search</span>
          </button>
        </div>
      </nav>

      {/* Mobile header - logo only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={bibueTower} 
            alt="Bibue Tower" 
            className="h-10 w-auto object-contain brightness-0 dark:brightness-0 dark:invert"
          />
          <span className="text-xl font-sacred font-semibold tracking-wide">
            Bibue
          </span>
        </Link>
        <div className="flex items-center gap-0.5">
          <ThemeSelector />
          <UserMenu />
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
