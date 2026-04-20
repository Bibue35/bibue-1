'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Search, Sun, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavProps {
  user?: { email?: string | null; display_name?: string | null } | null;
  isAdmin?: boolean;
}

type NavLink = { href: string; label: string };

export default function Nav({ user, isAdmin }: NavProps) {
  const pathname = usePathname();

  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const scrollRef = useRef(0);

  // ---- Nav links ---------------------------------------------------------
  const navLinks: NavLink[] = [
    { href: '/manga', label: 'Browse' },
    { href: '/community', label: 'Community' },
    ...(user ? [{ href: '/watchlist', label: 'Library' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Dashboard' }] : []),
  ];

  // ---- Theme toggle (light/dark, persisted) ------------------------------
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('bibue-theme') : null;
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem('bibue-theme', next ? 'dark' : 'light');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // ---- Keep navbar visible while mobile menu is open ---------------------
  useEffect(() => {
    if (isMobileMenuOpen) setIsVisible(true);
  }, [isMobileMenuOpen]);

  // ---- Cmd/Ctrl+K opens search, Esc closes overlays ----------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ---- Auto-hide on scroll-down, reveal on scroll-up (rAF) ---------------
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobileMenuOpen]);

  // ---- Close mobile menu on route change ---------------------------------
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ---- Lock body scroll while mobile menu / search are open --------------
  useEffect(() => {
    const locked = isMobileMenuOpen || isSearchOpen;
    const prev = document.body.style.overflow;
    if (locked) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // =======================================================================
  return (
    <>
      {/* Skip link (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Navbar */}
      <nav
        aria-label="Main navigation"
        className={cn(
          'fixed top-0 left-0 right-0 transform-gpu motion-reduce:transition-none',
          'transition-[transform,padding] duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isMobileMenuOpen ? 'z-[120]' : 'z-50',
          !isVisible && '-translate-y-full pointer-events-none',
        )}
        style={{
          willChange: 'transform',
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
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <div
                aria-hidden="true"
                className="h-6 sm:h-8 md:h-10 aspect-square rounded-lg bg-primary text-primary-foreground grid place-items-center font-editorial font-bold text-xs sm:text-sm md:text-base"
              >
                B
              </div>
              <span className="text-xl sm:text-2xl font-editorial font-bold tracking-[0.15em] uppercase transition-opacity duration-300 group-hover:opacity-70">
                Bibue
              </span>
            </Link>

            {/* Center nav — desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-all duration-300',
                      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-300"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="hidden md:inline-flex p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-300"
                aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <Link
                  href="/account"
                  className="hidden md:inline-flex px-3 py-2 text-[13px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  {user.display_name ?? 'Account'}
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="hidden md:inline-flex px-3 py-2 text-[13px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="md:hidden px-3 py-2 text-[13px] font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu — backdrop */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-[200] bg-background/60 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none',
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Mobile menu — slide-in panel (right-aligned) */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!isMobileMenuOpen}
        className={cn(
          'md:hidden fixed top-0 right-0 bottom-0 z-[201] w-[80%] max-w-[340px]',
          'bg-background border-l border-border/60',
          'transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="px-6 pt-6 pb-8 h-full flex flex-col">
          {/* Header — logo + close */}
          <div className="flex items-center justify-between mb-10">
            <Link
              href="/"
              className="flex items-center gap-1.5 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div
                aria-hidden="true"
                className="h-7 aspect-square rounded-lg bg-primary text-primary-foreground grid place-items-center font-editorial font-bold text-sm"
              >
                B
              </div>
              <span className="text-lg font-editorial font-bold tracking-[0.15em] uppercase text-foreground">
                Bibue
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors duration-200"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile nav links */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'block py-4 border-b border-foreground/10',
                      'text-2xl font-editorial font-bold tracking-wide',
                      'transition-all duration-300 ease-out motion-reduce:transition-none',
                      active
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:pl-2',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Theme toggle (text variant) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full text-left block py-4 border-b border-foreground/10 text-2xl font-editorial font-bold tracking-wide text-muted-foreground hover:text-foreground hover:pl-2 transition-all duration-300 ease-out motion-reduce:transition-none"
              >
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>

              <div className="my-2 h-px bg-foreground/10" />

              {user ? (
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-4 text-2xl font-editorial font-bold tracking-wide text-muted-foreground hover:text-foreground hover:pl-2 transition-all duration-300 ease-out motion-reduce:transition-none"
                >
                  {user.display_name ?? 'Account'}
                </Link>
              ) : (
                <div className="pt-6">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center py-3 px-6 rounded-full border border-border/30 text-sm font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Search modal — placeholder */}
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-[300] flex items-start justify-center px-4 pt-[15vh]"
        >
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />
          <div className="relative max-w-xl w-full bg-card border border-border rounded-2xl p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-editorial text-lg font-bold tracking-wide">Search</h2>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 -mr-1 -mt-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Full-text search across titles, authors, and genres lands in Phase 2. For now, browse
              via the Manga tab.
            </p>
            <div className="mt-5 flex items-center justify-between text-[11px] uppercase tracking-widest text-muted-foreground/70">
              <span>Phase 2 feature</span>
              <span>
                Press{' '}
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-foreground/80">
                  Esc
                </kbd>{' '}
                to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
