import { useState, useEffect, useCallback } from "react";
import { Search, X, Film, BookOpen, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchAnime, useSearchManga } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"anime" | "manga">("anime");
  const navigate = useNavigate();

  const { data: animeResults, isLoading: animeLoading } = useSearchAnime(query, activeTab === "anime");
  const { data: mangaResults, isLoading: mangaLoading } = useSearchManga(query, activeTab === "manga");

  const results = activeTab === "anime" ? animeResults : mangaResults;
  const isLoading = activeTab === "anime" ? animeLoading : mangaLoading;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex flex-col items-center pt-[10vh] px-4 animate-slide-down">
        <div className="w-full max-w-2xl">
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute -inset-[2px] bg-gradient-anime rounded-2xl opacity-75 blur group-focus-within:opacity-100 transition-opacity" />
            <div className="relative glass-strong rounded-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anime, manga, manhwa..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full h-16 pl-14 pr-14 bg-transparent text-xl font-body placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-primary/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("anime")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider transition-all duration-300",
                activeTab === "anime"
                  ? "bg-gradient-anime text-primary-foreground shadow-neon"
                  : "glass text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="w-4 h-4" />
              Anime
            </button>
            <button
              onClick={() => setActiveTab("manga")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider transition-all duration-300",
                activeTab === "manga"
                  ? "bg-gradient-manga text-primary-foreground shadow-neon-pink"
                  : "glass text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Manga
            </button>
          </div>

          {/* Results */}
          {query.length > 2 && (
            <div className="mt-4 glass-strong rounded-2xl max-h-[50vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : results && results.length > 0 ? (
                <div className="p-2 stagger-children">
                  {results.slice(0, 8).map((item, index) => (
                    <button
                      key={item.mal_id}
                      onClick={() => {
                        navigate(`/${activeTab}/${item.mal_id}`);
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary/10 transition-all duration-300 text-left animate-slide-up group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <img
                        src={item.images.webp.image_url}
                        alt={item.title}
                        className="w-14 h-20 object-cover rounded-lg group-hover:shadow-neon transition-shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.title_japanese}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.score && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-display">
                              ★ {item.score}
                            </span>
                          )}
                          {'episodes' in item && item.episodes && (
                            <span className="text-xs text-muted-foreground">
                              {item.episodes} eps
                            </span>
                          )}
                          {'chapters' in item && item.chapters && (
                            <span className="text-xs text-muted-foreground">
                              {item.chapters} ch
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}

          {/* Quick suggestions when empty */}
          {query.length <= 2 && (
            <div className="mt-6 text-center text-muted-foreground">
              <p className="font-jp text-lg mb-2">検索してください</p>
              <p className="text-sm">Start typing to search for anime or manga</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
