import { Moon, Sun, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeSelectorProps {
  variant?: "icon" | "text";
}

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { resolvedMode, setMode } = useThemeContext();

  const icon = resolvedMode === "ink" 
    ? <Pen className="h-5 w-5" /> 
    : resolvedMode === "dark" 
      ? <Moon className="h-5 w-5" /> 
      : <Sun className="h-5 w-5" />;

  const label = resolvedMode === "ink" 
    ? "Ink & Paper" 
    : resolvedMode === "dark" 
      ? "Dark Mode" 
      : "Light Mode";

  if (variant === "text") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left",
              "hover:bg-foreground/5 text-foreground"
            )}
          >
            {label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setMode("light")} className="gap-2">
            <Sun className="h-4 w-4" /> Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("dark")} className="gap-2">
            <Moon className="h-4 w-4" /> Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("ink")} className="gap-2">
            <Pen className="h-4 w-4" /> Ink & Paper
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
          {icon}
          <span className="sr-only">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode("light")} className="gap-2">
          <Sun className="h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")} className="gap-2">
          <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("ink")} className="gap-2">
          <Pen className="h-4 w-4" /> Ink & Paper
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
