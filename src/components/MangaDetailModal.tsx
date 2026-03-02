import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "react-router-dom";
import { X, Star, Copy, Share2, MessageCircle, Send, User, ArrowUpDown, ThumbsUp, ChevronDown, ExternalLink, Heart, Trophy, Users, Globe, BookOpen, Calendar, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [activeTab, setActiveTab] = useState<"stats" | "comments" | "similar">("stats");
  const [newComment, setNewComment] = useState("");
  const [commentSort, setCommentSort] = useState<"latest" | "likes">("latest");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

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

  const statusLabel = manga?.status === "Finished" ? "Completed" : manga?.status === "Publishing" ? "Ongoing" : manga?.status === "RELEASING" ? "Ongoing" : manga?.status === "FINISHED" ? "Completed" : manga?.status === "HIATUS" ? "Hiatus" : manga?.status;
  const statusColor = statusLabel === "Ongoing" ? "bg-primary/20 text-primary" : statusLabel === "Completed" ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive";

  const publishedFrom = manga?.published?.from ? new Date(manga.published.from).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
  const publishedTo = manga?.published?.to ? new Date(manga.published.to).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null;
  const publishedRange = publishedFrom ? `${publishedFrom} – ${publishedTo || "Present"}` : null;

  const tabs = [
    { id: "stats" as const, label: "Statistics" },
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

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster + Title */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-10 pb-0">
          <div className="flex items-end gap-4 sm:gap-6">
            <div className="w-28 h-40 sm:w-44 sm:h-64 rounded-2xl overflow-hidden border-2 border-border/30 shadow-2xl flex-shrink-0 -mb-10 sm:-mb-12 bg-muted">
              {manga?.images?.webp?.large_image_url && (
                <img src={manga.images.webp.large_image_url} alt={manga.title} className="w-full h-full object-cover object-top" />
              )}
            </div>
            <div className="pb-2 sm:pb-4 min-w-0 flex-1">
              <h1 className="text-xl sm:text-3xl md:text-5xl font-bold tracking-tight text-foreground line-clamp-2">
                {manga?.title}
              </h1>
              {manga?.title_japanese && (
                <p className="text-sm sm:text-2xl text-muted-foreground font-jp mt-0.5 line-clamp-1">{manga.title_japanese}</p>
              )}
              <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm flex-wrap">
                {manga?.score && (
                  <div className="flex items-center gap-1 bg-primary/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-primary/30">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-primary text-primary" />
                    <span className="font-semibold text-primary">{formatScore(manga.score)}</span>
                  </div>
                )}
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

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 sm:px-8 md:px-10 pt-14 sm:pt-16 pb-6 sm:pb-10">

        {/* Main — 8 cols */}
        <div className="lg:col-span-8 space-y-8 sm:space-y-10">

          {/* Synopsis */}
          <div>
            <h2 className="uppercase text-[10px] sm:text-xs tracking-widest text-muted-foreground mb-2 sm:mb-3 font-semibold">Synopsis</h2>
            {isLoading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
            ) : (
              <p className="text-sm sm:text-[15.5px] text-muted-foreground leading-relaxed">{manga?.synopsis || "No synopsis available."}</p>
            )}
          </div>

          {/* Genres */}
          {manga?.genres && manga.genres.length > 0 && (
            <Collapsible defaultOpen>
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
                      onClick={() => onOpenChange(false)}
                      className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      {genre.name}
                    </Link>
                  ))}
                  {manga?.themes?.map(t => (
                    <span key={t.mal_id} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs border border-border/30">{t.name}</span>
                  ))}
                  {(manga as any)?.demographics?.map((d: any) => (
                    <span key={d.mal_id} className="px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-medium border border-border/30">{d.name}</span>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Tabs */}
          <div>
            <div className="flex border-b border-border/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">({tab.count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className="mt-6 sm:mt-8 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {manga?.score && (
                    <div className="rounded-2xl bg-muted/30 border border-primary/20 p-4 sm:p-5 col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Score</span>
                      </div>
                      <div className="text-3xl font-bold">{formatScore(manga.score)}</div>
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={cn("w-3 h-3", i <= Math.round(manga.score! / 2) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                        ))}
                      </div>
                      {manga.scored_by && <p className="text-[10px] text-muted-foreground mt-1">{manga.scored_by.toLocaleString()} votes</p>}
                    </div>
                  )}
                  {manga?.rank && (
                    <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground font-medium">Ranked</span></div>
                      <p className="text-2xl font-bold">#{manga.rank}</p>
                    </div>
                  )}
                  {manga?.popularity && (
                    <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2"><Globe className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground font-medium">Popularity</span></div>
                      <p className="text-2xl font-bold">#{manga.popularity.toLocaleString()}</p>
                    </div>
                  )}
                  {manga?.members && (
                    <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground font-medium">Members</span></div>
                      <p className="text-2xl font-bold">{manga.members.toLocaleString()}</p>
                    </div>
                  )}
                  {manga?.favorites && (
                    <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-destructive" /><span className="text-xs text-muted-foreground font-medium">Favorites</span></div>
                      <p className="text-2xl font-bold">{manga.favorites.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground font-medium">Chapters</span></div>
                    <p className="text-2xl font-bold">{manga?.chapters || "?"}<span className="text-sm font-normal text-muted-foreground ml-1.5">({statusLabel || "?"})</span></p>
                  </div>
                </div>

                {/* Info rows */}
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
                    <div key={label} className="flex items-center justify-between px-5 py-3">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                {/* External reading note */}
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Chapters are not available for reading on Bibue</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        You can read the latest chapters on official platforms. Bibue is your discovery & tracking hub.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(manga?.type === 'Manhwa' || manga?.type === 'Manhua' || manga?.countryOfOrigin === 'KR' || manga?.countryOfOrigin === 'CN') ? (
                          <>
                            <a href="https://www.webtoons.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"><ExternalLink className="w-3 h-3" /> WEBTOON</a>
                            <a href="https://www.tappytoon.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"><ExternalLink className="w-3 h-3" /> Tappytoon</a>
                          </>
                        ) : (
                          <>
                            <a href="https://mangaplus.shueisha.co.jp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"><ExternalLink className="w-3 h-3" /> MANGA Plus</a>
                            <a href="https://www.viz.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors border border-primary/20"><ExternalLink className="w-3 h-3" /> VIZ</a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Discussion</h3>
                  <div className="flex items-center gap-1">
                    <Button variant={commentSort === "latest" ? "secondary" : "ghost"} size="sm" onClick={() => setCommentSort("latest")} className="gap-1.5 text-xs h-8 px-2.5"><ArrowUpDown className="w-3 h-3" /> New</Button>
                    <Button variant={commentSort === "likes" ? "secondary" : "ghost"} size="sm" onClick={() => setCommentSort("likes")} className="gap-1.5 text-xs h-8 px-2.5"><ThumbsUp className="w-3 h-3" /> Top</Button>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="mb-6">
                  <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={user ? "Share your thoughts…" : "Sign in to comment…"} className="mb-3 resize-none text-sm border-border/30" rows={3} disabled={!user} />
                  <Button type="submit" size="sm" disabled={!user || !newComment.trim() || addCommentMutation.isPending} className="gap-2"><Send className="w-4 h-4" />{user ? "Post Comment" : "Sign in to Comment"}</Button>
                </form>
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading comments...</div>
                  ) : comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-xl p-4 bg-muted/30 border border-border/20">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-muted-foreground" /></div>
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

        {/* Sidebar — 4 cols */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-8 space-y-6">

            {/* Watchlist CTA */}
            <WatchlistButton
              mal_id={mangaId}
              media_type="manga"
              title={manga?.title || ""}
              title_japanese={manga?.title_japanese}
              image_url={manga?.images?.webp?.large_image_url}
              score={manga?.score}
              variant="full"
            />

            {/* Score Card */}
            {manga?.score && (
              <div className="rounded-2xl sm:rounded-3xl bg-muted/30 border border-primary/20 p-5 sm:p-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-foreground">{formatScore(manga.score)}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i <= Math.round(manga.score! / 2) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
                  ))}
                </div>
                {manga.scored_by && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">{manga.scored_by.toLocaleString()} users scored</p>}
              </div>
            )}

            {/* Alt Titles */}
            {(manga?.title_romaji || manga?.title_english || manga?.title_japanese) && (
              <Collapsible>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-muted/30 border border-border/30 text-xs sm:text-sm hover:bg-muted/50 transition-colors cursor-pointer">
                  <span className="font-medium text-muted-foreground">Alternative Titles</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 rounded-2xl bg-muted/30 border border-border/30 p-4 sm:p-5 text-sm space-y-0">
                  {manga.title_english && manga.title_english !== manga.title && (
                    <div className="py-2 border-b border-border/20"><p className="text-muted-foreground text-[10px]">English</p><p className="font-medium mt-0.5 text-xs">{manga.title_english}</p></div>
                  )}
                  {manga.title_romaji && manga.title_romaji !== manga.title && (
                    <div className="py-2 border-b border-border/20"><p className="text-muted-foreground text-[10px]">Romaji</p><p className="font-medium mt-0.5 text-xs">{manga.title_romaji}</p></div>
                  )}
                  {manga.title_japanese && (
                    <div className="py-2"><p className="text-muted-foreground text-[10px]">Japanese</p><p className="font-medium mt-0.5 text-xs font-jp">{manga.title_japanese}</p></div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* External Links */}
            <div className="flex flex-col gap-2">
              <a href={`https://anilist.co/manga/${manga?.anilist_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/30 border border-border/30 text-xs sm:text-sm hover:bg-muted/50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-primary" /><span className="font-medium">View on AniList</span>
              </a>
              {manga?.idMal && (
                <a href={`https://myanimelist.net/manga/${manga.idMal}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/30 border border-border/30 text-xs sm:text-sm hover:bg-muted/50 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 text-primary" /><span className="font-medium">View on MyAnimeList</span>
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs flex-1" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/manga/${mangaId}`); toast({ title: "Link copied!" }); }}>
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs flex-1" onClick={async () => {
                const url = `${window.location.origin}/manga/${mangaId}`;
                const shareData = { title: manga?.title || "Manga", text: manga?.synopsis?.slice(0, 100) + "..." || "", url };
                if (navigator.share && navigator.canShare?.(shareData)) { try { await navigator.share(shareData); } catch {} } else { navigator.clipboard.writeText(url); toast({ title: "Link copied!" }); }
              }}>
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </div>

            <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
              Powered by AniList + MangaDex + MyAnimeList
            </p>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
