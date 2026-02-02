import { useQuery } from "@tanstack/react-query";
import { Film, BookOpen, Book, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RelatedMediaItem {
  id: number;
  title: string;
  type: "ANIME" | "MANGA";
  format: string;
  relationType: string;
  image: string;
  status?: string;
}

interface RelatedMediaProps {
  mediaId: number;
  mediaType: "anime" | "manga";
  onNavigate?: () => void;
}

const ANILIST_API = "https://graphql.anilist.co";

async function fetchRelatedMedia(mediaId: number, mediaType: "anime" | "manga"): Promise<RelatedMediaItem[]> {
  const type = mediaType.toUpperCase();
  
  const query = `
    query ($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        relations {
          edges {
            relationType
            node {
              id
              title { english romaji }
              type
              format
              status
              coverImage { large medium }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables: { id: mediaId, type } }),
  });

  const json = await response.json();
  const relations = json.data?.Media?.relations?.edges || [];

  // Filter for relevant cross-media relations
  const relevantRelations = relations
    .filter((edge: any) => {
      const node = edge.node;
      // Show opposite media types (anime->manga, manga->anime)
      // Also show light novels for manga
      if (mediaType === "anime") {
        return node.type === "MANGA";
      } else {
        return node.type === "ANIME" || node.format === "NOVEL";
      }
    })
    .map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title.english || edge.node.title.romaji,
      type: edge.node.type,
      format: edge.node.format,
      relationType: formatRelationType(edge.relationType),
      image: edge.node.coverImage?.large || edge.node.coverImage?.medium || "",
      status: edge.node.status,
    }));

  return relevantRelations;
}

function formatRelationType(type: string): string {
  const map: Record<string, string> = {
    SOURCE: "Source Material",
    ADAPTATION: "Adaptation",
    PREQUEL: "Prequel",
    SEQUEL: "Sequel",
    PARENT: "Parent Story",
    SIDE_STORY: "Side Story",
    SPIN_OFF: "Spin-off",
    ALTERNATIVE: "Alternative",
    OTHER: "Related",
  };
  return map[type] || type;
}

function formatMediaType(format: string): string {
  const map: Record<string, string> = {
    TV: "Anime",
    TV_SHORT: "Anime Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MANGA: "Manga",
    NOVEL: "Light Novel",
    ONE_SHOT: "One-shot",
  };
  return map[format] || format;
}

export function RelatedMedia({ mediaId, mediaType, onNavigate }: RelatedMediaProps) {
  const navigate = useNavigate();
  
  const { data: relatedMedia, isLoading } = useQuery({
    queryKey: ["related-media", mediaId, mediaType],
    queryFn: () => fetchRelatedMedia(mediaId, mediaType),
    staleTime: 1000 * 60 * 15,
  });

  const handleClick = (item: RelatedMediaItem) => {
    const path = item.type === "ANIME" ? `/anime/${item.id}` : `/manga/${item.id}`;
    onNavigate?.();
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!relatedMedia || relatedMedia.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        {mediaType === "anime" ? (
          <>
            <BookOpen className="w-4 h-4" />
            Read the Manga
          </>
        ) : (
          <>
            <Film className="w-4 h-4" />
            Watch the Anime
          </>
        )}
      </h3>
      
      <div className="space-y-2">
        {relatedMedia.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all group text-left"
          >
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  item.type === "ANIME" 
                    ? "bg-primary/10 text-primary" 
                    : item.format === "NOVEL"
                      ? "bg-accent/50 text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                )}>
                  {item.type === "ANIME" ? (
                    <span className="flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      {formatMediaType(item.format)}
                    </span>
                  ) : item.format === "NOVEL" ? (
                    <span className="flex items-center gap-1">
                      <Book className="w-3 h-3" />
                      Light Novel
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {formatMediaType(item.format)}
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.relationType}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
