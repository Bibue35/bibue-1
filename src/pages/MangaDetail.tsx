import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Calendar, Users, Heart, Share2, Bookmark, ExternalLink, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMangaDetails } from "@/hooks/useAnimeData";
import { formatScore, formatNumber } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function MangaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: manga, isLoading, error } = useMangaDetails(Number(id));
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "characters" | "reviews">("overview");

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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
                <div className="flex-shrink-0">
                  <div className="w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-lg animate-scale-in relative">
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
                <div className="flex-1 min-w-0 animate-fade-up">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {manga?.genres?.slice(0, 4).map((genre) => (
                      <span
                        key={genre.mal_id}
                        className="px-3 py-1 rounded-full liquid-glass-subtle text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                    {manga?.title}
                  </h1>
                  <p className="font-jp text-xl text-muted-foreground mb-4">
                    {manga?.title_japanese}
                  </p>

                  {/* Author */}
                  {manga?.authors?.[0] && (
                    <p className="flex items-center gap-2 text-muted-foreground mb-6">
                      <User className="w-4 h-4" />
                      By {manga.authors.map(a => a.name).join(", ")}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {manga?.score && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-subtle">
                        <Star className="w-5 h-5 text-primary fill-primary" />
                        <span className="font-bold text-lg">{formatScore(manga.score)}</span>
                        <span className="text-muted-foreground text-sm">({formatNumber(manga.scored_by)} votes)</span>
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
                        <Users className="w-5 h-5 text-accent" />
                        <span className="font-bold">{formatNumber(manga.members)}</span>
                        <span className="text-muted-foreground text-sm">Members</span>
                      </div>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
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
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="lg" className="rounded-full gap-2">
                      <BookOpen className="w-5 h-5" />
                      Read Now
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full gap-2">
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
          <div className="flex items-center gap-1 p-1 rounded-xl liquid-glass w-fit mb-8">
            {(["overview", "chapters", "characters", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 rounded-lg text-sm font-medium capitalize transition-all duration-300",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
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

                {/* External links */}
                <div className="liquid-glass rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">External Links</h3>
                  <div className="space-y-2">
                    <a
                      href={`https://myanimelist.net/manga/${manga.mal_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <span className="text-sm">MyAnimeList</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://anilist.co/search/manga?search=${encodeURIComponent(manga.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <span className="text-sm">AniList</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "overview" && (
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
