import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import bibueTower from "@/assets/bibue-tower.png";
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));

export function CollapsibleNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const scrollRef = useRef(0);
  const { user } = useAuth();

  const navLinks = [
    { href: "/manga", label: "Browse" },
    ...(user ? [
      { href: "/originals", label: "Originals" },
      { href: "/studio", label: "Studio" },
    ] : []),
    { href: "/community", label: "Community" },
  ];

  useEffect(() => {
    if (isMobileMenuOpen) setIsVisible(true);
  }, [isMobileMenuOpen]);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - scrollRef.current;
        if (!isMobileMenuOpen) {
          if (scrollDelta > 10 && currentScrollY > 150) setIsVisible(false);
          else if (scrollDelta < -5 || currentScrollY < 50) setIsVisible(true);
        }
        setIsScrolled(currentScrollY > 30);
        scrollRef.current = currentScrollY;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <nav
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 py-5",
          !isVisible && "pointer-events-none"
        )}
        style={{
          willChange: "opacity",
          transition: "opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <img
                src={bibueTower}
                alt="Bibue Tower"
                className="h-6 sm:h-8 md:h-10 w-auto object-contain dark:brightness-0 dark:invert logo-stable"
                loading="eager"
                decoding="sync"
              />
              <span className="text-xl sm:text-2xl font-sacred font-bold tracking-[0.15em] uppercase transition-opacity duration-300 group-hover:opacity-70">
                Bibue
              </span>
            </Link>

            {/* Center links — desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-all duration-300 btn-press",
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-300 btn-press"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="hidden md:block">
                <ThemeSelector />
              </div>

              <div className="hidden md:block">
                <UserMenu />
              </div>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden px-3 py-2 text-[13px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors btn-press"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? "Close" : "Menu"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — full-screen takeover */}
        <div
          className={cn(
            "md:hidden fixed inset-0 z-[55] transition-all duration-500",
            isMobileMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-background/92 backdrop-blur-3xl" />

          {/* Content layer */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Top bar — logo + close, mirrors main nav */}
            <div className="flex items-center justify-between px-4 py-5">
              <Link
                to="/"
                className="flex items-center gap-1.5 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img
                  src={bibueTower}
                  alt="Bibue Tower"
                  className="h-6 w-auto object-contain dark:brightness-0 dark:invert logo-stable"
                  loading="eager"
                  decoding="sync"
                />
                <span className="text-xl font-sacred font-bold tracking-[0.15em] uppercase">
                  Bibue
                </span>
              </Link>
              <button
                className="px-3 py-2 text-[13px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors btn-press"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                Close
              </button>
            </div>

            {/* Nav links — left-aligned, stacked, large type */}
            <div className="flex-1 flex flex-col justify-center px-8 -mt-16">
              {[
                { href: "/manga", label: "Browse" },
                { href: "/originals", label: "Originals" },
                { href: "/studio", label: "Studio" },
                { href: "/community", label: "Community" },
                { href: "/seek", label: "Seek" },
              ].map((link, i) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "block py-3 text-[2rem] font-sacred font-bold tracking-wide leading-tight transition-all duration-300",
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground/60 hover:text-foreground hover:translate-x-2"
                  )}
                  style={{
                    transitionDelay: isMobileMenuOpen ? `${i * 40}ms` : "0ms",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="w-8 h-px bg-border/20 my-4" />

              {/* Secondary actions — same alignment, smaller type */}
              <div className="space-y-3">
                {user ? (
                  <Link
                    to="/settings"
                    className="block text-sm font-medium tracking-wide uppercase text-muted-foreground/50 hover:text-foreground transition-all duration-300 hover:translate-x-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-sm font-medium tracking-wide uppercase text-muted-foreground/50 hover:text-foreground transition-all duration-300 hover:translate-x-1"
                  >
                    Sign In
                  </button>
                )}
                <div className="inline-block">
                  <ThemeSelector variant="text" />
                </div>
              </div>
            </div>

            {/* Bottom hint */}
            <p className="pb-8 text-center text-[9px] tracking-[0.35em] uppercase text-muted-foreground/30"
               style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
            >
              Tap close or scroll to dismiss
            </p>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </Suspense>
      )}
    </>
  );
}
