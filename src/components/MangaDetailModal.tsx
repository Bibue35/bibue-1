import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, X, Star, Copy, Share2, MessageCircle, Send, User, ArrowUpDown, ThumbsUp, History, ChevronDown, Loader2 } from "lucide-react";
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
import { useMangaDexSearch, useMangaDexChapters, findBestMatch, type MangaDexChapter } from "@/hooks/useMangaDex";

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
  const [readingChapterId, setReadingChapterId] = useState<string | null>(null);
  const [chapterOffset, setChapterOffset] = useState(0);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastChapterRead } = useReadingProgress(mangaId, "manga");

  // MangaDex integration: search for matching manga
  const searchTitle = manga?.title_english || manga?.title_romaji || manga?.title;
  const { data: searchResults, isLoading: searchLoading } = useMangaDexSearch(searchTitle, open && !!manga);
  
  const mangadexMatch = useMemo(() => {
    if (!searchResults || !manga) return null;
    return findBestMatch(searchResults, manga.title);
  }, [searchResults, manga]);

  // Fetch MangaDex chapters
  const { data: mangadexData, isLoading: chaptersLoading } = useMangaDexChapters(
    mangadexMatch?.id, chapterOffset, 100, !!mangadexMatch
  );

  const chapters = mangadexData?.chapters || [];
  const totalChapters = mangadexData?.total || 0;

  // Find chapter to read
  const readingChapter = useMemo(() => {
    if (!readingChapterId) return null;
    return chapters.find(ch => ch.id === readingChapterId) || null;
  }, [readingChapterId, chapters]);

  // Comments query
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["manga-comments", mangaId, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`*, profiles:user_id (username, avatar_url)`)
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

  const handleRead = (chapterId: string) => {
    setReadingChapterId(chapterId);
  };

  const handleCloseReader = () => {
    setReadingChapterId(null);
  };

  const handleNavigateAway = () => {
    setReadingChapterId(null);
    onOpenChange(false);
  };

  // Navigate chapters in reader
  const handleChapterChange = (chapterId: string) => {
    setReadingChapterId(chapterId);
  };

  // If reading, show the reader
  if (readingChapter && manga) {
    return (
      <MangaReader
        mangaId={mangaId}
        mangaTitle={manga.title}
        mangaImageUrl={manga.images?.webp?.large_image_url}
        chapterId={readingChapter.id}
        chapterNumber={readingChapter.chapter || '?'}
        chapters={chapters}
        onChapterChange={handleChapterChange}
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
          {/* Hero Image Section */}
          <div className="relative h-[65vh] xs:h-[55vh] sm:h-80 overflow-hidden">
            {isLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <>
                <img
                  src={manga?.images?.webp?.large_image_url}
                  alt={manga?.title}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
                
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

            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-colors sm:left-auto sm:right-4"
            >
              <ChevronDown className="w-5 h-5 sm:hidden" />
              <X className="w-5 h-5 hidden sm:block" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-col xs:flex-row items-stretch xs:items-center justify-between border-b border-border/30 gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {chapters.length > 0 && (
                <Button 
                  variant="default" 
                  size="sm"
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-4 flex-1 xs:flex-none"
                  onClick={() => handleRead(chapters[chapters.length - 1].id)}
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Read First</span>
                  <span className="xs:hidden">Start</span>
                </Button>
              )}
              {lastChapterRead && chapters.length > 0 && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-4 flex-1 xs:flex-none"
                  onClick={() => {
                    // Find closest chapter to lastChapterRead
                    const match = chapters.find(ch => ch.chapter === String(lastChapterRead));
                    if (match) handleRead(match.id);
                    else if (chapters[0]) handleRead(chapters[0].id);
                  }}
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
                    url,
                  };
                  if (navigator.share && navigator.canShare?.(shareData)) {
                    try { await navigator.share(shareData); } catch {}
                  } else {
                    navigator.clipboard.writeText(url);
                    toast({ title: "Link copied!" });
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

              {/* Chapters Tab - MangaDex powered */}
              <TabsContent value="chapters">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-sm sm:text-lg font-bold font-sacred">
                    {chaptersLoading ? "LOADING..." : `${chapters.length} CHAPTERS`}
                  </h2>
                  {lastChapterRead && (
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Last: Ch. {lastChapterRead}
                    </span>
                  )}
                </div>

                {/* MangaDex Attribution */}
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/30">
                  <img 
                    src="https://mangadex.org/img/brand/mangadex-logo.svg" 
                    alt="MangaDex" 
                    className="h-4 sm:h-5 opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    Chapters provided by <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">MangaDex</a>
                  </span>
                </div>

                {(searchLoading || chaptersLoading) ? (
                  <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Finding chapters...</span>
                  </div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-8 px-4 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium text-foreground/80">No readable chapters available</p>
                    <p className="text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
                      This title is likely <span className="text-primary font-medium">officially licensed</span>, so fan-translated chapters aren't hosted on MangaDex.
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">Read officially on</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {(manga?.type === 'Manhwa' || manga?.type === 'Manhua') ? (
                          <>
                            <a href="https://www.webtoons.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">WEBTOON</a>
                            <a href="https://www.tappytoon.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Tappytoon</a>
                          </>
                        ) : (
                          <>
                            <a href="https://mangaplus.shueisha.co.jp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">MANGA Plus</a>
                            <a href="https://www.viz.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">VIZ</a>
                          </>
                        )}
                        {mangadexMatch && (
                          <a href={`https://mangadex.org/title/${mangadexMatch.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">MangaDex</a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[300px] sm:h-[400px]">
                      <div className="space-y-0.5 sm:space-y-1 pr-4">
                        {chapters.map((ch) => {
                          const chNum = ch.chapter ? parseFloat(ch.chapter) : 0;
                          const isLastRead = lastChapterRead === Math.floor(chNum);
                          return (
                            <button
                              key={ch.id}
                              onClick={() => handleRead(ch.id)}
                              className={cn(
                                "w-full flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-left transition-all hover:bg-primary/10",
                                isLastRead && "bg-primary/20 border border-primary/30"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <span className={cn(
                                    "font-medium text-xs sm:text-sm",
                                    isLastRead ? "text-primary" : "text-foreground"
                                  )}>
                                    Ch. {ch.chapter}
                                  </span>
                                  {isLastRead && (
                                    <span className="text-[10px] sm:text-xs bg-primary/20 text-primary px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                                      Last
                                    </span>
                                  )}
                                  {ch.title && (
                                    <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                                      — {ch.title}
                                    </span>
                                  )}
                                </div>
                                {ch.scanlationGroup && (
                                  <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 block mt-0.5">
                                    {ch.scanlationGroup}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {ch.pages > 0 && (
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">{ch.pages}p</span>
                                )}
                                <span className="text-[10px] sm:text-sm text-muted-foreground">
                                  {new Date(ch.readableAt || ch.publishAt).toLocaleDateString('en-US', { 
                                    month: 'short', day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {/* Load more */}
                    {totalChapters > chapters.length && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs"
                        onClick={() => setChapterOffset(prev => prev + 100)}
                      >
                        Load more chapters...
                      </Button>
                    )}
                  </>
                )}
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

                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading comments...
                    </div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl p-4 bg-muted/50">
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
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
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
