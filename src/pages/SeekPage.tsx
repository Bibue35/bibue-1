import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Send, Sparkles, Star, BookOpen, Tv, Plus, ChevronRight, Clock, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { searchAnime, searchManga } from "@/lib/api";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FloatingNav } from "@/components/FloatingNav";
import { SEO } from "@/components/SEO";

// Types
interface SeekResult {
  title: string;
  type: "anime" | "manga";
  year: number | null;
  genres: string[];
  episodes: number | null;
  chapters: number | null;
  score: number | null;
  matchReason: string;
  // Enriched after fetch
  anilistId?: number;
  imageUrl?: string;
  convincePitch?: string;
  isLoadingConvince?: boolean;
}

interface RecentSearch {
  query: string;
  resultCount: number;
  timestamp: number;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// Mood chips
const MOOD_CHIPS = [
  { emoji: "🔥", label: "Hype & adrenaline" },
  { emoji: "😢", label: "Make me cry" },
  { emoji: "🧠", label: "Mind-bending" },
  { emoji: "😂", label: "Gut-bustingly funny" },
  { emoji: "🌸", label: "Cozy & wholesome" },
  { emoji: "💀", label: "Dark & disturbing" },
  { emoji: "💕", label: "Butterflies romance" },
  { emoji: "🗡️", label: "Cold-blooded MC" },
  { emoji: "🌌", label: "Existential dread" },
  { emoji: "🎭", label: "Psychological thriller" },
  { emoji: "⚔️", label: "Epic battle scenes" },
  { emoji: "🏝️", label: "Relaxing & chill" },
];

// Trope chips
const TROPE_CHIPS = [
  "OP from the start",
  "Tournament arc",
  "Time loop",
  "Found family",
  "Villain protagonist",
  "Power system",
  "Isekai but good",
  "Slow burn",
  "Unreliable narrator",
  "Training montage",
  "Revenge arc",
  "Post-apocalyptic",
  "School setting",
  "Political intrigue",
];

const CONTENT_TYPES = ["All", "Anime", "Manga", "Manhwa", "Manhua"] as const;

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function SeekPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SeekResult[]>([]);
  const [contentType, setContentType] = useState<string>("All");
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { watchlist, addToWatchlist, isInWatchlist } = useWatchlist();

  // Memoize random chips so they don't re-shuffle on every render
  const moodChips = useMemo(() => shuffleAndPick(MOOD_CHIPS, 7), []);
  const tropeChips = useMemo(() => shuffleAndPick(TROPE_CHIPS, 7), []);

  // Recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("seek-recent") || "[]");
    } catch { return []; }
  });

  const saveRecentSearch = useCallback((query: string, resultCount: number) => {
    const updated = [
      { query, resultCount, timestamp: Date.now() },
      ...recentSearches.filter(s => s.query !== query),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("seek-recent", JSON.stringify(updated));
  }, [recentSearches]);

  // Fetch cover images for results
  const enrichResults = useCallback(async (recs: SeekResult[]) => {
    const enriched = await Promise.all(
      recs.map(async (rec) => {
        try {
          const searchFn = rec.type === "anime" ? searchAnime : searchManga;
          const results = await searchFn(rec.title, 1, 1);
          if (results.length > 0) {
            const match = results[0];
            return {
              ...rec,
              anilistId: match.anilist_id || match.mal_id,
              imageUrl: match.images?.webp?.large_image_url || match.images?.jpg?.large_image_url,
            };
          }
        } catch (e) {
          console.warn(`Failed to fetch cover for "${rec.title}":`, e);
        }
        return rec;
      })
    );
    return enriched;
  }, []);

  const handleSubmit = useCallback(async (promptText?: string) => {
    const query = promptText || input.trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const watchlistTitles = watchlist?.map(w => w.title) || [];

      const { data, error } = await supabase.functions.invoke("seek", {
        body: {
          prompt: query,
          watchlist: watchlistTitles,
          contentType: contentType.toLowerCase(),
          conversationHistory,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const recs: SeekResult[] = data?.recommendations || [];

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: "user", content: query },
        { role: "assistant", content: JSON.stringify(recs) },
      ]);

      // Save recent search
      saveRecentSearch(query, recs.length);

      // Show results immediately, then enrich with images
      setResults(recs);
      setIsLoading(false);

      // Enrich with cover images in background
      const enriched = await enrichResults(recs);
      setResults(enriched);
    } catch (e: any) {
      console.error("Seek error:", e);
      toast({ title: "Something went wrong", description: e.message || "Failed to get recommendations", variant: "destructive" });
      setIsLoading(false);
    }
  }, [input, isLoading, watchlist, contentType, conversationHistory, toast, saveRecentSearch, enrichResults]);

  const handleChipClick = useCallback((text: string) => {
    setInput(text);
    // Auto-submit after setting input
    setTimeout(() => {
      handleSubmit(text);
    }, 0);
  }, [handleSubmit]);

  const handleConvince = useCallback(async (index: number) => {
    const rec = results[index];
    if (rec.convincePitch || rec.isLoadingConvince) return;

    setResults(prev => prev.map((r, i) => i === index ? { ...r, isLoadingConvince: true } : r));

    try {
      const watchedContext = watchlist?.slice(0, 10).map(w => w.title).join(", ") || "";
      const { data, error } = await supabase.functions.invoke("seek-convince", {
        body: { title: rec.title, type: rec.type, watchedContext },
      });

      if (error) throw error;

      setResults(prev => prev.map((r, i) =>
        i === index ? { ...r, convincePitch: data?.pitch || "No pitch available.", isLoadingConvince: false } : r
      ));
    } catch {
      setResults(prev => prev.map((r, i) =>
        i === index ? { ...r, isLoadingConvince: false } : r
      ));
      toast({ title: "Failed to load pitch", variant: "destructive" });
    }
  }, [results, watchlist, toast]);

  const handleSave = useCallback((rec: SeekResult) => {
    if (!user) {
      toast({ title: "Sign in to save", description: "Create an account to build your watchlist.", variant: "destructive" });
      return;
    }
    if (rec.anilistId && isInWatchlist(rec.anilistId, rec.type)) {
      toast({ title: "Already saved" });
      return;
    }
    addToWatchlist.mutate({
      mal_id: rec.anilistId || 0,
      media_type: rec.type,
      title: rec.title,
      image_url: rec.imageUrl,
    });
  }, [user, toast, isInWatchlist, addToWatchlist]);

  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("seek-recent");
  }, []);

  return (
    <>
      <SEO title="Seek — AI Discovery" description="Describe a vibe. Get anime and manga recommendations powered by AI." />
      <FloatingNav />
      <main id="main-content" className="min-h-screen bg-background pt-16 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="pt-8 pb-6 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Seek</h1>
            </div>
            {!hasSearched && (
              <p className="text-muted-foreground text-sm sm:text-base">
                Tell me what you're in the mood for. I'll find it.
              </p>
            )}
          </div>

          {/* Input */}
          <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm pb-4 pt-2">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
              className="relative"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={hasSearched
                  ? `More like #3 but darker... or "None of these — try something weird"`
                  : "cold blooded mc, dark fantasy with great art..."
                }
                className={cn(
                  "w-full rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm",
                  "px-5 py-3.5 pr-14 text-sm sm:text-base",
                  "placeholder:text-muted-foreground/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
                  "transition-all duration-200"
                )}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl h-10 w-10 min-w-[44px]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>

            {isLoading && (
              <p className="text-xs text-muted-foreground/60 mt-2 text-center animate-pulse">Seeking...</p>
            )}

            {/* Content type filter */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct}
                  onClick={() => setContentType(ct)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    contentType === ct
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          {/* Pre-search content */}
          {!hasSearched && !isLoading && (
            <div className="space-y-6 mt-2">
              {/* Mood chips */}
              <div>
                <p className="text-xs text-muted-foreground/60 mb-2 font-medium uppercase tracking-wider">Mood</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {moodChips.map((chip) => (
                    <button
                      key={chip.label}
                      onClick={() => handleChipClick(chip.label)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border/30 text-sm whitespace-nowrap hover:border-primary/30 hover:bg-primary/5 transition-colors"
                    >
                      <span>{chip.emoji}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trope chips */}
              <div>
                <p className="text-xs text-muted-foreground/60 mb-2 font-medium uppercase tracking-wider">Trope</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {tropeChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="px-3 py-1.5 rounded-full bg-muted/50 text-xs font-medium whitespace-nowrap hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    <button onClick={clearHistory} className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((s) => (
                      <button
                        key={s.timestamp}
                        onClick={() => { setInput(s.query); handleSubmit(s.query); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-muted/50 transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate text-muted-foreground group-hover:text-foreground">{s.query}</span>
                        <span className="text-xs text-muted-foreground/40 ml-2 shrink-0">{s.resultCount} results</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card/50 border border-border/20">
                  <Skeleton className="w-20 h-28 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-3 mt-4">
              {results.map((rec, i) => (
                <div
                  key={`${rec.title}-${i}`}
                  className="rounded-2xl bg-card/60 border border-border/20 overflow-hidden transition-all hover:border-border/40"
                >
                  <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                    {/* Cover image */}
                    <Link
                      to={rec.anilistId ? `/${rec.type}/${rec.anilistId}` : "#"}
                      className="shrink-0 w-[72px] sm:w-20 aspect-[2/3] rounded-xl overflow-hidden"
                    >
                      {rec.imageUrl ? (
                        <img
                          src={rec.imageUrl}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-2">
                          <span className="text-[10px] text-center text-muted-foreground leading-tight">{rec.title}</span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2">{rec.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {rec.score && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                {rec.score.toFixed(1)}
                              </span>
                            )}
                            {rec.year && <span className="text-xs text-muted-foreground">{rec.year}</span>}
                            {rec.type === "anime" && rec.episodes && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <Tv className="w-3 h-3" /> {rec.episodes} ep
                              </span>
                            )}
                            {rec.type !== "anime" && rec.chapters && (
                              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                <BookOpen className="w-3 h-3" /> {rec.chapters} ch
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                          {rec.type}
                        </Badge>
                      </div>

                      {/* Genres */}
                      {rec.genres?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {rec.genres.slice(0, 4).map((g) => (
                            <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Match reason */}
                      <p className="text-xs sm:text-sm text-muted-foreground italic mt-2 leading-relaxed">
                        "{rec.matchReason}"
                      </p>

                      {/* Convince pitch (expanded) */}
                      {rec.convincePitch && (
                        <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <p className="text-xs sm:text-sm leading-relaxed">{rec.convincePitch}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs rounded-lg"
                          onClick={() => handleConvince(i)}
                          disabled={rec.isLoadingConvince || !!rec.convincePitch}
                        >
                          {rec.isLoadingConvince ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 mr-1" />
                          )}
                          {rec.convincePitch ? "Convinced" : "Convince me"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs rounded-lg"
                          onClick={() => handleSave(rec)}
                          disabled={!!(rec.anilistId && isInWatchlist(rec.anilistId, rec.type))}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {rec.anilistId && isInWatchlist(rec.anilistId, rec.type) ? "Saved" : "Save"}
                        </Button>

                        {rec.anilistId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs rounded-lg ml-auto"
                            asChild
                          >
                            <Link to={`/${rec.type}/${rec.anilistId}`}>
                              Details <ChevronRight className="w-3 h-3 ml-0.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results after search */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No results found. Try describing a different vibe.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
