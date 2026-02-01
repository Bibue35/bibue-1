import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface IncognitoContextType {
  isIncognito: boolean;
  toggleIncognito: () => void;
  hideActivity: boolean;
  toggleHideActivity: () => void;
}

const IncognitoContext = createContext<IncognitoContextType | undefined>(undefined);

export function IncognitoProvider({ children }: { children: ReactNode }) {
  const [isIncognito, setIsIncognito] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth state changes directly from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
      if (!session?.user) {
        setIsIncognito(false);
        setHideActivity(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load preferences from database when user changes
  useEffect(() => {
    if (!userId) {
      setIsIncognito(false);
      setHideActivity(false);
      return;
    }

    const loadPreferences = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("incognito_mode, hide_activity")
        .eq("user_id", userId)
        .single();

      if (data) {
        setIsIncognito(data.incognito_mode || false);
        setHideActivity(data.hide_activity || false);
      }
    };

    loadPreferences();
  }, [userId]);

  const toggleIncognito = useCallback(async () => {
    const newValue = !isIncognito;
    setIsIncognito(newValue);

    if (userId) {
      await supabase
        .from("user_preferences")
        .upsert({ 
          user_id: userId, 
          incognito_mode: newValue 
        }, { onConflict: "user_id" });
    }
  }, [isIncognito, userId]);

  const toggleHideActivity = useCallback(async () => {
    const newValue = !hideActivity;
    setHideActivity(newValue);

    if (userId) {
      await supabase
        .from("user_preferences")
        .upsert({ 
          user_id: userId, 
          hide_activity: newValue 
        }, { onConflict: "user_id" });
    }
  }, [hideActivity, userId]);

  return (
    <IncognitoContext.Provider value={{ isIncognito, toggleIncognito, hideActivity, toggleHideActivity }}>
      {children}
    </IncognitoContext.Provider>
  );
}

export function useIncognito() {
  const context = useContext(IncognitoContext);
  if (context === undefined) {
    throw new Error("useIncognito must be used within an IncognitoProvider");
  }
  return context;
}
