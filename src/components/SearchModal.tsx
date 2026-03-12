import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, X, Film, BookOpen, Loader2, Clock, Trash2, ArrowRight, Zap, Mic, MicOff, SlidersHorizontal, Star, Bookmark, BookmarkCheck, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getContentType, getContentLabel, getContentTypeBadgeClass } from "@/lib/contentType";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { useSearchAnime, useSearchManga } from "@/hooks/useAnimeData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
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

// Save for later (bookmarked results)
const SAVED_RESULTS_KEY = "bibueSavedResults";
interface SavedResult { id: number; type: "anime" | "manga"; title: string; image: string; savedAt: number; }
function getSavedResults(): SavedResult[] {
  try { return JSON.parse(localStorage.getItem(SAVED_RESULTS_KEY) || "[]"); } catch { return []; }
}
function toggleSavedResult(item: SavedResult): SavedResult[] {
  const saved = getSavedResults();
  const idx = saved.findIndex(s => s.id === item.id && s.type === item.type);
  if (idx >= 0) saved.splice(idx, 1);
  else saved.unshift(item);
  localStorage.setItem(SAVED_RESULTS_KEY, JSON.stringify(saved.slice(0, 50)));
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

// Filter options
const FILTER_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Thriller", "Supernatural",
  "Sports", "Psychological", "Mecha", "Music",
];
const FILTER_YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020s", "2010s", "2000s", "classic"];
const FILTER_STATUSES = [
  { value: "RELEASING", label: "Ongoing" },
  { value: "FINISHED", label: "Completed" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
  { value: "HIATUS", label: "Hiatus" },
];
const FILTER_TYPES = [
  { value: "all", label: "All" },
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
  { value: "manhwa", label: "Manhwa" },
  { value: "manhua", label: "Manhua" },
];
const FILTER_SCORES = [
  { value: "9", label: "9+" },
  { value: "8", label: "8+" },
  { value: "7", label: "7+" },
  { value: "6", label: "6+" },
];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "score", label: "Highest Rated" },
  { value: "popularity", label: "Most Popular" },
  { value: "newest", label: "Newest" },
];

