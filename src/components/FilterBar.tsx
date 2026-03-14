import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FilterState } from "@/hooks/useFilterPreferences";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { SlidersHorizontal } from "lucide-react";

/* ── Genre & Filter Data ─────────────────────── */

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Thriller",
  "Supernatural", "Psychological", "Sports", "Historical",
  "Isekai", "Shounen", "Shoujo", "Seinen", "Josei",
  "School", "Military",
];

const YEARS = [
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2020s", label: "2020s" },
  { value: "2010s", label: "2010s" },
  { value: "classic", label: "Classic" },
];

const STATUSES = [
  { value: "RELEASING", label: "Ongoing" },
  { value: "FINISHED", label: "Completed" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
  { value: "HIATUS", label: "Hiatus" },
];

const SORTS = [
  { value: "popularity", label: "Popular" },
  { value: "score", label: "Top Rated" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alpha", label: "A–Z" },
];

const SCORE_RANGES = [
  { value: 90, label: "9+" },
  { value: 80, label: "8+" },
  { value: 70, label: "7+" },
  { value: 60, label: "6+" },
];

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
  activeCount: number;
  mediaType?: "anime" | "manga";
  typeOptions?: { value: string; label: string }[];
  lockedGenre?: string;
  className?: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  onReset,
  activeCount,
  mediaType = "manga",
  typeOptions,
  lockedGenre,
  className,
}: FilterBarProps) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  const defaultTypeOptions = useMemo(() => {
    if (typeOptions) return typeOptions;
    return mediaType === "manga"
      ? [
          { value: "all", label: "All" },
          { value: "manga", label: "Manga" },
          { value: "manhwa", label: "Manhwa" },
          { value: "manhua", label: "Manhua" },
        ]
      : [
          { value: "all", label: "All" },
          { value: "TV", label: "TV" },
          { value: "MOVIE", label: "Film" },
          { value: "OVA", label: "OVA" },
        ];
  }, [typeOptions, mediaType]);

  // Build summary of active filters for display
  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    const currentSort = SORTS.find(s => s.value === filters.sort);
    if (currentSort && filters.sort !== "popularity") parts.push(currentSort.label);
    if (filters.type) {
      const typeLabel = defaultTypeOptions.find(t => t.value === filters.type)?.label;
      if (typeLabel) parts.push(typeLabel);
    }
    if (filters.genre) parts.push(filters.genre);
    if (filters.year) {
      const yearLabel = YEARS.find(y => y.value === filters.year)?.label;
      if (yearLabel) parts.push(yearLabel);
    }
    if (filters.status) {
      const statusLabel = STATUSES.find(s => s.value === filters.status)?.label;
      if (statusLabel) parts.push(statusLabel);
    }
    if (filters.scoreMin) parts.push(`${filters.scoreMin / 10}+`);
    return parts;
  }, [filters, defaultTypeOptions]);

  const filterContent = (
    <div className={cn("space-y-6", className)}>
      {/* Sort */}
      <FilterSection label="Sort">
        <div className="flex flex-wrap gap-1.5">
          {SORTS.map(s => (
            <Pill
              key={s.value}
              active={filters.sort === s.value}
              onClick={() => onFilterChange("sort", s.value)}
            >
              {s.label}
            </Pill>
          ))}
        </div>
      </FilterSection>

      {/* Type */}
      <FilterSection label="Type">
        <div className="flex flex-wrap gap-1.5">
          {defaultTypeOptions.map(t => (
            <Pill
              key={t.value}
              active={(filters.type || "all") === t.value}
              onClick={() => onFilterChange("type", t.value === "all" ? null : t.value)}
            >
              {t.label}
            </Pill>
          ))}
        </div>
      </FilterSection>

      {/* Genre */}
      {!lockedGenre && (
        <FilterSection label="Genre">
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map(g => (
              <Pill
                key={g}
                active={filters.genre === g}
                onClick={() => onFilterChange("genre", filters.genre === g ? null : g)}
              >
                {g}
              </Pill>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Year */}
      <FilterSection label="Year">
        <div className="flex flex-wrap gap-1.5">
          {YEARS.map(y => (
            <Pill
              key={y.value}
              active={filters.year === y.value}
              onClick={() => onFilterChange("year", filters.year === y.value ? null : y.value)}
            >
              {y.label}
            </Pill>
          ))}
        </div>
      </FilterSection>

      {/* Status */}
      <FilterSection label="Status">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <Pill
              key={s.value}
              active={filters.status === s.value}
              onClick={() => onFilterChange("status", filters.status === s.value ? null : s.value)}
            >
              {s.label}
            </Pill>
          ))}
        </div>
      </FilterSection>

      {/* Score */}
      <FilterSection label="Min Score">
        <div className="flex flex-wrap gap-1.5">
          {SCORE_RANGES.map(s => (
            <Pill
              key={s.value}
              active={filters.scoreMin === s.value}
              onClick={() => onFilterChange("scoreMin", filters.scoreMin === s.value ? null : s.value)}
            >
              {s.label}
            </Pill>
          ))}
        </div>
      </FilterSection>

      {/* Reset */}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          className="text-xs font-medium tracking-wide uppercase text-destructive hover:text-destructive/80 transition-colors btn-press"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 flex-wrap">
          <Drawer>
            <DrawerTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium tracking-wide uppercase transition-all btn-press",
                activeCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground/10 text-foreground hover:bg-foreground/15"
              )}>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
            </DrawerTrigger>
            <DrawerContent className="px-6 pb-8 pt-4 max-h-[85vh] overflow-y-auto">
              <div className="mx-auto w-12 h-1 rounded-full bg-muted mb-6" />
              <h3 className="text-lg font-sacred font-bold tracking-wide mb-6">Filters</h3>
              {filterContent}
            </DrawerContent>
          </Drawer>

          {/* Show active filter chips inline on mobile */}
          {activeFilterSummary.map((label) => (
            <span key={label} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Top bar: Filter toggle + quick sort + type pills + active chips */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-all btn-press",
            activeCount > 0 || expanded
              ? "bg-primary text-primary-foreground"
              : "bg-foreground/10 text-foreground hover:bg-foreground/15"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {expanded ? "Hide Filters" : "Filters"}
          {activeCount > 0 && (
            <span className={cn(
              "text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center",
              expanded ? "bg-primary-foreground text-primary" : "bg-primary-foreground text-primary"
            )}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Active filter summary chips shown inline */}
        {activeFilterSummary.map((label) => (
          <span key={label} className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
            {label}
          </span>
        ))}

        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-[11px] font-medium text-destructive hover:text-destructive/80 transition-colors btn-press ml-auto"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick sort pills always visible */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SORTS.slice(0, 4).map(s => (
          <Pill
            key={s.value}
            active={filters.sort === s.value}
            onClick={() => onFilterChange("sort", s.value)}
          >
            {s.label}
          </Pill>
        ))}
        <span className="w-px h-6 bg-border/20 mx-1 self-center" />
        {defaultTypeOptions.map(t => (
          <Pill
            key={t.value}
            active={(filters.type || "all") === t.value}
            onClick={() => onFilterChange("type", t.value === "all" ? null : t.value)}
          >
            {t.label}
          </Pill>
        ))}
      </div>

      {/* Expanded filter sections */}
      {expanded && (
        <div className="border-t border-border/10 pt-6 animate-fade-up-spring">
          {filterContent}
        </div>
      )}

      {/* Active filter removable chips */}
      {activeCount > 0 && !expanded && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {filters.genre && (
            <ActiveChip label={`Genre: ${filters.genre}`} onRemove={() => onFilterChange("genre", null)} />
          )}
          {filters.year && (
            <ActiveChip label={`Year: ${filters.year}`} onRemove={() => onFilterChange("year", null)} />
          )}
          {filters.status && (
            <ActiveChip label={`Status: ${STATUSES.find(s => s.value === filters.status)?.label || filters.status}`} onRemove={() => onFilterChange("status", null)} />
          )}
          {filters.scoreMin && (
            <ActiveChip label={`Score: ${filters.scoreMin / 10}+`} onRemove={() => onFilterChange("scoreMin", null)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mb-2 block">
        {label}
      </span>
      {children}
    </div>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200 btn-press",
        active
          ? "filter-pill-active"
          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
      )}
    >
      {children}
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors btn-press"
    >
      {label}
      <span className="text-primary/50 ml-0.5">×</span>
    </button>
  );
}