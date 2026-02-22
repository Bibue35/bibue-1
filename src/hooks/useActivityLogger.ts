import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIncognito } from "@/contexts/IncognitoContext";
import type { Json } from "@/integrations/supabase/types";

interface ActivityDetails {
  score?: number;
  episode?: number;
  chapter?: number;
  [key: string]: Json | undefined;
}

export function useActivityLogger() {
  const { user } = useAuth();
  const { isIncognito } = useIncognito();

  const logActivity = async (
    activityType: string,
    malId: number,
    mediaType: "anime" | "manga",
    title: string,
    imageUrl?: string | null,
    details?: ActivityDetails
  ) => {
    // Don't log anything if user is in incognito mode
    if (isIncognito) {
      // Activity not logged in incognito mode
      return;
    }

    if (!user) return;

    try {
      await supabase.from("activity_logs").insert([{
        user_id: user.id,
        activity_type: activityType,
        mal_id: malId,
        media_type: mediaType,
        title,
        image_url: imageUrl || null,
        details: details || {},
      }]);
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  return { logActivity, isIncognito };
}
