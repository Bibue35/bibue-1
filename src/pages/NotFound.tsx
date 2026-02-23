import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { Home, TrendingUp, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";

const funMessages = [
  "This page got isekai'd to another world! 🌀",
  "Looks like this page used a forbidden jutsu and vanished! 🍃",
  "This page went beyond Plus Ultra... and never came back! 💥",
  "Error 404: Page not found in this timeline ⏳",
  "This page was eaten by a Titan. Sorry! 🗡️",
];

const NotFound = () => {
  const { t } = useLanguage();
  const [message] = useState(() => funMessages[Math.floor(Math.random() * funMessages.length)]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    // 404 - invalid route accessed
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." noIndex />
      <main className="flex items-center justify-center min-h-screen pt-16 pb-24 px-4">
        <div className="text-center max-w-lg">
          {/* Large 404 */}
          <div className="relative mb-8">
            <span className="text-[8rem] sm:text-[10rem] font-bold leading-none text-primary/10 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{message}</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for has vanished into the void. But don't worry — there's plenty of anime and manga to explore!
          </p>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                window.location.href = `/?search=${encodeURIComponent(query.trim())}`;
              }
            }}
            className="relative max-w-sm mx-auto mb-8"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anime or manga..."
              className="w-full h-12 pl-11 pr-4 rounded-full bg-card border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </form>

          {/* Navigation links */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild className="gap-2 rounded-full">
              <Link to="/">
                <Home className="w-4 h-4" />
                Homepage
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2 rounded-full">
              <Link to="/anime">
                <TrendingUp className="w-4 h-4" />
                Trending
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
