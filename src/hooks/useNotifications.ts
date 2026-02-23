import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback } from "react";

export interface Notification {
  id: string;
  user_id: string;
  media_id: number;
  media_type: string;
  type: string;
  message: string;
  title: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const createNotification = useCallback(
    async (notification: {
      media_id: number;
      media_type: string;
      type: string;
      message: string;
      title: string;
      image_url?: string;
    }) => {
      if (!user) return;
      // Check for duplicate (same media_id + type + message within last 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("media_id", notification.media_id)
        .eq("type", notification.type)
        .eq("message", notification.message)
        .gte("created_at", oneDayAgo)
        .limit(1);

      if (existing && existing.length > 0) return; // Already notified

      await supabase.from("notifications").insert({
        user_id: user.id,
        ...notification,
        image_url: notification.image_url || null,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    [user, queryClient]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
}

export function useNotificationPreference(mediaId: number, mediaType: "anime" | "manga") {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preference } = useQuery({
    queryKey: ["notification-pref", user?.id, mediaId, mediaType],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isEnabled = preference?.enabled ?? false;

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const newValue = !isEnabled;
      
      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          {
            user_id: user.id,
            media_id: mediaId,
            media_type: mediaType,
            enabled: newValue,
          },
          { onConflict: "user_id,media_id,media_type" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-pref", user?.id, mediaId, mediaType] });
    },
  });

  return { isEnabled, toggle };
}
