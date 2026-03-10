import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";

export type ThemeFlavor = "default" | "celestial" | "monochrome" | "contrast";

interface ThemeContextType {
  mode: string;
  flavor: ThemeFlavor;
  resolvedMode: "light" | "dark";
  setMode: (mode: string) => void;
  setFlavor: (flavor: ThemeFlavor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [flavor, setFlavorState] = useState<ThemeFlavor>(() => {
    if (typeof window === "undefined") return "celestial";
    return (localStorage.getItem("theme-flavor") as ThemeFlavor) || "celestial";
  });

  // Apply flavor classes to document (next-themes handles dark/light)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-mocha", "theme-latte", "theme-frappe", "theme-macchiato", "theme-crimson-scroll", "theme-celestial", "theme-monochrome", "theme-contrast");
    if (flavor !== "default") {
      root.classList.add(`theme-${flavor}`);
    }
  }, [flavor]);

  // Persist theme to Supabase when user is logged in
  const persistToSupabase = useCallback(async (mode: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          theme: mode,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    } catch {
      // Silent fail — localStorage is the primary store
    }
  }, []);

  // Load theme from Supabase on auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const { data } = await supabase
            .from("user_preferences")
            .select("theme")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (data?.theme && (data.theme === "light" || data.theme === "dark")) {
            setTheme(data.theme);
            localStorage.setItem("bibue-theme", data.theme);
          }
        } catch {
          // Ignore
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setTheme]);

  const setMode = useCallback((newMode: string) => {
    setTheme(newMode);
    localStorage.setItem("bibue-theme", newMode);
    persistToSupabase(newMode);
  }, [setTheme, persistToSupabase]);

  const setFlavor = useCallback((newFlavor: ThemeFlavor) => {
    setFlavorState(newFlavor);
    localStorage.setItem("theme-flavor", newFlavor);
  }, []);

  return (
    <ThemeContext.Provider 
      value={{ 
        mode: theme || "dark", 
        flavor, 
        resolvedMode: (resolvedTheme as "light" | "dark") || "dark", 
        setMode, 
        setFlavor 
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
