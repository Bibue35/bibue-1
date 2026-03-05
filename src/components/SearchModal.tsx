import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, Film, BookOpen, Loader2, Clock, Trash2, Sparkles, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getContentType, getContentLabel, getContentTypeBadgeClass } from "@/lib/contentType";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { useSearchAnime, useSearchManga } from "@/hooks/useAnimeData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 8;

// Common abbreviation mappings for better search results
const ABBREVIATION_ENTRIES = [
  { abbr: "jjk", full: "jujutsu kaisen" },
  { abbr: "aot", full: "attack on titan" },
  { abbr: "mha", full: "my hero academia" },
  { abbr: "bnha", full: "boku no hero academia" },
  { abbr: "opm", full: "one punch man" },
  { abbr: "op", full: "one piece" },
  { abbr: "ds", full: "demon slayer" },
  { abbr: "kny", full: "kimetsu no yaiba" },
  { abbr: "fma", full: "fullmetal alchemist" },
  { abbr: "fmab", full: "fullmetal alchemist brotherhood" },
  { abbr: "csm", full: "chainsaw man" },
  { abbr: "sao", full: "sword art online" },
  { abbr: "snk", full: "shingeki no kyojin" },
  { abbr: "hxh", full: "hunter x hunter" },
  { abbr: "dn", full: "death note" },
  { abbr: "re:zero", full: "re zero" },
  { abbr: "rezero", full: "re zero" },
  { abbr: "slime", full: "that time i got reincarnated as a slime" },
  { abbr: "konosuba", full: "kono subarashii sekai ni shukufuku wo" },
  { abbr: "oregairu", full: "yahari ore no seishun" },
  { abbr: "bunny girl", full: "seishun buta yarou" },
  { abbr: "sxf", full: "spy x family" },
  { abbr: "spyxfamily", full: "spy x family" },
  { abbr: "spy family", full: "spy x family" },
  { abbr: "solo", full: "solo leveling" },
  { abbr: "sl", full: "solo leveling" },
  { abbr: "bc", full: "black clover" },
  { abbr: "dr stone", full: "dr. stone" },
  { abbr: "drstone", full: "dr. stone" },
  { abbr: "mob", full: "mob psycho 100" },
  { abbr: "mp100", full: "mob psycho 100" },
  { abbr: "tte", full: "the promised neverland" },
  { abbr: "tpn", full: "the promised neverland" },
  { abbr: "tbhk", full: "toilet-bound hanako-kun" },
  { abbr: "jojo", full: "jojo's bizarre adventure" },
  { abbr: "jojos", full: "jojo's bizarre adventure" },
  { abbr: "naruto", full: "naruto" },
  { abbr: "bleach", full: "bleach" },
  { abbr: "dbz", full: "dragon ball z" },
  { abbr: "dbs", full: "dragon ball super" },
  { abbr: "yyh", full: "yu yu hakusho" },
  { abbr: "fmab", full: "fullmetal alchemist brotherhood" },
  { abbr: "made in abyss", full: "made in abyss" },
  { abbr: "mia", full: "made in abyss" },
  { abbr: "onk", full: "oshi no ko" },
  { abbr: "frieren", full: "frieren" },
  { abbr: "wind breaker", full: "wind breaker" },
  { abbr: "blue lock", full: "blue lock" },
  { abbr: "dandadan", full: "dandadan" },
  { abbr: "sakamoto", full: "sakamoto days" },
];

// Fuzzy search instance for abbreviations
const abbreviationFuse = new Fuse(ABBREVIATION_ENTRIES, {
  keys: ["abbr", "full"],
  threshold: 0.4, // Allow fuzzy matching with typos
  distance: 100,
  includeScore: true,
});

// Expand search query using fuzzy abbreviation matching
function expandSearchQuery(query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  
  // First try exact match
  const exactMatch = ABBREVIATION_ENTRIES.find(e => e.abbr === lowerQuery);
  if (exactMatch) return exactMatch.full;
  
  // Then try fuzzy match
  const fuzzyResults = abbreviationFuse.search(lowerQuery);
  if (fuzzyResults.length > 0 && fuzzyResults[0].score! < 0.3) {
    return fuzzyResults[0].item.full;
  }
  
  return query;
}

