import { useState, useMemo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { BookOpen, X, Star, Copy, Share2, MessageCircle, Send, User, ArrowUpDown, ThumbsUp, History, ChevronDown, Loader2, ExternalLink, Heart, Trophy, Users, Calendar, Globe, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  const [activeTab, setActiveTab] = useState<"chapters" | "comments" | "similar">("chapters");
  const [newComment, setNewComment] = useState("");
  const [commentSort, setCommentSort] = useState<"latest" | "likes">("latest");
  const [readingChapterId, setReadingChapterId] = useState<string | null>(null);
  const [chapterOffset, setChapterOffset] = useState(0);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastChapterRead } = useReadingProgress(mangaId, "manga");

  // MangaDex integration
  const searchTitle = manga?.title_english || manga?.title_romaji || manga?.title;
  const { data: searchResults, isLoading: searchLoading } = useMangaDexSearch(searchTitle, open && !!manga);

  const mangadexMatch = useMemo(() => {
    if (!searchResults || !manga) return null;
    return findBestMatch(searchResults, manga.title);
  }, [searchResults, manga]);

  const { data: mangadexData, isLoading: chaptersLoading } = useMangaDexChapters(
    mangadexMatch?.id, chapterOffset, 100, !!mangadexMatch
  );

  const chapters = mangadexData?.chapters || [];
  const totalChapters = mangadexData?.total || 0;

  const readingChapter = useMemo(() => {
    if (!readingChapterId) return null;
    return chapters.find(ch => ch.id === readingChapterId) || null;
  }, [readingChapterId, chapters]);

  // Comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["manga-comments", mangaId, commentSort],
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
      queryClient.invalidateQueries({ queryKey: ["manga-comments", mangaId, commentSort] });
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

  const handleRead = (chapterId: string) => setReadingChapterId(chapterId);
  const handleCloseReader = () => setReadingChapterId(null);
  const handleNavigateAway = () => { setReadingChapterId(null); onOpenChange(false); };
  const handleChapterChange = (chapterId: string) => setReadingChapterId(chapterId);

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

  const statusLabel = manga?.status === "Finished" ? "COMPLETED" : manga?.status === "Publishing" ? "ONGOING" : manga?.status;
  const statusColor = manga?.status === "Finished" ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary";

  const tabs = [
    { id: "chapters" as const, label: "Chapters", count: chapters.length || undefined },
    { id: "comments" as const, label: "Comments", count: comments?.length },
    { id: "similar" as const, label: "Similar" },
  ];

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={manga?.title || "Manga Details"}
    >
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <img
              src={manga?.images?.webp?.large_image_url}
              alt={manga?.title}
              className="w-full h-full object-cover object-top blur-sm scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          </>
        )}

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster + Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-10 pb-0">
          <div className="flex items-end gap-4 sm:gap-6">
            {/* Poster */}
            <div className="w-28 h-40 sm:w-44 sm:h-64 rounded-2xl overflow-hidden border-2 border-border/30 shadow-2xl flex-shrink-0 -mb-10 sm:-mb-12 bg-muted">
              {manga?.images?.webp?.large_image_url && (
                <img
                  src={manga.images.webp.large_image_url}
                  alt={manga.title}
                  className="w-full h-full object-cover object-top"
                />
              )}
            </div>

            {/* Title info */}
            <div className="pb-2 sm:pb-4 min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight text-foreground line-clamp-2">
                {manga?.title}
              </h1>
              {manga?.title_japanese && (
                <p className="text-sm sm:text-2xl text-muted-foreground font-jp mt-0.5 line-clamp-1">
                  {manga.title_japanese}
                </p>
              )}
              <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm flex-wrap">
                {manga?.score && (
                  <div className="flex items-center gap-1 bg-muted/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-foreground text-foreground" />
                    <span className="font-semibold">{formatScore(manga.score)}</span>
                  </div>
                )}
                <span className="text-muted-foreground">
                  {manga?.published?.from ? new Date(manga.published.from).getFullYear() : "—"}
                  {manga?.status === "Publishing" && " • Releasing"}
                </span>
                {statusLabel && (
                  <span className={cn("px-2.5 py-0.5 text-[10px] sm:text-xs font-medium rounded-full", statusColor)}>
                    {statusLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body: 12-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 sm:px-8 md:px-10 pt-14 sm:pt-16 pb-6 sm:pb-10">

        {/* Main Content — left 8 cols */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">

          {/* Synopsis */}
          <div>
            <h2 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-2 sm:mb-3 font-semibold">Synopsis</h2>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-sm sm:text-[15.5px] text-muted-foreground leading-relaxed">
                {manga?.synopsis || "No synopsis available."}
              </p>
            )}
          </div>

          {/* Genres */}
          {manga?.genres && manga.genres.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted text-muted-foreground text-xs sm:text-sm hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer">
                <span className="font-medium">Genres</span>
                <span className="text-muted-foreground/60">({manga.genres.length})</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((genre) => (
                    <Link
                      key={genre.mal_id}
                      to={`/manga?genre=${genre.mal_id}`}
                      onClick={() => onOpenChange(false)}
                      className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-muted text-muted-foreground text-xs sm:text-sm hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Tabs: Chapters / Comments / Similar */}
          <div>
            <div className="flex border-b border-border/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab.id
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({tab.count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Chapters Tab */}
            {activeTab === "chapters" && (
              <div className="mt-6 sm:mt-8">
                <div className="rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/30 p-4 sm:p-8">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-xl font-semibold">
                      {chaptersLoading ? "Loading..." : `All Chapters • ${chapters.length} released`}
                    </h3>
                    {lastChapterRead && (
                      <span className="text-primary text-xs sm:text-sm font-medium">
                        Last read: Ch. {lastChapterRead}
                      </span>
                    )}
                  </div>

                  {/* MangaDex Attribution */}
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-muted/50 border border-border/20">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Chapters provided by{" "}
                      <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                        MangaDex
                      </a>
                    </span>
                  </div>

                  {(searchLoading || chaptersLoading) ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Finding chapters...</span>
                    </div>
                  ) : chapters.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 text-muted-foreground">
                      <div className="text-5xl sm:text-6xl mb-4">📖</div>
                      <p className="text-base sm:text-lg font-medium text-foreground/80">No chapters available</p>
                      <p className="text-xs sm:text-sm mt-2 max-w-sm mx-auto">
                        This title is likely <span className="text-primary font-medium">officially licensed</span>. Try reading on an official platform.
                      </p>
                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {(manga?.type === 'Manhwa' || manga?.type === 'Manhua') ? (
                          <>
                            <a href="https://www.webtoons.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">WEBTOON</a>
                            <a href="https://www.tappytoon.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">Tappytoon</a>
                          </>
                        ) : (
                          <>
                            <a href="https://mangaplus.shueisha.co.jp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">MANGA Plus</a>
                            <a href="https://www.viz.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">VIZ</a>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-[300px] sm:h-[400px]">
                        <div className="space-y-0.5">
                          {chapters.map((ch) => {
                            const chNum = ch.chapter ? parseFloat(ch.chapter) : 0;
                            const isLastRead = lastChapterRead === Math.floor(chNum);
                            return (
                              <button
                                key={ch.id}
                                onClick={() => handleRead(ch.id)}
                                className={cn(
                                  "w-full flex items-center justify-between py-3 px-3 sm:px-4 rounded-xl text-left transition-all hover:bg-primary/10",
                                  isLastRead && "bg-primary/15 border border-primary/30"
                                )}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("font-medium text-xs sm:text-sm", isLastRead ? "text-primary" : "text-foreground")}>
                                      Ch. {ch.chapter}
                                    </span>
                                    {isLastRead && (
                                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Last</span>
                                    )}
                                    {ch.title && (
                                      <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[250px]">— {ch.title}</span>
                                    )}
                                  </div>
                                  {ch.scanlationGroup && (
                                    <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 block mt-0.5">{ch.scanlationGroup}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {ch.pages > 0 && <span className="text-[10px] sm:text-xs text-muted-foreground">{ch.pages}p</span>}
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    {new Date(ch.readableAt || ch.publishAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      {totalChapters > chapters.length && (
                        <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setChapterOffset(prev => prev + 100)}>
                          Load more chapters...
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Discussion</h3>
                  <div className="flex items-center gap-1">
                    <Button variant={commentSort === "latest" ? "secondary" : "ghost"} size="sm" onClick={() => setCommentSort("latest")} className="gap-1.5 text-xs h-8 px-2.5">
                      <ArrowUpDown className="w-3 h-3" /> New
                    </Button>
                    <Button variant={commentSort === "likes" ? "secondary" : "ghost"} size="sm" onClick={() => setCommentSort("likes")} className="gap-1.5 text-xs h-8 px-2.5">
                      <ThumbsUp className="w-3 h-3" /> Top
                    </Button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mb-6">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Share your thoughts…" : "Sign in to comment…"}
                    className="mb-3 resize-none text-sm border-border/30"
                    rows={3}
                    disabled={!user}
                  />
                  <Button type="submit" size="sm" disabled={!user || !newComment.trim() || addCommentMutation.isPending} className="gap-2">
                    <Send className="w-4 h-4" />
                    {user ? "Post Comment" : "Sign in to Comment"}
                  </Button>
                </form>

                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl p-4 bg-muted/30 border border-border/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
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
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No comments yet — be the first to discuss!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Similar Tab */}
            {activeTab === "similar" && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-base sm:text-lg font-semibold mb-6">You might also like</h3>
                <RelatedMedia mediaId={mangaId} mediaType="manga" onNavigate={() => onOpenChange(false)} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — right 4 cols */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-8 space-y-6">

            {/* CTA: Start / Continue Reading */}
            {chapters.length > 0 ? (
              <div className="space-y-2">
                <Button
                  variant="primary"
                  className="w-full py-5 text-base sm:text-lg rounded-2xl sm:rounded-3xl gap-2"
                  onClick={() => handleRead(chapters[chapters.length - 1].id)}
                >
                  <BookOpen className="w-5 h-5" />
                  Start Reading Ch. 1
                </Button>
                {lastChapterRead && (
                  <Button
                    variant="secondary"
                    className="w-full py-4 rounded-2xl gap-2"
                    onClick={() => {
                      const match = chapters.find(ch => ch.chapter === String(lastChapterRead));
                      if (match) handleRead(match.id);
                      else if (chapters[0]) handleRead(chapters[0].id);
                    }}
                  >
                    <History className="w-4 h-4" />
                    Continue Ch. {lastChapterRead}
                  </Button>
                )}
              </div>
            ) : (
              <WatchlistButton
                mal_id={mangaId}
                media_type="manga"
                title={manga?.title || ""}
                title_japanese={manga?.title_japanese}
                image_url={manga?.images?.webp?.large_image_url}
                score={manga?.score}
                variant="full"
              />
            )}

            {/* Score Card */}
            {manga?.score && (
              <div className="rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/30 p-5 sm:p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-foreground">{formatScore(manga.score)}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.round(manga.score! / 2) ? "fill-foreground text-foreground" : "text-muted-foreground/30")} />
                  ))}
                </div>
                {manga.scored_by && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">{manga.scored_by.toLocaleString()} users scored</p>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/30 p-5 sm:p-6">
              <h3 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-3 font-semibold">Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {manga?.rank && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Ranked</p>
                      <p className="text-sm font-semibold">#{manga.rank}</p>
                    </div>
                  </div>
                )}
                {manga?.popularity && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Popularity</p>
                      <p className="text-sm font-semibold">#{manga.popularity.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {manga?.members && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Members</p>
                      <p className="text-sm font-semibold">{manga.members.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {manga?.favorites && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Favorites</p>
                      <p className="text-sm font-semibold">{manga.favorites.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/30 p-5 sm:p-6 text-sm space-y-0">
              <h3 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-2 font-semibold">Information</h3>
              {manga?.type && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium mt-0.5">{manga.type}</p>
                </div>
              )}
              {manga?.status && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p className="font-medium mt-0.5">{manga.status === "RELEASING" ? "Publishing" : manga.status === "FINISHED" ? "Finished" : manga.status === "NOT_YET_RELEASED" ? "Not yet published" : manga.status === "HIATUS" ? "On Hiatus" : manga.status}</p>
                </div>
              )}
              {manga?.published && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Published</p>
                  <p className="font-medium mt-0.5">
                    {new Date(manga.published.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {manga.published.to ? ` to ${new Date(manga.published.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : manga.status === "RELEASING" ? " to ?" : ""}
                  </p>
                </div>
              )}
              {manga?.chapters && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Chapters</p>
                  <p className="font-medium mt-0.5">{manga.chapters}</p>
                </div>
              )}
              {manga?.volumes && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Volumes</p>
                  <p className="font-medium mt-0.5">{manga.volumes}</p>
                </div>
              )}
              {manga?.source && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Source</p>
                  <p className="font-medium mt-0.5">{manga.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
              )}
              {manga?.countryOfOrigin && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Origin</p>
                  <p className="font-medium mt-0.5">{manga.countryOfOrigin === 'JP' ? '🇯🇵 Japan' : manga.countryOfOrigin === 'KR' ? '🇰🇷 South Korea' : manga.countryOfOrigin === 'CN' ? '🇨🇳 China' : manga.countryOfOrigin}</p>
                </div>
              )}
              {manga?.authors && manga.authors.length > 0 && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Author{manga.authors.length > 1 ? 's' : ''}</p>
                  <p className="font-medium mt-0.5">{manga.authors.map(a => a.name).join(", ")}</p>
                </div>
              )}
              {(manga as any)?.serializations && (manga as any).serializations.length > 0 && (
                <div className="py-2.5 border-b border-border/20">
                  <p className="text-muted-foreground text-xs">Serialization</p>
                  <p className="font-medium mt-0.5">{(manga as any).serializations.map((s: any) => s.name).join(", ")}</p>
                </div>
              )}
              {manga?.themes && manga.themes.length > 0 && (
                <div className="py-2.5">
                  <p className="text-muted-foreground text-xs">Themes</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {manga.themes.map(t => (
                      <span key={t.mal_id} className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">{t.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Titles */}
            {(manga?.title_romaji || manga?.title_english || manga?.title_japanese) && (
              <Collapsible>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-muted/30 border border-border/30 text-xs sm:text-sm hover:bg-muted/50 transition-colors cursor-pointer">
                  <span className="font-medium text-muted-foreground">Alternative Titles</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5 text-sm space-y-0">
                  {manga.title_english && manga.title_english !== manga.title && (
                    <div className="py-2 border-b border-border/20">
                      <p className="text-muted-foreground text-[10px]">English</p>
                      <p className="font-medium mt-0.5 text-xs">{manga.title_english}</p>
                    </div>
                  )}
                  {manga.title_romaji && manga.title_romaji !== manga.title && (
                    <div className="py-2 border-b border-border/20">
                      <p className="text-muted-foreground text-[10px]">Romaji</p>
                      <p className="font-medium mt-0.5 text-xs">{manga.title_romaji}</p>
                    </div>
                  )}
                  {manga.title_japanese && (
                    <div className="py-2">
                      <p className="text-muted-foreground text-[10px]">Japanese</p>
                      <p className="font-medium mt-0.5 text-xs font-jp">{manga.title_japanese}</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* External Links */}
            <div className="flex flex-col gap-2">
              <a
                href={`https://anilist.co/manga/${manga?.anilist_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/30 border border-border/30 text-xs sm:text-sm hover:bg-muted/50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">View on AniList</span>
              </a>
              {manga?.idMal && (
                <a
                  href={`https://myanimelist.net/manga/${manga.idMal}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/30 border border-border/30 text-xs sm:text-sm hover:bg-muted/50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">View on MyAnimeList</span>
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
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

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs flex-1"
                onClick={() => {
                  const url = `${window.location.origin}/manga/${mangaId}`;
                  navigator.clipboard.writeText(url);
                  toast({ title: "Link copied!" });
                }}
              >
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs flex-1"
                onClick={async () => {
                  const url = `${window.location.origin}/manga/${mangaId}`;
                  const shareData = { title: manga?.title || "Manga", text: manga?.synopsis?.slice(0, 100) + "..." || "", url };
                  if (navigator.share && navigator.canShare?.(shareData)) {
                    try { await navigator.share(shareData); } catch {}
                  } else {
                    navigator.clipboard.writeText(url);
                    toast({ title: "Link copied!" });
                  }
                }}
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </div>

            <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
              Powered by MangaDex • Data updated live
            </p>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
