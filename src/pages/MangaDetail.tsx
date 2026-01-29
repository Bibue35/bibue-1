import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, Star, Calendar, Heart, Bookmark, ChevronLeft, ChevronRight, MessageCircle, User } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { ChapterComments } from "@/components/ChapterComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ScrollWings, FloatingHalo, AmbientClouds } from "@/components/ScrollWings";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [selectedChapter, setSelectedChapter] = useState(1);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const synopsisRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  const chapters = manga ? generateChapters(manga.chapters || 30) : [];
  const currentChapter = chapters.find(ch => ch.number === selectedChapter);

  return (
    <div className="min-h-screen bg-background relative">
      <CollapsibleNavbar />
      
      {/* Ambient divine elements */}
      <AmbientClouds className="z-0" />

      {/* ============ SECTION 1: READER (Hero) ============ */}
      <section ref={readerRef} className="relative min-h-screen pt-16">
        {isLoading ? (
          <div className="absolute inset-0 pt-20 px-4">
            <Skeleton className="w-full h-[60vh] rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Full background */}
            <div className="absolute inset-0 z-0">
              <img
                src={manga?.images.webp.large_image_url}
                alt={manga?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
            </div>

            {/* Floating halo above title */}
            <FloatingHalo className="absolute top-24 left-1/2 -translate-x-1/2 w-64 z-10" />

            {/* Reader content */}
            <div className="relative z-10 container mx-auto px-4 pt-8 sm:pt-12">
              {/* Title & Quick Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-sacred tracking-wide mb-2">
                  {manga?.title}
                </h1>
                <p className="font-jp text-sm sm:text-base text-muted-foreground mb-2">
                  {manga?.title_japanese}
                </p>
                
                {/* Author */}
                {manga?.authors?.[0] && (
                  <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <User className="w-4 h-4" />
                    By {manga.authors.map(a => a.name).join(", ")}
                  </p>
                )}
                
                {/* Quick stats */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {manga?.score && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-xs sm:text-sm">
                      <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                      <span className="font-bold">{formatScore(manga.score)}</span>
                    </div>
                  )}
                  {manga?.chapters && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-subtle text-xs sm:text-sm">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{manga.chapters} Chapters</span>
                    </div>
                  )}
                  {manga?.status && (
                    <div className="px-3 py-1.5 rounded-full liquid-glass-subtle text-xs sm:text-sm">
                      {manga.status}
                    </div>
                  )}
                </div>
              </div>

              {/* Reader Area */}
              <div className="max-w-4xl mx-auto">
                <div className="liquid-glass-strong rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="aspect-[3/4] sm:aspect-[4/5] flex items-center justify-center bg-muted/10">
                    <div className="text-center px-4">
                      <div className="w-24 h-24 rounded-full liquid-glass flex items-center justify-center mb-4 mx-auto">
                        <BookOpen className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-sacred font-bold mb-2">Chapter {selectedChapter}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{currentChapter?.pages || 20} pages</p>
                      <Button variant="primary" size="lg" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        Start Reading
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chapter selector below reader */}
                <div className="mt-4 sm:mt-6 liquid-glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-sacred font-medium">Chapter {selectedChapter}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        disabled={selectedChapter <= 1}
                        onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">{selectedChapter} / {chapters.length}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        disabled={selectedChapter >= chapters.length}
                        onClick={() => setSelectedChapter(prev => Math.min(chapters.length, prev + 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Chapter grid */}
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {chapters.map((ch) => (
                      <button
                        key={ch.number}
                        onClick={() => setSelectedChapter(ch.number)}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                          selectedChapter === ch.number
                            ? "bg-primary text-primary-foreground scale-105"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {ch.number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <Button variant="primary" size="lg" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Read Chapter {selectedChapter}
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Bookmark className="w-4 h-4" />
                    Add to List
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Scroll down to comments indicator with wings */}
            <div className="relative z-10 mt-8">
              <ScrollWings 
                direction="down" 
                label="View Comments" 
                onClick={() => scrollToSection(commentsRef)}
              />
            </div>
          </>
        )}
      </section>

      {/* ============ SECTION 2: COMMENTS ============ */}
      <section ref={commentsRef} className="relative py-12 sm:py-16 min-h-[80vh]">
        {/* Scroll up to synopsis */}
        <ScrollWings 
          direction="up" 
          label="Synopsis & Info" 
          onClick={() => scrollToSection(synopsisRef)}
          className="mb-8"
        />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-xl sm:text-2xl font-bold font-sacred">Chapter {selectedChapter} Discussion</h2>
            </div>
            
            <div className="liquid-glass rounded-2xl p-4 sm:p-6">
              {manga && (
                <ChapterComments 
                  mangaId={manga.mal_id} 
                  chapterNumber={selectedChapter} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Scroll down to synopsis */}
        <ScrollWings 
          direction="down" 
          label="Synopsis & Details" 
          onClick={() => scrollToSection(synopsisRef)}
          className="mt-8"
        />
      </section>

      {/* ============ SECTION 3: SYNOPSIS & INFO ============ */}
      <section ref={synopsisRef} className="relative py-12 sm:py-16 min-h-screen">
        {/* Scroll up to comments */}
        <ScrollWings 
          direction="up" 
          label="Back to Comments" 
          onClick={() => scrollToSection(commentsRef)}
          className="mb-8"
        />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Synopsis & Cover */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover + Synopsis combined */}
              <div className="liquid-glass rounded-2xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Cover */}
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <div className="relative w-32 sm:w-40 aspect-[2/3] rounded-xl overflow-hidden">
                      <FloatingHalo className="absolute -top-8 left-1/2 -translate-x-1/2 w-32" />
                      <img
                        src={manga?.images.webp.large_image_url}
                        alt={manga?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Synopsis */}
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-sacred mb-3">Synopsis</h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {manga?.synopsis || "No synopsis available."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Genres */}
              {manga?.genres && manga.genres.length > 0 && (
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {manga.genres.map((genre) => (
                      <Link
                        key={genre.mal_id}
                        to={`/manga?genre=${genre.mal_id}`}
                        className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/80 transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Information */}
            <div className="space-y-4">
              <div className="liquid-glass rounded-2xl p-5">
                <h3 className="text-lg font-bold font-sacred mb-4">Information</h3>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: "Type", value: manga?.type },
                    { label: "Chapters", value: manga?.chapters },
                    { label: "Volumes", value: manga?.volumes },
                    { label: "Status", value: manga?.status },
                    { label: "Published", value: manga?.published?.string },
                    { label: "Rank", value: manga?.rank ? `#${manga.rank}` : undefined },
                    { label: "Popularity", value: manga?.popularity ? `#${manga.popularity}` : undefined },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Authors */}
              {manga?.authors && manga.authors.length > 0 && (
                <div className="liquid-glass rounded-2xl p-5">
                  <h3 className="text-lg font-bold font-sacred mb-3">Authors</h3>
                  <div className="flex flex-wrap gap-2">
                    {manga.authors.map((author) => (
                      <span
                        key={author.mal_id}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                      >
                        {author.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll back to reader */}
        <ScrollWings 
          direction="up" 
          label="Back to Reader" 
          onClick={() => scrollToSection(readerRef)}
          className="mt-12"
        />
      </section>
    </div>
  );
}
