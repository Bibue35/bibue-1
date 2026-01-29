import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Calendar, Users, Heart, Share2, Bookmark, User, ChevronLeft, ChevronRight } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { ChapterComments } from "@/components/ChapterComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";
import { HaloRing, HeavenlyCloud, LightBeams } from "@/components/DivineElements";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "characters" | "reviews">("overview");
  const [selectedChapter, setSelectedChapter] = useState(1);

  // Generate mock chapter data
  const generateChapters = (count: number) => {
    const published = manga?.published?.from ? new Date(manga.published.from) : new Date();
    return Array.from({ length: Math.min(count, 50) }, (_, i) => {
      const chapterDate = new Date(published);
      chapterDate.setDate(chapterDate.getDate() + (i * 7));
      return {
        number: i + 1,
        title: `Chapter ${i + 1}`,
        released: chapterDate.toISOString(),
        score: 7.5 + (Math.random() * 2),
        pages: Math.floor(18 + Math.random() * 12),
      };
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-sacred mb-4">Error Loading Manga</h1>
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
  const currentChapter = chapters.find(ch => ch.number === selectedChapter);

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero Banner */}
      <section className="relative min-h-[50vh] pt-20">
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
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
              
              {/* Divine elements */}
              <div className="hidden divine:block">
                <LightBeams className="opacity-30" />
                <HeavenlyCloud className="absolute top-20 right-10" variant="large" />
                <HeavenlyCloud className="absolute top-32 left-20" variant="small" />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 pt-12 pb-8">
              <Link
                to="/manga"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Manga</span>
              </Link>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Cover */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                  <div className="relative w-40 aspect-[2/3] rounded-2xl overflow-hidden liquid-glass animate-scale-in">
                    {/* Divine halo */}
                    <div className="hidden divine:block absolute -top-8 left-1/2 -translate-x-1/2 w-32">
                      <HaloRing />
                    </div>
                    <img
                      src={manga?.images.webp.large_image_url}
                      alt={manga?.title}
                      className="w-full h-full object-cover"
                    />
                    {manga?.type && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                        {manga.type}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center md:text-left">
                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sacred mb-1 tracking-wide">
                    {manga?.title}
                  </h1>
                  <p className="font-jp text-sm text-muted-foreground mb-2">
                    {manga?.title_japanese}
                  </p>

                  {/* Author */}
                  {manga?.authors?.[0] && (
                    <p className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mb-4">
                      <User className="w-4 h-4" />
                      By {manga.authors.map(a => a.name).join(", ")}
                    </p>
                  )}

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                    {manga?.score && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-sm">
                        <Star className="w-4 h-4 text-foreground fill-foreground" />
                        <span className="font-bold">{formatScore(manga.score)}</span>
                      </div>
                    )}
                    {manga?.chapters && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-sm">
                        <BookOpen className="w-4 h-4" />
                        <span>{manga.chapters} Chapters</span>
                      </div>
                    )}
                    {manga?.rank && (
                      <div className="px-3 py-1.5 rounded-full liquid-glass-subtle text-sm font-bold">
                        #{manga.rank} Ranked
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <Button size="default" variant="primary" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Read Now
                    </Button>
                    <Button size="default" variant="outline" className="gap-2">
                      <Bookmark className="w-4 h-4" />
                      Add to List
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Content Tabs */}
      <section className="py-6 relative z-10">
        <div className="container mx-auto px-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass w-fit mb-6 overflow-x-auto">
            {(["overview", "chapters", "characters", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && manga && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2">
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-3">Synopsis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {manga.synopsis || "No synopsis available."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-base font-bold font-sacred mb-3">Information</h3>
                  <dl className="space-y-2 text-sm">
                    {[
                      { label: "Type", value: manga.type },
                      { label: "Chapters", value: manga.chapters },
                      { label: "Volumes", value: manga.volumes },
                      { label: "Status", value: manga.status },
                      { label: "Published", value: manga.published?.string },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium text-right text-xs">{value || "N/A"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {manga.genres && manga.genres.length > 0 && (
                  <div className="liquid-glass rounded-2xl p-5">
                    <h3 className="text-base font-bold font-sacred mb-3">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {manga.genres.map((genre) => (
                        <Link
                          key={genre.mal_id}
                          to={`/manga?genre=${genre.mal_id}`}
                          className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium hover:bg-accent/80 transition-colors"
                        >
                          {genre.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chapters Tab - Completely Redesigned */}
          {activeTab === "chapters" && manga && (
            <div className="animate-fade-in space-y-6">
              {/* Chapter Viewer Header */}
              <div className="liquid-glass rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Chapter Navigation */}
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={selectedChapter <= 1}
                      onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))}
                      className="rounded-full"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    
                    <div className="relative">
                      {/* Divine halo for chapter number */}
                      <div className="hidden divine:block absolute -top-4 left-1/2 -translate-x-1/2 w-20">
                        <HaloRing />
                      </div>
                      <div className="w-20 h-20 rounded-2xl liquid-glass-strong flex items-center justify-center">
                        <span className="text-3xl font-bold font-sacred">{selectedChapter}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={selectedChapter >= chapters.length}
                      onClick={() => setSelectedChapter(prev => Math.min(chapters.length, prev + 1))}
                      className="rounded-full"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Chapter Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-xl font-bold font-sacred mb-2">
                      Chapter {selectedChapter}: {currentChapter?.title || `Chapter ${selectedChapter}`}
                    </h2>
                    {currentChapter && (
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-muted-foreground mb-3">
                        {currentChapter.released && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(currentChapter.released).toLocaleDateString()}
                          </span>
                        )}
                        {currentChapter.score && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-foreground text-foreground" />
                            {currentChapter.score.toFixed(1)}
                          </span>
                        )}
                        {currentChapter.pages && (
                          <span>{currentChapter.pages} pages</span>
                        )}
                      </div>
                    )}
                    <Button variant="primary" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Read Chapter {selectedChapter}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chapter Grid + Comments */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chapter Grid */}
                <div className="lg:col-span-2 liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-4">All Chapters</h3>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {chapters.map((ch) => (
                      <button
                        key={ch.number}
                        onClick={() => setSelectedChapter(ch.number)}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                          selectedChapter === ch.number
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {ch.number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div className="liquid-glass rounded-2xl p-5">
                  <ChapterComments
                    mangaId={manga.mal_id}
                    chapterNumber={selectedChapter}
                  />
                </div>
              </div>
            </div>
          )}

          {(activeTab === "characters" || activeTab === "reviews") && (
            <div className="liquid-glass rounded-2xl p-8 text-center animate-fade-in">
              <p className="text-muted-foreground text-lg font-sacred">Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-2 font-jp">この機能は開発中です</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
