import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Owner / Admin access check ───
const OWNER_EMAILS = ["ltenantdelatour@gmail.com", "louis.tenantdelatour@gmail.com", "ltdlt@bibue.net"];

export function useIsOwnerOrAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["owner-admin-check", user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      if (user.email && OWNER_EMAILS.includes(user.email)) return true;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });
}

// ─── Enhanced Overview stats — all parallel ───
export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [
        creators, series, chapters, reports, payouts, wishlist,
        totalUsers, discussions, tickets, follows, watchlistItems,
        recentUsers, recentSeries, recentTickets, dmcaRequests
      ] = await Promise.all([
        supabase.from("creator_profiles").select("id", { count: "exact", head: true }),
        supabase.from("series").select("id", { count: "exact", head: true }),
        supabase.from("chapters").select("id", { count: "exact", head: true }),
        supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("payouts").select("amount, status"),
        supabase.from("subscription_wishlist").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("discussions").select("id", { count: "exact", head: true }),
        supabase.from("support_tickets").select("id, status", { count: "exact" }),
        supabase.from("user_follows").select("id", { count: "exact", head: true }),
        supabase.from("watchlist").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("user_id, username, display_name, avatar_url, created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("series").select("id, title, status, cover_image_url, created_at, creator_profiles!series_creator_id_fkey(display_name)").order("created_at", { ascending: false }).limit(6),
        supabase.from("support_tickets").select("id, subject, status, category, is_creator_priority, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("dmca_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const pendingPayouts = payouts.data?.filter(p => p.status === "pending") || [];
      const totalPending = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPaid = (payouts.data?.filter(p => p.status === "paid") || []).reduce((sum, p) => sum + Number(p.amount), 0);

      const openTickets = (tickets.data || []).filter(t => t.status === "open" || t.status === "in-progress").length;

      return {
        totalCreators: creators.count || 0,
        totalSeries: series.count || 0,
        totalChapters: chapters.count || 0,
        pendingReports: reports.count || 0,
        pendingPayoutAmount: totalPending,
        totalPaid,
        subscriptionWishlist: wishlist.count || 0,
        totalUsers: totalUsers.count || 0,
        totalDiscussions: discussions.count || 0,
        totalTickets: tickets.count || 0,
        openTickets,
        totalFollows: follows.count || 0,
        totalWatchlistItems: watchlistItems.count || 0,
        pendingDMCA: dmcaRequests.count || 0,
        recentUsers: recentUsers.data || [],
        recentSeries: recentSeries.data || [],
        recentTickets: recentTickets.data || [],
      };
    },
    staleTime: 30_000, // Cache for 30s to avoid re-fetching on tab switches
  });
}

// ─── All creators with details ───
export function useAdminCreators(search?: string) {
  return useQuery({
    queryKey: ["admin-creators", search],
    queryFn: async () => {
      let query = supabase
        .from("creator_profiles")
        .select("*, series(count)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (search) {
        query = query.ilike("display_name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const userIds = (data || []).map(c => c.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return (data || []).map(c => ({
        ...c,
        username: profileMap.get(c.user_id)?.username || c.display_name,
        seriesCount: c.series?.[0]?.count || 0,
      }));
    },
    staleTime: 30_000,
  });
}

// ─── All series with creator info ───
export function useAdminSeries(search?: string) {
  return useQuery({
    queryKey: ["admin-series", search],
    queryFn: async () => {
      let query = supabase
        .from("series")
        .select("*, chapters(count), creator_profiles!series_creator_id_fkey(display_name)")
        .order("updated_at", { ascending: false })
        .limit(200);

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(s => ({
        ...s,
        creatorName: (s as any).creator_profiles?.display_name || "Unknown",
        chaptersCount: s.chapters?.[0]?.count || 0,
      }));
    },
    staleTime: 30_000,
  });
}

// ─── Content moderation queue ───
export function useAdminModeration(statusFilter: string = "pending") {
  return useQuery({
    queryKey: ["admin-moderation", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("content_moderation_queue")
        .select("*, series(title, content_rating, language, reading_direction, cover_image_url), chapters(chapter_number, title)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const creatorIds = [...new Set((data || []).map(d => d.creator_id))];
      const { data: profiles } = await supabase
        .from("creator_profiles")
        .select("user_id, display_name")
        .in("user_id", creatorIds);

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      return (data || []).map(item => ({
        ...item,
        creatorName: nameMap.get(item.creator_id) || "Unknown",
      }));
    },
    staleTime: 15_000,
  });
}

export function useAdminModerationCounts() {
  return useQuery({
    queryKey: ["admin-moderation-counts"],
    queryFn: async () => {
      const [pending, approved, rejected] = await Promise.all([
        supabase.from("content_moderation_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("content_moderation_queue").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("content_moderation_queue").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      ]);
      return {
        pending: pending.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0,
        total: (pending.count || 0) + (approved.count || 0) + (rejected.count || 0),
      };
    },
    staleTime: 30_000,
  });
}

export function useBulkModerationAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemIds, action, chapterIds }: { itemIds: string[]; action: "approved" | "rejected"; chapterIds?: (string | null)[] }) => {
      const { error } = await supabase
        .from("content_moderation_queue")
        .update({ status: action, reviewed_at: new Date().toISOString() })
        .in("id", itemIds);
      if (error) throw error;

      if (action === "approved" && chapterIds) {
        const validIds = chapterIds.filter(Boolean) as string[];
        if (validIds.length > 0) {
          await supabase
            .from("chapters")
            .update({ status: "published", published_at: new Date().toISOString() })
            .in("id", validIds);
        }
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-moderation"] });
      queryClient.invalidateQueries({ queryKey: ["admin-moderation-counts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      toast.success(`${vars.itemIds.length} item(s) ${vars.action}`);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useApproveModerationItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, chapterId }: { itemId: string; chapterId?: string | null }) => {
      const { error } = await supabase
        .from("content_moderation_queue")
        .update({ status: "approved", reviewed_at: new Date().toISOString() })
        .eq("id", itemId);
      if (error) throw error;

      if (chapterId) {
        await supabase
          .from("chapters")
          .update({ status: "published", published_at: new Date().toISOString() })
          .eq("id", chapterId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-moderation"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      toast.success("Approved!");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useRejectModerationItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, reason }: { itemId: string; reason: string }) => {
      const { error } = await supabase
        .from("content_moderation_queue")
        .update({ status: "rejected", rejection_reason: reason, reviewed_at: new Date().toISOString() })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-moderation"] });
      toast.success("Rejected");
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Payouts ───
export function useAdminPayouts() {
  return useQuery({
    queryKey: ["admin-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const creatorIds = [...new Set((data || []).map(p => p.creator_id))];
      const { data: profiles } = await supabase
        .from("creator_profiles")
        .select("user_id, display_name")
        .in("user_id", creatorIds);

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);

      return (data || []).map(p => ({
        ...p,
        creatorName: nameMap.get(p.creator_id) || "Unknown",
      }));
    },
    staleTime: 30_000,
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payoutId: string) => {
      const { error } = await supabase
        .from("payouts")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payoutId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      toast.success("Marked as paid");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useCreatePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ creatorId, amount, method, notes }: { creatorId: string; amount: number; method: string; notes?: string }) => {
      const { error } = await supabase
        .from("payouts")
        .insert({ creator_id: creatorId, amount, method, notes });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      toast.success("Payout created");
    },
    onError: (e) => toast.error(e.message),
  });
}
