import { useState, useMemo } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { Skeleton } from "@/components/ui/skeleton";
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
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* Header with day selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {isToday ? "Today's Schedule" : `${selectedDayLabel}'s Schedule`}
              </h2>
              <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">
                {isToday ? "今日放送" : "放送スケジュール"}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="gap-1 glass-button self-start sm:self-auto" asChild>
            <Link to="/anime?filter=airing">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Day selector buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {DAYS.map((day, index) => (
            <Button
              key={day.key}
              variant={selectedDay === day.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(day.key)}
              className={cn(
                "flex-shrink-0 min-w-[60px] transition-all",
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
              <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                <div className="mb-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="aspect-[2/3] rounded-2xl" />
              </div>
            ))}
          </HorizontalScroll>
        ) : scheduleData && scheduleData.length > 0 ? (
          <HorizontalScroll title="" titleJp="">
            {scheduleData.map((item, index) => (
              <div key={item.anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                {/* Airing time badge */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    {item.airingTime}
                  </span>
                  {item.episode && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground">
                      E{item.episode}
                    </span>
                  )}
                </div>
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
