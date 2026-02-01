import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface IncognitoContextType {
  isIncognito: boolean;
  toggleIncognito: () => void;
  hideActivity: boolean;
  toggleHideActivity: () => void;
}

const IncognitoContext = createContext<IncognitoContextType | undefined>(undefined);

export function IncognitoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isIncognito, setIsIncognito] = useState(false);
  const [hideActivity, setHideActivity] = useState(false);

  // Load preferences from database
  useEffect(() => {
    if (!user) {
      setIsIncognito(false);
      setHideActivity(false);
      return;
    }

    const loadPreferences = async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("incognito_mode, hide_activity")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setIsIncognito(data.incognito_mode || false);
        setHideActivity(data.hide_activity || false);
      }
    };

    loadPreferences();
  }, [user]);

  const toggleIncognito = async () => {
    const newValue = !isIncognito;
    setIsIncognito(newValue);

    if (user) {
      await supabase
        .from("user_preferences")
        .upsert({ 
          user_id: user.id, 
          incognito_mode: newValue 
        }, { onConflict: "user_id" });
    }
  };

  const toggleHideActivity = async () => {
    const newValue = !hideActivity;
    setHideActivity(newValue);

    if (user) {
      await supabase
        .from("user_preferences")
        .upsert({ 
          user_id: user.id, 
          hide_activity: newValue 
        }, { onConflict: "user_id" });
    }
  };

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
