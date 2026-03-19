import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SEO, creativeWorkJsonLd } from "@/components/SEO";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Bookmark, MessageCircle, Send, User, ThumbsUp, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Play, Bell } from "lucide-react";
import { useUserScore } from "@/hooks/useUserScore";
import { RatingPopover } from "@/components/RatingPopover";
import { EpisodeCountdown } from "@/components/EpisodeCountdown";
import { WhereToWatch } from "@/components/WhereToWatch";
import { ShareButton } from "@/components/ShareButton";
import { WatchlistStatus } from "@/components/WatchlistStatus";
import { EpisodeProgressTracker } from "@/components/EpisodeProgressTracker";
import { RelatedMedia } from "@/components/RelatedMedia";
import { NotificationToggle } from "@/components/NotificationToggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validateComment } from "@/lib/validation";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useTranslatedText } from "@/hooks/useTranslatedText";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function AnimeDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [episodePanelOpen, setEpisodePanelOpen] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, isLoading: watchlistLoading } = useWatchlist();

  const translatedSynopsis = useTranslatedText(anime?.synopsis);
  const { logView } = useViewingHistory();
  const { score: userScore, rate: rateMedia } = useUserScore(Number(id), "anime");
  const [likeAnimatingId, setLikeAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    if (anime && id) {
      logView({
        media_id: Number(id),
        media_type: "anime",
        title: anime.title,
        title_japanese: anime.title_japanese,
        image_url: anime.images?.webp?.large_image_url,
        last_episode: selectedEpisode,
      });
    }
  }, [anime?.anilist_id]);

  const handleBookmarkToggle = () => {
    if (!user) {
      toast({ title: t("comments.signInToComment"), variant: "destructive" });
      return;
    }
    if (isBookmarked) {
      removeFromWatchlist.mutate({ mal_id: Number(id), media_type: "anime" });
    } else if (anime) {
      addToWatchlist.mutate({
        mal_id: Number(id),
        media_type: "anime",
        title: anime.title,
        title_japanese: anime.title_japanese,
        image_url: anime.images?.webp?.large_image_url,
        score: anime.score,
      });
    }
  };

  // Comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["episode-comments", Number(id), selectedEpisode, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_comments")
        .select(`*, profiles:user_id (username, avatar_url)`)
        .eq("anime_id", Number(id))
        .eq("episode_number", selectedEpisode)
        .order(sortBy === "likes" ? "likes" : "created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Real-time comment count updates
  const [commentFlash, setCommentFlash] = useState(false);
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`comments-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "episode_comments",
          filter: `anime_id=eq.${id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["episode-comments", Number(id), selectedEpisode, sortBy] });
          setCommentFlash(true);
          setTimeout(() => setCommentFlash(false), 600);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, selectedEpisode, sortBy, queryClient]);

  const { data: userLikes } = useQuery({
    queryKey: ["user-likes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(l => l.comment_id);
    },
    enabled: !!user,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Please sign in to comment");
      const { error } = await supabase
        .from("episode_comments")
        .insert({ user_id: user.id, anime_id: Number(id), episode_number: selectedEpisode, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["episode-comments", Number(id), selectedEpisode, sortBy] });
      toast({ title: t("comments.commentPosted") });
    },
    onError: (error: Error) => {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Please sign in to like");
      const hasLiked = userLikes?.includes(commentId);
      if (hasLiked) {
        const { error } = await supabase.from("comment_likes").delete().eq("user_id", user.id).eq("comment_id", commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("comment_likes").insert({ user_id: user.id, comment_id: commentId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episode-comments", Number(id), selectedEpisode, sortBy] });
      queryClient.invalidateQueries({ queryKey: ["user-likes", user?.id] });
    },
    onError: (error: Error) => {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    const validation = validateComment(trimmedComment);
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error, variant: "destructive" });
      return;
    }
    addCommentMutation.mutate(trimmedComment);
  };

  const generateEpisodes = (count: number) => {
    return Array.from({ length: Math.min(count, 24) }, (_, i) => ({
      number: i + 1,
      title: `Episode ${i + 1}`,
    }));
  };

  const episodes = anime ? generateEpisodes(anime.episodes || 12) : [];
  const totalEpisodes = episodes.length;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-sacred mb-4">{t("detail.errorLoading")} Anime</h1>
          <p className="text-muted-foreground mb-6">{t("common.somethingWrong")}</p>
          <Link to="/">
            <Button variant="outline">{t("common.goHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {anime && (
        <SEO
          title={anime.title}
          description={anime.synopsis?.slice(0, 155) || `Watch ${anime.title} on Bibue.`}
          image={anime.images?.webp?.large_image_url}
          url={`/anime/${id}`}
          jsonLd={creativeWorkJsonLd({
            name: anime.title,
            description: anime.synopsis,
            image: anime.images?.webp?.large_image_url,
            url: `/anime/${id}`,
            genre: anime.genres?.map((g: any) => g.name),
            rating: anime.score,
            ratingCount: anime.scored_by,
          })}
        />
      )}

      {/* ============ BANNER ============ */}
      <div className="relative w-full h-48 sm:h-64 md:h-72 overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <img
              src={anime?.images?.webp?.large_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          </>
        )}
        {/* Back button */}
        <Link
          to="/anime"
          className="absolute top-4 left-4 z-10 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-sacred font-semibold">Back</span>
        </Link>
      </div>

      {/* ============ HERO: POSTER + INFO ============ */}
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto -mt-24 sm:-mt-32 relative z-10">
          <div className="flex gap-5 sm:gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              {isLoading ? (
                <Skeleton className="w-28 sm:w-36 md:w-44 aspect-[2/3] rounded-xl" />
              ) : (
                <img
                  src={anime?.images?.webp?.large_image_url}
                  alt={anime?.title}
                  className="w-28 sm:w-36 md:w-44 aspect-[2/3] object-cover rounded-xl shadow-2xl border border-border/20"
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-8 sm:pt-16 md:pt-20">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-sacred line-clamp-2 mb-1.5">
                {anime?.title}
              </h1>
              {anime?.title_japanese && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{anime.title_japanese}</p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap mb-4">
                {anime?.score && (
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                    {formatScore(anime.score)}
                  </span>
                )}
                {anime?.year && <span>· {anime.year}</span>}
                {anime?.episodes && <span>· {anime.episodes} eps</span>}
                {anime?.duration && <span className="hidden sm:inline">· {anime.duration}</span>}
                {anime?.status && <span>· {anime.status}</span>}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handleBookmarkToggle}
                  disabled={watchlistLoading}
                  variant={isBookmarked ? "secondary" : "default"}
                  size="sm"
                  className="gap-1.5"
                >
                  <Bookmark className={cn("w-3.5 h-3.5", isBookmarked && "fill-current")} />
                  {isBookmarked ? "In List" : "Add to List"}
                </Button>
                <ShareButton title={anime?.title || ""} url={`/anime/${id}`} />
                {anime && (
                  <NotificationToggle
                    mediaId={Number(id)}
                    mediaType="anime"
                    title={anime.title}
                  />
                )}
              </div>

              {/* Countdown */}
              {anime?.nextAiringEpisode && (
                <div className="mt-3">
                  <EpisodeCountdown airingAt={anime.nextAiringEpisode.airingAt} episode={anime.nextAiringEpisode.episode} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Genres */}
              {anime?.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anime.genres.map((genre) => (
                    <Link
                      key={genre.mal_id}
                      to={`/genre/${genre.name.toLowerCase().replace(/ /g, "-")}`}
                      className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  {t("detail.synopsis")}
                </h2>
                <div className="relative">
                  <p className={cn(
                    "text-sm text-muted-foreground leading-relaxed",
                    !synopsisExpanded && "line-clamp-4"
                  )}>
                    {translatedSynopsis || t("detail.noSynopsis")}
                  </p>
                  {translatedSynopsis && translatedSynopsis.length > 300 && (
                    <button
                      onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                      className="text-xs text-primary mt-1 hover:underline"
                    >
                      {synopsisExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              </div>

              {/* Video Player */}
              {anime && (
                <VideoPlayer
                  animeId={Number(id)}
                  animeTitle={anime.title}
                  episodeNumber={selectedEpisode}
                  totalEpisodes={totalEpisodes}
                  thumbnail={anime.images?.webp?.large_image_url}
                  onPrevEpisode={() => selectedEpisode > 1 && setSelectedEpisode(selectedEpisode - 1)}
                  onNextEpisode={() => selectedEpisode < totalEpisodes && setSelectedEpisode(selectedEpisode + 1)}
                />
              )}

              {/* Episode selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Episodes</h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => selectedEpisode > 1 && setSelectedEpisode(selectedEpisode - 1)}
                      disabled={selectedEpisode <= 1}
                      className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-muted-foreground min-w-[4rem] text-center">
                      Ep {selectedEpisode} / {totalEpisodes}
                    </span>
                    <button
                      onClick={() => selectedEpisode < totalEpisodes && setSelectedEpisode(selectedEpisode + 1)}
                      disabled={selectedEpisode >= totalEpisodes}
                      className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Episode grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                  {episodes.map((ep) => (
                    <button
                      key={ep.number}
                      onClick={() => setSelectedEpisode(ep.number)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-medium transition-all active:scale-95",
                        selectedEpisode === ep.number
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {ep.number}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Progress Tracker */}
              {anime && (
                <EpisodeProgressTracker
                  malId={Number(id)}
                  totalEpisodes={anime.episodes || episodes.length}
                  animeTitle={anime.title}
                />
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Watchlist Status */}
              {anime && (
                <WatchlistStatus
                  malId={Number(id)}
                  mediaType="anime"
                  title={anime.title}
                  titleJapanese={anime.title_japanese}
                  imageUrl={anime.images?.webp?.large_image_url}
                  score={anime.score}
                  totalEpisodes={anime.episodes}
                />
              )}

              {/* Info card */}
              {anime && (
                <div className="rounded-xl bg-muted/20 p-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
                    {t("detail.information")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: t("detail.source"), value: anime.source },
                      { label: t("common.status"), value: anime.status },
                      { label: t("detail.aired"), value: anime.aired?.string },
                      { label: t("detail.rating"), value: anime.rating },
                      { label: t("detail.duration"), value: anime.duration },
                      { label: t("detail.rank"), value: anime.rank ? `#${anime.rank}` : undefined },
                      { label: t("detail.studios"), value: anime.studios?.map(s => s.name).join(", ") },
                    ].filter(item => item.value).map(({ label, value }) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span className="text-muted-foreground text-xs">{label}</span>
                        <span className="text-xs font-medium text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Where to Watch */}
              {anime && <WhereToWatch title={anime.title} />}

              {/* Related Media */}
              {anime && (
                <RelatedMedia
                  mediaId={Number(id)}
                  mediaType="anime"
                  currentTitle={anime.title}
                  currentStatus={anime.status}
                />
              )}
            </div>
          </div>

          {/* ============ COMMENTS (collapsible, full-width) ============ */}
          <Collapsible defaultOpen className="mt-8 border-t border-border/20 pt-6">
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  {t("detail.commentSection")}
                </h2>
                {comments && comments.length > 0 && (
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-semibold transition-all duration-300",
                    "bg-primary/15 text-primary",
                    commentFlash && "scale-125 bg-primary text-primary-foreground"
                  )}>
                    {comments.length}
                  </span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4">
              <div className="flex items-center justify-end gap-1 mb-3">
                <Button variant={sortBy === "latest" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("latest")} className="gap-1 text-xs h-7 px-2">
                  <ArrowUpDown className="w-3 h-3" /> {t("comments.latest")}
                </Button>
                <Button variant={sortBy === "likes" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("likes")} className="gap-1 text-xs h-7 px-2">
                  <ThumbsUp className="w-3 h-3" /> {t("comments.top")}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="mb-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? t("comments.shareThoughts") : t("comments.signInPlaceholder")}
                  className="mb-2 resize-none border-border/30"
                  rows={2}
                  disabled={!user}
                />
                <Button type="submit" size="sm" disabled={!user || !newComment.trim() || addCommentMutation.isPending} className="gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  {user ? t("comments.postComment") : t("comments.signInToComment")}
                </Button>
              </form>

              <div className="space-y-3">
                {commentsLoading ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">{t("comments.loadingComments")}</div>
                ) : comments && comments.length > 0 ? (
                  comments.map((comment) => {
                    const hasLiked = userLikes?.includes(comment.id);
                    return (
                      <div key={comment.id} className="rounded-xl bg-muted/30 p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-xs">{(comment.profiles as any)?.username || "Anonymous"}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1.5">{comment.content}</p>
                            <button
                              onClick={() => likeMutation.mutate(comment.id)}
                              disabled={!user || likeMutation.isPending}
                              className={cn(
                                "flex items-center gap-1 text-xs transition-colors",
                                hasLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <ThumbsUp className={cn("w-3 h-3", hasLiked && "fill-current")} />
                              <span>{comment.likes || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm">{t("detail.noCommentsYet")}</div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