// Seek result type
interface SeekResult {
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
  const searchMode = "standard";
  const [showFilters, setShowFilters] = useState(false);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterScore, setFilterScore] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [seekResults, setSeekResults] = useState<SeekResult[]>([]);
  const [seekLoading, setSeekLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const seekDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  const expandedQuery = expandSearchQuery(query);
  const autocompleteSuggestions = useMemo(() => getAutocompleteSuggestions(query), [query]);

  const shouldSearch = expandedQuery.trim().length >= 2 && searchMode === "standard";
  const { data: animeResults, isLoading: animeLoading } = useSearchAnime(expandedQuery, shouldSearch && (filterType === "all" || filterType === "anime"));
  const { data: mangaResults, isLoading: mangaLoading } = useSearchManga(expandedQuery, shouldSearch && filterType !== "anime");
  const isLoading = animeLoading || mangaLoading;
  const hasResults = (animeResults && animeResults.length > 0) || (mangaResults && mangaResults.length > 0);

  // Voice input
  const handleVoiceResult = useCallback((text: string) => {
    setQuery(text);
    setShowAutocomplete(false);
  }, []);
  const { isListening, startListening, stopListening, isSupported: voiceSupported } = useVoiceInput(handleVoiceResult);


  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setRecentSearches(getRecentSearches());
      setSavedSearches(getSavedSearches());
      setSavedResults(getSavedResults());
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

  const handleSaveResult = (id: number, type: "anime" | "manga", title: string, image: string) => {
    const updated = toggleSavedResult({ id, type, title, image, savedAt: Date.now() });
    setSavedResults([...updated]);
  };

  const isResultSaved = (id: number, type: "anime" | "manga") => {
    return savedResults.some(s => s.id === id && s.type === type);
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

  // Filter + sort results
  const filterAndSort = <T extends { genres?: Array<{ name: string }>; score?: number; status?: string; year?: number; countryOfOrigin?: string }>(items: T[] | undefined): T[] | undefined => {
    if (!items) return items;
    let filtered = items;
    if (filterGenre) filtered = filtered.filter(i => i.genres?.some(g => g.name === filterGenre));
    if (filterStatus) filtered = filtered.filter(i => i.status === filterStatus);
    if (filterScore) filtered = filtered.filter(i => (i.score ?? 0) >= parseInt(filterScore));
    if (filterYear) {
      const y = filterYear;
      if (/^\d{4}$/.test(y)) filtered = filtered.filter(i => i.year === parseInt(y));
      else if (y === "2020s") filtered = filtered.filter(i => i.year && i.year >= 2020 && i.year <= 2029);
      else if (y === "2010s") filtered = filtered.filter(i => i.year && i.year >= 2010 && i.year <= 2019);
      else if (y === "2000s") filtered = filtered.filter(i => i.year && i.year >= 2000 && i.year <= 2009);
      else if (y === "classic") filtered = filtered.filter(i => i.year && i.year < 2000);
    }
    if (filterType === "manhwa") filtered = filtered.filter(i => i.countryOfOrigin === "KR");
    else if (filterType === "manhua") filtered = filtered.filter(i => i.countryOfOrigin === "CN");
    
    // Sort
    if (sortBy === "score") filtered = [...filtered].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    else if (sortBy === "newest") filtered = [...filtered].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    
    return filtered;
  };

  const filteredAnime = filterType !== "manga" && filterType !== "manhwa" && filterType !== "manhua" ? filterAndSort(animeResults) : undefined;
  const filteredManga = filterType !== "anime" ? filterAndSort(mangaResults) : undefined;
  const hasFilteredResults = (filteredAnime && filteredAnime.length > 0) || (filteredManga && filteredManga.length > 0);
  const activeFilterCount = [filterGenre, filterYear, filterStatus, filterScore, filterType !== "all" ? filterType : null, sortBy !== "relevance" ? sortBy : null].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Search anime and manga" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-fade-in" />

      <div className="relative z-10 flex flex-col items-center pt-[8vh] px-4 animate-fade-up pointer-events-none h-full">
        <div className="w-full max-w-2xl pointer-events-auto flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
          
          <div className="relative flex-shrink-0">
            <div className="flex items-center rounded-[9999px] border border-foreground/20 bg-card/60 backdrop-blur-md px-6 sm:px-8 py-1.5 shadow-sm hover:shadow-md transition-all duration-300 focus-within:border-foreground/40 focus-within:ring-4 focus-within:ring-foreground/5 focus-within:shadow-lg">
              <Search className="w-5 sm:w-6 h-5 sm:h-6 text-muted-foreground/60 shrink-0" aria-hidden="true" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
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
                    "p-1.5 rounded-full transition-all duration-200 relative",
                    showFilters || activeFilterCount > 0 ? "bg-foreground/10 text-foreground" : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
                  )}
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-foreground text-background text-[8px] font-bold flex items-center justify-center">
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
              {/* Type */}
              <div>
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Type</span>
                <div className="flex flex-wrap gap-1">
                  {FILTER_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setFilterType(t.value)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                        filterType === t.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      )}
                    >{t.label}</button>
                  ))}
                </div>
              </div>

              {/* Genre */}
              <div>
                <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Genre</span>
                <div className="flex flex-wrap gap-1">
                  {FILTER_GENRES.map(g => (
                    <button
                      key={g}
                      onClick={() => setFilterGenre(filterGenre === g ? null : g)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                        filterGenre === g ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      )}
                    >{g}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                {/* Year */}
                <div className="flex-1 min-w-[140px]">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Year</span>
                  <div className="flex flex-wrap gap-1">
                    {FILTER_YEARS.map(y => (
                      <button
                        key={y}
                        onClick={() => setFilterYear(filterYear === y ? null : y)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                          filterYear === y ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                      >{y}</button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex-1 min-w-[140px]">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Status</span>
                  <div className="flex flex-wrap gap-1">
                    {FILTER_STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setFilterStatus(filterStatus === s.value ? null : s.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                          filterStatus === s.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                {/* Min Score */}
                <div className="flex-1 min-w-[120px]">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Min Score</span>
                  <div className="flex flex-wrap gap-1">
                    {FILTER_SCORES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setFilterScore(filterScore === s.value ? null : s.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                          filterScore === s.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex-1 min-w-[120px]">
                  <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-1.5 block">Sort By</span>
                  <div className="flex flex-wrap gap-1">
                    {SORT_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSortBy(s.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                          sortBy === s.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                        )}
                      >{s.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterGenre(null); setFilterYear(null); setFilterStatus(null); setFilterType("all"); setFilterScore(null); setSortBy("relevance"); }}
                  className="text-xs text-destructive hover:text-destructive/80 font-medium"
                >Clear all filters</button>
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

          {searchMode === "standard" && query.trim().length >= 2 && (
            <div className="mt-4 liquid-glass-strong rounded-2xl flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full max-h-[calc(85vh-160px)]">
                {isLoading && !hasResults ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : hasFilteredResults ? (
                  <div className="p-3 space-y-4">
                    {/* Anime */}
                    {filteredAnime && filteredAnime.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground sticky top-0 bg-card/80 backdrop-blur-sm rounded-lg">
                          <Film className="w-4 h-4" />
                          <span>Anime</span>
                          <span className="text-xs opacity-60 ml-auto">({filteredAnime.length})</span>
                        </div>
                        <div className="space-y-1">
                          {filteredAnime.slice(0, 8).map((item) => (
                            <div key={`anime-${item.anilist_id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 group">
                              <button
                                onClick={() => handleSelectResult("anime", item)}
                                className="flex items-center gap-4 flex-1 min-w-0 text-left"
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
                              <button
                                onClick={() => handleSaveResult(item.anilist_id, "anime", item.title, item.images.webp.image_url)}
                                className={cn(
                                  "p-1.5 rounded-full shrink-0 transition-all duration-200",
                                  isResultSaved(item.anilist_id, "anime")
                                    ? "text-foreground"
                                    : "text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-foreground"
                                )}
                                aria-label={isResultSaved(item.anilist_id, "anime") ? "Remove from saved" : "Save for later"}
                              >
                                {isResultSaved(item.anilist_id, "anime") ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              </button>
                            </div>
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
                          <span className="text-xs opacity-60 ml-auto">({filteredManga.length})</span>
                        </div>
                        <div className="space-y-1">
                          {filteredManga.slice(0, 8).map((item) => (
                            <div key={`manga-${item.anilist_id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-all duration-300 group">
                              <button
                                onClick={() => handleSelectResult("manga", item)}
                                className="flex items-center gap-4 flex-1 min-w-0 text-left"
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
                              <button
                                onClick={() => handleSaveResult(item.anilist_id, "manga", item.title, item.images.webp.image_url)}
                                className={cn(
                                  "p-1.5 rounded-full shrink-0 transition-all duration-200",
                                  isResultSaved(item.anilist_id, "manga")
                                    ? "text-foreground"
                                    : "text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-foreground"
                                )}
                                aria-label={isResultSaved(item.anilist_id, "manga") ? "Remove from saved" : "Save for later"}
                              >
                                {isResultSaved(item.anilist_id, "manga") ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              </button>
                            </div>
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

          {/* Empty state: Recent, Saved searches, Saved results */}
          {query.trim().length === 0 && (
            <div className="mt-4 flex-shrink-0 space-y-3">
              {/* Saved Results */}
              {savedResults.length > 0 && (
                <div className="liquid-glass-strong rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Bookmark className="w-4 h-4" />
                    <span>Saved for Later</span>
                    <span className="text-xs opacity-60 ml-auto">({savedResults.length})</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                    {savedResults.slice(0, 10).map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => { navigate(`/${item.type}/${item.id}`); onClose(); }}
                        className="flex-shrink-0 group"
                      >
                        <div className="w-16 h-22 rounded-lg overflow-hidden bg-muted mb-1 relative">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSaveResult(item.id, item.type, item.title, item.image); }}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[64px]">{item.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Star className={cn("w-3 h-3 inline mr-1", savedSearches.includes(query.trim()) && "fill-foreground")} />
                {savedSearches.includes(query.trim()) ? "Saved" : "Save search"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
