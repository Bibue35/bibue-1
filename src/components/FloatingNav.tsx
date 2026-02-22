import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useMessages";
import { useLanguage } from "@/contexts/LanguageContext";
import bibueTower from "@/assets/bibue-tower.png";

export function FloatingNav() {
  const { t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadCount();

  const navLinks = [
    { href: "/anime", label: t("nav.anime") },
    { href: "/manga", label: t("nav.manga") },
    { href: "/seasonal", label: "Seasonal" },
    { href: "/schedule", label: "Schedule" },
    
    { href: "/news", label: t("nav.news") },
    { href: "/recommendations", label: t("nav.forYou") },
  ];

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
      {/* Static nav - scrolls with page */}
      <nav
        aria-label="Main navigation"
        className={cn(
          "w-full z-50 transition-all duration-300",
          "bg-background/50 backdrop-blur-sm"
        )}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo - left side */}
            <Link to="/" className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              <div className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto flex items-center justify-center">
                <img 
                  src={bibueTower} 
                  alt="Bibue Tower" 
                  width={28}
                  height={40}
                  className="h-full w-auto object-contain dark:brightness-0 dark:invert logo-stable"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-sacred font-semibold tracking-wide">
                Bibue
              </span>
            </Link>

            {/* Center nav links - desktop only, absolutely centered */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
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
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-foreground/10"
                aria-label="Community"
                asChild
              >
                <Link to="/community">
                  <Users className="w-5 h-5" />
                  {user && (unreadCount ?? 0) > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                    >
                      {unreadCount && unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              <ThemeSelector />
              <UserMenu />

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full hover:bg-foreground/10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      <div
        className={cn(
          "fixed top-16 left-4 right-4 z-50 bg-background/95 backdrop-blur-md border border-border/30 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg",
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-3 space-y-0.5 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                location.pathname === link.href
                  ? "text-foreground bg-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
