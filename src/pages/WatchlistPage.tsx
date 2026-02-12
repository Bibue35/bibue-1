import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Grid, List, Film, BookOpen, Trash2, Tag, BarChart3 } from "lucide-react";
import { QuickProgressButton } from "@/components/QuickProgressButton";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { RatingPopover } from "@/components/RatingPopover";
import { CategoryManager, useCategories } from "@/components/CategoryManager";
import { BatchEditMode, BatchSelectCheckbox } from "@/components/BatchEditMode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WatchlistPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const statusOptions = [
    { value: "plan_to_watch", label: t("status.planToWatch") },
    { value: "watching", label: t("status.watching") },
    { value: "completed", label: t("status.completed") },
    { value: "on_hold", label: t("status.onHold") },
    { value: "dropped", label: t("status.dropped") },
  ];
  const { watchlist, isLoading, removeFromWatchlist, updateStatus, updateScore } = useWatchlist();
  const { data: categories = [] } = useCategories();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const typeFromUrl = searchParams.get("type") as "anime" | "manga" | null;
  const [filter, setFilter] = useState<"all" | "anime" | "manga">(typeFromUrl || "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredWatchlist = watchlist?.filter((item) => {
    const typeMatch = filter === "all" || item.media_type === filter;
    const statusMatch = statusFilter === "all" || item.status === statusFilter;
    const categoryMatch = categoryFilter === "all" || 
      (categoryFilter === "none" && !item.category) ||
      item.category === categoryFilter;
    return typeMatch && statusMatch && categoryMatch;
  });

  const animeCount = watchlist?.filter((i) => i.media_type === "anime").length || 0;
  const mangaCount = watchlist?.filter((i) => i.media_type === "manga").length || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-24 flex flex-col items-center justify-center text-center px-4">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("watchlist.signIn")}</h1>
          <p className="text-muted-foreground">{t("watchlist.signInDesc")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              {filter === "anime" ? t("watchlist.savedAnime") : filter === "manga" ? t("watchlist.savedManga") : t("watchlist.mySaved")}
            </h1>
            {language === "ja" && <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-4">{t("watchlist.mySavedJp")}</p>}
            
            {/* Stats */}
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                <span>{animeCount} Anime</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{mangaCount} Manga</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/stats")}
                className="gap-1.5 rounded-full"
              >
                <BarChart3 className="w-4 h-4" />
                {t("watchlist.viewStats")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Edit Mode */}
      <section className="py-2">
        <div className="container mx-auto px-4">
          <BatchEditMode
            items={filteredWatchlist?.map(i => ({ 
              id: i.id, 
              mal_id: i.mal_id, 
              media_type: i.media_type, 
              title: i.title 
            })) || []}
            isActive={isBatchMode}
            onToggle={() => {
              setIsBatchMode(!isBatchMode);
              setSelectedIds(new Set());
            }}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </div>
      </section>

      {/* Filters */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "anime", "manga"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn("rounded-full capitalize", filter !== f && "glass-button")}
                >
                  {f === "all" ? t("common.all") : f}
                </Button>
              ))}
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 rounded-full">
                  <SelectValue placeholder={t("common.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("watchlist.allStatus")}</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 rounded-full">
                    <Tag className="w-3 h-3 mr-1" />
                    <SelectValue placeholder={t("watchlist.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("watchlist.allCategories")}</SelectItem>
                    <SelectItem value="none">{t("watchlist.uncategorized")}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <CategoryManager />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-full"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-full"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Watchlist Grid */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1"
            )}>
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-2xl" : "h-24 rounded-2xl"} />
              ))}
            </div>
          ) : filteredWatchlist && filteredWatchlist.length > 0 ? (
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1"
            )}>
              {filteredWatchlist.map((item) => (
                viewMode === "grid" ? (
                  <div key={item.id} className="group animate-fade-up">
                    <button
                      onClick={() => navigate(`/${item.media_type}/${item.mal_id}`)}
                      className="block text-left w-full"
                    >
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-2 divine-card sun-glow moon-glow">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 bg-background/80 text-foreground text-xs font-bold px-1.5 py-0.5 rounded capitalize">
                          {item.media_type}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWatchlist.mutate({ mal_id: item.mal_id, media_type: item.media_type as "anime" | "manga" });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-foreground/80 transition-colors">
                        {item.title}
                      </h3>
                    </button>
                    <div className="flex items-center gap-1 mt-1">
                      <RatingPopover
                        currentScore={item.score}
                        onRate={(score) => updateScore.mutate({ mal_id: item.mal_id, media_type: item.media_type as "anime" | "manga", score })}
                        size="sm"
                      />
                      <Select 
                        value={item.status} 
                        onValueChange={(status) => updateStatus.mutate({ mal_id: item.mal_id, media_type: item.media_type as "anime" | "manga", status })}
                      >
                        <SelectTrigger className="h-7 text-xs rounded-full flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <QuickProgressButton
                      mal_id={item.mal_id}
                      media_type={item.media_type as "anime" | "manga"}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl liquid-glass-subtle hover:bg-foreground/5 transition-all group"
                  >
                    <button
                      onClick={() => navigate(`/${item.media_type}/${item.mal_id}`)}
                      className="flex items-center gap-3 sm:gap-4 flex-1 text-left"
                    >
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        className="w-14 sm:w-16 h-18 sm:h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-foreground/80 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">{item.media_type}</p>
                      </div>
                    </button>
                    <QuickProgressButton
                      mal_id={item.mal_id}
                      media_type={item.media_type as "anime" | "manga"}
                    />
                    <RatingPopover
                      currentScore={item.score}
                      onRate={(score) => updateScore.mutate({ mal_id: item.mal_id, media_type: item.media_type as "anime" | "manga", score })}
                    />
                    <Select 
                      value={item.status} 
                      onValueChange={(status) => updateStatus.mutate({ mal_id: item.mal_id, media_type: item.media_type as "anime" | "manga", status })}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      onClick={() => removeFromWatchlist.mutate({ mal_id: item.mal_id, media_type: item.media_type as "anime" | "manga" })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t("watchlist.empty")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("watchlist.emptyDesc")}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/anime")}>{t("watchlist.browseAnime")}</Button>
                <Button variant="outline" onClick={() => navigate("/manga")}>{t("watchlist.browseManga")}</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
