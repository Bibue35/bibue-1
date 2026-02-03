import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ContentReport {
  id: string;
  user_id: string;
  content_type: string;
  content_id: number;
  content_title: string;
  report_type: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  reporter?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface UserWithProfile {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string | null;
  created_at: string;
  is_public: boolean;
  role?: string;
  is_banned?: boolean;
  ban_reason?: string;
  ban_expires_at?: string | null;
}

interface UserBan {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  expires_at: string | null;
  created_at: string;
}

// Check if current user has moderator or admin role
export function useIsModeratorOrAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role-check", user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "moderator"]);

      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user?.id,
  });
}

// Fetch content reports
export function useReports(status?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["content-reports", status],
    queryFn: async (): Promise<ContentReport[]> => {
      if (!user?.id) return [];

      let query = supabase
        .from("content_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data: reports, error } = await query;
      if (error) throw error;
      if (!reports || reports.length === 0) return [];

      // Fetch reporter profiles
      const reporterIds = [...new Set(reports.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", reporterIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return reports.map((report) => ({
        ...report,
        reporter: profileMap.get(report.user_id) || undefined,
      }));
    },
    enabled: !!user?.id,
  });
}

// Update report status
export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
    }: {
      reportId: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from("content_reports")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-reports"] });
      toast.success("Report status updated");
    },
    onError: (error) => {
      toast.error("Failed to update report: " + error.message);
    },
  });
}

// Fetch users with their roles and ban status
export function useUsers(searchQuery?: string) {
  return useQuery({
    queryKey: ["admin-users", searchQuery],
    queryFn: async (): Promise<UserWithProfile[]> => {
      // Fetch profiles
      let query = supabase
        .from("profiles")
        .select("user_id, username, avatar_url, display_name, created_at, is_public")
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchQuery) {
        query = query.ilike("username", `%${searchQuery}%`);
      }

      const { data: profiles, error: profilesError } = await query;
      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map((p) => p.user_id);

      // Fetch roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Fetch active bans
      const { data: bans } = await supabase
        .from("user_bans")
        .select("*")
        .in("user_id", userIds)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) || []);
      const banMap = new Map(bans?.map((b) => [b.user_id, b]) || []);

      return profiles.map((profile) => {
        const ban = banMap.get(profile.user_id);
        return {
          ...profile,
          role: roleMap.get(profile.user_id) || "user",
          is_banned: !!ban,
          ban_reason: ban?.reason,
          ban_expires_at: ban?.expires_at,
        };
      });
    },
  });
}

// Ban a user
export function useBanUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      expiresAt,
    }: {
      userId: string;
      reason: string;
      expiresAt?: string | null;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("user_bans").insert({
        user_id: userId,
        banned_by: user.id,
        reason,
        expires_at: expiresAt || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User banned successfully");
    },
    onError: (error) => {
      toast.error("Failed to ban user: " + error.message);
    },
  });
}

// Unban a user (remove ban record)
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_bans")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User unbanned successfully");
    },
    onError: (error) => {
      toast.error("Failed to unban user: " + error.message);
    },
  });
}

// Update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "moderator" | "user";
    }) => {
      // First, delete any existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Then insert the new role (if not 'user', as 'user' is default)
      if (role !== "user") {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
    },
    onError: (error) => {
      toast.error("Failed to update role: " + error.message);
    },
  });
}

// Get report statistics
export function useReportStats() {
  return useQuery({
    queryKey: ["report-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_reports")
        .select("status");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((r) => r.status === "pending").length || 0,
        resolved: data?.filter((r) => r.status === "resolved").length || 0,
        dismissed: data?.filter((r) => r.status === "dismissed").length || 0,
      };

      return stats;
    },
  });
}
