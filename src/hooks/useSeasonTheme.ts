import { useMemo } from "react";

export type AnimeSeason = "winter" | "spring" | "summer" | "fall";

interface SeasonTheme {
  season: AnimeSeason;
  label: string;
  accentHsl: string; // For CSS custom property override
  glowColor: string; // For subtle ambient effects
}

function getCurrentSeason(): AnimeSeason {
  const month = new Date().getMonth(); // 0-based
  if (month >= 0 && month <= 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "fall";
}

const SEASON_THEMES: Record<AnimeSeason, SeasonTheme> = {
  winter: {
    season: "winter",
    label: "Winter",
    accentHsl: "210 80% 65%",
    glowColor: "210 70% 70% / 0.15",
  },
  spring: {
    season: "spring",
    label: "Spring",
    accentHsl: "340 70% 70%",
    glowColor: "340 65% 75% / 0.15",
  },
  summer: {
    season: "summer",
    label: "Summer",
    accentHsl: "28 90% 55%",
    glowColor: "28 85% 60% / 0.15",
  },
  fall: {
    season: "fall",
    label: "Fall",
    accentHsl: "15 75% 50%",
    glowColor: "15 70% 55% / 0.15",
  },
};

export function useSeasonTheme() {
  return useMemo(() => {
    const season = getCurrentSeason();
    return SEASON_THEMES[season];
  }, []);
}
