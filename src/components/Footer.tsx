import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Browse",
    links: [
      { label: "Anime", href: "/anime" },
      { label: "Manga", href: "/manga" },
      { label: "Rankings", href: "/rankings" },
      { label: "Community", href: "/community" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "AniList", href: "#" },
      { label: "MyAnimeList", href: "#" },
      { label: "Discord", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border/30 py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg sm:text-xl font-semibold">
              Bibue
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xs">
              Discover your next favorite anime and manga.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">{section.title}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-border/30 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Bibue. Powered by Jikan API.</p>
        </div>
      </div>
    </footer>
  );
}
