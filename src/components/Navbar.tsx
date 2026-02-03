import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import bibueLogo from "@/assets/bibue-logo-horizontal.png";

// Primary nav items shown directly
const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/anime", label: "Anime" },
  { href: "/manga", label: "Manga" },
];

// Secondary items in "More" dropdown
const moreLinks = [
  { href: "/rankings", label: "Rankings" },
  { href: "/community", label: "Community" },
];

// All links for mobile menu
const allLinks = [...primaryLinks, ...moreLinks];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isMoreActive = moreLinks.some(link => location.pathname === link.href);

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
          className="h-10 sm:h-12 md:h-14 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert"
        />
      </Link>

      <nav className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 pointer-events-none">
        <div className="w-full px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between pointer-events-auto relative">
            {/* Left spacer for logo */}
            <div className="w-32 sm:w-36 md:w-40" />

            {/* Center: Navigation - absolutely centered */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {primaryLinks.map((link) => (
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
              
              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300",
                      isMoreActive
                        ? "text-foreground bg-foreground/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    More <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[140px]">
                  {moreLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        to={link.href}
                        className={cn(
                          location.pathname === link.href && "bg-accent"
                        )}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right: Icons - tighter spacing on mobile */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground h-9 w-9 sm:h-10 sm:w-10"
              >
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>

              <ThemeSelector />
              
              <UserMenu />

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full h-9 w-9 sm:h-10 sm:w-10"
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

        {/* Mobile Menu - improved styling */}
        <div
          className={cn(
            "md:hidden fixed top-14 sm:top-16 left-3 right-3 sm:left-4 sm:right-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden transition-all duration-200 pointer-events-auto shadow-lg",
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="p-3 sm:p-4 space-y-0.5 sm:space-y-1">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "block px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-colors",
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
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
