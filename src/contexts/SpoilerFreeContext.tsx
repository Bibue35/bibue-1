import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SpoilerFreeContextType {
  isSpoilerFree: boolean;
  toggleSpoilerFree: () => void;
}

const SpoilerFreeContext = createContext<SpoilerFreeContextType | undefined>(undefined);

export function SpoilerFreeProvider({ children }: { children: ReactNode }) {
  const [isSpoilerFree, setIsSpoilerFree] = useState(() => {
    // Check localStorage for initial value (works without auth)
    return localStorage.getItem("bibue-spoiler-free") === "true";
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const toggleSpoilerFree = useCallback(() => {
    const newValue = !isSpoilerFree;
    setIsSpoilerFree(newValue);
    localStorage.setItem("bibue-spoiler-free", String(newValue));
  }, [isSpoilerFree]);

  return (
    <SpoilerFreeContext.Provider value={{ isSpoilerFree, toggleSpoilerFree }}>
      {children}
    </SpoilerFreeContext.Provider>
  );
}

export function useSpoilerFree() {
  const context = useContext(SpoilerFreeContext);
  if (context === undefined) {
    throw new Error("useSpoilerFree must be used within a SpoilerFreeProvider");
  }
  return context;
}
