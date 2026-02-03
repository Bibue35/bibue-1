import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import bibueLogo from "@/assets/bibue-logo.jpg";

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
      {/* Fixed Logo - Always Visible */}
      <Link 
        to="/" 
        className="fixed top-2 left-3 sm:top-3 sm:left-4 z-[60] flex items-center"
      >
        <img 
          src={bibueLogo} 
          alt="Bibue" 
          className="h-16 sm:h-20 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert"
        />
      </Link>

      {/* Fixed navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left spacer for logo */}
            <div className="w-20 sm:w-24" />

            {/* Center nav links - desktop only */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
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
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full hover:bg-foreground/5"
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
      </nav>

      {/* Mobile menu dropdown */}
      <div
        className={cn(
          "md:hidden fixed top-16 left-3 right-3 sm:left-4 sm:right-4 z-[55] bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg",
          isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-3 sm:p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                location.pathname === link.href
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
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
