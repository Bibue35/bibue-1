import { useState, memo, forwardRef, lazy, Suspense, useCallback } from "react";
import { Anime, getAnimeById } from "@/lib/api";
import { cn } from "@/lib/utils";
const AnimeDetailModal = lazy(() => import("./AnimeDetailModal").then(m => ({ default: m.AnimeDetailModal })));
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface AnimeCardProps {
  anime: Anime;
  index?: number;
  variant?: "default" | "compact";
  eager?: boolean;
}

export const AnimeCard = memo(forwardRef<HTMLDivElement, AnimeCardProps>(function AnimeCard({ anime, index = 0, variant = "default", eager = false }, ref) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { language } = useLanguage();

  const prefetchDetail = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ["anime", anime.anilist_id, language],
      queryFn: () => getAnimeById(anime.anilist_id, language as any),
      staleTime: 1000 * 60 * 60,
    });
  }, [queryClient, anime.anilist_id, language]);

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          onMouseEnter={prefetchDetail}
          onTouchStart={prefetchDetail}
          className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl transition-all duration-150 group text-left w-full hover:bg-foreground/5 active:scale-[0.98]"
        >
          <img
            src={anime.images.webp.image_url}
            alt={`${anime.title} cover art`}
            width={64}
            height={96}
            loading="lazy"
            decoding="async"
            className="w-14 sm:w-16 aspect-[2/3] object-cover rounded-lg bg-muted"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm sm:text-base truncate group-hover:text-foreground/80 transition-colors">
              {anime.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {anime.genres?.slice(0, 2).map(g => g.name).join(", ")}
            </p>
          </div>
        </button>
        
        {modalOpen && (
          <Suspense fallback={null}>
            <AnimeDetailModal
              animeId={anime.anilist_id}
              open={modalOpen}
              onOpenChange={setModalOpen}
            />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <div
        ref={ref}
        onClick={() => setModalOpen(true)}
        onMouseEnter={prefetchDetail}
        onTouchStart={prefetchDetail}
        className={cn(
          "cursor-pointer group",
          "transition-all duration-200 ease-out",
          "md:hover:-translate-y-1.5 md:hover:shadow-lg md:hover:shadow-black/40",
          "rounded-lg"
        )}
      >
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted">
          <img
            src={anime.images.webp.image_url}
            alt={`${anime.title} cover art`}
            width={190}
            height={285}
            loading={eager ? "eager" : "lazy"}
            decoding={eager ? "sync" : "async"}
            className="w-full h-full object-cover transition-transform duration-200 ease-out md:group-hover:scale-[1.03]"
          />
        </div>
        <p className="text-sm font-medium truncate mt-1.5 px-0.5">{anime.title}</p>
      </div>
      
      {modalOpen && (
        <Suspense fallback={null}>
          <AnimeDetailModal
            animeId={anime.anilist_id}
            open={modalOpen}
            onOpenChange={setModalOpen}
          />
        </Suspense>
      )}
    </>
  );
}));
