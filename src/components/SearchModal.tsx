import { useState, useEffect, useCallback } from "react";
import { Search, X, Film, BookOpen, Loader2, Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearchAnime, useSearchManga } from "@/hooks/useAnimeData";

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 8;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  
  const recent = getRecentSearches().filter(s => s !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  // Search both anime and manga simultaneously
  const { data: animeResults, isLoading: animeLoading } = useSearchAnime(query, query.trim().length > 0);
  const { data: mangaResults, isLoading: mangaLoading } = useSearchManga(query, query.trim().length > 0);

  const isLoading = animeLoading || mangaLoading;
  const hasResults = (animeResults && animeResults.length > 0) || (mangaResults && mangaResults.length > 0);

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
      setRecentSearches(getRecentSearches());
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleSelectResult = (type: "anime" | "manga", item: { mal_id: number; title: string }) => {
    saveRecentSearch(query);
    navigate(`/${type}/${item.mal_id}`);
    onClose();
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

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
                placeholder="Search anime & manga..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full h-14 pl-14 pr-14 bg-transparent text-lg placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 sm:p-1.5 bg-muted/60 hover:bg-muted rounded-full transition-colors active:scale-95"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {query.trim().length > 0 && (
            <div className="mt-4 liquid-glass-strong rounded-2xl max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoading && !hasResults ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : hasResults ? (
                <div className="p-2 space-y-4">
                  {/* Anime Section */}
                  {animeResults && animeResults.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                        <Film className="w-4 h-4" />
                        <span>Anime</span>
                        <span className="text-xs opacity-60">({animeResults.length})</span>
                      </div>
                      <div>
                        {animeResults.slice(0, 5).map((item) => (
                          <button
                            key={`anime-${item.mal_id}`}
                            onClick={() => handleSelectResult("anime", item)}
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
                                {item.episodes && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.episodes} eps
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manga Section */}
                  {mangaResults && mangaResults.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground border-t border-border/50 pt-4">
                        <BookOpen className="w-4 h-4" />
                        <span>Manga</span>
                        <span className="text-xs opacity-60">({mangaResults.length})</span>
                      </div>
                      <div>
                        {mangaResults.slice(0, 5).map((item) => (
                          <button
                            key={`manga-${item.mal_id}`}
                            onClick={() => handleSelectResult("manga", item)}
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
                                {item.chapters && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.chapters} ch
                                  </span>
                                )}
                                {item.type && (
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {item.type}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="mb-1">No results found for "{query.trim()}"</p>
                  <p className="text-sm opacity-70">Try checking your spelling or using different keywords</p>
                </div>
              )}
            </div>
          )}

          {/* Recent searches when empty */}
          {query.trim().length === 0 && (
            <div className="mt-4">
              {recentSearches.length > 0 ? (
                <div className="liquid-glass-strong rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      onClick={handleClearRecent}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="px-3 py-1.5 text-sm rounded-full liquid-glass-subtle hover:bg-muted/50 transition-all duration-300"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p className="font-jp text-lg mb-2">検索してください</p>
                  <p className="text-sm">Start typing to search anime & manga</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
