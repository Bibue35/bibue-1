import { useState, useEffect, useMemo } from "react";
import { SEO, creativeWorkJsonLd } from "@/components/SEO";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Star, Heart, Bookmark, Eye, ChevronsLeft, ChevronsRight, MessageCircle, Send, User, History, Loader2 } from "lucide-react";
import { getContentType, getContentLabel, getContentTypeBadgeClass } from "@/lib/contentType";
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
import { ChapterProgressTracker } from "@/components/ChapterProgressTracker";
import { RelatedMedia } from "@/components/RelatedMedia";
import { NotificationToggle } from "@/components/NotificationToggle";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useTranslatedText } from "@/hooks/useTranslatedText";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useMangaDexSearch, useMangaDexChapters, findBestMatch } from "@/hooks/useMangaDex";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [readingChapterId, setReadingChapterId] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { lastChapterRead } = useReadingProgress(Number(id), "manga");
  const translatedSynopsis = useTranslatedText(manga?.synopsis);
  const { logView } = useViewingHistory();

  // MangaDex integration
  const searchTitle = manga?.title_english || manga?.title_romaji || manga?.title;
  const { data: searchResults } = useMangaDexSearch(searchTitle, !!manga);
  const mangadexMatch = useMemo(() => {
    if (!searchResults || !manga) return null;
    return findBestMatch(searchResults, manga.title);
  }, [searchResults, manga]);
  const { data: mangadexData, isLoading: chaptersLoading } = useMangaDexChapters(mangadexMatch?.id, 0, 100, !!mangadexMatch);
  const mdChapters = mangadexData?.chapters || [];
  const totalMdChapters = mangadexData?.total || 0;

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
      if (!user) throw new Error(t("comments.signInToComment"));

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
      toast({ title: t("comments.commentPosted") });
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-sacred mb-4">{t("detail.errorLoading")} Manga</h1>
          <p className="text-muted-foreground mb-6">{t("common.somethingWrong")}</p>
          <Link to="/">
            <Button variant="outline">{t("common.goHome")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Find the reading chapter from MangaDex data
  const readingMdChapter = readingChapterId ? mdChapters.find(ch => ch.id === readingChapterId) : null;

  // Reading Mode
  if (isReading && readingMdChapter) {
    return (
      <MangaReader
        mangaId={Number(id)}
        mangaTitle={manga?.title || ""}
        mangaImageUrl={manga?.images.webp.large_image_url}
        chapterId={readingMdChapter.id}
        chapterNumber={readingMdChapter.chapter || '?'}
        chapters={mdChapters}
        onChapterChange={(chId) => setReadingChapterId(chId)}
        onClose={() => { setIsReading(false); setReadingChapterId(null); }}
      />
    );
  }

  // DemonicScans Style Detail Page
  return (
    <div className="min-h-screen bg-background">
      {manga && (
        <SEO
          title={manga.title}
          description={manga.synopsis?.slice(0, 155) || `Read ${manga.title} on Bibue.`}
          image={manga.images?.webp?.large_image_url}
          url={`/manga/${id}`}
          jsonLd={creativeWorkJsonLd({
            name: manga.title,
            description: manga.synopsis,
            image: manga.images?.webp?.large_image_url,
            url: `/manga/${id}`,
            genre: manga.genres?.map((g: any) => g.name),
            rating: manga.score,
            ratingCount: manga.scored_by,
          })}
        />
      )}
      {/* Minimal top - just Bibue logo */}
      <div className="container mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
        <Link to="/manga" className="text-2xl font-sacred font-semibold text-foreground hover:text-primary transition-colors">
          Bibue
        </Link>
        <Link to="/manga" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← {t("nav.manga")}
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
                    {mdChapters.length > 0 && (
                      <Button 
                        variant="default" 
                        className="w-full gap-2"
                        onClick={() => {
                          setReadingChapterId(mdChapters[mdChapters.length - 1].id);
                          setIsReading(true);
                        }}
                      >
                        <BookOpen className="w-4 h-4" />
                        {t("detail.readFirst")}
                      </Button>
                    )}
                    {lastChapterRead && mdChapters.length > 0 && (
                      <Button 
                        variant="secondary" 
                        className="w-full gap-2"
                        onClick={() => {
                          const match = mdChapters.find(ch => ch.chapter === String(lastChapterRead));
                          if (match) setReadingChapterId(match.id);
                          else setReadingChapterId(mdChapters[0].id);
                          setIsReading(true);
                        }}
                      >
                        <History className="w-4 h-4" />
                        {t("detail.continue")} {lastChapterRead}
                      </Button>
                    )}
                    {mdChapters.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => {
                            setReadingChapterId(mdChapters[mdChapters.length - 1].id);
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
                            setReadingChapterId(mdChapters[0].id);
                            setIsReading(true);
                          }}
                        >
                          Latest Ch.
                          <ChevronsRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 gap-2">
                        <Bookmark className="w-4 h-4" />
                        {t("detail.bookmark")}
                      </Button>
                      {manga && (
                        <NotificationToggle
                          mediaId={Number(id)}
                          mediaType="manga"
                          title={manga.title}
                        />
                      )}
                    </div>
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
                      <h1 className="text-3xl sm:text-4xl font-bold font-sacred mb-2">
                        {manga?.title}
                        {manga?.countryOfOrigin && (
                          <span className={cn(
                            "ml-3 text-sm font-medium px-2.5 py-1 rounded-full align-middle inline-block",
                            getContentTypeBadgeClass(getContentType({ type: 'MANGA', countryOfOrigin: manga.countryOfOrigin }))
                          )}>
                            {getContentLabel(getContentType({ type: 'MANGA', countryOfOrigin: manga.countryOfOrigin }))}
                          </span>
                        )}
                      </h1>
                      
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
                      {translatedSynopsis || t("detail.noSynopsis")}
                    </p>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-sm">
                  {[
                    { label: t("common.author"), value: manga?.authors?.map(a => a.name).join(", ") },
                    { label: t("detail.rating"), value: manga?.score ? `${manga.score}%` : undefined },
                    { label: t("common.status"), value: manga?.status },
                    { label: t("detail.lastUpdate"), value: mdChapters[0]?.readableAt ? new Date(mdChapters[0].readableAt).toLocaleDateString() : undefined },
                    { label: t("detail.alternatives"), value: manga?.title_japanese },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-muted-foreground">{label}</span>
                      <p className="font-medium truncate">{value}</p>
                    </div>
                  ))}
                </div>
                {/* Chapter Progress Tracker */}
                {manga && (
                  <div className="mb-6">
                    <ChapterProgressTracker
                      malId={Number(id)}
                      totalChapters={manga.chapters || totalMdChapters}
                      mangaTitle={manga.title}
                    />
                  </div>
                )}

                {/* Related Media / Cross-Media Linking */}
                {manga && (
                  <div className="mb-6">
                    <RelatedMedia
                      mediaId={Number(id)}
                      mediaType="manga"
                      currentTitle={manga.title}
                      currentStatus={manga.status}
                    />
                  </div>
                )}

                {/* Chapters Section - MangaDex powered */}
                <div className="rounded-xl border border-border/30 bg-muted/20 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold font-sacred">
                      {chaptersLoading ? "Loading..." : `${totalMdChapters} ${t("detail.chaptersAvailable")}`}
                    </h2>
                    {lastChapterRead && (
                      <span className="text-sm text-muted-foreground">
                        {t("detail.lastRead")}: Ch. {lastChapterRead}
                      </span>
                    )}
                  </div>

                  {/* MangaDex Attribution */}
                  <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/30">
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      Chapters provided by <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">MangaDex</a>
                    </span>
                  </div>

                  {chaptersLoading ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Finding chapters...</span>
                    </div>
                  ) : mdChapters.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No chapters available on MangaDex.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-1">
                        {mdChapters.map((ch) => {
                          const chNum = ch.chapter ? Math.floor(parseFloat(ch.chapter)) : 0;
                          const isLastRead = lastChapterRead === chNum;
                          return (
                            <button
                              key={ch.id}
                              onClick={() => {
                                setReadingChapterId(ch.id);
                                setIsReading(true);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between py-3 px-4 rounded-lg text-left transition-all",
                                "hover:bg-primary/10",
                                isLastRead && "bg-primary/20 border border-primary/30"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={cn(
                                  "font-medium",
                                  isLastRead ? "text-primary" : "text-foreground"
                                )}>
                                  Ch. {ch.chapter}
                                </span>
                                {isLastRead && (
                                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    {t("detail.lastRead")}
                                  </span>
                                )}
                                {ch.title && (
                                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    — {ch.title}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {ch.scanlationGroup && (
                                  <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">{ch.scanlationGroup}</span>
                                )}
                                <span className="text-sm text-muted-foreground">
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
                  )}
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
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">{t("detail.commentSection")}</h2>
            </div>
            
            <div className="rounded-2xl border border-border/30 bg-muted/20 p-4 sm:p-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={user ? t("comments.shareChapterThoughts") : t("comments.signInPlaceholder")}
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
                  {user ? t("comments.postComment") : t("comments.signInToComment")}
                </Button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {commentsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("comments.loadingComments")}
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
                    <p>{t("detail.noCommentsYet")}</p>
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
