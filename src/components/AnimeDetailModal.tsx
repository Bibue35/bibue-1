import { useState, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Play, X, Star, Eye, Search, ChevronLeft, ChevronRight, ChevronDown, MessageCircle, Send, User, ThumbsUp, ArrowUpDown, Users, Tv, BookOpen, Heart as HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnimeDetails, useAnimeRecommendations } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";
import { CharactersStaffTab } from "./CharactersStaffTab";
import { WhereToWatch } from "./WhereToWatch";
import { ShareButton } from "./ShareButton";
import { WatchlistStatus } from "./WatchlistStatus";
import { RelatedMedia } from "./RelatedMedia";
import { ResponsiveModal } from "./ResponsiveModal";
import { AnimeCard } from "./AnimeCard";

interface AnimeDetailModalProps {
  animeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnimeDetailModal({ animeId, open, onOpenChange }: AnimeDetailModalProps) {
  const navigate = useNavigate();
  const { data: anime, isLoading } = useAnimeDetails(animeId, open);
  const { data: recommendations } = useAnimeRecommendations(animeId, open);
  const [episodeRange, setEpisodeRange] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate mock episode data
  const generateEpisodes = (count: number) => {
    return Array.from({ length: Math.min(count, 24) }, (_, i) => ({
      number: i + 1,
      title: i === 0 ? "Episode 1" : `Episode ${i + 1}`,
      description: `Episode ${i + 1} of ${anime?.title || "this anime"}...`,
      thumbnail: anime?.images?.webp?.large_image_url,
    }));
  };

  const episodes = anime ? generateEpisodes(anime.episodes || 12) : [];
  const episodesPerPage = 4;
  const totalPages = Math.ceil(episodes.length / episodesPerPage);
  const displayedEpisodes = episodes.slice(
    episodeRange * episodesPerPage,
    (episodeRange + 1) * episodesPerPage
  );

  // Comments query
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["anime-comments", animeId, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`*, profiles:user_id (username, avatar_url)`)
        .eq("anime_id", animeId)
        .eq("category", "general")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open && activeTab === "comments",
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Please sign in to comment");
      const { error } = await supabase
        .from("discussions")
        .insert({ user_id: user.id, anime_id: animeId, category: "general", title: `Comment on ${anime?.title}`, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["anime-comments", animeId, sortBy] });
      toast({ title: "Comment posted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    const validation = validateComment(trimmed);
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error, variant: "destructive" });
      return;
    }
    addCommentMutation.mutate(trimmed);
  };

  const handlePlay = (episodeNumber?: number) => {
    onOpenChange(false);
    navigate(`/anime/${animeId}`, { state: { episode: episodeNumber || 1 } });
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title={anime?.title || "Anime Details"}>
      {/* Hero Image */}
      <div className="relative h-[65vh] xs:h-[55vh] sm:h-80 overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <img src={anime?.images?.webp?.large_image_url} alt={anime?.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <h1 className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl font-bold font-sacred text-foreground mb-0.5 sm:mb-1 line-clamp-2">
                {anime?.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-jp mb-2 sm:mb-3 line-clamp-1">
                {anime?.title_japanese}
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                {anime?.score && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-foreground text-foreground" />
                    {formatScore(anime.score)}
                  </span>
                )}
                <span>•</span>
                <span>{anime?.year || new Date(anime?.aired?.from || "").getFullYear()}</span>
                {anime?.episodes && (
                  <>
                    <span>•</span>
                    <span>{anime.episodes} eps</span>
                  </>
                )}
                {anime?.status && (
                  <>
                    <span className="hidden xs:inline">•</span>
                    <span className="hidden xs:inline">{anime.status}</span>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors sm:left-auto sm:right-4"
        >
          <ChevronDown className="w-5 h-5 sm:hidden" />
          <X className="w-5 h-5 hidden sm:block" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-border/30 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button variant="default" size="sm" className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4" onClick={() => handlePlay(1)}>
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            <span className="hidden xs:inline">PLAY</span>
          </Button>
          <ShareButton title={anime?.title || ""} url={`/anime/${animeId}`} />
        </div>
        <WatchlistStatus
          malId={animeId}
          mediaType="anime"
          title={anime?.title || ""}
          titleJapanese={anime?.title_japanese}
          imageUrl={anime?.images?.webp?.large_image_url}
          score={anime?.score}
          totalEpisodes={anime?.episodes}
        />
      </div>

      {/* Tabbed Content */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2.5 sm:px-3">Overview</TabsTrigger>
            <TabsTrigger value="episodes" className="text-xs sm:text-sm px-2.5 sm:px-3 gap-1">
              <Play className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Episodes</span>
              <span className="xs:hidden">Eps</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="text-xs sm:text-sm px-2.5 sm:px-3 gap-1">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Characters</span>
              <span className="xs:hidden">Cast</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm px-2.5 sm:px-3">Reviews</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs sm:text-sm px-2.5 sm:px-3">
              <span className="hidden xs:inline">Recommendations</span>
              <span className="xs:hidden">Similar</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs sm:text-sm px-2.5 sm:px-3 gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Comments</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-5">
              {/* Synopsis */}
              <div>
                <h2 className="text-base sm:text-lg font-bold font-sacred mb-2">SYNOPSIS</h2>
                {isLoading ? (
                  <><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {anime?.synopsis || "No synopsis available."}
                  </p>
                )}
              </div>

              {/* Genres */}
              {anime?.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anime.genres.map((genre) => (
                    <Link
                      key={genre.mal_id}
                      to={`/genre/${genre.name.toLowerCase().replace(/ /g, "-")}`}
                      onClick={() => onOpenChange(false)}
                      className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Info grid */}
              {anime && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { label: "Source", value: anime.source },
                    { label: "Episodes", value: anime.episodes },
                    { label: "Status", value: anime.status },
                    { label: "Aired", value: anime.aired?.string },
                    { label: "Duration", value: anime.duration },
                    { label: "Studios", value: anime.studios?.map(s => s.name).join(", ") },
                  ].filter(i => i.value).map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-muted-foreground">{label}</span>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Where to Watch */}
              {anime && <WhereToWatch title={anime.title} />}

              {/* Related Media */}
              <RelatedMedia mediaId={animeId} mediaType="anime" onNavigate={() => onOpenChange(false)} />
            </div>
          </TabsContent>

          {/* Episodes Tab */}
          <TabsContent value="episodes">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-lg font-bold font-sacred">EPISODES</h2>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {episodeRange * episodesPerPage + 1}-{Math.min((episodeRange + 1) * episodesPerPage, episodes.length)}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" disabled={episodeRange === 0} onClick={() => setEpisodeRange(p => p - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" disabled={episodeRange >= totalPages - 1} onClick={() => setEpisodeRange(p => p + 1)}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {displayedEpisodes.map((ep) => (
                <button key={ep.number} onClick={() => handlePlay(ep.number)} className="text-left group">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-1.5">
                    <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-1.5 right-1.5 bg-background/80 text-foreground text-[10px] font-bold px-1 py-0.5 rounded">E{ep.number}</div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-xs group-hover:text-primary transition-colors line-clamp-1">{ep.number}. {ep.title}</h3>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters">
            <CharactersStaffTab mediaId={animeId} mediaType="anime" />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-semibold mb-1">Reviews Coming Soon</h3>
              <p className="text-sm text-muted-foreground">User reviews will be available in a future update.</p>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            {recommendations && recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {recommendations.slice(0, 12).map((rec) => (
                  <AnimeCard key={rec.entry.anilist_id} anime={rec.entry} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No recommendations available</p>
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-sacred">COMMENTS</h2>
              <div className="flex items-center gap-1">
                <Button variant={sortBy === "latest" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("latest")} className="gap-1.5 text-xs">
                  <ArrowUpDown className="w-3 h-3" /> Latest
                </Button>
                <Button variant={sortBy === "likes" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("likes")} className="gap-1.5 text-xs">
                  <ThumbsUp className="w-3 h-3" /> Top
                </Button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Share your thoughts..." : "Sign in to comment..."}
                className="mb-3 resize-none"
                rows={3}
                disabled={!user}
              />
              <Button type="submit" disabled={!user || !newComment.trim() || addCommentMutation.isPending} className="gap-2">
                <Send className="w-4 h-4" />
                {user ? "Post Comment" : "Sign in to comment"}
              </Button>
            </form>
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl bg-muted/30 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{(comment.profiles as any)?.username || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to share your thoughts!</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveModal>
  );
}
