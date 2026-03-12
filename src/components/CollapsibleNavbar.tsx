import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchModal } from "./SearchModal";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import bibueTower from "@/assets/bibue-tower.png";
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/manga", label: "Browse" },
  { href: "/originals", label: "Originals" },
  { href: "/studio", label: "Studio" },
  { href: "/seek", label: "Seek" },
  { href: "/community", label: "Community" },
];

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
    if (isMobileMenuOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

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
      </nav>

      {/* ── Mobile Sidebar ── */}
      {/* Scrim — light so background shows through */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-[60] transition-opacity duration-400",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Sidebar panel — true glassmorphic */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-[61] w-[85vw] max-w-[340px] flex flex-col",
          "transition-transform duration-[400ms]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.2, 0.64, 1)",
          background: "linear-gradient(170deg, rgba(12, 12, 18, 0.48) 0%, rgba(18, 18, 28, 0.52) 50%, rgba(10, 10, 15, 0.45) 100%)",
          backdropFilter: "blur(40px) saturate(1.6) brightness(0.95)",
          WebkitBackdropFilter: "blur(40px) saturate(1.6) brightness(0.95)",
          borderRight: "1px solid rgba(192, 192, 192, 0.18)",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.04), 8px 0 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Metallic top edge highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(192,192,192,0.15) 30%, rgba(232,232,232,0.2) 50%, rgba(192,192,192,0.15) 70%, transparent 100%)",
          }}
        />

        {/* ── Header: Logo + Close ── */}
        <div className="flex items-center justify-between px-6 pt-7 pb-5">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              src={bibueTower}
              alt="Bibue Tower"
              className="h-7 w-auto object-contain dark:brightness-0 dark:invert logo-stable transition-all duration-700 group-hover:drop-shadow-[0_0_12px_rgba(192,192,192,0.6)]"
              style={{
                filter: isMobileMenuOpen ? "drop-shadow(0 0 6px rgba(192,192,192,0.25))" : "none",
                transition: "filter 0.8s ease-out",
              }}
              loading="eager"
              decoding="sync"
            />
            <span
              className="text-lg font-sacred font-bold tracking-[0.18em] uppercase transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(192,192,192,0.35)]"
              style={{ color: "#FFFFFF" }}
            >
              Bibue
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 -mr-2 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA1F2]"
            style={{ color: "#FFFFFF" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(192,192,192,0.08)";
              e.currentTarget.style.boxShadow = "0 0 8px rgba(29,161,242,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
            <span className="text-[11px] font-medium tracking-[0.15em] uppercase">Close</span>
          </button>
        </div>

        {/* ── Primary Navigation ── */}
        <nav className="flex-1 px-6 pt-2 overflow-y-auto" aria-label="Mobile menu">
          <ul className="space-y-0.5">
            {PRIMARY_LINKS.map((link, i) => {
              const isActive = link.href === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group relative block py-3.5 px-3 -mx-3 rounded-xl text-[1.4rem] font-sacred font-bold tracking-[0.06em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA1F2] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    style={{
                      color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                      transitionDelay: isMobileMenuOpen ? `${60 + i * 40}ms` : "0ms",
                      transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-16px)",
                      opacity: isMobileMenuOpen ? 1 : 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FFFFFF";
                      e.currentTarget.style.background = "rgba(192,192,192,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isActive ? "#FFFFFF" : "rgba(255,255,255,0.75)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-2 left-3 h-[2px] w-7 rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #1DA1F2, #4BBCF7, #1DA1F2)",
                          boxShadow: "0 0 8px rgba(29, 161, 242, 0.4)",
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── Divider ── */}
          <div
            className="my-6 mx-0"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, rgba(31,31,31,0.9) 0%, rgba(80,80,80,0.3) 50%, rgba(31,31,31,0.9) 100%)",
            }}
          />

          {/* ── Secondary Actions ── */}
          <ul className="space-y-1">
            <li
              style={{
                transitionDelay: isMobileMenuOpen ? "300ms" : "0ms",
                transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-16px)",
                opacity: isMobileMenuOpen ? 1 : 0,
                transition: "all 300ms ease-out",
              }}
            >
              <ThemeSelector variant="text" />
            </li>
            {user ? (
              <li>
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-3 -mx-3 rounded-xl text-sm font-medium tracking-[0.14em] uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA1F2]"
                  style={{
                    color: "rgba(224, 224, 224, 0.7)",
                    transitionDelay: isMobileMenuOpen ? "340ms" : "0ms",
                    transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-16px)",
                    opacity: isMobileMenuOpen ? 1 : 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.background = "rgba(192,192,192,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(224, 224, 224, 0.7)"; e.currentTarget.style.background = "transparent"; }}
                >
                  Settings
                </Link>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => { setAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left py-2.5 px-3 -mx-3 rounded-xl text-sm font-medium tracking-[0.14em] uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA1F2]"
                  style={{
                    color: "rgba(224, 224, 224, 0.7)",
                    transitionDelay: isMobileMenuOpen ? "340ms" : "0ms",
                    transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-16px)",
                    opacity: isMobileMenuOpen ? 1 : 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.background = "rgba(192,192,192,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(224, 224, 224, 0.7)"; e.currentTarget.style.background = "transparent"; }}
                >
                  Sign In
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* ── Footer ── */}
        <div
          className="px-6 pb-6 pt-3 text-center"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
        >
          <p
            className="text-[8px] tracking-[0.3em] uppercase leading-relaxed"
            style={{ color: "rgba(192, 192, 192, 0.25)" }}
          >
            Bibue — Unifying East Asian Stories
          </p>
        </div>

        {/* Metallic bottom edge highlight */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(192,192,192,0.1) 30%, rgba(232,232,232,0.12) 50%, rgba(192,192,192,0.1) 70%, transparent 100%)",
          }}
        />
      </aside>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </Suspense>
      )}
    </>
  );
}
