import { useState, useMemo } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeCountdown } from "@/components/EpisodeCountdown";
import { Link } from "react-router-dom";
import { useScheduleByDay } from "@/hooks/useAnimeData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
// flavor used for conditional liquid-glass styling

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const DAY_TRANSLATION_KEYS = ["days.sun", "days.mon", "days.tue", "days.wed", "days.thu", "days.fri", "days.sat"] as const;

export function ScheduleSection() {
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<string>(DAY_KEYS[today]);
  const { t, language } = useLanguage();
  const { flavor } = useThemeContext();
  
  const { data: scheduleData, isLoading } = useScheduleByDay(selectedDay);

  const selectedDayLabel = t(DAY_TRANSLATION_KEYS[DAY_KEYS.indexOf(selectedDay as typeof DAY_KEYS[number])]);
  const isToday = DAY_KEYS[today] === selectedDay;

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
              <h2
                className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight"
              >
                {isToday ? t("schedule.todaySchedule") : `${selectedDayLabel}${t("schedule.daySchedule")}`}
              </h2>
              {language === "ja" && (
                <p className="font-jp text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">
                  {isToday ? t("schedule.todayScheduleJp") : t("schedule.broadcastSchedule")}
                </p>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="gap-1 glass-button self-start sm:self-auto text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
            <Link to="/anime?filter=airing">
              <span className="hidden xs:inline">{t("schedule.viewAll")}</span>
              <span className="xs:hidden">{t("schedule.all")}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </Button>
        </div>

        {/* Day selector buttons */}
        <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {DAY_KEYS.map((dayKey, index) => (
            <Button
              key={dayKey}
              variant={selectedDay === dayKey ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDay(dayKey)}
              className={cn(
                "flex-shrink-0 min-w-[56px] sm:min-w-[60px] transition-all text-xs sm:text-sm h-9 sm:h-9 active:scale-95",
                selectedDay === dayKey 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "bg-background/50 border-border/50 hover:bg-accent"
              )}
            >
              {index === today ? t("schedule.today") : t(DAY_TRANSLATION_KEYS[index])}
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
              <div key={item.anilist_id} className={cn("flex-shrink-0 w-28 sm:w-36 md:w-44", isToday && "liquid-frosted rounded-xl p-1.5")}>
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
            <p>{t("schedule.noAnime")} {selectedDayLabel}</p>
          </div>
        )}
      </div>
    </section>
  );
}
