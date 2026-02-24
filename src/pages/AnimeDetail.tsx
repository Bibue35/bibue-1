import { useState, useEffect, useRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SEO, creativeWorkJsonLd } from "@/components/SEO";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Play, Star, Clock, Bookmark, MessageCircle, Send, User, Maximize2, Minimize2, ThumbsUp, ArrowUpDown, ChevronDown, PictureInPicture2 } from "lucide-react";
import bibueTower from "@/assets/bibue-tower.png";
import { EpisodeCountdown } from "@/components/EpisodeCountdown";
import { WhereToWatch } from "@/components/WhereToWatch";
import { ShareButton } from "@/components/ShareButton";
import { WatchlistStatus } from "@/components/WatchlistStatus";
import { ResolutionSelector, type Resolution } from "@/components/ResolutionSelector";
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
import { useMiniPlayer } from "@/contexts/MiniPlayerContext";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AnimeDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [episodePanelOpen, setEpisodePanelOpen] = useState(false);
  const playerRef = useRef<HTMLElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const { activateMiniPlayer } = useMiniPlayer();
  
  const translatedSynopsis = useTranslatedText(anime?.synopsis);
  const { logView } = useViewingHistory();
  const isBookmarked = isInWatchlist(Number(id), "anime");

  // Log viewing history when anime data loads
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

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };
    
    if (isFullscreen) {
      window.addEventListener("mousemove", handleMouseMove);
      timeout = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (playerRef.current) {
        await playerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  const handleMinimize = () => {
    if (!anime) return;
    const episodes = generateEpisodes(anime.episodes || 12);
    activateMiniPlayer({
      animeId: Number(id),
      animeTitle: anime.title,
      animeTitleJapanese: anime.title_japanese,
      episodeNumber: selectedEpisode,
      totalEpisodes: episodes.length,
      thumbnail: anime.images?.webp?.large_image_url,
      youtubeId: anime.trailer?.youtube_id,
    });
    navigate("/anime");
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

      {/* ============ CINEMA PLAYER ============ */}
      <section 
        ref={playerRef as React.RefObject<HTMLElement>}
        className={cn(
          "relative bg-black",
          isFullscreen ? "fixed inset-0 z-50" : "w-full aspect-video max-h-[70vh]"
        )}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <>
            {/* Placeholder — no licensed content yet */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={anime?.images?.webp?.large_image_url} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-10 blur-md" 
              />
              <div className="relative text-center z-10 flex flex-col items-center gap-3">
                <img 
                  src={bibueTower} 
                  alt="Bibue" 
                  className="w-14 h-14 sm:w-20 sm:h-20 opacity-40 dark:invert" 
                />
                <p className="text-white/50 text-xs">Content coming soon</p>
              </div>
            </div>

            {/* Minimal top controls - fade on inactivity */}
            <div className={cn(
              "absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-5 py-2.5 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <Link
                to="/anime"
                className="text-white/80 hover:text-white text-sm font-sacred font-semibold transition-colors"
              >
                ← Back
              </Link>
              <div className="flex items-center gap-1">
                <ResolutionSelector value={resolution} onChange={setResolution} />
                <button
                  onClick={handleMinimize}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                  title="Mini player"
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* ============ TITLE BAR + EPISODE SELECTOR ============ */}
      <div className="border-b border-border/20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-5xl mx-auto py-4 sm:py-5">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-sacred line-clamp-1">
                  {anime?.title}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
                  {anime?.score && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                      <span className="font-medium text-foreground">{formatScore(anime.score)}</span>
                    </span>
                  )}
                  {anime?.year && <span>· {anime.year}</span>}
                  {anime?.episodes && <span>· {anime.episodes} eps</span>}
                  {anime?.status && <span className="hidden sm:inline">· {anime.status}</span>}
                  {anime?.nextAiringEpisode && (
                    <EpisodeCountdown airingAt={anime.nextAiringEpisode.airingAt} episode={anime.nextAiringEpisode.episode} />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmarkToggle}
                  disabled={watchlistLoading}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    isBookmarked ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                </Button>
                <ShareButton title={anime?.title || ""} url={`/anime/${id}`} />
              </div>
            </div>

            {/* Episode selector strip */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEpisodePanelOpen(!episodePanelOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current text-primary" />
                <span>Episode {selectedEpisode}</span>
                <span className="text-muted-foreground text-xs">/ {totalEpisodes}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", episodePanelOpen && "rotate-180")} />
              </button>

              {/* Quick prev/next */}
              {selectedEpisode > 1 && (
                <button
                  onClick={() => setSelectedEpisode(selectedEpisode - 1)}
                  className="px-2.5 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  ← Prev
                </button>
              )}
              {selectedEpisode < totalEpisodes && (
                <button
                  onClick={() => setSelectedEpisode(selectedEpisode + 1)}
                  className="px-2.5 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Next →
                </button>
              )}
            </div>

            {/* Expandable episode grid */}
            {episodePanelOpen && (
              <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-border/20">
                <ScrollArea className="max-h-48">
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                    {episodes.map((ep) => (
                      <button
                        key={ep.number}
                        onClick={() => {
                          setSelectedEpisode(ep.number);
                          setEpisodePanelOpen(false);
                        }}
                        className={cn(
                          "py-1.5 rounded-md text-xs font-medium transition-all",
                          selectedEpisode === ep.number
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground"
                        )}
                      >
                        {ep.number}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-5xl mx-auto py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Synopsis */}
              <div>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">{t("detail.synopsis")}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {translatedSynopsis || t("detail.noSynopsis")}
                </p>
              </div>

              {/* Genres */}
              {anime?.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anime.genres.map((genre) => (
                    <Link key={genre.mal_id} to={`/genre/${genre.name.toLowerCase().replace(/ /g, "-")}`}
                      className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs hover:bg-accent hover:text-accent-foreground transition-colors">
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Episode Progress Tracker */}
              {anime && (
                <EpisodeProgressTracker
                  malId={Number(id)}
                  totalEpisodes={anime.episodes || episodes.length}
                  animeTitle={anime.title}
                />
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Watchlist + Notification */}
              {anime && (
                <div className="flex flex-col gap-2">
                  <WatchlistStatus
                    malId={Number(id)}
                    mediaType="anime"
                    title={anime.title}
                    titleJapanese={anime.title_japanese}
                    imageUrl={anime.images?.webp?.large_image_url}
                    score={anime.score}
                    totalEpisodes={anime.episodes}
                  />
                  <NotificationToggle
                    mediaId={Number(id)}
                    mediaType="anime"
                    title={anime.title}
                  />
                </div>
              )}

              {/* Info */}
              {anime && (
                <div className="rounded-xl bg-muted/20 p-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">{t("detail.information")}</h3>
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
          <Collapsible className="mt-8">
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                  {t("detail.commentSection")}
                </h2>
                {comments && (
                  <span className="text-xs text-muted-foreground">({comments.length})</span>
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
