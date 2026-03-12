import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, X, Film, BookOpen, Loader2, Clock, Trash2, Sparkles, ArrowRight, Zap, Mic, MicOff, SlidersHorizontal, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getContentType, getContentLabel, getContentTypeBadgeClass } from "@/lib/contentType";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { useSearchAnime, useSearchManga } from "@/hooks/useAnimeData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const RECENT_SEARCHES_KEY = "recentSearches";
const SAVED_SEARCHES_KEY = "bibueSavedSearches";
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
  { abbr: "made in abyss", full: "made in abyss" },
  { abbr: "mia", full: "made in abyss" },
  { abbr: "onk", full: "oshi no ko" },
  { abbr: "frieren", full: "frieren" },
  { abbr: "wind breaker", full: "wind breaker" },
  { abbr: "blue lock", full: "blue lock" },
  { abbr: "dandadan", full: "dandadan" },
  { abbr: "sakamoto", full: "sakamoto days" },
];

const abbreviationFuse = new Fuse(ABBREVIATION_ENTRIES, {
  keys: ["abbr", "full"],
  threshold: 0.4,
  distance: 100,
  includeScore: true,
});

function expandSearchQuery(query: string): string {
  const lowerQuery = query.toLowerCase().trim();
  const exactMatch = ABBREVIATION_ENTRIES.find(e => e.abbr === lowerQuery);
  if (exactMatch) return exactMatch.full;
  const fuzzyResults = abbreviationFuse.search(lowerQuery);
  if (fuzzyResults.length > 0 && fuzzyResults[0].score! < 0.3) return fuzzyResults[0].item.full;
  return query;
}

function getAutocompleteSuggestions(query: string, limit = 6): Array<{ abbr: string; full: string; type: 'abbreviation' | 'title' }> {
  if (!query.trim()) return [];
  const lowerQuery = query.toLowerCase().trim();
  const suggestions: Array<{ abbr: string; full: string; type: 'abbreviation' | 'title' }> = [];
  const abbrMatches = ABBREVIATION_ENTRIES.filter(e => e.abbr.toLowerCase().startsWith(lowerQuery) || e.full.toLowerCase().includes(lowerQuery));
  abbrMatches.slice(0, 4).forEach(match => {
    suggestions.push({ abbr: match.abbr, full: match.full, type: 'abbreviation' });
  });
  if (suggestions.length < limit) {
    const fuzzyResults = abbreviationFuse.search(lowerQuery);
    fuzzyResults.filter(r => r.score! < 0.5).slice(0, limit - suggestions.length).forEach(result => {
      if (!suggestions.some(s => s.full === result.item.full)) {
        suggestions.push({ abbr: result.item.abbr, full: result.item.full, type: 'title' });
      }
    });
  }
  return suggestions.slice(0, limit);
}

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"); } catch { return []; }
}
function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const recent = getRecentSearches().filter(s => s !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)));
}
function clearRecentSearches() { localStorage.removeItem(RECENT_SEARCHES_KEY); }

// Saved searches
function getSavedSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || "[]"); } catch { return []; }
}
function toggleSavedSearch(query: string) {
  const saved = getSavedSearches();
  const idx = saved.indexOf(query.trim());
  if (idx >= 0) saved.splice(idx, 1);
  else saved.unshift(query.trim());
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(saved.slice(0, 20)));
  return saved;
}

// Voice recognition hook
function useVoiceInput(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const isSupported = typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return { isListening, startListening, stopListening, isSupported };
}

