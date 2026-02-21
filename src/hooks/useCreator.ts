import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCreatorProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["creator-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useRegisterCreator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: { display_name: string; bio?: string; social_links?: Record<string, string> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.from("creator_profiles").insert({
        user_id: user.id,
        display_name: profile.display_name,
        bio: profile.bio || null,
        social_links: profile.social_links || {},
        guidelines_accepted_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-profile"] });
      toast.success("Creator account registered!");
    },
    onError: (e) => toast.error("Registration failed: " + e.message),
  });
}

export function useCreatorSeries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["creator-series", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useCreateSeries() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (series: {
      title: string;
      description?: string;
      genre_tags?: string[];
      cover_image_url?: string;
      content_rating: string;
      language: string;
      reading_direction: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("series").insert({
        creator_id: user.id,
        ...series,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-series"] });
      toast.success("Series created! It will be reviewed by moderators.");
    },
    onError: (e) => toast.error("Failed to create series: " + e.message),
  });
}

export function useSeriesChapters(seriesId: string | undefined) {
  return useQuery({
    queryKey: ["series-chapters", seriesId],
    queryFn: async () => {
      if (!seriesId) return [];
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("series_id", seriesId)
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!seriesId,
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chapter: {
      series_id: string;
      chapter_number: number;
      title?: string;
      status: string;
      scheduled_publish_at?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("chapters").insert({
        creator_id: user.id,
        ...chapter,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["series-chapters", vars.series_id] });
      toast.success("Chapter created!");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });
}

export function useUploadPage() {
  return useMutation({
    mutationFn: async ({ file, seriesId, chapterNum, pageNum }: {
      file: File;
      seriesId: string;
      chapterNum: number;
      pageNum: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/series/${seriesId}/chapters/${chapterNum}/${pageNum}.webp`;
      
      // Upload file directly (browser-side, no server compression for now)
      const { error: uploadError } = await supabase.storage
        .from("creator-uploads")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("creator-uploads")
        .getPublicUrl(path);
      
      return urlData.publicUrl;
    },
  });
}

export function useModerationQueue() {
  return useQuery({
    queryKey: ["moderation-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_moderation_queue")
        .select("*, series(*), chapters(*)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useReviewContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ queueId, action, reason, chapterId, seriesId }: {
      queueId: string;
      action: "approved" | "rejected";
      reason?: string;
      chapterId?: string;
      seriesId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update queue item
      const { error: queueError } = await supabase
        .from("content_moderation_queue")
        .update({
          status: action,
          reviewer_id: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq("id", queueId);
      if (queueError) throw queueError;

      // Update the actual content
      if (chapterId) {
        const newStatus = action === "approved" ? "approved" : "rejected";
        const { error } = await supabase.from("chapters").update({
          status: action === "approved" ? "published" : "rejected",
          rejection_reason: reason || null,
          published_at: action === "approved" ? new Date().toISOString() : null,
        }).eq("id", chapterId);
        if (error) throw error;

        // If rejected, increment creator strikes
        if (action === "rejected") {
          // Get creator_id from chapter
          const { data: chapter } = await supabase.from("chapters").select("creator_id").eq("id", chapterId).single();
          if (chapter) {
            await supabase.rpc("increment_creator_strike" as any, { _creator_id: chapter.creator_id });
          }
        }
      }

      if (seriesId && !chapterId) {
        const { error } = await supabase.from("series").update({
          status: action === "approved" ? "published" : "rejected",
          rejection_reason: reason || null,
        }).eq("id", seriesId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-queue"] });
      toast.success("Content reviewed!");
    },
    onError: (e) => toast.error("Review failed: " + e.message),
  });
}

export function useChapterReports() {
  return useQuery({
    queryKey: ["chapter-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_reports")
        .select("*, chapters(title, series_id, chapter_number, series(title))")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
