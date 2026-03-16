import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Library, Grid, List, Film, BookOpen, Trash2, Tag, BarChart3, Search, ArrowUpDown, BookmarkPlus, ChevronDown } from "lucide-react";
import { QuickProgressButton } from "@/components/QuickProgressButton";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { RatingPopover } from "@/components/RatingPopover";
import { CategoryManager, useCategories } from "@/components/CategoryManager";
import { BatchEditMode } from "@/components/BatchEditMode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = "recent" | "title" | "score" | "status";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  
  const typeFromUrl = searchParams.get("type") as "anime" | "manga" | "manhwa" | "manhua" | null;
  const [filter, setFilter] = useState<"all" | "anime" | "manga" | "manhwa" | "manhua">(typeFromUrl || "all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [mangaSubOpen, setMangaSubOpen] = useState(false);

  const filteredWatchlist = useMemo(() => {
    let items = watchlist?.filter((item) => {
      const typeMatch = filter === "all" || 
        item.media_type === filter ||
        (filter === "manhwa" && item.media_type === "manga") ||
        (filter === "manhua" && item.media_type === "manga");
      const statusMatch = statusFilter === "all" || item.status === statusFilter;
      const categoryMatch = categoryFilter === "all" || 
        (categoryFilter === "none" && !item.category) ||
        item.category === categoryFilter;
      const searchMatch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title_japanese?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatch && statusMatch && categoryMatch && searchMatch;
    }) || [];

    // Sort
    switch (sortBy) {
      case "title":
        items = [...items].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "score":
        items = [...items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        break;
      case "status":
        items = [...items].sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      case "recent":
      default:
        // Already sorted by updated_at desc from DB
        break;
    }

    return items;
  }, [watchlist, filter, statusFilter, categoryFilter, searchQuery, sortBy]);

  const animeCount = watchlist?.filter((i) => i.media_type === "anime").length || 0;
  const mangaCount = watchlist?.filter((i) => i.media_type === "manga").length || 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-24 flex flex-col items-center justify-center text-center px-4">
          <Library className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("watchlist.signIn")}</h1>
          <p className="text-muted-foreground">{t("watchlist.signInDesc")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Library" description="Your personal anime and manga library. Organize, rate, and manage your bookmarked titles." url="/watchlist" noIndex />
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-6 sm:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              My Library
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

      {/* Search + Sort Bar */}
      <section className="py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full bg-foreground/5 border-foreground/10"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-44 rounded-full">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="title">Title A–Z</SelectItem>
                <SelectItem value="score">Highest Score</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
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
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className={cn("rounded-full", filter !== "all" && "glass-button")}
              >
                {t("common.all")}
              </Button>
              <Button
                variant={filter === "anime" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("anime")}
                className={cn("rounded-full", filter !== "anime" && "glass-button")}
              >
                Anime
              </Button>

              {/* Manga collapsible group */}
              <div className="relative">
                <Button
                  variant={["manga", "manhwa", "manhua"].includes(filter) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    if (!["manga", "manhwa", "manhua"].includes(filter)) setFilter("manga");
                    setMangaSubOpen(!mangaSubOpen);
                  }}
                  className={cn(
                    "rounded-full gap-1",
                    !["manga", "manhwa", "manhua"].includes(filter) && "glass-button"
                  )}
                >
                  {filter === "manhwa" ? "Manhwa" : filter === "manhua" ? "Manhua" : "Manga"}
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    mangaSubOpen && "rotate-180"
                  )} />
                </Button>
                {mangaSubOpen && (
                  <div className="absolute top-full left-0 mt-1 z-20 bg-popover border border-border rounded-xl shadow-lg p-1 min-w-[120px]">
                    {(["manga", "manhwa", "manhua"] as const).map((sub) => (
                      <button
                        key={sub}
                        onClick={() => {
                          setFilter(sub);
                          setMangaSubOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors",
                          filter === sub ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        )}
                      >
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
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

      {/* Library Grid */}
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
              <BookmarkPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Your library is empty</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Bookmark anime and manga to build your personal collection. Tap the heart icon on any title to save it here.
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