import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer role="contentinfo" className="border-t border-border/30 py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg sm:text-xl font-semibold">
              Bibue
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xs">
              Discover, track, and share your favorite anime &amp; manga.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Browse</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/anime" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Anime</Link></li>
              <li><Link to="/manga" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Manga</Link></li>
              <li><Link to="/rankings" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Rankings</Link></li>
              <li><Link to="/community" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
              <li><Link to="/community" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Connect</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">AniList</a></li>
              <li><a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">MyAnimeList</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Legal</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-border/30 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bibue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
