import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mic } from "lucide-react";

interface Character {
  id: number;
  name: string;
  image: string;
  role: string;
  voiceActors?: Array<{
    id: number;
    name: string;
    image: string;
    language: string;
  }>;
}

interface Staff {
  id: number;
  name: string;
  image: string;
  role: string;
}

interface CharactersStaffTabProps {
  mediaId: number;
  mediaType: "anime" | "manga";
}

const ANILIST_API = "https://graphql.anilist.co";

async function fetchCharactersAndStaff(
  mediaId: number,
  mediaType: "anime" | "manga"
): Promise<{ characters: Character[]; staff: Staff[] }> {
  const type = mediaType.toUpperCase();
  
  const query = `
    query ($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        characters(sort: [ROLE, RELEVANCE], perPage: 12) {
          edges {
            role
            node {
              id
              name { full }
              image { large medium }
            }
            voiceActors(language: JAPANESE) {
              id
              name { full }
              image { large medium }
              languageV2
            }
          }
        }
        staff(sort: [RELEVANCE], perPage: 12) {
          edges {
            role
            node {
              id
              name { full }
              image { large medium }
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
  const media = json.data?.Media;

  if (!media) {
    return { characters: [], staff: [] };
  }

  const characters: Character[] = media.characters?.edges?.map((edge: any) => ({
    id: edge.node.id,
    name: edge.node.name.full,
    image: edge.node.image?.large || edge.node.image?.medium || "",
    role: edge.role,
    voiceActors: edge.voiceActors?.map((va: any) => ({
      id: va.id,
      name: va.name.full,
      image: va.image?.large || va.image?.medium || "",
      language: va.languageV2,
    })),
  })) || [];

  const staff: Staff[] = media.staff?.edges?.map((edge: any) => ({
    id: edge.node.id,
    name: edge.node.name.full,
    image: edge.node.image?.large || edge.node.image?.medium || "",
    role: edge.role,
  })) || [];

  return { characters, staff };
}

export function CharactersStaffTab({ mediaId, mediaType }: CharactersStaffTabProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["characters-staff", mediaId, mediaType],
    queryFn: () => fetchCharactersAndStaff(mediaId, mediaType),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold mb-3">Characters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-12 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { characters = [], staff = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Characters */}
      {characters.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Characters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characters.map((char) => (
              <div
                key={char.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <img
                  src={char.image || "/placeholder.svg"}
                  alt={char.name}
                  className="w-12 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{char.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {char.role.toLowerCase()}
                  </p>
                </div>
                {char.voiceActors && char.voiceActors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-medium truncate max-w-[80px]">
                        {char.voiceActors[0].name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Mic className="w-3 h-3" />
                        {char.voiceActors[0].language}
                      </p>
                    </div>
                    <img
                      src={char.voiceActors[0].image || "/placeholder.svg"}
                      alt={char.voiceActors[0].name}
                      className="w-10 h-14 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff */}
      {staff.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4">Production Staff</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {staff.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <img
                  src={person.image || "/placeholder.svg"}
                  alt={person.name}
                  className="w-10 h-14 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {person.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {characters.length === 0 && staff.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No character or staff information available</p>
        </div>
      )}
    </div>
  );
}