// Get autocomplete suggestions based on typed query
function getAutocompleteSuggestions(query: string, limit = 6): Array<{ abbr: string; full: string; type: 'abbreviation' | 'title' }> {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  const suggestions: Array<{ abbr: string; full: string; type: 'abbreviation' | 'title' }> = [];
  
  // First, find matching abbreviations
  const abbrMatches = ABBREVIATION_ENTRIES.filter(e => 
    e.abbr.toLowerCase().startsWith(lowerQuery) || 
    e.full.toLowerCase().includes(lowerQuery)
  );
  
  abbrMatches.slice(0, 4).forEach(match => {
    suggestions.push({ abbr: match.abbr, full: match.full, type: 'abbreviation' });
  });
  
  // Then try fuzzy matches if we don't have enough
  if (suggestions.length < limit) {
    const fuzzyResults = abbreviationFuse.search(lowerQuery);
    fuzzyResults
      .filter(r => r.score! < 0.5)
      .slice(0, limit - suggestions.length)
      .forEach(result => {
        const exists = suggestions.some(s => s.full === result.item.full);
        if (!exists) {
          suggestions.push({ abbr: result.item.abbr, full: result.item.full, type: 'title' });
        }
      });
  }
  
  return suggestions.slice(0, limit);
}

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
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Expand abbreviations for better search
  const expandedQuery = expandSearchQuery(query);
  
  // Get autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => 
    getAutocompleteSuggestions(query), 
    [query]
  );

  // Only search when query is long enough and user hasn't just typed
  const shouldSearch = expandedQuery.trim().length >= 2;
  
  // Search both anime and manga simultaneously
  const { data: animeResults, isLoading: animeLoading } = useSearchAnime(expandedQuery, shouldSearch);
  const { data: mangaResults, isLoading: mangaLoading } = useSearchManga(expandedQuery, shouldSearch);

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

  const handleSelectResult = (type: "anime" | "manga", item: { anilist_id: number; mal_id: number; title: string }) => {
    saveRecentSearch(query);
    navigate(`/${type}/${item.anilist_id}`);
    onClose();
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
    setShowAutocomplete(false);
  };

  const handleSuggestionClick = (suggestion: { abbr: string; full: string }) => {
    setQuery(suggestion.full);
    setShowAutocomplete(false);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  const animeCount = animeResults?.length || 0;
  const mangaCount = mangaResults?.length || 0;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Search anime and manga" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in" />

      {/* Modal */}
      <div className="relative z-10 flex flex-col items-center pt-[10vh] px-4 animate-fade-up pointer-events-none h-full">
        <div 
          className="w-full max-w-2xl pointer-events-auto flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <div className="flex items-center rounded-[9999px] border border-foreground/20 bg-card/60 backdrop-blur-md px-8 py-1.5 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-foreground/40 focus-within:ring-4 focus-within:ring-foreground/5 focus-within:shadow-lg">
              <Search className="w-6 h-6 text-muted-foreground/60 shrink-0" aria-hidden="true" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowAutocomplete(true);
                }}
                autoFocus
                aria-label="Search anime and manga"
                className="flex-1 ml-4 h-14 bg-transparent text-xl placeholder:text-muted-foreground/50 focus:outline-none text-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1.5 bg-muted/60 hover:bg-muted rounded-full transition-colors active:scale-95 shrink-0"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete Suggestions */}
          {query.trim().length > 0 && query.trim().length < 3 && showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div className="mt-2 liquid-glass-strong rounded-2xl p-2 flex-shrink-0">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <Zap className="w-3 h-3" />
                <span>{t("search.quickSuggestions")}</span>
              </div>
              <div className="space-y-0.5">
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.abbr}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 uppercase">
                        {suggestion.abbr}
                      </Badge>
                      <span className="text-sm truncate">{suggestion.full}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {query.trim().length >= 2 && (
            <div className="mt-4 liquid-glass-strong rounded-2xl flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full max-h-[calc(80vh-100px)]">
                {isLoading && !hasResults ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : hasResults ? (
                  <div className="p-3 space-y-4">
                    {/* Anime Section */}
                    {animeResults && animeResults.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur-sm rounded-lg">
                          <Film className="w-4 h-4" />
                          <span>Anime</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              {t("browse.newest")}
                            </Badge>
                          <span className="text-xs opacity-60 ml-auto">({animeCount})</span>
                        </div>
                        <div className="space-y-1">
                          {animeResults.slice(0, 8).map((item) => (
                            <button
                              key={`anime-${item.anilist_id}`}
                              onClick={() => handleSelectResult("anime", item)}
                              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 text-left group"
                            >
                              <img
                                src={item.images.webp.image_url}
                                alt={`${item.title} cover art`}
                                width={48}
                                height={64}
                                loading="lazy"
                                className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
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
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur-sm rounded-lg border-t border-border/50 mt-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Manga / Manhwa / Manhua</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              {t("browse.newest")}
                            </Badge>
                          <span className="text-xs opacity-60 ml-auto">({mangaCount})</span>
                        </div>
                        <div className="space-y-1">
                          {mangaResults.slice(0, 8).map((item) => (
                            <button
                              key={`manga-${item.anilist_id}`}
                              onClick={() => handleSelectResult("manga", item)}
                              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 text-left group"
                            >
                              <img
                                src={item.images.webp.image_url}
                                alt={`${item.title} cover art`}
                                width={48}
                                height={64}
                                loading="lazy"
                                className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
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
                                  <span className={cn(
                                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                                    getContentTypeBadgeClass(getContentType({ type: 'MANGA', countryOfOrigin: item.countryOfOrigin }))
                                  )}>
                                    {getContentLabel(getContentType({ type: 'MANGA', countryOfOrigin: item.countryOfOrigin }))}
                                  </span>
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
                    <p className="mb-1">{t("search.noResults")} "{query.trim()}"</p>
                    <p className="text-sm opacity-70">{t("search.tryDifferent")}</p>
                    {query.trim().toLowerCase() !== expandedQuery.toLowerCase() && (
                      <p className="text-xs mt-2 text-primary">{t("search.searchedFor")}: "{expandedQuery}"</p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Recent searches when empty */}
          {query.trim().length === 0 && (
            <div className="mt-4 flex-shrink-0">
              {recentSearches.length > 0 ? (
                <div className="liquid-glass-strong rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{t("search.recentSearches")}</span>
                    </div>
                    <button
                      onClick={handleClearRecent}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t("search.clear")}
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
                  {language === "ja" && <p className="font-jp text-lg mb-2">検索してください</p>}
                  <p className="text-sm">{t("search.startTyping")}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {t("search.tip")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
