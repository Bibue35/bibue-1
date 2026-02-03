import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import bibueLogo from "@/assets/bibue-logo.jpg";
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
  const location = useLocation();

  return (
    <>
      {/* Scrolls with page - not fixed */}
      <div className="relative z-50 pt-4 pb-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo - left side */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={bibueTower} 
                alt="Bibue Tower" 
                className="h-10 sm:h-12 w-auto object-contain dark:invert"
              />
              <span className="text-2xl font-sacred font-semibold tracking-wide">
                Bibue
              </span>
            </Link>

            {/* Center nav links - desktop only */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full",
                    location.pathname === link.href
                      ? "text-foreground bg-foreground/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full"
              >
                <Search className="w-5 h-5" />
              </Button>

              <ThemeSelector />
              <UserMenu />

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="relative z-50 px-4 md:hidden">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium",
                  location.pathname === link.href
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
