import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface RealtimeCounts {
  newTickets: number;
  newModeration: number;
  newReports: number;
  newSubmissions: number;
}

export function useAdminRealtime() {
  const queryClient = useQueryClient();
  const [counts, setCounts] = useState<RealtimeCounts>({
    newTickets: 0,
    newModeration: 0,
    newReports: 0,
    newSubmissions: 0,
  });

  const clearCount = useCallback((key: keyof RealtimeCounts) => {
    setCounts((prev) => ({ ...prev, [key]: 0 }));
  }, []);

  const clearAll = useCallback(() => {
    setCounts({ newTickets: 0, newModeration: 0, newReports: 0, newSubmissions: 0 });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_tickets" },
        (payload) => {
          setCounts((prev) => ({ ...prev, newTickets: prev.newTickets + 1 }));
          queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
          toast.info("New support ticket", {
            description: (payload.new as any)?.subject || "A user submitted a ticket",
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "content_moderation_queue" },
        (payload) => {
          setCounts((prev) => ({ ...prev, newModeration: prev.newModeration + 1 }));
          queryClient.invalidateQueries({ queryKey: ["admin-moderation"] });
          queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
          toast.info("New moderation item", {
            description: `${(payload.new as any)?.content_type || "Content"} requires review`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "content_reports" },
        (payload) => {
          setCounts((prev) => ({ ...prev, newReports: prev.newReports + 1 }));
          queryClient.invalidateQueries({ queryKey: ["content-reports"] });
          queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
          toast.warning("New content report", {
            description: (payload.new as any)?.report_type || "A user reported content",
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "studio_submissions" },
        (payload) => {
          setCounts((prev) => ({ ...prev, newSubmissions: prev.newSubmissions + 1 }));
          queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
          toast.info("New studio submission", {
            description: (payload.new as any)?.series_title || "A creator submitted work",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Map counts to tab IDs
  const tabBadges: Record<string, number> = {
    support: counts.newTickets,
    moderation: counts.newModeration + counts.newReports,
    studio: counts.newSubmissions,
  };

  return { counts, tabBadges, clearCount, clearAll };
}
