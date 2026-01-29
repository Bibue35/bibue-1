import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";

const navLinks = [
  { href: "/", label: "Home", jp: "ホーム" },
  { href: "/anime", label: "Anime", jp: "アニメ" },
  { href: "/manga", label: "Manga", jp: "漫画" },
  { href: "/rankings", label: "Rankings", jp: "ランキング" },
  { href: "/news", label: "News", jp: "ニュース" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "glass-strong py-3"
            : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
                <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse" />
              </div>
              <span className="font-display text-2xl font-bold gradient-text">
                AnimeVerse
              </span>
              <span className="font-jp text-xs text-muted-foreground hidden sm:block">
                アニメバース
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative px-4 py-2 font-display text-sm uppercase tracking-wider transition-all duration-300 group",
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-anime scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  {location.pathname === link.href && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-anime" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Button variant="neon" size="sm" className="hidden sm:flex">
                Connect
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
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

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden absolute top-full left-0 right-0 glass-strong border-t border-border overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "block px-4 py-3 rounded-lg font-display uppercase tracking-wider transition-all duration-300",
                  location.pathname === link.href
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  "animate-slide-right"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="flex items-center justify-between">
                  {link.label}
                  <span className="font-jp text-xs opacity-60">{link.jp}</span>
                </span>
              </Link>
            ))}
            <Button variant="neon" className="w-full mt-4">
              Connect with AniList
            </Button>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
