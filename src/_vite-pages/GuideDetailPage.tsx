import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { watchOrderGuides, GuideEntry } from "@/data/watchOrderGuides";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { BookmarkPlus, BookOpen, AlertTriangle, ChevronLeft } from "lucide-react";

const GuideDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = watchOrderGuides.find((g) => g.slug === slug);
  const [orderMode, setOrderMode] = useState<"release" | "chronological">("release");
  const { user } = useAuth();
  const { addToWatchlist, isInWatchlist } = useWatchlist();

  if (!guide) return <Navigate to="/guides" replace />;

  const entries = orderMode === "chronological" && guide.chronologicalOrder
    ? guide.chronologicalOrder
    : guide.releaseOrder;

  const handleAddAll = () => {
    if (!user) return;
    const uniqueIds = new Set<number>();
    entries.forEach((entry) => {
      if (!uniqueIds.has(entry.anilistId) && !isInWatchlist(entry.anilistId, "anime")) {
        uniqueIds.add(entry.anilistId);
        addToWatchlist.mutate({
          mal_id: entry.anilistId,
          media_type: "anime",
          title: entry.title,
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <SEO
        title={`${guide.franchise} Watch Order Guide (2026)`}
        description={`Complete watch order guide for ${guide.franchise}. Learn the best order to watch all ${guide.releaseOrder.length} entries in the franchise.`}
        url={`/guide/${guide.slug}`}
      />

      <main id="main-content" className="container mx-auto px-4 pt-20 pb-16">
        {/* Back link */}
        <Link
          to="/guides"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> All Guides
        </Link>

        {/* Hero */}
        <div className={`rounded-xl bg-gradient-to-r ${guide.bannerColor} p-6 sm:p-10 mb-8`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-white/80" />
            <span className="text-white/70 text-sm font-medium">Watch Order Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            How to Watch {guide.franchise} in Order
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-3xl leading-relaxed">
            {guide.introduction}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {guide.hasChronological && guide.chronologicalOrder && (
            <div className="flex items-center bg-card rounded-full p-1 border border-border/50">
              <button
                onClick={() => setOrderMode("release")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors",
                  orderMode === "release"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Release Order
              </button>
              <button
                onClick={() => setOrderMode("chronological")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors",
                  orderMode === "chronological"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Chronological Order
              </button>
            </div>
          )}

          {user && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 ml-auto"
              onClick={handleAddAll}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Add all to watchlist
            </Button>
          )}
        </div>

        {/* Entry list */}
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <EntryCard
              key={`${entry.anilistId}-${index}`}
              entry={entry}
              index={index + 1}
              isOnWatchlist={isInWatchlist(entry.anilistId, "anime")}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function EntryCard({
  entry,
  index,
  isOnWatchlist,
}: {
  entry: GuideEntry;
  index: number;
  isOnWatchlist: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card transition-colors",
        isOnWatchlist ? "border-primary/30 bg-primary/5" : "border-border/50"
      )}
    >
      {/* Sequence number */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
        {index}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Link
            to={`/anime/${entry.anilistId}`}
            className="font-semibold text-foreground hover:text-primary transition-colors text-sm sm:text-base"
          >
            {entry.title}
          </Link>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {entry.type}
          </Badge>
          {entry.episodes && (
            <span className="text-xs text-muted-foreground">
              {entry.episodes} ep{typeof entry.episodes === "number" && entry.episodes > 1 ? "s" : ""}
            </span>
          )}
          <Badge
            variant={entry.essential ? "default" : "secondary"}
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {entry.essential ? "Essential" : "Optional"}
          </Badge>
          {isOnWatchlist && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/50 text-primary">
              In watchlist
            </Badge>
          )}
        </div>
        {entry.note && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {entry.note}
          </p>
        )}
        {entry.fillerNote && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-500/90 bg-amber-500/10 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span><strong>Filler guide:</strong> {entry.fillerNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GuideDetailPage;
