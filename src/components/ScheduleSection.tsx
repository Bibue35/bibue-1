import { useState, useMemo } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeCountdown } from "@/components/EpisodeCountdown";
import { Link } from "react-router-dom";
import { useScheduleByDay } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: "sunday", label: "Sun" },
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
] as const;

export function ScheduleSection() {
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[today].key);
  
  const { data: scheduleData, isLoading } = useScheduleByDay(selectedDay);

  const selectedDayLabel = DAYS.find(d => d.key === selectedDay)?.label || "Today";
  const isToday = DAYS[today].key === selectedDay;

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header with day selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
                {isToday ? "Today's Schedule" : `${selectedDayLabel}'s Schedule`}
              </h2>
              <p className="font-jp text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
                {isToday ? "今日放送" : "放送スケジュール"}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="gap-1 glass-button self-start sm:self-auto text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
            <Link to="/anime?filter=airing">
              <span className="hidden xs:inline">View All</span>
              <span className="xs:hidden">All</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </Button>
        </div>

        {/* Day selector buttons - scrollable on mobile */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {DAYS.map((day, index) => (
            <Button
              key={day.key}
              variant={selectedDay === day.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(day.key)}
              className={cn(
                "flex-shrink-0 min-w-[56px] sm:min-w-[60px] transition-all text-xs sm:text-sm h-9 sm:h-9 active:scale-95",
                selectedDay === day.key 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-background/50 border-border/50 hover:bg-accent"
              )}
            >
              {index === today ? "Today" : day.label}
            </Button>
          ))}
        </div>

        {/* Schedule content */}
        {isLoading ? (
          <HorizontalScroll title="" titleJp="">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                <div className="mb-2">
                  <Skeleton className="h-4 sm:h-5 w-14 sm:w-16 rounded-full" />
                </div>
                <Skeleton className="aspect-[2/3] rounded-xl sm:rounded-2xl" />
              </div>
            ))}
          </HorizontalScroll>
        ) : scheduleData && scheduleData.length > 0 ? (
          <HorizontalScroll title="" titleJp="">
            {scheduleData.map((item, index) => (
              <div key={item.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                {/* Airing time badge + countdown */}
                <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-primary/10 text-primary">
                    {item.airingTime}
                  </span>
                  {item.episode && (
                    <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 rounded bg-accent text-accent-foreground">
                      E{item.episode}
                    </span>
                  )}
                </div>
                {item.airingAt && (
                  <div className="mb-1">
                    <EpisodeCountdown airingAt={item.airingAt} compact />
                  </div>
                )}
                <AnimeCard anime={item.anime} index={index} />
              </div>
            ))}
          </HorizontalScroll>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No anime airing on {selectedDayLabel}</p>
          </div>
        )}
      </div>
    </section>
  );
}
