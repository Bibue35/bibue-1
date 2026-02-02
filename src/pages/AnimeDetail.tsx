import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Star, Clock, Heart, Bookmark, MessageCircle, Send, User, Maximize2, Minimize2, ThumbsUp, ArrowUpDown } from "lucide-react";
import { ResolutionSelector, type Resolution } from "@/components/ResolutionSelector";
import { CollapsibleEpisodeList } from "@/components/CollapsibleEpisodeList";
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

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [isFavorite, setIsFavorite] = useState(false);
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const playerRef = useRef<HTMLElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, isLoading: watchlistLoading } = useWatchlist();
  
  const isBookmarked = isInWatchlist(Number(id), "anime");

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

  // Handle fullscreen toggle using browser Fullscreen API
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

  // Listen for fullscreen changes (e.g., pressing Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    if (!user) {
      toast({ title: "Please sign in to bookmark", variant: "destructive" });
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

  // Handle favorite toggle (local state for now)
  const handleFavoriteToggle = () => {
    if (!user) {
      toast({ title: "Please sign in to favorite", variant: "destructive" });
      return;
    }
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? "Removed from favorites" : "Added to favorites!" });
  };

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["episode-comments", Number(id), selectedEpisode, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_comments")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("anime_id", Number(id))
        .eq("episode_number", selectedEpisode)
        .order(sortBy === "likes" ? "likes" : "created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if user has liked a comment
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
        .insert({
          user_id: user.id,
          anime_id: Number(id),
          episode_number: selectedEpisode,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["episode-comments", Number(id), selectedEpisode, sortBy] });
      toast({ title: "Comment posted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Please sign in to like");
      
      const hasLiked = userLikes?.includes(commentId);
      
      if (hasLiked) {
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_likes")
          .insert({ user_id: user.id, comment_id: commentId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episode-comments", Number(id), selectedEpisode, sortBy] });
      queryClient.invalidateQueries({ queryKey: ["user-likes", user?.id] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  // Generate mock episode data with thumbnails
  const generateEpisodes = (count: number) => {
    const aired = anime?.aired?.from ? new Date(anime.aired.from) : new Date();
    return Array.from({ length: Math.min(count, 24) }, (_, i) => {
      const episodeDate = new Date(aired);
      episodeDate.setDate(episodeDate.getDate() + (i * 7));
      return {
        number: i + 1,
        title: `Episode ${i + 1}`,
        description: i === 0 ? anime?.synopsis?.slice(0, 100) + "..." : `The story continues in episode ${i + 1}...`,
        aired: episodeDate.toISOString(),
        thumbnail: anime?.images?.webp?.large_image_url,
      };
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-sacred mb-4">Error Loading Anime</h1>
          <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const episodes = anime ? generateEpisodes(anime.episodes || 12) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* ============ SECTION 1: FULLSCREEN VIDEO PLAYER ============ */}
      <section 
        ref={playerRef}
        className={cn(
          "relative bg-black transition-all duration-300 flex flex-col",
          isFullscreen ? "fixed inset-0 z-50" : "h-screen"
        )}
      >
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <>
            {/* Top Header Bar - Fixed, always accessible */}
            <div className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              {/* Left - Bibue Logo */}
              <Link
                to="/anime"
                className="pointer-events-auto text-xl sm:text-2xl font-sacred font-semibold text-white hover:text-primary transition-colors"
              >
                Bibue
              </Link>

              {/* Right - Controls */}
              <div className={cn(
                "pointer-events-auto flex items-center gap-2 transition-all duration-300",
                showControls ? "opacity-100" : "opacity-0"
              )}>
                <ResolutionSelector value={resolution} onChange={setResolution} />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBookmarkToggle}
                  disabled={watchlistLoading}
                  className={cn(
                    "h-9 w-9 hover:bg-white/10 rounded-full transition-all",
                    isBookmarked ? "text-primary" : "text-white/70 hover:text-white"
                  )}
                >
                  <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleFavoriteToggle}
                  className={cn(
                    "h-9 w-9 hover:bg-white/10 rounded-full transition-all",
                    isFavorite ? "text-destructive" : "text-white/70 hover:text-white"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                </Button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/70 hover:text-white"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Video Player Area - Takes remaining space */}
            <div className="flex-1 relative">
              {anime?.trailer?.youtube_id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=0&rel=0&modestbranding=1&iv_load_policy=3`}
                  title={`${anime.title} - Episode ${selectedEpisode}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/80 to-background">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center mb-4 mx-auto">
                      <Play className="w-8 h-8 text-foreground" />
                    </div>
                    <h2 className="text-xl font-sacred font-bold mb-1">{anime?.title}</h2>
                    <p className="text-muted-foreground text-sm">Episode {selectedEpisode}</p>
                    <p className="text-xs text-muted-foreground mt-2">Video player coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom - Collapsible Episode List */}
            <div className="relative z-[90]">
              <CollapsibleEpisodeList
                episodes={episodes}
                selectedEpisode={selectedEpisode}
                onSelectEpisode={setSelectedEpisode}
                animeTitle={anime?.title}
                totalEpisodes={anime?.episodes || episodes.length}
              />
            </div>
          </>
        )}
      </section>

      {/* ============ SECTION 2: SYNOPSIS, GENRES, STUDIO, INFO ============ */}
      <section className="py-12 sm:py-16 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="liquid-glass rounded-2xl p-5 sm:p-8">
              {/* Header with poster */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden">
                    <img
                      src={anime?.images.webp.large_image_url}
                      alt={anime?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Title and quick stats */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold font-sacred mb-2">{anime?.title}</h2>
                  <p className="font-jp text-sm text-muted-foreground mb-4">{anime?.title_japanese}</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                    {anime?.score && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 text-sm">
                        <Star className="w-4 h-4 fill-foreground text-foreground" />
                        <span className="font-bold">{formatScore(anime.score)}</span>
                      </div>
                    )}
                    {anime?.episodes && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{anime.episodes} Episodes</span>
                      </div>
                    )}
                    {anime?.rank && (
                      <div className="px-3 py-1.5 rounded-full bg-foreground/10 text-sm font-bold">
                        #{anime.rank} Ranked
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Synopsis */}
              <div className="mb-6">
                <h3 className="text-lg font-bold font-sacred mb-3">Synopsis</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {anime?.synopsis || "No synopsis available."}
                </p>
              </div>

              {/* Genres */}
              {anime?.genres && anime.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold font-sacred mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre) => (
                      <Link
                        key={genre.mal_id}
                        to={`/anime?genre=${genre.mal_id}`}
                        className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/80 transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Studio */}
              {anime?.studios && anime.studios.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold font-sacred mb-3">Studios</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.studios.map((studio) => (
                      <span
                        key={studio.mal_id}
                        className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm"
                      >
                        {studio.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Information Grid */}
              <div>
                <h3 className="text-lg font-bold font-sacred mb-3">Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Source", value: anime?.source },
                    { label: "Episodes", value: anime?.episodes },
                    { label: "Status", value: anime?.status },
                    { label: "Aired", value: anime?.aired?.string },
                    { label: "Rating", value: anime?.rating },
                    { label: "Rank", value: anime?.rank ? `#${anime.rank}` : undefined },
                    { label: "Popularity", value: anime?.popularity ? `#${anime.popularity}` : undefined },
                    { label: "Duration", value: anime?.duration },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-muted-foreground text-xs mb-0.5">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 3: COMMENTS ============ */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <h2 className="text-xl sm:text-2xl font-bold font-sacred">Comment Section</h2>
                {comments && (
                  <span className="text-sm text-muted-foreground">({comments.length})</span>
                )}
              </div>
              
              {/* Sort Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant={sortBy === "latest" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("latest")}
                  className="gap-1.5 text-xs"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Latest
                </Button>
                <Button
                  variant={sortBy === "likes" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy("likes")}
                  className="gap-1.5 text-xs"
                >
                  <ThumbsUp className="w-3 h-3" />
                  Top
                </Button>
              </div>
            </div>
            
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Share your thoughts on this episode..." : "Sign in to comment..."}
                  className="mb-3 liquid-glass-subtle border-foreground/10 resize-none"
                  rows={3}
                  disabled={!user}
                />
                <Button 
                  type="submit" 
                  disabled={!user || !newComment.trim() || addCommentMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  {user ? "Post Comment" : "Sign in to Comment"}
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading comments...
                  </div>
                ) : comments && comments.length > 0 ? (
                  comments.map((comment) => {
                    const hasLiked = userLikes?.includes(comment.id);
                    return (
                      <div 
                        key={comment.id} 
                        className="liquid-glass-subtle rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {(comment.profiles as any)?.username || "Anonymous"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {comment.content}
                            </p>
                            
                            {/* Like button */}
                            <button
                              onClick={() => likeMutation.mutate(comment.id)}
                              disabled={!user || likeMutation.isPending}
                              className={cn(
                                "flex items-center gap-1.5 text-xs transition-colors",
                                hasLiked 
                                  ? "text-primary" 
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <ThumbsUp className={cn("w-3.5 h-3.5", hasLiked && "fill-current")} />
                              <span>{comment.likes || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
