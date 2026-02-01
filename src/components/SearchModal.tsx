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
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in" />

      {/* Modal */}
      <div className="relative z-10 flex flex-col items-center pt-[10vh] px-4 animate-fade-up pointer-events-none">
        <div 
          className="w-full max-w-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="relative">
            <div className="liquid-glass-strong rounded-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anime, manga..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full h-14 pl-14 pr-14 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/50 rounded-full transition-colors"
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
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "anime"
                  ? "bg-foreground text-background"
                  : "liquid-glass-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="w-4 h-4" />
              Anime
            </button>
            <button
              onClick={() => setActiveTab("manga")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                activeTab === "manga"
                  ? "bg-foreground text-background"
                  : "liquid-glass-subtle text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Manga
            </button>
          </div>

          {/* Results */}
          {query.trim().length > 0 && (
            <div className="mt-4 liquid-glass-strong rounded-2xl max-h-[50vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : results && results.length > 0 ? (
                <div className="p-2">
                  {results.slice(0, 8).map((item) => (
                    <button
                      key={item.mal_id}
                      onClick={() => {
                        navigate(`/${activeTab}/${item.mal_id}`);
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 text-left group"
                    >
                      <img
                        src={item.images.webp.image_url}
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate group-hover:text-foreground/80 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.title_japanese}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.score && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-foreground">
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
                  No results found for "{query.trim()}"
                </div>
              )}
            </div>
          )}

          {/* Quick suggestions when empty */}
          {query.trim().length === 0 && (
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
