import { useState } from "react";
import { Filter, X, Calendar, Tv, Building2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterState {
  year?: number;
  season?: string;
  format?: string;
  status?: string;
  sort: string;
}

interface AdvancedFiltersProps {
  type: "anime" | "manga";
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

const seasons = [
  { value: "WINTER", label: "Winter" },
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "FALL", label: "Fall" },
];

const animeFormats = [
  { value: "TV", label: "TV" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "MOVIE", label: "Movie" },
  { value: "SPECIAL", label: "Special" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music" },
];

const mangaFormats = [
  { value: "MANGA", label: "Manga" },
  { value: "NOVEL", label: "Light Novel" },
  { value: "ONE_SHOT", label: "One-shot" },
];

const animeStatus = [
  { value: "RELEASING", label: "Airing" },
  { value: "FINISHED", label: "Finished" },
  { value: "NOT_YET_RELEASED", label: "Not Yet Aired" },
  { value: "CANCELLED", label: "Cancelled" },
];

const mangaStatus = [
  { value: "RELEASING", label: "Publishing" },
  { value: "FINISHED", label: "Finished" },
  { value: "NOT_YET_RELEASED", label: "Not Yet Released" },
  { value: "HIATUS", label: "On Hiatus" },
];

const sortOptions = [
  { value: "POPULARITY_DESC", label: "Popularity" },
  { value: "SCORE_DESC", label: "Score" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "START_DATE_DESC", label: "Newest" },
  { value: "FAVOURITES_DESC", label: "Favorites" },
  { value: "TITLE_ROMAJI", label: "Title A-Z" },
];

export function AdvancedFilters({ type, filters, onFiltersChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const formats = type === "anime" ? animeFormats : mangaFormats;
  const statuses = type === "anime" ? animeStatus : mangaStatus;

  const activeFilterCount = [
    filters.year,
    filters.season,
    filters.format,
    filters.status,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({ sort: filters.sort });
  };

  const updateFilter = (key: keyof FilterState, value: string | number | undefined) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sort Dropdown */}
      <Select
        value={filters.sort}
        onValueChange={(value) => updateFilter("sort", value)}
      >
        <SelectTrigger className="w-40 rounded-full">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "gap-2 rounded-full",
              activeFilterCount > 0 && "border-primary text-primary"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Year
              </label>
              <Select
                value={filters.year?.toString() || ""}
                onValueChange={(value) => updateFilter("year", value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Any year" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="">Any year</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Season (Anime only) */}
            {type === "anime" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Season</label>
                <Select
                  value={filters.season || ""}
                  onValueChange={(value) => updateFilter("season", value || undefined)}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Any season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any season</SelectItem>
                    {seasons.map((season) => (
                      <SelectItem key={season.value} value={season.value}>
                        {season.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tv className="w-4 h-4" />
                Format
              </label>
              <Select
                value={filters.format || ""}
                onValueChange={(value) => updateFilter("format", value || undefined)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Any format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any format</SelectItem>
                  {formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => updateFilter("status", value || undefined)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.year && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter("year", undefined)}
            >
              {filters.year}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.season && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter("season", undefined)}
            >
              {seasons.find(s => s.value === filters.season)?.label}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.format && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter("format", undefined)}
            >
              {formats.find(f => f.value === filters.format)?.label}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {filters.status && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => updateFilter("status", undefined)}
            >
              {statuses.find(s => s.value === filters.status)?.label}
              <X className="w-3 h-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
