import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Calendar, Users, Heart, Share2, Bookmark, User } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { ChapterList } from "@/components/ChapterList";
import { ChapterComments } from "@/components/ChapterComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "characters" | "reviews">("overview");
  const [selectedChapter, setSelectedChapter] = useState(1);

  // Generate mock chapter data with dates and scores
  const generateChapters = (count: number) => {
    const published = manga?.published?.from ? new Date(manga.published.from) : new Date();
    return Array.from({ length: Math.min(count, 50) }, (_, i) => {
      const chapterDate = new Date(published);
      chapterDate.setDate(chapterDate.getDate() + (i * 7)); // Weekly chapters
      return {
        number: i + 1,
        title: `Chapter ${i + 1}`,
        released: chapterDate.toISOString(),
        score: 7.5 + (Math.random() * 2), // Mock score between 7.5-9.5
        pages: Math.floor(18 + Math.random() * 12), // 18-30 pages
      };
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Manga</h1>
          <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const chapters = manga ? generateChapters(manga.chapters || 30) : [];

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero Banner */}
      <section className="relative min-h-[70vh] pt-20">
        {isLoading ? (
          <Skeleton className="absolute inset-0" />
        ) : (
          <>
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src={manga?.images.webp.large_image_url}
                alt={manga?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 pt-20 pb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Cover */}
                <div className="flex-shrink-0 flex justify-center lg:justify-start">
                  <div className="w-48 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden liquid-glass sunbeam-hover animate-scale-in relative">
                    <img
                      src={manga?.images.webp.large_image_url}
                      alt={manga?.title}
                      className="w-full h-full object-cover"
                    />
                    {manga?.type && (
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                        {manga.type}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 animate-fade-up text-center lg:text-left">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                    {manga?.genres?.slice(0, 4).map((genre) => (
                      <Link
                        key={genre.mal_id}
                        to={`/manga?genre=${genre.mal_id}`}
                        className="px-3 py-1 rounded-full liquid-glass-subtle text-sm font-medium hover:scale-105 transition-transform"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                    {manga?.title}
                  </h1>
                  <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-4">
                    {manga?.title_japanese}
                  </p>

                  {/* Author */}
                  {manga?.authors?.[0] && (
                    <p className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground mb-6">
                      <User className="w-4 h-4" />
                      By {manga.authors.map(a => a.name).join(", ")}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                    {manga?.score && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-subtle">
                        <Star className="w-5 h-5 text-foreground fill-foreground" />
                        <span className="font-bold text-lg">{formatScore(manga.score)}</span>
                        <span className="text-muted-foreground text-sm hidden sm:inline">({formatNumber(manga.scored_by)} votes)</span>
                      </div>
                    )}
                    {manga?.rank && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-subtle">
                        <span className="font-bold text-lg">#{manga.rank}</span>
                        <span className="text-muted-foreground text-sm">Ranked</span>
                      </div>
                    )}
                    {manga?.members && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-subtle">
                        <Users className="w-5 h-5" />
                        <span className="font-bold">{formatNumber(manga.members)}</span>
                      </div>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground mb-8">
                    {manga?.chapters && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{manga.chapters} Chapters</span>
                      </div>
                    )}
                    {manga?.volumes && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{manga.volumes} Volumes</span>
                      </div>
                    )}
                    {manga?.published?.string && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{manga.published.string}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <Button size="lg" className="gap-2">
                      <BookOpen className="w-5 h-5" />
                      Read Now
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2">
                      <Bookmark className="w-5 h-5" />
                      Add to List
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Content Tabs */}
      <section className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass w-fit mb-8 overflow-x-auto">
            {(["overview", "chapters", "characters", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all duration-300 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && manga && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              {/* Synopsis */}
              <div className="lg:col-span-2">
                <div className="liquid-glass rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">Synopsis</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {manga.synopsis || "No synopsis available."}
                  </p>
                </div>
              </div>

              {/* Sidebar info */}
              <div className="space-y-6">
                <div className="liquid-glass rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Information</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{manga.type || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Chapters</dt>
                      <dd className="font-medium">{manga.chapters || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Volumes</dt>
                      <dd className="font-medium">{manga.volumes || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">{manga.status || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Published</dt>
                      <dd className="font-medium text-right text-xs">{manga.published?.string || "N/A"}</dd>
                    </div>
                  </dl>
                </div>

              </div>
            </div>
          )}

          {activeTab === "chapters" && manga && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              {/* Chapter list */}
              <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-bold mb-4">Chapters</h3>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  <ChapterList
                    chapters={chapters}
                    selectedChapter={selectedChapter}
                    onSelectChapter={setSelectedChapter}
                    mangaTitle={manga.title}
                  />
                </div>
              </div>

              {/* Chapter comments */}
              <div className="liquid-glass rounded-2xl p-4 sm:p-6">
                <ChapterComments
                  mangaId={manga.mal_id}
                  chapterNumber={selectedChapter}
                />
              </div>
            </div>
          )}

          {(activeTab === "characters" || activeTab === "reviews") && (
            <div className="liquid-glass rounded-2xl p-12 text-center animate-fade-in">
              <p className="text-muted-foreground text-lg">
                Coming Soon
              </p>
              <p className="text-sm text-muted-foreground mt-2 font-jp">
                この機能は開発中です
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
