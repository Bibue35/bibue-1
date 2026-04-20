'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bookmark, Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Manga', href: '/manga' },
  { label: 'Anime', href: '/anime' },
  { label: 'Classics', href: '/classics' },
  { label: 'Originals', href: '/originals' },
  { label: 'Rankings', href: '/rankings' },
];

export default function Nav({
  user,
}: {
  user?: { email?: string | null; display_name?: string | null } | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bibue-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('bibue-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-400',
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border/60'
          : 'bg-background/0 border-b border-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-400',
            scrolled ? 'h-14' : 'h-16 md:h-20',
          )}
        >
          <Link href="/" className="group flex items-center gap-2" aria-label="Bibue home">
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="font-editorial text-xl md:text-2xl font-bold tracking-wider text-primary"
            >
              BIBUE
            </motion.span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-2 text-sm text-foreground/70 hover:text-foreground transition-colors group"
              >
                {item.label}
                <span className="absolute left-3 right-3 bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <IconButton aria-label="Search"><Search className="w-4 h-4" strokeWidth={1.75} /></IconButton>
            <IconButton aria-label="Bookmarks"><Bookmark className="w-4 h-4" strokeWidth={1.75} /></IconButton>
            <IconButton aria-label="Toggle theme" onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4" strokeWidth={1.75} /> : <Moon className="w-4 h-4" strokeWidth={1.75} />}
            </IconButton>

            {user ? (
              <Link
                href="/account"
                className="ml-2 hidden sm:inline-flex px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-shadow"
              >
                {user.display_name ?? 'Account'}
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="ml-2 hidden sm:inline-flex px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
              >
                Sign in
              </Link>
            )}

            <IconButton className="md:hidden" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </IconButton>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-base rounded-lg hover:bg-muted transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href={user ? '/account' : '/sign-in'}
                onClick={() => setMenuOpen(false)}
                className="mt-2 mx-3 px-4 py-3 rounded-full bg-primary text-primary-foreground text-center text-sm font-medium"
              >
                {user ? 'Account' : 'Sign in'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function IconButton({
  children,
  onClick,
  className,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label': string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        'p-2 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted transition-colors cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
