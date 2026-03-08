import { useState, useEffect, useMemo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SEO, creativeWorkJsonLd } from "@/components/SEO";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Heart, Bookmark, Eye, MessageCircle, Send, User, Loader2, Trophy, Users, Calendar, BookOpen, ExternalLink, Globe, ChevronDown } from "lucide-react";
import { getContentType, getContentLabel, getContentTypeBadgeClass } from "@/lib/contentType";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";
import { RelatedMedia } from "@/components/RelatedMedia";
import { WhereToRead } from "@/components/WhereToRead";
import { NotificationToggle } from "@/components/NotificationToggle";
import { WatchlistButton } from "@/components/WatchlistButton";
import { useTranslatedText } from "@/hooks/useTranslatedText";
import { useViewingHistory } from "@/hooks/useViewingHistory";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const translatedSynopsis = useTranslatedText(manga?.synopsis);
  const { logView } = useViewingHistory();

  // General comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["manga-general-comments", Number(id)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`id, content, created_at, user_id, profiles:user_id (username, avatar_url)`)
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

  const statusLabel = manga?.status === "Finished" ? "Completed" : manga?.status === "Publishing" ? "Ongoing" : manga?.status === "RELEASING" ? "Ongoing" : manga?.status === "FINISHED" ? "Completed" : manga?.status === "HIATUS" ? "Hiatus" : manga?.status;

  const publishedFrom = manga?.published?.from ? new Date(manga.published.from).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
  const publishedTo = manga?.published?.to ? new Date(manga.published.to).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
  const publishedRange = publishedFrom ? `${publishedFrom} – ${publishedTo || "Present"}` : null;

  return (
    <div className="min-h-screen bg-background">
      {manga && (
        <SEO
          title={manga.title}
          description={manga.synopsis?.slice(0, 155) || `Discover ${manga.title} on Bibue.`}
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

      {/* Cinematic Hero Banner */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <img
              src={manga?.images?.webp?.large_image_url}
              alt={manga?.title}
              className="w-full h-full object-cover object-top scale-110 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
          </>
        )}

        {/* Top nav */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 sm:px-8 pt-4 flex items-center justify-between">
          <Link to="/manga" className="text-2xl font-sacred font-semibold text-foreground hover:text-primary transition-colors">
            Bibue
          </Link>
          <Link to="/manga" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Browse Manga
          </Link>
        </div>

        {/* Hero content overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 lg:px-12 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto flex items-end gap-6 sm:gap-8">
            {/* Poster */}
            <div className="w-32 h-48 sm:w-48 sm:h-72 rounded-2xl overflow-hidden border-2 border-border/30 shadow-2xl flex-shrink-0 -mb-16 sm:-mb-20 bg-muted">
              {manga?.images?.webp?.large_image_url && (
                <img
                  src={manga.images.webp.large_image_url}
                  alt={manga?.title}
                  className="w-full h-full object-cover object-top"
                />
              )}
            </div>

            {/* Title + meta */}
            <div className="pb-2 sm:pb-4 min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {manga?.score && (
                  <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/30">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-bold text-primary">{formatScore(manga.score)}</span>
                  </div>
                )}
                {statusLabel && (
                  <span className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full",
                    statusLabel === "Ongoing" ? "bg-primary/20 text-primary border border-primary/30" :
                    statusLabel === "Completed" ? "bg-muted text-muted-foreground" :
                    "bg-destructive/20 text-destructive border border-destructive/30"
                  )}>
                    {statusLabel}
                  </span>
                )}
                {manga?.countryOfOrigin && (
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full",
                    getContentTypeBadgeClass(getContentType({ type: 'MANGA', countryOfOrigin: manga.countryOfOrigin }))
                  )}>
                    {getContentLabel(getContentType({ type: 'MANGA', countryOfOrigin: manga.countryOfOrigin }))}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-sacred leading-tight line-clamp-2">
                {manga?.title}
              </h1>
              {manga?.title_japanese && (
                <p className="text-lg sm:text-2xl text-muted-foreground font-jp mt-1 line-clamp-1">
                  {manga.title_japanese}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-24 sm:pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

          {/* Left: Main content — 8 cols */}
          <div className="lg:col-span-8 space-y-12">

            {/* Synopsis */}
            <div>
              <h2 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-3 font-semibold">Synopsis</h2>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {translatedSynopsis || t("detail.noSynopsis")}
                </p>
              )}
            </div>

            {/* Genre Pills */}
            {manga?.genres && manga.genres.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 group cursor-pointer w-full">
                  <h2 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground font-semibold">Genres & Themes</h2>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {manga.genres.map((genre) => (
                      <Link
                        key={genre.mal_id}
                        to={`/manga?genre=${genre.mal_id}`}
                        className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20"
                      >
                        {genre.name}
                      </Link>
                    ))}
                    {manga?.themes?.map(theme => (
                      <span key={theme.mal_id} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs border border-border/30">
                        {theme.name}
                      </span>
                    ))}
                    {(manga as any)?.demographics?.map((d: any) => (
                      <span key={d.mal_id} className="px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-medium border border-border/30">
                        {d.name}
                      </span>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* ═══ PREMIUM STATISTICS PANEL ═══ */}
            <div>
              <h2 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-5 font-semibold">Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Score */}
                {manga?.score && (
                  <div className="rounded-2xl glass-panel p-5 sm:p-6 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      <span className="text-xs text-muted-foreground font-medium">Score</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-foreground">{formatScore(manga.score)}</div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={cn("w-3 h-3", i <= Math.round(manga.score! / 2) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                      ))}
                    </div>
                    {manga.scored_by && (
                      <p className="text-[10px] text-muted-foreground mt-1">{manga.scored_by.toLocaleString()} votes</p>
                    )}
                  </div>
                )}

                {/* Ranked */}
                {manga?.rank && (
                  <div className="rounded-2xl glass-panel p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground font-medium">Ranked</span>
                    </div>
                    <p className="text-2xl font-bold">#{manga.rank}</p>
                  </div>
                )}

                {/* Popularity */}
                {manga?.popularity && (
                  <div className="rounded-2xl glass-panel p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground font-medium">Popularity</span>
                    </div>
                    <p className="text-2xl font-bold">#{manga.popularity.toLocaleString()}</p>
                  </div>
                )}

                {/* Members */}
                {manga?.members && (
                  <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground font-medium">Members</span>
                    </div>
                    <p className="text-2xl font-bold">{manga.members.toLocaleString()}</p>
                  </div>
                )}

                {/* Favorites */}
                {manga?.favorites && (
                  <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-destructive" />
                      <span className="text-xs text-muted-foreground font-medium">Favorites</span>
                    </div>
                    <p className="text-2xl font-bold">{manga.favorites.toLocaleString()}</p>
                  </div>
                )}

                {/* Total Chapters */}
                <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Chapters</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {manga?.chapters || "?"}
                    <span className="text-sm font-normal text-muted-foreground ml-1.5">
                      ({statusLabel || "Unknown"})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ INFORMATION PANEL ═══ */}
            <div>
              <h2 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-4 font-semibold">Information</h2>
              <div className="rounded-2xl bg-muted/30 border border-border/30 divide-y divide-border/20">
                {[
                  { label: "Status", value: statusLabel },
                  { label: "Published", value: publishedRange },
                  { label: "Author", value: manga?.authors?.map(a => a.name).join(", ") },
                  { label: "Serialization", value: (manga as any)?.serializations?.map((s: any) => s.name).join(", ") },
                  { label: "Type", value: manga?.type },
                  { label: "Volumes", value: manga?.volumes },
                  { label: "Source", value: manga?.source?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) },
                  { label: "Origin", value: manga?.countryOfOrigin === 'JP' ? '🇯🇵 Japan' : manga?.countryOfOrigin === 'KR' ? '🇰🇷 South Korea' : manga?.countryOfOrigin === 'CN' ? '🇨🇳 China' : manga?.countryOfOrigin },
                ].filter(item => item.value).map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Where to Read */}
            {manga && (
              <WhereToRead type={manga.type} countryOfOrigin={manga.countryOfOrigin} />
            )}

            {/* Related Media */}
            {manga && (
              <RelatedMedia
                mediaId={Number(id)}
                mediaType="manga"
                currentTitle={manga.title}
                currentStatus={manga.status}
              />
            )}

            {/* Comments */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold font-sacred">{t("detail.commentSection")}</h2>
              </div>
              <div className="rounded-2xl border border-border/30 bg-muted/20 p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="mb-6">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? t("comments.shareChapterThoughts") : t("comments.signInPlaceholder")}
                    className="mb-3 resize-none bg-background/50 border-border/30"
                    rows={3}
                    disabled={!user}
                  />
                  <Button type="submit" disabled={!user || !newComment.trim() || addCommentMutation.isPending} className="gap-2">
                    <Send className="w-4 h-4" />
                    {user ? t("comments.postComment") : t("comments.signInToComment")}
                  </Button>
                </form>
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">{t("comments.loadingComments")}</div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl p-4 bg-background/30 border border-border/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                            {(comment.profiles as any)?.avatar_url ? (
                              <img src={(comment.profiles as any).avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
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
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t("detail.noCommentsYet")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar — 4 cols */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-8 space-y-5">

              {/* Watchlist CTA */}
              <WatchlistButton
                mal_id={Number(id)}
                media_type="manga"
                title={manga?.title || ""}
                title_japanese={manga?.title_japanese}
                image_url={manga?.images?.webp?.large_image_url}
                score={manga?.score}
                variant="full"
              />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2">
                  <Bookmark className="w-4 h-4" />
                  {t("detail.bookmark")}
                </Button>
                {manga && (
                  <NotificationToggle mediaId={Number(id)} mediaType="manga" title={manga.title} />
                )}
              </div>

              {/* Score Card */}
              {manga?.score && (
                <div className="rounded-2xl bg-muted/30 border border-primary/20 p-5 text-center">
                  <div className="text-4xl font-bold text-foreground">{formatScore(manga.score)}</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={cn("w-4 h-4", i <= Math.round(manga.score! / 2) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                    ))}
                  </div>
                  {manga.scored_by && (
                    <p className="text-xs text-muted-foreground mt-2">{manga.scored_by.toLocaleString()} users scored</p>
                  )}
                </div>
              )}

              {/* Alternative Titles */}
              {(manga?.title_romaji || manga?.title_english || manga?.title_japanese) && (
                <div className="rounded-2xl bg-muted/30 border border-border/30 p-5 text-sm space-y-0">
                  <h3 className="uppercase text-[10px] tracking-widest text-muted-foreground mb-2 font-semibold">Alternative Titles</h3>
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
                </div>
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

              <p className="text-[10px] text-muted-foreground text-center">
                Powered by AniList + MangaDex + MyAnimeList
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
