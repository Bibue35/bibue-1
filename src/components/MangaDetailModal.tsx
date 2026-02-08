import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, X, Star, Copy, Share2, MessageCircle, Send, User, ArrowUpDown, ThumbsUp, History, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";
import { WatchlistButton } from "./WatchlistButton";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { MangaReader } from "./MangaReader";
import { RelatedMedia } from "./RelatedMedia";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "./ResponsiveModal";

interface MangaDetailModalProps {
  mangaId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MangaDetailModal({ mangaId, open, onOpenChange }: MangaDetailModalProps) {
  const { data: manga, isLoading } = useMangaDetails(mangaId, open);
  const [activeTab, setActiveTab] = useState("chapters");
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [readingChapter, setReadingChapter] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastChapterRead } = useReadingProgress(mangaId, "manga");

  // Generate ALL chapter data - no limits
  const generateChapters = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      number: count - i,
      title: `Chapter ${count - i}`,
      released: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    }));
  };

  const chapters = manga ? generateChapters(manga.chapters || 50) : [];
  const totalChapters = chapters.length;
  const firstChapter = chapters[chapters.length - 1]?.number || 1;
  const lastChapter = chapters[0]?.number || totalChapters;

  // Comments query - general comments for the manga
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["manga-comments", mangaId, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("manga_id", mangaId)
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
        .insert({
          user_id: user.id,
          manga_id: mangaId,
          category: "general",
          title: `Comment on ${manga?.title}`,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["manga-comments", mangaId, sortBy] });
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

  const handleRead = (chapterNumber: number) => {
    setReadingChapter(chapterNumber);
  };

  const handleCloseReader = () => {
    setReadingChapter(null);
  };

  const handleNavigateAway = () => {
    setReadingChapter(null);
    onOpenChange(false);
  };

  // If reading, show the reader
  if (readingChapter !== null && manga) {
    return (
      <MangaReader
        mangaId={mangaId}
        mangaTitle={manga.title}
        mangaImageUrl={manga.images?.webp?.large_image_url}
        selectedChapter={readingChapter}
        totalChapters={totalChapters}
        firstChapter={firstChapter}
        lastChapter={lastChapter}
        onChapterChange={setReadingChapter}
        onClose={handleCloseReader}
        onNavigate={handleNavigateAway}
      />
    );
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={manga?.title || "Manga Details"}
    >
          {/* Hero Image Section - taller on mobile for Netflix feel */}
          <div className="relative h-[65vh] xs:h-[55vh] sm:h-80 overflow-hidden">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <img
                  src={manga?.images?.webp?.large_image_url}
                  alt={manga?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <h1 className="text-2xl xs:text-2xl sm:text-3xl md:text-4xl font-bold font-sacred text-foreground mb-0.5 sm:mb-1 line-clamp-2">
                    {manga?.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground font-jp mb-2 sm:mb-3 line-clamp-1">
                    {manga?.title_japanese}
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    {manga?.score && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-foreground text-foreground" />
                        {formatScore(manga.score)}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(manga?.published?.from || "").getFullYear()}</span>
                    {manga?.status && (
                      <>
                        <span className="hidden xs:inline">•</span>
                        <span className="hidden xs:inline">{manga.status}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Close / Back button - Netflix-style */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors sm:left-auto sm:right-4"
            >
              <ChevronDown className="w-5 h-5 sm:hidden" />
              <X className="w-5 h-5 hidden sm:block" />
            </button>
          </div>

          {/* Action buttons - Stacked on very small screens */}
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col xs:flex-row items-stretch xs:items-center justify-between border-b border-border/30 gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <Button 
                variant="default" 
                size="sm"
                className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-4 flex-1 xs:flex-none"
                onClick={() => handleRead(firstChapter)}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Read First</span>
                <span className="xs:hidden">Start</span>
              </Button>
              {lastChapterRead && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-4 flex-1 xs:flex-none"
                  onClick={() => handleRead(lastChapterRead)}
                >
                  <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Continue Ch. {lastChapterRead}</span>
                  <span className="sm:hidden">Ch. {lastChapterRead}</span>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hidden xs:flex"
                onClick={() => {
                  const url = `${window.location.origin}/manga/${mangaId}`;
                  navigator.clipboard.writeText(url);
                  toast({ title: "Link copied!", description: "Manga link copied to clipboard" });
                }}
              >
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hidden xs:flex"
                onClick={async () => {
                  const url = `${window.location.origin}/manga/${mangaId}`;
                  const shareData = {
                    title: manga?.title || "Check out this manga",
                    text: manga?.synopsis?.slice(0, 100) + "..." || "Check out this manga on Bibue!",
                    url: url,
                  };
                  
                  if (navigator.share && navigator.canShare?.(shareData)) {
                    try {
                      await navigator.share(shareData);
                    } catch (err) {
                      if ((err as Error).name !== 'AbortError') {
                        navigator.clipboard.writeText(url);
                        toast({ title: "Link copied!", description: "Manga link copied to clipboard" });
                      }
                    }
                  } else {
                    navigator.clipboard.writeText(url);
                    toast({ title: "Link copied!", description: "Manga link copied to clipboard" });
                  }
                }}
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
            <WatchlistButton
              mal_id={mangaId}
              media_type="manga"
              title={manga?.title || ""}
              title_japanese={manga?.title_japanese}
              image_url={manga?.images?.webp?.large_image_url}
              score={manga?.score}
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
                {manga?.synopsis || "No synopsis available."}
              </p>
            )}

            {/* Genres */}
            {manga?.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {manga.genres.slice(0, 5).map((genre) => (
                  <Link
                    key={genre.mal_id}
                    to={`/manga?genre=${genre.mal_id}`}
                    onClick={() => onOpenChange(false)}
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-muted text-muted-foreground text-xs sm:text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Related Media - Watch the Anime */}
            <div className="mt-4 sm:mt-6">
              <RelatedMedia 
                mediaId={mangaId} 
                mediaType="manga" 
                onNavigate={() => onOpenChange(false)} 
              />
            </div>
          </div>
          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-3 sm:mb-4">
                <TabsTrigger value="chapters" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Chapters</span>
                  <span className="xs:hidden">Chs</span>
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Comments</span>
                  <span className="xs:hidden">Chat</span>
                </TabsTrigger>
              </TabsList>

              {/* Chapters Tab */}
              <TabsContent value="chapters">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-lg font-bold font-sacred">
                    {chapters.length} CHAPTERS
                  </h2>
                  {lastChapterRead && (
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Last: Ch. {lastChapterRead}
                    </span>
                  )}
                </div>

                {/* Chapter List - Full scrollable list */}
                <ScrollArea className="h-[300px] sm:h-[400px]">
                  <div className="space-y-0.5 sm:space-y-1 pr-4">
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 sm:h-12 w-full" />
                      ))
                    ) : (
                      chapters.map((ch) => {
                        const isLastRead = lastChapterRead === ch.number;
                        return (
                          <button
                            key={ch.number}
                            onClick={() => handleRead(ch.number)}
                            className={cn(
                              "w-full flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-left transition-all hover:bg-primary/10",
                              isLastRead && "bg-primary/20 border border-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                              <span className={cn(
                                "font-medium text-xs sm:text-sm",
                                isLastRead ? "text-primary" : "text-foreground"
                              )}>
                                Ch. {ch.number}
                              </span>
                              {isLastRead && (
                                <span className="text-[10px] sm:text-xs bg-primary/20 text-primary px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Last
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] sm:text-sm text-muted-foreground flex-shrink-0">
                              {new Date(ch.released).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-lg font-bold font-sacred">COMMENTS</h2>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Button
                      variant={sortBy === "latest" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy("latest")}
                      className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-2.5"
                    >
                      <ArrowUpDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      New
                    </Button>
                    <Button
                      variant={sortBy === "likes" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy("likes")}
                      className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-2.5"
                    >
                      <ThumbsUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Top
                    </Button>
                  </div>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleSubmit} className="mb-4 sm:mb-6">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Share your thoughts..." : "Sign in to comment..."}
                    className="mb-2 sm:mb-3 resize-none text-xs sm:text-sm"
                    rows={2}
                    disabled={!user}
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={!user || !newComment.trim() || addCommentMutation.isPending}
                    className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {user ? "Post" : "Sign in"}
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
                            <p className="text-sm text-muted-foreground">
                              {comment.content}
                            </p>
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
    </ResponsiveModal>
  );
}
