import { Moon, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext, ThemeFlavor } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeSelectorProps {
  variant?: "icon" | "text";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { resolvedMode, setMode, flavor, setFlavor } = useThemeContext();

  const toggleTheme = () => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  };

  const isLiquidGlass = flavor === "liquid-glass";

  if (variant === "text") {
    return (
      <div className="space-y-0.5">
        <button
          onClick={toggleTheme}
          className={cn(
            "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left",
          "hover:bg-foreground/5",
          resolvedMode === "dark"
            ? "text-primary"
            : "text-primary"
          )}
        >
          {resolvedMode === "dark" ? "Dark Mode" : "Light Mode"}
        </button>
        <button
          onClick={() => setFlavor(isLiquidGlass ? "default" : "liquid-glass")}
          className={cn(
            "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left flex items-center gap-2",
            "hover:bg-foreground/5",
            isLiquidGlass
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <Sparkles className="w-4 h-4" />
          {isLiquidGlass ? "Liquid Glass ✓" : "Liquid Glass"}
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-foreground/5 transition-colors"
        >
          {isLiquidGlass ? (
            <Sparkles className="h-5 w-5" />
          ) : resolvedMode === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Theme options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem onClick={toggleTheme}>
          {resolvedMode === "dark" ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setFlavor(isLiquidGlass ? "default" : "liquid-glass")}
          className={cn(isLiquidGlass && "text-primary")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Liquid Glass {isLiquidGlass && "✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
