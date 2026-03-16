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
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const scrollRef = useRef(0);
  const { user } = useAuth();

  const navLinks = [
    { href: "/originals", label: "Originals" },
    { href: "/community", label: "Community" },
    ...(user ? [{ href: "/watchlist", label: "Library" }] : []),
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
        setScrollOpacity(Math.min(1, currentScrollY / 150));
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
          "fixed top-0 left-0 right-0 transform-gpu",
          "transition-[transform,padding] duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isMobileMenuOpen ? "z-[120]" : "z-50",
          scrollOpacity > 0.05 ? "navbar-shimmer-line" : "",
          !isVisible && "-translate-y-full pointer-events-none"
        )}
        style={{
          willChange: "transform",
          backgroundColor: `hsl(var(--background) / ${scrollOpacity * 0.85})`,
          backdropFilter: `blur(${scrollOpacity * 24}px)`,
          WebkitBackdropFilter: `blur(${scrollOpacity * 24}px)`,
          paddingTop: `${scrollOpacity > 0.5 ? 0.75 : 1.25}rem`,
          paddingBottom: `${scrollOpacity > 0.5 ? 0.75 : 1.25}rem`,
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
      </nav>

      {/* Mobile Menu — frosted glass overlay */}
      {/* Backdrop scrim — dark tint + captures taps to close */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[200] bg-background/60 backdrop-blur-sm transition-opacity duration-300",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        onTouchStart={(e) => {
          (e.currentTarget as any)._swipeStartX = e.touches[0].clientX;
          (e.currentTarget as any)._swipeStartY = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const startX = (e.currentTarget as any)._swipeStartX;
          const startY = (e.currentTarget as any)._swipeStartY;
          if (startX == null) return;
          const endX = e.changedTouches[0].clientX;
          const diffX = startX - endX;
          const diffY = Math.abs(e.changedTouches[0].clientY - startY);
          if (diffX > 60 && diffY < 100) {
            setIsMobileMenuOpen(false);
          }
        }}
      />
      {/* Slide-in panel — heavy frosted glass (colors bleed, text unreadable) */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-[201] w-[85%] max-w-[340px]",
          "bg-background/85 backdrop-blur-[80px] backdrop-saturate-150",
          "border-r border-border/10",
          "transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        )}
        onTouchStart={(e) => {
          (e.currentTarget as any)._swipeStartX = e.touches[0].clientX;
          (e.currentTarget as any)._swipeStartY = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const startX = (e.currentTarget as any)._swipeStartX;
          const startY = (e.currentTarget as any)._swipeStartY;
          if (startX == null) return;
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const diffX = startX - endX;
          const diffY = Math.abs(endY - startY);
          if (diffX > 60 && diffY < 100) {
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <div className="px-6 pt-6 pb-8 h-full flex flex-col">
          {/* Header — logo + close */}
          <div className={cn(
            "flex items-center justify-between mb-10 transition-all duration-300",
            isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )} style={{ transitionDelay: isMobileMenuOpen ? "150ms" : "0ms" }}>
            <Link to="/" className="flex items-center gap-1.5 group" onClick={() => setIsMobileMenuOpen(false)}>
              <img
                src={bibueTower}
                alt="Bibue"
                className="h-7 w-auto object-contain dark:brightness-0 dark:invert logo-stable"
              />
              <span className="text-lg font-sacred font-bold tracking-[0.15em] uppercase text-foreground">
                Bibue
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-200 btn-press"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              {[
                { href: "/manga", label: "Browse", sub: "Discover manga" },
                { href: "/originals", label: "Originals", sub: "Bibue exclusives" },
                { href: "/watchlist", label: "Library", sub: "Your bookmarks", requiresAuth: true },
                { href: "/community", label: "Community", sub: "Discuss & connect" },
              ].filter(l => !('requiresAuth' in l && l.requiresAuth) || user).map((link, i) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "block py-4 border-b border-foreground/10",
                    "transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                    location.pathname !== link.href && "hover:pl-2"
                  )}
                  style={{ transitionDelay: isMobileMenuOpen ? `${200 + i * 60}ms` : "0ms" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-label block text-2xl font-sacred font-bold tracking-wide text-foreground">
                    {link.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground/50 tracking-wide mt-0.5">
                    {link.sub}
                  </span>
                </Link>
              ))}


              <div className={cn(
                "transition-all duration-300 ease-out",
                isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )} style={{ transitionDelay: isMobileMenuOpen ? "440ms" : "0ms" }}>
                <ThemeSelector variant="text" />
              </div>

              <div className="my-2 h-px bg-foreground/10" />

              {user ? (
                <Link
                  to="/settings"
                  className={cn(
                    "block py-4 text-2xl font-sacred font-bold tracking-wide text-muted-foreground hover:text-foreground hover:pl-2 transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: isMobileMenuOpen ? "500ms" : "0ms" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              ) : (
                <div className={cn(
                  "pt-6 transition-all duration-300 ease-out",
                  isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )} style={{ transitionDelay: isMobileMenuOpen ? "500ms" : "0ms" }}>
                  <button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-6 rounded-full border border-border/30 text-sm font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300 btn-press"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </Suspense>
      )}
    </>
  );
}
