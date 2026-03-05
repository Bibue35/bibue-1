import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface ThemeSelectorProps {
  variant?: "icon" | "text";
}

// Cycle: Moonlight (celestial+dark) → Sunlight (celestial+light) → Monochrome (monochrome+dark)
type ThemeState = "moonlight" | "sunlight" | "monochrome";

function getThemeState(flavor: string, resolvedMode: string): ThemeState {
  if (flavor === "monochrome") return "monochrome";
  return resolvedMode === "dark" ? "moonlight" : "sunlight";
}

const labels: Record<ThemeState, string> = {
  moonlight: "Moonlight",
  sunlight: "Sunlight",
  monochrome: "Monochrome",
};

const icons: Record<ThemeState, typeof Moon> = {
  moonlight: Moon,
  sunlight: Sun,
  monochrome: Monitor,
};

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { flavor, resolvedMode, setMode, setFlavor } = useThemeContext();

  const current = getThemeState(flavor, resolvedMode);

  const cycle = useCallback(() => {
    if (current === "moonlight") {
      setFlavor("celestial");
      setMode("light");
    } else if (current === "sunlight") {
      setFlavor("monochrome");
      setMode("dark");
    } else {
      setFlavor("celestial");
      setMode("dark");
    }
  }, [current, setMode, setFlavor]);

  const next: ThemeState = current === "moonlight" ? "sunlight" : current === "sunlight" ? "monochrome" : "moonlight";
  const Icon = icons[current];

  if (variant === "text") {
    return (
      <button
        onClick={cycle}
        className={cn(
          "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left",
          "hover:bg-foreground/5 text-muted-foreground"
        )}
      >
        {labels[current]}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className="rounded-full hover:bg-foreground/5 transition-all group btn-press"
      aria-label={`Switch to ${labels[next]} mode`}
    >
      <Icon className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors" />
    </Button>
  );
}
