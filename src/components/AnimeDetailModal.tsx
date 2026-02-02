import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Play, X, Star, Copy, Share2, Eye, Search, ChevronLeft, ChevronRight, MessageCircle, Send, User, ThumbsUp, ArrowUpDown, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnimeDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";
import { WatchlistButton } from "./WatchlistButton";
import { CharactersStaffTab } from "./CharactersStaffTab";
import { MarkdownContent } from "./MarkdownContent";
import { RelatedMedia } from "./RelatedMedia";

interface AnimeDetailModalProps {
  animeId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnimeDetailModal({ animeId, open, onOpenChange }: AnimeDetailModalProps) {
  const navigate = useNavigate();
  const { data: anime, isLoading } = useAnimeDetails(animeId, open);
  const [episodeRange, setEpisodeRange] = useState(0);
  const [activeTab, setActiveTab] = useState("episodes");
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

  // Comments query - general comments for the anime
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["anime-comments", animeId, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("anime_id", animeId)
        .eq("category", "general")
        .order(sortBy === "likes" ? "created_at" : "created_at", { ascending: false });
      
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
        .insert({
          user_id: user.id,
          anime_id: animeId,
          category: "general",
          title: `Comment on ${anime?.title}`,
          content,
        });
      
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
    const trimmedComment = newComment.trim();
    const validation = validateComment(trimmedComment);
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error, variant: "destructive" });
      return;
    }
    addCommentMutation.mutate(trimmedComment);
  };

  const handlePlay = (episodeNumber?: number) => {
    onOpenChange(false);
    navigate(`/anime/${animeId}`, { state: { episode: episodeNumber || 1 } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="max-w-5xl w-[98vw] sm:w-[95vw] max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden rounded-xl sm:rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>{anime?.title || "Anime Details"}</DialogTitle>
        </VisuallyHidden>
        
        <ScrollArea className="max-h-[95vh] sm:max-h-[90vh]">
          {/* Hero Image Section */}
          <div className="relative h-48 xs:h-56 sm:h-80 overflow-hidden">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <img
                  src={anime?.images?.webp?.large_image_url}
                  alt={anime?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold font-sacred text-foreground mb-0.5 sm:mb-1 line-clamp-2">
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

            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-border/30 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button 
                variant="default" 
                size="sm"
                className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4"
                onClick={() => handlePlay(1)}
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                <span className="hidden xs:inline">PLAY</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9">
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9">
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
            <WatchlistButton
              mal_id={animeId}
              media_type="anime"
              title={anime?.title || ""}
              title_japanese={anime?.title_japanese}
              image_url={anime?.images?.webp?.large_image_url}
              score={anime?.score}
              variant="full"
            />
          </div>

          {/* Synopsis */}
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
            <h2 className="text-base sm:text-lg font-bold font-sacred mb-2 sm:mb-3">SYNOPSIS</h2>
            {isLoading ? (
              <>
                <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                <Skeleton className="h-3 sm:h-4 w-3/4" />
              </>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-4 sm:line-clamp-none">
                {anime?.synopsis || "No synopsis available."}
              </p>
            )}

            {/* Genres */}
            {anime?.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {anime.genres.slice(0, 5).map((genre) => (
                  <Link
                    key={genre.mal_id}
                    to={`/anime?genre=${genre.mal_id}`}
                    onClick={() => onOpenChange(false)}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-muted text-muted-foreground text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Related Media - Read the Manga */}
            <div className="mt-4 sm:mt-6">
              <RelatedMedia 
                mediaId={animeId} 
                mediaType="anime" 
                onNavigate={() => onOpenChange(false)} 
              />
            </div>
          </div>

          {/* Tabs for Episodes, Characters and Comments */}
          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-3 sm:mb-4 w-full justify-start overflow-x-auto">
                <TabsTrigger value="episodes" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Episodes</span>
                  <span className="xs:hidden">Eps</span>
                </TabsTrigger>
                <TabsTrigger value="characters" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Characters</span>
                  <span className="xs:hidden">Cast</span>
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Comments</span>
                  <span className="xs:hidden">Chat</span>
                </TabsTrigger>
              </TabsList>

              {/* Episodes Tab */}
              <TabsContent value="episodes">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h2 className="text-sm sm:text-lg font-bold font-sacred">EPISODES</h2>
                    <button className="p-1 sm:p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {episodeRange * episodesPerPage + 1}-{Math.min((episodeRange + 1) * episodesPerPage, episodes.length)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      disabled={episodeRange === 0}
                      onClick={() => setEpisodeRange(prev => prev - 1)}
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                      disabled={episodeRange >= totalPages - 1}
                      onClick={() => setEpisodeRange(prev => prev + 1)}
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

                {/* Episode Grid - 2 columns on mobile, 4 on larger */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i}>
                        <Skeleton className="aspect-video rounded-lg mb-1.5 sm:mb-2" />
                        <Skeleton className="h-3 sm:h-4 w-3/4 mb-1" />
                        <Skeleton className="h-2.5 sm:h-3 w-full" />
                      </div>
                    ))
                  ) : (
                    displayedEpisodes.map((ep) => (
                      <button
                        key={ep.number}
                        onClick={() => handlePlay(ep.number)}
                        className="text-left group"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-1.5 sm:mb-2">
                          <img
                            src={ep.thumbnail}
                            alt={ep.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {/* Episode number badge */}
                          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-background/80 text-foreground text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded">
                            E{ep.number}
                          </div>
                          {/* Watched indicator (mock - first episode) */}
                          {ep.number === 1 && (
                            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 p-0.5 sm:p-1 rounded-full bg-primary/80">
                              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                            </div>
                          )}
                          {/* Play overlay on hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white" />
                            </div>
                          </div>
                        </div>
                        <h3 className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {ep.number}. {ep.title}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                          {ep.description}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Characters & Staff Tab */}
              <TabsContent value="characters">
                <CharactersStaffTab mediaId={animeId} mediaType="anime" />
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-sacred">COMMENT SECTION</h2>
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

                {/* Comment Form */}
                <form onSubmit={handleSubmit} className="mb-6">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Share your thoughts..." : "Sign in to comment..."}
                    className="mb-3 resize-none"
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
                    comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className="rounded-xl p-4 bg-muted/50"
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
                            <MarkdownContent 
                              content={comment.content} 
                              className="text-sm text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
