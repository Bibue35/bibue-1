import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Eye,
  Calendar,
  Award,
  Settings,
  Users,
  Layers,
} from "lucide-react";

function useCreatorByIdentifier(identifier: string | undefined) {
  return useQuery({
    queryKey: ["creator-profile-public", identifier],
    queryFn: async () => {
      if (!identifier) throw new Error("No identifier");

      // Try by user_id first (UUID format)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      let query = supabase
        .from("creator_profiles")
        .select("*")
        .eq("status", "active");

      if (isUuid) {
        query = query.eq("user_id", identifier);
      } else {
        // Lookup by display_name slug (lowercase, hyphens → spaces)
        const name = decodeURIComponent(identifier).replace(/-/g, " ");
        query = query.ilike("display_name", name);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!identifier,
  });
}

function useCreatorSeries(userId: string | undefined) {
  return useQuery({
    queryKey: ["creator-series-public", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("series")
        .select("*")
        .eq("creator_id", userId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!userId,
  });
}

function useCreatorChapterCount(userId: string | undefined) {
  return useQuery({
    queryKey: ["creator-chapter-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count } = await supabase
        .from("chapters")
        .select("id", { count: "exact", head: true })
        .eq("creator_id", userId)
        .eq("status", "published");
      return count || 0;
    },
    enabled: !!userId,
  });
}

export default function CreatorProfile() {
  const { identifier } = useParams<{ identifier: string }>();
  const { user } = useAuth();
  const { data: creator, isLoading } = useCreatorByIdentifier(identifier);
  const { data: series = [] } = useCreatorSeries(creator?.user_id);
  const { data: chapterCount = 0 } = useCreatorChapterCount(creator?.user_id);

  const isOwnProfile = user?.id === creator?.user_id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-28 pb-16 container mx-auto px-4 max-w-4xl space-y-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-3">Creator Not Found</h1>
          <p className="text-muted-foreground mb-6">This creator profile doesn't exist or isn't active.</p>
          <Button asChild>
            <Link to="/originals">Browse Originals</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const joinedDate = new Date(creator.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${creator.display_name} — Bibue Creator`}
        description={creator.bio || `View ${creator.display_name}'s original series on bibue.net`}
      />
      <CollapsibleNavbar />

      {/* ─── Profile Header ─── */}
      <section className="pt-28 sm:pt-32 pb-10 sm:pb-14">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-5 overflow-hidden border-2 border-border/50 bg-muted">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {creator.display_name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{creator.display_name}</h1>
            {creator.is_verified && (
              <Award className="w-5 h-5 text-primary" />
            )}
          </div>

          {/* Joined date */}
          <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Joined {joinedDate}
          </p>

          {/* Bio */}
          {creator.bio && (
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed mb-6">
              {creator.bio}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            {isOwnProfile ? (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/creator/dashboard">
                  <Settings className="w-4 h-4" /> Edit Profile
                </Link>
              </Button>
            ) : (
              <Button className="gap-2">
                <Users className="w-4 h-4" /> Follow Creator
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid grid-cols-3 divide-x divide-border/50">
            {[
              { icon: Layers, label: "Series", value: series.length },
              { icon: BookOpen, label: "Chapters", value: chapterCount },
              { icon: Eye, label: "Total Views", value: "—" },
            ].map((stat) => (
              <div key={stat.label} className="py-5 px-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <stat.icon className="w-3.5 h-3.5" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Series Grid ─── */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-lg font-semibold mb-6">
            {series.length > 0 ? "Published Series" : "No Series Yet"}
          </h2>

          {series.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {series.map((s) => (
                <Link key={s.id} to={`/originals/${s.id}`} className="group block">
                  <Card className="overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {s.cover_image_url ? (
                        <img
                          src={s.cover_image_url}
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 gap-1 text-xs">
                        <Award className="w-3 h-3" /> Original
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {s.title}
                      </h3>
                      {s.genre_tags && s.genre_tags.length > 0 && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {s.genre_tags.slice(0, 3).join(" • ")}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {s.approved_chapters_count} ch
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> —
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                This creator hasn't published any series yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
