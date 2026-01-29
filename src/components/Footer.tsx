import { Link } from "react-router-dom";
import { Sparkles, Twitter, MessageCircle, Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/30">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
              <span className="font-display text-2xl font-bold gradient-text">
                AnimeVerse
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your ultimate destination for discovering anime and manga. 
              Track your favorites, explore new series, and connect with the community.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-neon transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-neon transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-neon transition-all duration-300"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Explore</h3>
            <ul className="space-y-3">
              {[
                { label: "Trending Anime", href: "/anime" },
                { label: "Popular Manga", href: "/manga" },
                { label: "Top Rankings", href: "/rankings" },
                { label: "Airing Schedule", href: "/schedule" },
                { label: "Seasonal Charts", href: "/seasonal" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary anime-underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-3">
              {[
                { label: "API Documentation", href: "#" },
                { label: "Community Discord", href: "#" },
                { label: "Contribute", href: "#" },
                { label: "Report Issues", href: "#" },
                { label: "Feature Requests", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary anime-underline transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { label: "Terms of Service", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Cookie Policy", href: "#" },
                { label: "DMCA", href: "#" },
                { label: "Contact Us", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary anime-underline transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 AnimeVerse. Made with{" "}
            <Heart className="w-4 h-4 inline text-accent fill-accent" /> for anime fans worldwide.
          </p>
          <p className="text-sm text-muted-foreground font-jp">
            アニメとマンガを愛する人のために
          </p>
        </div>
      </div>
    </footer>
  );
}
