import { Moon, Sun, Pen, Shield } from "lucide-react";
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

const themeIcons = {
  dark: <Moon className="h-5 w-5" />,
  light: <Sun className="h-5 w-5" />,
  ink: <Pen className="h-5 w-5" />,
  medieval: <Shield className="h-5 w-5" />,
};

const themeLabels = {
  dark: "Dark Mode",
  light: "Light Mode",
  ink: "Ink & Paper",
  medieval: "Medieval",
};

const themeOptions = [
  { key: "light", icon: <Sun className="h-4 w-4" />, label: "Light" },
  { key: "dark", icon: <Moon className="h-4 w-4" />, label: "Dark" },
  { key: "ink", icon: <Pen className="h-4 w-4" />, label: "Ink & Paper" },
  { key: "medieval", icon: <Shield className="h-4 w-4" />, label: "Medieval" },
] as const;

export function ThemeSelector({ variant = "icon" }: ThemeSelectorProps) {
  const { resolvedMode, setMode } = useThemeContext();

  const icon = themeIcons[resolvedMode] || themeIcons.dark;
  const label = themeLabels[resolvedMode] || themeLabels.dark;

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
          {themeOptions.map((opt) => (
            <DropdownMenuItem key={opt.key} onClick={() => setMode(opt.key)} className="gap-2">
              {opt.icon} {opt.label}
            </DropdownMenuItem>
          ))}
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
        {themeOptions.map((opt) => (
          <DropdownMenuItem key={opt.key} onClick={() => setMode(opt.key)} className="gap-2">
            {opt.icon} {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
