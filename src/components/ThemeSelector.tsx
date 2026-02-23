import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  variant?: "icon" | "text";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { resolvedMode, setMode } = useThemeContext();

  const toggleTheme = () => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  };

  if (variant === "text") {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left",
          "hover:bg-foreground/5",
          resolvedMode === "dark"
            ? "text-blue-400"
            : "text-amber-500"
        )}
      >
        {resolvedMode === "dark" ? "Dark Mode" : "Light Mode"}
      </button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full hover:bg-foreground/5 transition-colors"
    >
      {resolvedMode === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
