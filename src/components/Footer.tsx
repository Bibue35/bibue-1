import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { to: "/manga", label: "Browse Manga" },
  { to: "/originals", label: "Originals" },
  { to: "/studio", label: "Studio" },
  { to: "/community", label: "Community" },
  { to: "/terms", label: "Guidelines" },
  { to: "/privacy", label: "Legal" },
  { to: "/support", label: "Support" },
];

export function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-border/20 bg-background footer-glow-line">
      <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-4">
          <Link to="/" className="text-3xl sm:text-4xl font-editorial liquid-metal-text tracking-tight">
            Bibue
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
            A legal platform for original manga, manhwa &amp; manhua creators.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="mt-10 mx-auto w-40 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

        {/* Nav links */}
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors nav-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social icons */}
        <div className="mt-10 flex items-center justify-center gap-5">
          <span className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground/50 cursor-default hover-grow" title="Coming soon">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </span>
          <span className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground/50 cursor-default hover-grow" title="Coming soon">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
          </span>
          <span className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground/50 cursor-default hover-grow" title="Coming soon">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </span>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/15 text-center">
          <p className="text-[11px] sm:text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Bibue. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
