import { useState, useCallback, useEffect } from "react";

export interface FilterState {
  genre: string | null;
  year: string | null;
  status: string | null;
  type: string | null;
  sort: string;
  scoreMin: number | null;
  search: string;
  chaptersMin: number | null;
}

const DEFAULT_FILTERS: FilterState = {
  genre: null,
  year: null,
  status: null,
  type: null,
  sort: "popularity",
  scoreMin: null,
  search: "",
  chaptersMin: null,
};

const STORAGE_KEY = "bibue_filter_prefs";

function loadPrefs(context: string): FilterState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_FILTERS;
    const all = JSON.parse(stored);
    return { ...DEFAULT_FILTERS, ...all[context] };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function savePrefs(context: string, filters: FilterState) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const all = stored ? JSON.parse(stored) : {};
    all[context] = filters;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function useFilterPreferences(context: string) {
  const [filters, setFilters] = useState<FilterState>(() => loadPrefs(context));

  useEffect(() => {
    savePrefs(context, filters);
  }, [context, filters]);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeCount = [
    filters.genre,
    filters.year,
    filters.status,
    filters.type,
    filters.sort !== "popularity" ? filters.sort : null,
    filters.scoreMin,
    filters.chaptersMin,
  ].filter(Boolean).length;

  return { filters, updateFilter, resetFilters, setFilters, activeCount };
}
