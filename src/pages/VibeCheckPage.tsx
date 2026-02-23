import { useState, lazy, Suspense } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, Star, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { searchAnime } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const AnimeDetailModal = lazy(() => import("@/components/AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));

const MOOD_TAGS = [
  { label: "Dark", emoji: "🌑", color: "bg-zinc-800 text-zinc-200 border-zinc-600" },
  { label: "Colorful", emoji: "🌈", color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  { label: "Nostalgic", emoji: "📼", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { label: "Chaotic", emoji: "💥", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  { label: "Cozy", emoji: "☕", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { label: "Epic", emoji: "⚔️", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { label: "Melancholy", emoji: "🌧️", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Uplifting", emoji: "☀️", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { label: "Mind-bending", emoji: "🧠", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Romantic", emoji: "💕", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { label: "Creepy", emoji: "👁️", color: "bg-emerald-800/30 text-emerald-300 border-emerald-600/30" },
  { label: "Chill", emoji: "🍃", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  { label: "Intense", emoji: "🔥", color: "bg-orange-600/20 text-orange-300 border-orange-600/30" },
  { label: "Surreal", emoji: "🪐", color: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  { label: "Funny", emoji: "😂", color: "bg-yellow-400/20 text-yellow-200 border-yellow-400/30" },
  { label: "Heartbreaking", emoji: "💔", color: "bg-red-400/20 text-red-300 border-red-400/30" },
];

interface AIRecommendation {
  title: string;
  reason: string;
  genres: string[];
  score: number;
}

interface MatchedRecommendation extends AIRecommendation {
  anilistId?: number;
  imageUrl?: string;
}

export default function VibeCheckPage() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MatchedRecommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : prev.length < 5
        ? [...prev, mood]
        : prev
    );
  };

  const handleVibeCheck = async () => {
    if (selectedMoods.length === 0) {
      toast({ title: "Select at least one mood", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke("vibe-check", {
        body: { moods: selectedMoods },
      });

      if (error) throw error;

      const recs: AIRecommendation[] = data.recommendations || [];

      // Try to match each recommendation to an AniList entry
      const matched: MatchedRecommendation[] = await Promise.all(
        recs.map(async (rec) => {
          try {
            const searchResult = await searchAnime(rec.title, 1);
            const firstMatch = searchResult[0];
            if (firstMatch) {
              return {
                ...rec,
                anilistId: firstMatch.anilist_id,
                imageUrl: firstMatch.images.webp.image_url,
              };
            }
          } catch {}
          return rec;
        })
      );

      setResults(matched);
    } catch (error) {
      console.error("Vibe check error:", error);
      toast({
        title: "Vibe check failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAnime = (id: number) => {
    setSelectedAnimeId(id);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Vibe Check — Find Anime by Mood — Bibue"
        description="Build your mood board and let AI recommend anime that match your vibe. A new way to discover anime."
        url="/vibe"
      />
      <CollapsibleNavbar />

      <main id="main-content" className="pt-20 pb-24">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Hero */}
          <div className="text-center py-8 md:py-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Discovery
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-sacred mb-4">
              Vibe Check
            </h1>
            <p className="text-muted-foreground text-lg">
              Select your current mood and let AI find anime that match your vibe perfectly.
            </p>
          </div>

          {/* Mood tags */}
          <div className="max-w-3xl mx-auto mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
              What's your vibe? (Pick up to 5)
            </h2>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {MOOD_TAGS.map((mood) => {
                const isSelected = selectedMoods.includes(mood.label);
                return (
                  <button
                    key={mood.label}
                    onClick={() => toggleMood(mood.label)}
                    className={cn(
                      "px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200",
                      "hover:scale-105 active:scale-95",
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 " + mood.color
                        : "bg-muted/30 border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="mr-1.5">{mood.emoji}</span>
                    {mood.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action */}
          <div className="text-center mb-12">
            <Button
              onClick={handleVibeCheck}
              disabled={selectedMoods.length === 0 || isLoading}
              size="lg"
              className="gap-2 rounded-full px-8 h-12 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing vibes...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Check My Vibe
                </>
              )}
            </Button>
            {selectedMoods.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {selectedMoods.join(" · ")}
              </p>
            )}
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-bold mb-6 text-center">
                ✨ Your Vibe Matches
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.map((rec, i) => (
                  <button
                    key={i}
                    onClick={() => rec.anilistId && openAnime(rec.anilistId)}
                    className={cn(
                      "group text-left transition-transform duration-150",
                      rec.anilistId ? "hover:scale-[1.03] active:scale-[0.97]" : "opacity-70"
                    )}
                    disabled={!rec.anilistId}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-muted">
                      {rec.imageUrl ? (
                        <img
                          src={rec.imageUrl}
                          alt={rec.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {rec.score && (
                        <div className="absolute top-2 right-2 bg-background/80 text-foreground text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          {rec.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-0.5 group-hover:text-primary transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                      {rec.reason}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {hasSearched && !isLoading && results.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No results found. Try different moods!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {modalOpen && selectedAnimeId && (
        <Suspense fallback={null}>
          <AnimeDetailModal
            animeId={selectedAnimeId}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </div>
  );
}
