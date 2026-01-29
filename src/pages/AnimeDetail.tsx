import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Star, Clock, Heart, Bookmark, MessageCircle, Send, User, Maximize2, Minimize2, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: anime, isLoading, error } = useAnimeDetails(Number(id));
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [episodePage, setEpisodePage] = useState(0);
  const queryClient = useQueryClient();
  const episodesPerPage = 4;

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

  // Comments query
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["episode-comments", Number(id), selectedEpisode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_comments")
        .select("*")
        .eq("anime_id", Number(id))
        .eq("episode_number", selectedEpisode)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
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
      queryClient.invalidateQueries({ queryKey: ["episode-comments", Number(id), selectedEpisode] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
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
  const totalPages = Math.ceil(episodes.length / episodesPerPage);
  const visibleEpisodes = episodes.slice(episodePage * episodesPerPage, (episodePage + 1) * episodesPerPage);

  return (
    <div className="min-h-screen bg-background">
      {/* ============ SECTION 1: FULLSCREEN VIDEO PLAYER ============ */}
      <section className={cn(
        "relative bg-black transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50" : "h-screen"
      )}>
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <>
            {/* Bibue Logo - Click to exit */}
            <Link
              to="/"
              className={cn(
                "absolute top-4 left-4 z-50 transition-all duration-500",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <span className="text-2xl font-sacred font-semibold text-white drop-shadow-lg hover:text-primary transition-colors">
                Bibue
              </span>
            </Link>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={cn(
                "absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all duration-500",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Video Player */}
            <div className="w-full h-full">
              {anime?.trailer?.youtube_id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=0&rel=0&modestbranding=1&iv_load_policy=3`}
                  title={`${anime.title} - Episode ${selectedEpisode}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-background/80 to-background">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center mb-6 mx-auto">
                      <Play className="w-10 h-10 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-sacred font-bold mb-2">{anime?.title}</h2>
                    <p className="text-muted-foreground">Episode {selectedEpisode}</p>
                    <p className="text-sm text-muted-foreground mt-4">Video player coming soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Episode Bar */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent transition-all duration-500",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              {/* Episode title bar */}
              <div className="px-4 sm:px-6 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">E{selectedEpisode}</span>
                    <h2 className="text-white font-medium">{anime?.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
                      <Bookmark className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Episodes row */}
              <div className="px-4 sm:px-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">EPISODES</span>
                    <button className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-xs">{episodePage * episodesPerPage + 1}-{Math.min((episodePage + 1) * episodesPerPage, episodes.length)}</span>
                    <button 
                      onClick={() => setEpisodePage(prev => Math.max(0, prev - 1))}
                      disabled={episodePage === 0}
                      className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEpisodePage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={episodePage >= totalPages - 1}
                      className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Episode cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {visibleEpisodes.map((ep) => (
                    <button
                      key={ep.number}
                      onClick={() => setSelectedEpisode(ep.number)}
                      className={cn(
                        "relative group text-left rounded-lg overflow-hidden transition-all",
                        selectedEpisode === ep.number 
                          ? "ring-2 ring-primary" 
                          : "hover:ring-1 hover:ring-white/30"
                      )}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video relative">
                        <img
                          src={ep.thumbnail}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Episode number badge */}
                        <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs text-white font-medium">
                          E{ep.number}
                        </div>
                        {/* Watched indicator */}
                        {ep.number < selectedEpisode && (
                          <div className="absolute top-2 left-2 p-1 rounded-full bg-black/70">
                            <Eye className="w-3 h-3 text-white/70" />
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-2 bg-black/60">
                        <p className="text-white text-xs font-medium line-clamp-1">
                          {ep.number}. {ep.title}
                        </p>
                        <p className="text-white/50 text-xs line-clamp-2 mt-0.5">
                          {ep.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">Episode {selectedEpisode} Discussion</h2>
              {comments && (
                <span className="text-sm text-muted-foreground">({comments.length})</span>
              )}
            </div>
            
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this episode... (Sign in to comment)"
                  className="mb-3 liquid-glass-subtle border-foreground/10 resize-none"
                  rows={3}
                />
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading comments...
                  </div>
                ) : comments && comments.length > 0 ? (
                  comments.map((comment) => (
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
                            <span className="font-medium text-sm">User</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
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
