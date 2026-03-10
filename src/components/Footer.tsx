import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { to: "/manga", label: "Browse" },
  { to: "/originals", label: "Originals" },
  { to: "/studio", label: "Studio" },
  { to: "/community", label: "Community" },
  { to: "/terms", label: "Guidelines" },
  { to: "/privacy", label: "Legal" },
  { to: "/support", label: "Support" },
];

export function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-border/10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {/* Brand */}
        <div className="mb-12">
          <Link to="/" className="text-2xl sm:text-3xl font-sacred font-bold tracking-[0.15em] uppercase">
            Bibue
          </Link>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
            A legal platform for original manga, manhwa &amp; manhua creators.
          </p>
        </div>

        {/* Links — horizontal */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2 mb-12">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 tracking-wide uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="text-[11px] text-muted-foreground/50">
          &copy; {new Date().getFullYear()} Bibue. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
