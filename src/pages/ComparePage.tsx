import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Tv, Clock, Tag, Share2, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CompareAnime {
  id: number;
  title: { romaji: string; english: string | null };
  description: string | null;
  episodes: number | null;
  status: string;
  genres: string[];
  averageScore: number | null;
  coverImage: { large: string };
  format: string | null;
  seasonYear: number | null;
}

async function searchAnime(query: string): Promise<CompareAnime[]> {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anilist-proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query ($search: String) { Page(perPage: 6) { media(search: $search, type: ANIME) { id title { romaji english } description episodes status genres averageScore coverImage { large } format seasonYear } } }`,
      variables: { search: query },
    }),
  });
  const data = await res.json();
  return data?.data?.Page?.media || [];
}

async function fetchAnime(id: number): Promise<CompareAnime | null> {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anilist-proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query ($id: Int) { Media(id: $id, type: ANIME) { id title { romaji english } description episodes status genres averageScore coverImage { large } format seasonYear } }`,
      variables: { id },
    }),
  });
  const data = await res.json();
  return data?.data?.Media || null;
}

function AnimeSelector({ label, anime, onSelect, onClear }: {
  label: string;
  anime: CompareAnime | null;
  onSelect: (a: CompareAnime) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompareAnime[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const r = await searchAnime(query);
      setResults(r);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (anime) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
        <img src={anime.coverImage.large} alt="" className="w-12 h-16 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{anime.title.english || anime.title.romaji}</p>
          <p className="text-xs text-muted-foreground">{anime.genres.slice(0, 3).join(", ")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClear} className="shrink-0 h-8 w-8 rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${label}...`}
          className="pl-9"
        />
        {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      {results.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto rounded-xl border border-border/30 p-1">
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => { onSelect(r); setQuery(""); setResults([]); }}
              className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/60 text-left transition-colors"
            >
              <img src={r.coverImage.large} alt="" className="w-8 h-11 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.title.english || r.title.romaji}</p>
                <p className="text-[10px] text-muted-foreground">{r.averageScore ? `${r.averageScore}%` : "N/A"} • {r.episodes || "?"} eps</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatRow({ label, left, right, highlight }: { label: string; left: string; right: string; highlight?: "left" | "right" | null }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2 border-b border-border/20 last:border-0">
      <span className={cn("text-sm text-right", highlight === "left" && "font-bold text-primary")}>{left}</span>
      <span className="text-[10px] text-muted-foreground uppercase font-medium px-2 min-w-[80px] text-center">{label}</span>
      <span className={cn("text-sm", highlight === "right" && "font-bold text-primary")}>{right}</span>
    </div>
  );
}

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [left, setLeft] = useState<CompareAnime | null>(null);
  const [right, setRight] = useState<CompareAnime | null>(null);

  // Load from URL params
  useEffect(() => {
    const lid = searchParams.get("left");
    const rid = searchParams.get("right");
    if (lid) fetchAnime(parseInt(lid)).then(setLeft);
    if (rid) fetchAnime(parseInt(rid)).then(setRight);
  }, []);

  // Update URL when selection changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (left) params.set("left", left.id.toString());
    if (right) params.set("right", right.id.toString());
    setSearchParams(params, { replace: true });
  }, [left, right]);

  const share = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: "Comparison link copied!" });
  };

  const scoreHighlight = () => {
    if (!left?.averageScore || !right?.averageScore) return null;
    return left.averageScore > right.averageScore ? "left" : left.averageScore < right.averageScore ? "right" : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Compare Anime" description="Side-by-side anime comparison tool" url="/compare" />
      <CollapsibleNavbar />

      <section className="pt-28 pb-8 container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare Anime</h1>
          <p className="text-muted-foreground">Side-by-side — which should you watch?</p>
        </div>

        {/* Selectors */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Anime A</span>
            <AnimeSelector label="first anime" anime={left} onSelect={setLeft} onClear={() => setLeft(null)} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">Anime B</span>
            <AnimeSelector label="second anime" anime={right} onSelect={setRight} onClear={() => setRight(null)} />
          </div>
        </div>

        {/* Comparison */}
        {left && right && (
          <div className="space-y-6">
            {/* Visual header */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              <div className="flex flex-col items-center gap-2">
                <img src={left.coverImage.large} alt="" className="w-24 h-32 sm:w-32 sm:h-44 rounded-xl object-cover" />
                <h2 className="font-bold text-sm text-center">{left.title.english || left.title.romaji}</h2>
              </div>
              <span className="text-2xl font-bold text-muted-foreground">VS</span>
              <div className="flex flex-col items-center gap-2">
                <img src={right.coverImage.large} alt="" className="w-24 h-32 sm:w-32 sm:h-44 rounded-xl object-cover" />
                <h2 className="font-bold text-sm text-center">{right.title.english || right.title.romaji}</h2>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl bg-muted/40 border border-border/30 p-4">
              <StatRow label="Score" left={left.averageScore ? `${left.averageScore}%` : "N/A"} right={right.averageScore ? `${right.averageScore}%` : "N/A"} highlight={scoreHighlight()} />
              <StatRow label="Episodes" left={left.episodes?.toString() || "?"} right={right.episodes?.toString() || "?"} />
              <StatRow label="Status" left={left.status} right={right.status} />
              <StatRow label="Format" left={left.format || "?"} right={right.format || "?"} />
              <StatRow label="Year" left={left.seasonYear?.toString() || "?"} right={right.seasonYear?.toString() || "?"} />
              <StatRow label="Genres" left={left.genres.slice(0, 4).join(", ")} right={right.genres.slice(0, 4).join(", ")} />
            </div>

            {/* Shared genres */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Shared Genres</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {left.genres.filter(g => right.genres.includes(g)).map(g => (
                  <span key={g} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{g}</span>
                ))}
                {left.genres.filter(g => right.genres.includes(g)).length === 0 && (
                  <span className="text-xs text-muted-foreground">No shared genres</span>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={share} className="gap-1.5 rounded-full">
                <Share2 className="w-3.5 h-3.5" /> Share Comparison
              </Button>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
