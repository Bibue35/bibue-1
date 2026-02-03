import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, Star, Heart, Bookmark, Eye, ChevronsLeft, ChevronsRight, MessageCircle, Send, User, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";
import { MangaReader } from "@/components/MangaReader";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import bibueLogo from "@/assets/bibue-logo-horizontal.png";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [isReading, setIsReading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastChapterRead } = useReadingProgress(Number(id), "manga");

  // Generate mock chapter data - show ALL chapters
  const generateChapters = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      number: count - i,
      title: `Chapter ${count - i}`,
      released: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      pages: Math.floor(18 + Math.random() * 12),
    }));
  };

  // General comments query (for the manga detail page, not chapter-specific)
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["manga-general-comments", Number(id)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .eq("manga_id", Number(id))
        .eq("category", "general")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Please sign in to comment");

      const { error } = await supabase
        .from("discussions")
        .insert({
          user_id: user.id,
          manga_id: Number(id),
          category: "general",
          title: `Comment on ${manga?.title}`,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["manga-general-comments", Number(id)] });
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-sacred mb-4">Error Loading Manga</h1>
          <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const chapters = manga ? generateChapters(manga.chapters || 50) : [];
  const totalChapters = chapters.length;
  const firstChapter = chapters[chapters.length - 1]?.number || 1;
  const lastChapter = chapters[0]?.number || totalChapters;

  // Reading Mode - Use the new MangaReader component
  if (isReading) {
    return (
      <MangaReader
        mangaId={Number(id)}
        mangaTitle={manga?.title || ""}
        mangaImageUrl={manga?.images.webp.large_image_url}
        selectedChapter={selectedChapter}
        totalChapters={totalChapters}
        firstChapter={firstChapter}
        lastChapter={lastChapter}
        onChapterChange={setSelectedChapter}
        onClose={() => setIsReading(false)}
      />
    );
  }

  // DemonicScans Style Detail Page
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top - just Bibue logo */}
      <div className="container mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
        <Link to="/manga">
          <img 
            src={bibueLogo} 
            alt="Bibue" 
            className="h-10 sm:h-12 md:h-14 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert"
          />
        </Link>
        <Link to="/manga" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Manga
        </Link>
      </div>

      {/* SECTION 1: MANGA INFO */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Cover + Actions */}
              <div className="flex-shrink-0 w-full lg:w-72">
                <div className="sticky top-24">
                  {/* Cover Image */}
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-4 shadow-2xl">
                    {isLoading ? (
                      <Skeleton className="w-full h-full" />
                    ) : (
                      <img
                        src={manga?.images.webp.large_image_url}
                        alt={manga?.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      variant="default" 
                      className="w-full gap-2"
                      onClick={() => {
                        setSelectedChapter(firstChapter);
                        setIsReading(true);
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      Read First
                    </Button>
                    {lastChapterRead && (
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2"
                        onClick={() => {
                          setSelectedChapter(lastChapterRead);
                          setIsReading(true);
                        }}
                      >
                        <History className="w-4 h-4" />
                        Continue Ch. {lastChapterRead}
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setSelectedChapter(firstChapter);
                          setIsReading(true);
                        }}
                      >
                        <ChevronsLeft className="w-3 h-3" />
                        Ch. 1
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setSelectedChapter(lastChapter);
                          setIsReading(true);
                        }}
                      >
                        Ch. {lastChapter}
                        <ChevronsRight className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <Bookmark className="w-4 h-4" />
                      Bookmark
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                    {manga?.score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-bold text-foreground">{formatScore(manga.score)}</span>
                      </div>
                    )}
                    {manga?.members && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{(manga.members / 1000).toFixed(0)}k</span>
                      </div>
                    )}
                    {manga?.favorites && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{(manga.favorites / 1000).toFixed(1)}k</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Title, Synopsis, Chapters */}
              <div className="flex-1 min-w-0">
                {/* Title Section */}
                <div className="mb-6">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-10 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl sm:text-4xl font-bold font-sacred mb-2">{manga?.title}</h1>
                      
                      {/* Genres inline */}
                      {manga?.genres && manga.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {manga.genres.map((genre) => (
                            <Link
                              key={genre.mal_id}
                              to={`/manga?genre=${genre.mal_id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {genre.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Synopsis */}
                <div className="mb-6">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {manga?.synopsis || "No synopsis available."}
                    </p>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-sm">
                  {[
                    { label: "Author", value: manga?.authors?.map(a => a.name).join(", ") },
                    { label: "Rating", value: manga?.score ? `${manga.score}%` : undefined },
                    { label: "Status", value: manga?.status },
                    { label: "Last Update", value: chapters[0]?.released ? new Date(chapters[0].released).toLocaleDateString() : undefined },
                    { label: "Alternatives", value: manga?.title_japanese },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-muted-foreground">{label}</span>
                      <p className="font-medium truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Chapters Section */}
                <div className="rounded-xl border border-border/30 bg-muted/20 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-sacred">
                      {chapters.length} Chapters Available
                    </h2>
                    {lastChapterRead && (
                      <span className="text-sm text-muted-foreground">
                        Last read: Ch. {lastChapterRead}
                      </span>
                    )}
                  </div>

                  {/* Chapter List - Full scrollable list */}
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-1">
                      {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))
                      ) : (
                        chapters.map((chapter) => {
                          const isLastRead = lastChapterRead === chapter.number;
                          const releaseDate = new Date(chapter.released);
                          
                          return (
                            <button
                              key={chapter.number}
                              onClick={() => {
                                setSelectedChapter(chapter.number);
                                setIsReading(true);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between py-3 px-4 rounded-lg text-left transition-all",
                                "hover:bg-primary/10",
                                isLastRead && "bg-primary/20 border border-primary/30"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-medium",
                                  isLastRead ? "text-primary" : "text-foreground"
                                )}>
                                  Chapter {chapter.number}
                                </span>
                                {isLastRead && (
                                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    Last Read
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {releaseDate.toLocaleDateString('en-US', { 
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: GENERAL COMMENTS */}
      <section className="py-12 sm:py-16 border-t border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">Comment Section</h2>
            </div>
            
            <div className="rounded-2xl border border-border/30 bg-muted/20 p-4 sm:p-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? "Share your thoughts..." : "Sign in to comment..."}
                  className="mb-3 resize-none bg-background/50 border-border/30"
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
                      className="rounded-xl p-4 bg-background/30 border border-border/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                          {(comment.profiles as any)?.avatar_url ? (
                            <img 
                              src={(comment.profiles as any).avatar_url} 
                              alt="" 
                              className="w-full h-full rounded-full object-cover" 
                            />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
