import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { ThemeTransitionOverlay, useThemeTransition } from "./ThemeTransitionOverlay";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface ThemeSelectorProps {
  variant?: "icon" | "text";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { resolvedMode, setMode, setFlavor } = useThemeContext();
  const { direction, trigger, handleComplete } = useThemeTransition();

  const toggleTheme = useCallback(() => {
    const goingLight = resolvedMode === "dark";
    // Ensure celestial flavor is active for the transition
    setFlavor("celestial");
    // Trigger the animated overlay
    trigger(goingLight ? "to-sun" : "to-moon");
    // Apply mode change after a short delay so overlay covers the switch
    setTimeout(() => {
      setMode(goingLight ? "light" : "dark");
    }, 500);
  }, [resolvedMode, setMode, setFlavor, trigger]);

  if (variant === "text") {
    return (
      <>
        <button
          onClick={toggleTheme}
          className={cn(
            "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left flex items-center gap-3",
            "hover:bg-foreground/5",
            resolvedMode === "dark"
              ? "text-muted-foreground"
              : "text-muted-foreground"
          )}
        >
          {resolvedMode === "dark" ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-primary" />
          )}
          {resolvedMode === "dark" ? "Moonlight Mode" : "Sunlight Mode"}
        </button>
        <ThemeTransitionOverlay direction={direction} onComplete={handleComplete} />
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full hover:bg-foreground/5 transition-colors relative group"
      >
        <div className="relative">
          {resolvedMode === "dark" ? (
            <Moon className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors" />
          ) : (
            <Sun className="h-5 w-5 text-foreground/80 group-hover:text-foreground transition-colors" />
          )}
        </div>
        <span className="sr-only">
          Switch to {resolvedMode === "dark" ? "Sunlight" : "Moonlight"} mode
        </span>
      </Button>
      <ThemeTransitionOverlay direction={direction} onComplete={handleComplete} />
    </>
  );
}
