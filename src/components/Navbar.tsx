import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useMessages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import bibueLogo from "@/assets/bibue-logo.jpg";
import bibueTower from "@/assets/bibue-tower.png";

// Primary nav items shown directly (no Home - logo serves as home)
const primaryLinks = [
  { href: "/anime", label: "Anime" },
  { href: "/manga", label: "Manga" },
  { href: "/news", label: "News" },
  { href: "/rankings", label: "Rankings" },
];

// Community dropdown items
const communityLinks = [
  { href: "/community", label: "Discussions" },
  { href: "/messages", label: "Messages" },
];

// All links for mobile menu
const allLinks = [...primaryLinks, ...communityLinks];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadCount();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isCommunityActive = communityLinks.some(link => location.pathname === link.href);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 pointer-events-none">
        <div className="w-full px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-4 pointer-events-auto relative">
            {/* Left: Mobile menu + Logo */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Menu Button - now on left */}
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

              <Link to="/" className="flex items-center gap-2">
                <div className="h-12 sm:h-14 w-auto flex items-center justify-center">
                  <img 
                    src={bibueTower} 
                    alt="Bibue Tower" 
                    className="h-full w-auto object-contain dark:invert logo-stable"
                    loading="eager"
                    decoding="sync"
                  />
                </div>
                <span className="text-2xl sm:text-3xl font-sacred font-semibold tracking-wide">
                  Bibue
                </span>
              </Link>
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex items-center gap-1">
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
              
              {/* Community Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 relative cursor-pointer",
                      isCommunityActive
                        ? "text-foreground bg-foreground/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    <span>Community</span>
                    {user && (unreadCount ?? 0) > 0 && (
                      <Badge 
                        variant="default" 
                        className="ml-1 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                      >
                        {unreadCount && unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[140px]">
                  {communityLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        to={link.href}
                        className={cn(
                          "flex items-center justify-between w-full",
                          location.pathname === link.href && "bg-accent"
                        )}
                      >
                        {link.label}
                        {link.href === "/messages" && user && (unreadCount ?? 0) > 0 && (
                          <Badge 
                            variant="default" 
                            className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                          >
                            {unreadCount && unreadCount > 9 ? "9+" : unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
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
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden fixed top-14 sm:top-16 left-3 right-3 sm:left-4 sm:right-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden transition-all duration-200 pointer-events-auto shadow-lg",
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="p-3 sm:p-4 space-y-1">
            {/* Primary Links */}
            {primaryLinks.map((link) => (
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
            
            {/* Divider */}
            <div className="h-px bg-border/50 my-2" />
            
            {/* Community Section */}
            <div className="px-3 sm:px-4 py-1">
              <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Community</span>
            </div>
            {communityLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === link.href
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                {link.label}
                {link.href === "/messages" && user && (unreadCount ?? 0) > 0 && (
                  <Badge 
                    variant="default" 
                    className="h-5 min-w-5 px-1.5 text-xs"
                  >
                    {unreadCount && unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