// Advanced filter genres
const FILTER_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Thriller", "Supernatural",
];
const FILTER_YEARS = ["2026", "2025", "2024", "2023", "2020s", "2010s", "classic"];
const FILTER_STATUSES = [
  { value: "RELEASING", label: "Ongoing" },
  { value: "FINISHED", label: "Completed" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
];

// AI search result type
interface AISearchResult {
  title: string;
  matchReason: string;
  genres?: string[];
  score?: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [searchMode, setSearchMode] = useState<"standard" | "ai">("standard");
  const [showFilters, setShowFilters] = useState(false);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const expandedQuery = expandSearchQuery(query);
  const autocompleteSuggestions = useMemo(() => getAutocompleteSuggestions(query), [query]);

  const shouldSearch = expandedQuery.trim().length >= 2 && searchMode === "standard";
  const { data: animeResults, isLoading: animeLoading } = useSearchAnime(expandedQuery, shouldSearch);
  const { data: mangaResults, isLoading: mangaLoading } = useSearchManga(expandedQuery, shouldSearch);
  const isLoading = animeLoading || mangaLoading;
  const hasResults = (animeResults && animeResults.length > 0) || (mangaResults && mangaResults.length > 0);

  // Voice input
  const handleVoiceResult = useCallback((text: string) => {
    setQuery(text);
    setShowAutocomplete(false);
  }, []);
  const { isListening, startListening, stopListening, isSupported: voiceSupported } = useVoiceInput(handleVoiceResult);

  // AI Search
  useEffect(() => {
    if (searchMode !== "ai" || query.trim().length < 3) {
      setAiResults([]);
      return;
    }
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    aiDebounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("seek", {
          body: { prompt: query.trim(), contentType: "all", watchlist: [] },
        });
        if (error) throw error;
        setAiResults(Array.isArray(data?.recommendations) ? data.recommendations : []);
      } catch {
        setAiResults([]);
      } finally {
        setAiLoading(false);
      }
    }, 500);
    return () => { if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current); };
  }, [query, searchMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setRecentSearches(getRecentSearches());
      setSavedSearches(getSavedSearches());
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

  const handleToggleSaved = () => {
    if (!query.trim()) return;
    const updated = toggleSavedSearch(query);
    setSavedSearches([...updated]);
  };

  // Highlight matching text
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">{part}</mark> : part
    );
  };

  // Filter results client-side by advanced filters
  const filterResults = <T extends { genres?: Array<{ name: string }>; score?: number; status?: string; year?: number }>(items: T[] | undefined): T[] | undefined => {
    if (!items) return items;
    let filtered = items;
    if (filterGenre) filtered = filtered.filter(i => i.genres?.some(g => g.name === filterGenre));
    if (filterStatus) filtered = filtered.filter(i => i.status === filterStatus);
    if (filterYear) {
      const y = filterYear;
      if (/^\d{4}$/.test(y)) filtered = filtered.filter(i => i.year === parseInt(y));
    }
    return filtered;
  };

  const filteredAnime = filterResults(animeResults);
  const filteredManga = filterResults(mangaResults);
  const hasFilteredResults = (filteredAnime && filteredAnime.length > 0) || (filteredManga && filteredManga.length > 0);
  const activeFilterCount = [filterGenre, filterYear, filterStatus].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Search anime and manga" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in" />

      <div className="relative z-10 flex flex-col items-center pt-[8vh] px-4 animate-fade-up pointer-events-none h-full">
        <div className="w-full max-w-2xl pointer-events-auto flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
          
          {/* Mode toggle */}
          <div className="flex items-center justify-center gap-1 mb-3">
            <button
              onClick={() => setSearchMode("standard")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                searchMode === "standard" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Standard
            </button>
            <button
              onClick={() => setSearchMode("ai")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1",
                searchMode === "ai" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-3 h-3" />
              AI Search
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <div className="flex items-center rounded-[9999px] border border-foreground/20 bg-card/60 backdrop-blur-md px-6 sm:px-8 py-1.5 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-foreground/40 focus-within:ring-4 focus-within:ring-foreground/5 focus-within:shadow-lg">
              <Search className="w-5 sm:w-6 h-5 sm:h-6 text-muted-foreground/60 shrink-0" aria-hidden="true" />
              <input
                type="text"
                placeholder={searchMode === "ai" ? "Describe what you're looking for..." : t("search.placeholder")}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowAutocomplete(true); }}
                autoFocus
                aria-label="Search anime and manga"
                className="flex-1 ml-3 sm:ml-4 h-12 sm:h-14 bg-transparent text-lg sm:text-xl placeholder:text-muted-foreground/50 focus:outline-none text-foreground"
              />
              <div className="flex items-center gap-1 shrink-0">
                {voiceSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                      "p-1.5 rounded-full transition-all duration-200",
                      isListening ? "bg-destructive/20 text-destructive animate-pulse" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
                    )}
                    aria-label={isListening ? "Stop listening" : "Voice search"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "p-1.5 rounded-full transition-all duration-200",
                    showFilters || activeFilterCount > 0 ? "bg-primary/15 text-primary" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
                  )}
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {query && (
                  <button onClick={() => setQuery("")} className="p-1.5 bg-muted/60 hover:bg-muted rounded-full transition-colors active:scale-95 shrink-0" aria-label="Clear search">
                    <X className="w-4 sm:w-5 h-4 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-2 liquid-glass-strong rounded-2xl p-4 flex-shrink-0 animate-fade-up space-y-3">
              <div>
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Genre</span>
                <div className="flex flex-wrap gap-1">
                  {FILTER_GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => setFilterGenre(filterGenre === g ? null : g)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                        filterGenre === g ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      )}
                    >{g}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Year</span>
                  <div className="flex flex-wrap gap-1">
                    {FILTER_YEARS.map(y => (
                      <button
                        key={y}
                        onClick={() => setFilterYear(filterYear === y ? null : y)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                          filterYear === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                      >{y}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Status</span>
                  <div className="flex flex-wrap gap-1">
                    {FILTER_STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setFilterStatus(filterStatus === s.value ? null : s.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                          filterStatus === s.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterGenre(null); setFilterYear(null); setFilterStatus(null); }}
                  className="text-xs text-destructive hover:text-destructive/80 font-medium"
                >Clear filters</button>
              )}
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {query.trim().length > 0 && query.trim().length < 3 && showAutocomplete && autocompleteSuggestions.length > 0 && searchMode === "standard" && (
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
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 uppercase">{suggestion.abbr}</Badge>
                      <span className="text-sm truncate">{suggestion.full}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Search Results */}
          {searchMode === "ai" && query.trim().length >= 3 && (
            <div className="mt-4 liquid-glass-strong rounded-2xl flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full max-h-[calc(85vh-160px)]">
                {aiLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Seeking...</p>
                    </div>
                  </div>
                ) : aiResults.length > 0 ? (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>AI Recommendations</span>
                      <span className="text-xs opacity-60 ml-auto">({aiResults.length})</span>
                    </div>
                    {aiResults.map((result, idx) => (
                      <div key={idx} className="px-3 py-3 rounded-xl hover:bg-muted/50 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{result.title}</h4>
                            {result.genres && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.genres.slice(0, 3).map(g => (
                                  <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">{g}</span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground/80 mt-1.5 italic leading-relaxed">{result.matchReason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-sm">No AI results yet. Try describing what you're looking for.</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Standard Search Results */}
          {searchMode === "standard" && query.trim().length >= 2 && (
            <div className="mt-4 liquid-glass-strong rounded-2xl flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full max-h-[calc(85vh-160px)]">
                {isLoading && !hasResults ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : hasFilteredResults ? (
                  <div className="p-3 space-y-4">
                    {/* Anime */}
                    {filteredAnime && filteredAnime.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur-sm rounded-lg">
                          <Film className="w-4 h-4" />
                          <span>Anime</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />{t("browse.newest")}
                          </Badge>
                          <span className="text-xs opacity-60 ml-auto">({filteredAnime.length})</span>
                        </div>
                        <div className="space-y-1">
                          {filteredAnime.slice(0, 8).map((item) => (
                            <button
                              key={`anime-${item.anilist_id}`}
                              onClick={() => handleSelectResult("anime", item)}
                              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 text-left group"
                            >
                              <img src={item.images.webp.image_url} alt={`${item.title} cover art`} width={48} height={64} loading="lazy" className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate group-hover:text-foreground/80 transition-colors">
                                  {highlightMatch(item.title, query)}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">{item.title_japanese}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.score && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-foreground">★ {item.score}</span>
                                  )}
                                  {item.episodes && <span className="text-xs text-muted-foreground">{item.episodes} eps</span>}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manga */}
                    {filteredManga && filteredManga.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur-sm rounded-lg border-t border-border/50 mt-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Manga / Manhwa / Manhua</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />{t("browse.newest")}
                          </Badge>
                          <span className="text-xs opacity-60 ml-auto">({filteredManga.length})</span>
                        </div>
                        <div className="space-y-1">
                          {filteredManga.slice(0, 8).map((item) => (
                            <button
                              key={`manga-${item.anilist_id}`}
                              onClick={() => handleSelectResult("manga", item)}
                              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 text-left group"
                            >
                              <img src={item.images.webp.image_url} alt={`${item.title} cover art`} width={48} height={64} loading="lazy" className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate group-hover:text-foreground/80 transition-colors">
                                  {highlightMatch(item.title, query)}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">{item.title_japanese}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {item.score && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-foreground">★ {item.score}</span>
                                  )}
                                  {item.chapters && <span className="text-xs text-muted-foreground">{item.chapters} ch</span>}
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

          {/* Recent & Saved searches when empty */}
          {query.trim().length === 0 && (
            <div className="mt-4 flex-shrink-0 space-y-3">
              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="liquid-glass-strong rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Star className="w-4 h-4" />
                    <span>Saved Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map((search, index) => (
                      <button key={index} onClick={() => handleRecentClick(search)} className="px-3 py-1.5 text-sm rounded-full liquid-glass-subtle hover:bg-muted/50 transition-all duration-300">
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recentSearches.length > 0 ? (
                <div className="liquid-glass-strong rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{t("search.recentSearches")}</span>
                    </div>
                    <button onClick={handleClearRecent} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Trash2 className="w-3 h-3" />{t("search.clear")}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button key={index} onClick={() => handleRecentClick(search)} className="px-3 py-1.5 text-sm rounded-full liquid-glass-subtle hover:bg-muted/50 transition-all duration-300">
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  {language === "ja" && <p className="font-jp text-lg mb-2">検索してください</p>}
                  <p className="text-sm">{t("search.startTyping")}</p>
                  <p className="text-xs mt-2 opacity-60">{t("search.tip")}</p>
                </div>
              )}
            </div>
          )}

          {/* Save search button */}
          {query.trim().length > 0 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={handleToggleSaved}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200",
                  savedSearches.includes(query.trim())
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Star className={cn("w-3 h-3 inline mr-1", savedSearches.includes(query.trim()) && "fill-primary")} />
                {savedSearches.includes(query.trim()) ? "Saved" : "Save search"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
