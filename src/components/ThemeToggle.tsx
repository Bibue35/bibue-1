import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const getIcon = () => {
    if (theme === "divine") {
      return <Sparkles className="h-5 w-5" />;
    }
    if (resolvedTheme === "dark") {
      return <Moon className="h-5 w-5" />;
    }
    return <Sun className="h-5 w-5" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent transition-colors"
        >
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>Sunlight</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>Moonlight</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("divine")}
          className="gap-2 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Divine</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}