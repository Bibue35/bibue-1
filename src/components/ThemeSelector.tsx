import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface ThemeSelectorProps {
  variant?: "icon" | "text";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { resolvedMode, setMode, setFlavor } = useThemeContext();

  const toggleTheme = useCallback(() => {
    const goingLight = resolvedMode === "dark";
    setFlavor("celestial");
    setMode(goingLight ? "light" : "dark");
  }, [resolvedMode, setMode, setFlavor]);

  if (variant === "text") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left",
          "hover:bg-foreground/5 text-muted-foreground"
        )}
      >
        {resolvedMode === "dark" ? "Moonlight" : "Sunlight"}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover:bg-foreground/5 transition-all group btn-press"
      aria-label={`Switch to ${resolvedMode === "dark" ? "Sunlight" : "Moonlight"} mode`}
    >
      {resolvedMode === "dark" ? (
        <Moon className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors" />
      ) : (
        <Sun className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors" />
      )}
    </Button>
  );
}
