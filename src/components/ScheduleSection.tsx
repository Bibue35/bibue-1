import { useState, useEffect } from "react";
import { Calendar, Clock, Play } from "lucide-react";
import { useSchedule } from "@/hooks/useAnimeData";
import { Anime, formatScore } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const days = [
  { key: "monday", label: "Mon", labelFull: "Monday" },
  { key: "tuesday", label: "Tue", labelFull: "Tuesday" },
  { key: "wednesday", label: "Wed", labelFull: "Wednesday" },
  { key: "thursday", label: "Thu", labelFull: "Thursday" },
  { key: "friday", label: "Fri", labelFull: "Friday" },
  { key: "saturday", label: "Sat", labelFull: "Saturday" },
  { key: "sunday", label: "Sun", labelFull: "Sunday" },
];

export function ScheduleSection() {
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return today;
  });
  
  const { data: schedule, isLoading } = useSchedule(selectedDay);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-anime flex items-center justify-center shadow-neon">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Airing Schedule
              </h2>
              <p className="font-jp text-muted-foreground">放送予定</p>
            </div>
          </div>

          {/* Day selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass">
            {days.map((day) => (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={cn(
                  "px-3 md:px-4 py-2 rounded-lg font-display text-xs md:text-sm uppercase tracking-wider transition-all duration-300",
                  selectedDay === day.key
                    ? "bg-gradient-anime text-primary-foreground shadow-neon"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="hidden md:inline">{day.labelFull}</span>
                <span className="md:hidden">{day.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-28 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : schedule && schedule.length > 0 ? (
            schedule.slice(0, 12).map((anime: Anime, index: number) => (
              <div
                key={anime.mal_id}
                className="group glass rounded-xl p-4 hover:border-primary/50 transition-all duration-300 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={anime.images.webp.image_url}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {anime.title}
                    </h3>
                    <p className="font-jp text-xs text-muted-foreground truncate mt-1">
                      {anime.title_japanese}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {anime.score && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-display">
                          ★ {formatScore(anime.score)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="truncate">
                        {anime.status || "Airing"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No anime scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
