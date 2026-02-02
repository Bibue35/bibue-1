import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, X, Star, Copy, Share2, MessageCircle, Send, User, ArrowUpDown, ThumbsUp, History } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";
import { WatchlistButton } from "./WatchlistButton";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { MangaReader } from "./MangaReader";
import { cn } from "@/lib/utils";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButton className="max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{manga?.title || "Manga Details"}</DialogTitle>
        </VisuallyHidden>
        
        <ScrollArea className="max-h-[90vh]">
          {/* Hero Image Section */}
          <div className="relative h-64 sm:h-80 overflow-hidden">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <img
                  src={manga?.images?.webp?.large_image_url}
                  alt={manga?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h1 className="text-2xl sm:text-4xl font-bold font-sacred text-foreground mb-1">
                    {manga?.title}
                  </h1>
                  <p className="text-sm text-muted-foreground font-jp mb-3">
                    {manga?.title_japanese}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {manga?.score && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-foreground text-foreground" />
                        {formatScore(manga.score)}
                        {manga.scored_by && (
                          <span className="text-muted-foreground">
                            ({(manga.scored_by / 1000).toFixed(0)}k)
                          </span>
                        )}
                      </span>
                    )}
                    <span>•</span>
                    <span>{new Date(manga?.published?.from || "").getFullYear()}</span>
                    {manga?.status && (
                      <>
                        <span>•</span>
                        <span>{manga.status}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="px-6 sm:px-8 py-4 flex items-center justify-between border-b border-border/30">
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                className="gap-2"
                onClick={() => handleRead(firstChapter)}
              >
                <BookOpen className="w-4 h-4" />
                Read First
              </Button>
              {lastChapterRead && (
                <Button 
                  variant="secondary" 
                  className="gap-2"
                  onClick={() => handleRead(lastChapterRead)}
                >
                  <History className="w-4 h-4" />
                  Continue Ch. {lastChapterRead}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="rounded-full">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="w-4 h-4" />
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
          <div className="px-6 sm:px-8 py-6">
            <h2 className="text-lg font-bold font-sacred mb-3">SYNOPSIS</h2>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {manga?.synopsis || "No synopsis available."}
              </p>
            )}

            {/* Genres */}
            {manga?.genres && manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {manga.genres.map((genre) => (
                  <Link
                    key={genre.mal_id}
                    to={`/manga?genre=${genre.mal_id}`}
                    onClick={() => onOpenChange(false)}
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tabs for Chapters and Comments */}
          <div className="px-6 sm:px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="chapters" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Chapters
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Comment Section
                </TabsTrigger>
              </TabsList>

              {/* Chapters Tab */}
              <TabsContent value="chapters">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold font-sacred">
                    {chapters.length} CHAPTERS AVAILABLE
                  </h2>
                  {lastChapterRead && (
                    <span className="text-sm text-muted-foreground">
                      Last read: Ch. {lastChapterRead}
                    </span>
                  )}
                </div>

                {/* Chapter List - Full scrollable list, no pagination */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1 pr-4">
                    {isLoading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))
                    ) : (
                      chapters.map((ch) => {
                        const isLastRead = lastChapterRead === ch.number;
                        return (
                          <button
                            key={ch.number}
                            onClick={() => handleRead(ch.number)}
                            className={cn(
                              "w-full flex items-center justify-between py-3 px-4 rounded-lg text-left transition-all hover:bg-primary/10",
                              isLastRead && "bg-primary/20 border border-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-medium",
                                isLastRead ? "text-primary" : "text-foreground"
                              )}>
                                Chapter {ch.number}
                              </span>
                              {isLastRead && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  Last Read
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(ch.released).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
