import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTheme } from "next-themes";

export type ThemeFlavor = "default" | "mocha" | "latte" | "frappe" | "macchiato";
export type ThemeMode = "light" | "dark" | "system" | "ink";

interface ThemeContextType {
  mode: string;
  flavor: ThemeFlavor;
  resolvedMode: "light" | "dark" | "ink";
  setMode: (mode: string) => void;
  setFlavor: (flavor: ThemeFlavor) => void;
  isInk: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [isInk, setIsInk] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme-ink") === "true";
  });

  const [flavor, setFlavorState] = useState<ThemeFlavor>(() => {
    if (typeof window === "undefined") return "default";
    return (localStorage.getItem("theme-flavor") as ThemeFlavor) || "default";
  });

  // Apply flavor and ink classes
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all flavor classes
    root.classList.remove("theme-mocha", "theme-latte", "theme-frappe", "theme-macchiato", "ink");
    
    if (isInk) {
      root.classList.add("ink");
    } else if (flavor !== "default") {
      root.classList.add(`theme-${flavor}`);
    }
  }, [flavor, isInk]);

  const setMode = (newMode: string) => {
    if (newMode === "ink") {
      setIsInk(true);
      localStorage.setItem("theme-ink", "true");
      // Set underlying theme to light for ink
      setTheme("light");
    } else {
      setIsInk(false);
      localStorage.setItem("theme-ink", "false");
      setTheme(newMode);
    }
  };

  const setFlavor = (newFlavor: ThemeFlavor) => {
    setFlavorState(newFlavor);
    localStorage.setItem("theme-flavor", newFlavor);
  };

  const resolvedMode: "light" | "dark" | "ink" = isInk 
    ? "ink" 
    : (resolvedTheme as "light" | "dark") || "dark";

  return (
    <ThemeContext.Provider 
      value={{ 
        mode: isInk ? "ink" : (theme || "dark"), 
        flavor, 
        resolvedMode,
        setMode, 
        setFlavor,
        isInk,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
