import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useIsOwnerOrAdmin, useAdminOverview, useAdminCreators, useAdminSeries, useAdminModeration, useAdminModerationCounts, useApproveModerationItem, useRejectModerationItem, useBulkModerationAction, useAdminPayouts, useMarkPaid, useCreatePayout } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  Shield, LayoutDashboard, Users, BookOpen, AlertTriangle, BarChart3, DollarSign,
  Search, Loader2, CheckCircle, XCircle, Download, Eye, Heart, ChevronRight,
  TrendingUp, FileText, Clock, CreditCard, Headphones, MessageCircle, EyeOff,
  Activity, UserPlus, Globe, Bookmark, Star, ArrowUpRight, Zap, Flag, Plus, Trash2, Edit2,
} from "lucide-react";
import { SupportTicketsTab } from "@/components/admin/SupportTicketsTab";
import { AdminChapterComments } from "@/components/admin/AdminChapterComments";
import { StudioSubmissionsTab } from "@/components/admin/StudioSubmissionsTab";
import { BugRoadmapTab } from "@/components/admin/BugRoadmapTab";
import { UserManagement } from "@/components/admin/UserManagement";
import { ReportQueue } from "@/components/admin/ReportQueue";
import { DmcaTab } from "@/components/admin/DmcaTab";
import { Bug, UserCog } from "lucide-react";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Tab = "overview" | "creators" | "series" | "moderation" | "comments" | "analytics" | "payouts" | "support" | "studio" | "bugs" | "users" | "reports" | "dmca";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: UserCog },
  { id: "studio", label: "Studio Submissions", icon: FileText },
  { id: "creators", label: "Creators", icon: Users },
  { id: "series", label: "All Series", icon: BookOpen },
  { id: "moderation", label: "Moderation", icon: AlertTriangle },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "dmca", label: "DMCA", icon: Shield },
  { id: "comments", label: "Comments", icon: MessageCircle },
  { id: "bugs", label: "Bug Roadmap", icon: Bug },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "payouts", label: "Payouts", icon: DollarSign },
  { id: "support", label: "Support Tickets", icon: Headphones },
];

function exportCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(row => keys.map(k => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: hasAccess, isLoading: roleLoading } = useIsOwnerOrAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { tabBadges, clearCount } = useAdminRealtime();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "support") clearCount("newTickets");
    if (tab === "moderation") { clearCount("newModeration"); clearCount("newReports"); }
    if (tab === "studio") clearCount("newSubmissions");
  };

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <Shield className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SEO title="Bibue Admin Panel" description="Admin dashboard" noIndex />

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen bg-card border-r border-border/50 z-40 transition-all duration-200 flex flex-col",
        sidebarOpen ? "w-56" : "w-16"
      )}>
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary shrink-0" />
          {sidebarOpen && <span className="font-bold font-sacred text-sm">Bibue Admin Panel</span>}
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {TABS.map((tab) => {
            const badgeCount = tabBadges[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="flex-1 text-left">{tab.label}</span>}
                {badgeCount > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs justify-start gap-2"
            onClick={() => navigate("/")}
          >
            <Globe className="w-3.5 h-3.5" /> {sidebarOpen ? "Back to Site" : ""}
          </Button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-xs text-muted-foreground hover:text-foreground py-1"
          >
            {sidebarOpen ? "← Collapse" : "→"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn("flex-1 min-h-screen", sidebarOpen ? "md:ml-0 ml-16" : "ml-16")}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
          {activeTab === "overview" && <OverviewTab onNavigate={handleTabChange} />}
          {activeTab === "studio" && <StudioSubmissionsTab />}
          {activeTab === "creators" && <CreatorsTab />}
          {activeTab === "series" && <SeriesTab />}
          {activeTab === "moderation" && <ModerationTab />}
          {activeTab === "reports" && <ReportQueue />}
          {activeTab === "dmca" && <DmcaTab />}
          {activeTab === "comments" && <AdminChapterComments />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "payouts" && <PayoutsTab />}
          {activeTab === "support" && <SupportTicketsTab />}
          {activeTab === "bugs" && <BugRoadmapTab />}
          {activeTab === "users" && <UserManagement />}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab (Enhanced) ───
function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data: stats, isLoading, isError } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold font-sacred">Bibue Admin Panel</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/30">
              <CardContent className="p-4">
                <div className="skeleton-shimmer h-3 w-20 rounded mb-3" />
                <div className="skeleton-shimmer h-7 w-16 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="text-muted-foreground">Failed to load overview data</p>
      </div>
    );
  }

  const primaryCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-primary", bg: "bg-primary/8" },
    { label: "Total Creators", value: stats?.totalCreators || 0, icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/8" },
    { label: "Total Series", value: stats?.totalSeries || 0, icon: BookOpen, color: "text-violet-500", bg: "bg-violet-500/8" },
    { label: "Total Chapters", value: stats?.totalChapters || 0, icon: FileText, color: "text-cyan-500", bg: "bg-cyan-500/8" },
  ];

  const engagementCards = [
    { label: "Discussions", value: stats?.totalDiscussions || 0, icon: MessageCircle, color: "text-emerald-500" },
    { label: "User Follows", value: stats?.totalFollows || 0, icon: Heart, color: "text-pink-500" },
    { label: "Library Items", value: stats?.totalWatchlistItems || 0, icon: Bookmark, color: "text-amber-500" },
    { label: "Sub Wishlist", value: stats?.subscriptionWishlist || 0, icon: Star, color: "text-yellow-500" },
  ];

  const alertCards = [
    { label: "Pending Reports", value: stats?.pendingReports || 0, icon: AlertTriangle, color: "text-yellow-500", urgent: (stats?.pendingReports || 0) > 0, action: () => onNavigate("reports") },
    { label: "Open Tickets", value: stats?.openTickets || 0, icon: Headphones, color: "text-orange-500", urgent: (stats?.openTickets || 0) > 0, action: () => onNavigate("support") },
    { label: "Pending DMCA", value: stats?.pendingDMCA || 0, icon: Shield, color: "text-red-500", urgent: (stats?.pendingDMCA || 0) > 0, action: () => onNavigate("dmca") },
    { label: "Pending Payouts", value: `$${(stats?.pendingPayoutAmount || 0).toFixed(2)}`, icon: Clock, color: "text-orange-500", action: () => onNavigate("payouts") },
  ];

  const STATUS_COLORS: Record<string, string> = {
    open: "bg-primary/15 text-primary",
    "in-progress": "bg-amber-500/15 text-amber-500",
    resolved: "bg-emerald-500/15 text-emerald-500",
    closed: "bg-muted text-muted-foreground",
    pending: "bg-amber-500/15 text-amber-500",
    approved: "bg-emerald-500/15 text-emerald-500",
    published: "bg-emerald-500/15 text-emerald-500",
    rejected: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sacred tracking-wide">Bibue Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform overview & management</p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs py-1">
          <Activity className="w-3 h-3 text-emerald-500" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {primaryCards.map((card) => (
          <Card key={card.label} className="border-border/30 hover:border-border/60 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg", card.bg)}>
                  <card.icon className={cn("w-4 h-4", card.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Requires Attention
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {alertCards.map((card) => (
            <button
              key={card.label}
              onClick={card.action}
              className={cn(
                "text-left p-4 rounded-xl border transition-all",
                card.urgent
                  ? "border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
                  : "border-border/30 bg-card hover:bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className={cn("w-4 h-4", card.color)} />
                {card.urgent && <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />}
              </div>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {engagementCards.map((card) => (
              <div key={card.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <card.icon className={cn("w-4 h-4", card.color)} />
                  <span className="text-sm">{card.label}</span>
                </div>
                <span className="font-bold text-sm">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Paid Out</span>
              <span className="font-bold text-emerald-500">${(stats?.totalPaid || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Payouts</span>
              <span className="font-bold text-orange-500">${(stats?.pendingPayoutAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Tickets</span>
              <span className="font-bold">{stats?.totalTickets || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sub Wishlist Signups</span>
              <span className="font-bold">{stats?.subscriptionWishlist || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Recent Signups
              </CardTitle>
              <span className="text-xs text-muted-foreground">{stats?.totalUsers} total</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {(stats?.recentUsers || []).slice(0, 6).map((u: any) => (
                <div key={u.user_id} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 overflow-hidden">
                    {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.display_name || u.username || "?")[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{u.display_name || u.username || "User"}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No users yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" /> Recent Series
              </CardTitle>
              <button onClick={() => onNavigate("series")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {(stats?.recentSeries || []).map((s: any) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  {s.cover_image_url ? (
                    <img src={s.cover_image_url} alt="" className="w-8 h-10 rounded object-cover shrink-0 bg-muted" />
                  ) : (
                    <div className="w-8 h-10 rounded bg-muted shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{s.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge className={cn("text-[9px] px-1.5 py-0", STATUS_COLORS[s.status] || "bg-muted text-muted-foreground")}>{s.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{(s as any).creator_profiles?.display_name}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.recentSeries || stats.recentSeries.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No series yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Headphones className="w-4 h-4 text-orange-500" /> Recent Tickets
              </CardTitle>
              <button onClick={() => onNavigate("support")} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {(stats?.recentTickets || []).map((t: any) => (
                <div key={t.id} className="flex items-center gap-2.5">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", t.status === "open" ? "bg-primary" : t.status === "in-progress" ? "bg-amber-500" : "bg-muted-foreground/30")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{t.subject}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge className={cn("text-[9px] px-1.5 py-0", STATUS_COLORS[t.status] || "bg-muted text-muted-foreground")}>{t.status}</Badge>
                      {t.is_creator_priority && <Star className="w-2.5 h-2.5 text-amber-400" />}
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!stats?.recentTickets || stats.recentTickets.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No tickets yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Review Moderation", icon: AlertTriangle, tab: "moderation" as Tab },
              { label: "Content Reports", icon: Flag, tab: "reports" as Tab },
              { label: "DMCA Requests", icon: Shield, tab: "dmca" as Tab },
              { label: "Manage Creators", icon: Users, tab: "creators" as Tab },
              { label: "Support Tickets", icon: Headphones, tab: "support" as Tab },
              { label: "Process Payouts", icon: CreditCard, tab: "payouts" as Tab },
              { label: "Bug Roadmap", icon: Bug, tab: "bugs" as Tab },
              { label: "Studio Submissions", icon: FileText, tab: "studio" as Tab },
            ].map((action) => (
              <Button key={action.label} variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onNavigate(action.tab)}>
                <action.icon className="w-3.5 h-3.5" /> {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Creators Tab with inline editing ───
function CreatorsTab() {
  const [search, setSearch] = useState("");
  const { data: creators, isLoading, isError } = useAdminCreators(search || undefined);
  const queryClient = useQueryClient();

  const updateCreator = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("creator_profiles").update(updates).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-creators"] });
      toast.success("Creator updated");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sacred flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Creators
        </h1>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => creators && exportCSV(creators.map(c => ({ name: c.display_name, series: c.seriesCount, earned: c.total_earned, status: c.status })), "creators")}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search creators..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : isError ? (
        <div className="text-center py-12"><AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" /><p className="text-muted-foreground">Failed to load creators</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Creator</th>
                <th className="text-center py-3 px-2 font-medium">Series</th>
                <th className="text-center py-3 px-2 font-medium">Earned</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-center py-3 px-2 font-medium">Verified</th>
                <th className="text-center py-3 px-2 font-medium">Joined</th>
                <th className="text-center py-3 px-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(creators || []).map((c: any) => (
                <tr key={c.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                        {c.avatar_url ? <img src={c.avatar_url} alt="" className="w-full h-full object-cover" /> : c.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{c.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{c.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">{c.seriesCount}</td>
                  <td className="py-3 px-2 text-center font-medium">${Number(c.total_earned || 0).toFixed(2)}</td>
                  <td className="py-3 px-2 text-center">
                    <Select value={c.status} onValueChange={(val) => updateCreator.mutate({ userId: c.user_id, updates: { status: val } })}>
                      <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button
                      variant={c.is_verified ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => updateCreator.mutate({ userId: c.user_id, updates: { is_verified: !c.is_verified } })}
                    >
                      {c.is_verified ? "✓ Verified" : "Verify"}
                    </Button>
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button variant="ghost" size="sm" className="text-xs">View</Button>
                  </td>
                </tr>
              ))}
              {(!creators || creators.length === 0) && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No creators found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Series Tab with inline status change and delete ───
function SeriesTab() {
  const [search, setSearch] = useState("");
  const { data: series, isLoading, isError } = useAdminSeries(search || undefined);
  const queryClient = useQueryClient();

  const updateSeries = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("series").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      toast.success("Series updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteSeries = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("series").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      toast.success("Series deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sacred flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> All Series
        </h1>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => series && exportCSV(series.map((s: any) => ({ title: s.title, creator: s.creatorName, chapters: s.chaptersCount, status: s.status })), "series")}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search series..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : isError ? (
        <div className="text-center py-12"><AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" /><p className="text-muted-foreground">Failed to load series</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Title</th>
                <th className="text-center py-3 px-2 font-medium">Creator</th>
                <th className="text-center py-3 px-2 font-medium">Chapters</th>
                <th className="text-center py-3 px-2 font-medium">Rating</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-center py-3 px-2 font-medium">Updated</th>
                <th className="text-center py-3 px-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(series || []).map((s: any) => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      {s.cover_image_url ? (
                        <img src={s.cover_image_url} alt="" className="w-8 h-10 rounded object-cover shrink-0 bg-muted" />
                      ) : (
                        <div className="w-8 h-10 rounded bg-muted shrink-0" />
                      )}
                      <span className="font-medium max-w-[180px] truncate">{s.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center text-muted-foreground text-xs">{s.creatorName}</td>
                  <td className="py-3 px-2 text-center">{s.chaptersCount}</td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant="secondary" className="text-xs">{s.content_rating}</Badge>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Select value={s.status} onValueChange={(val) => updateSeries.mutate({ id: s.id, updates: { status: val } })}>
                      <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview" onClick={() => window.open(`/originals/${s.id}`, "_blank")}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Delete "${s.title}"? This cannot be undone.`)) {
                            deleteSeries.mutate(s.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!series || series.length === 0) && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No series found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Moderation Tab ───
function ModerationTab() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: queue, isLoading, isError } = useAdminModeration(statusFilter);
  const { data: counts } = useAdminModerationCounts();
  const approve = useApproveModerationItem();
  const reject = useRejectModerationItem();
  const bulkAction = useBulkModerationAction();

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!queue) return;
    if (selected.size === queue.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(queue.map((i: any) => i.id)));
    }
  };

  const handleBulk = (action: "approved" | "rejected") => {
    if (selected.size === 0) return;
    const items = queue?.filter((i: any) => selected.has(i.id)) || [];
    bulkAction.mutate({
      itemIds: Array.from(selected),
      action,
      chapterIds: items.map((i: any) => i.chapter_id),
    });
    setSelected(new Set());
  };

  const getContentType = (item: any) => {
    const dir = item.series?.reading_direction;
    const lang = item.series?.language;
    if (dir === "ltr" && lang === "ko") return "Manhwa";
    if (dir === "ltr" && lang === "zh") return "Manhua";
    return "Manga";
  };

  const STATUS_FILTERS = [
    { value: "pending", label: "Pending", count: counts?.pending },
    { value: "approved", label: "Approved", count: counts?.approved },
    { value: "rejected", label: "Rejected", count: counts?.rejected },
    { value: "all", label: "All", count: counts?.total },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-sacred flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-500" /> Moderation Queue
        </h1>
        <div className="flex gap-1 p-1 rounded-xl bg-muted/30">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setSelected(new Set()); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              {f.count != null && f.count > 0 && <span className="ml-1.5 text-[10px] opacity-70">({f.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="default" className="gap-1 text-xs" disabled={bulkAction.isPending} onClick={() => handleBulk("approved")}>
              <CheckCircle className="w-3.5 h-3.5" /> Approve All
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-xs" disabled={bulkAction.isPending} onClick={() => handleBulk("rejected")}>
              <XCircle className="w-3.5 h-3.5" /> Reject All
            </Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setSelected(new Set())}>Clear</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : isError ? (
        <div className="text-center py-12"><AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" /><p className="text-muted-foreground">Failed to load moderation queue</p></div>
      ) : !queue || queue.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No {statusFilter === "all" ? "" : statusFilter} items found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-3 px-3 text-left w-10"><Checkbox checked={selected.size === queue.length && queue.length > 0} onCheckedChange={toggleAll} /></th>
                  <th className="py-3 px-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Title</th>
                  <th className="py-3 px-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Creator</th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Content</th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Rating</th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Uploaded</th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="py-3 px-3 text-right font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item: any) => {
                  const isSelected = selected.has(item.id);
                  const title = item.content_type === "series"
                    ? item.series?.title
                    : `Ch. ${item.chapters?.chapter_number}${item.chapters?.title ? ` — ${item.chapters.title}` : ""}`;
                  const seriesTitle = item.content_type === "chapter" ? item.series?.title : null;
                  const contentType = getContentType(item);

                  return (
                    <tr key={item.id} className={cn("border-b border-border/20 transition-colors", isSelected ? "bg-primary/5" : "hover:bg-muted/20")}>
                      <td className="py-3 px-3"><Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.id)} /></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {item.series?.cover_image_url && <img src={item.series.cover_image_url} alt="" className="w-9 h-12 rounded object-cover shrink-0 bg-muted" />}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[200px]">{title}</p>
                            {seriesTitle && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{seriesTitle}</p>}
                            {item.flagged_reason && <p className="text-[10px] text-destructive mt-0.5">{item.flagged_reason}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground">{item.creatorName}</td>
                      <td className="py-3 px-3 text-center"><Badge variant="outline" className="text-[10px]">{contentType}</Badge></td>
                      <td className="py-3 px-3 text-center"><Badge variant="secondary" className="text-[10px]">{item.content_type}</Badge></td>
                      <td className="py-3 px-3 text-center"><Badge variant="secondary" className="text-[10px]">{item.series?.content_rating || "—"}</Badge></td>
                      <td className="py-3 px-3 text-center text-xs text-muted-foreground whitespace-nowrap">{format(new Date(item.created_at), "MMM d, yyyy")}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"} className="text-[10px]">{item.status}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          {item.series?.title && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview" onClick={() => window.open(`/originals/${item.series_id}`, "_blank")}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {item.status === "pending" && (
                            <>
                              <Button size="sm" className="h-7 px-2.5 text-xs gap-1" disabled={approve.isPending} onClick={() => approve.mutate({ itemId: item.id, chapterId: item.chapter_id })}>
                                <CheckCircle className="w-3 h-3" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled={reject.isPending} onClick={() => reject.mutate({ itemId: item.id, reason: "Rejected by admin" })}>
                                <XCircle className="w-3 h-3" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/20 text-xs text-muted-foreground">
            Showing {queue.length} item{queue.length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Analytics Tab ───
function AnalyticsTab() {
  const { data: stats, isError } = useAdminOverview();

  if (isError) {
    return (
      <div className="text-center py-16"><AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" /><p className="text-muted-foreground">Failed to load analytics</p></div>
    );
  }

  const growthMetrics = [
    { label: "Total Users", value: stats?.totalUsers || 0 },
    { label: "Total Creators", value: stats?.totalCreators || 0 },
    { label: "Total Series", value: stats?.totalSeries || 0 },
    { label: "Total Chapters", value: stats?.totalChapters || 0 },
    { label: "Discussions", value: stats?.totalDiscussions || 0 },
    { label: "User Follows", value: stats?.totalFollows || 0 },
    { label: "Library Items", value: stats?.totalWatchlistItems || 0 },
  ];

  const maxVal = Math.max(...growthMetrics.map(m => m.value), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" /> Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Platform Growth</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {growthMetrics.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-bold">{m.value.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${Math.max((m.value / maxVal) * 100, 2)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500" /> Revenue Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Paid Out</span>
              <span className="font-bold text-emerald-500">${(stats?.totalPaid || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Payouts</span>
              <span className="font-bold text-orange-500">${(stats?.pendingPayoutAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Reports</span>
              <span className="font-bold text-yellow-500">{stats?.pendingReports || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending DMCA</span>
              <span className="font-bold text-red-500">{stats?.pendingDMCA || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sub Wishlist</span>
              <span className="font-bold">{stats?.subscriptionWishlist || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Payouts Tab with Create Payout ───
function PayoutsTab() {
  const { data: payouts, isLoading, isError } = useAdminPayouts();
  const { data: creators } = useAdminCreators();
  const markPaid = useMarkPaid();
  const createPayout = useCreatePayout();
  const [showCreate, setShowCreate] = useState(false);
  const [newPayout, setNewPayout] = useState({ creatorId: "", amount: "", method: "paypal", notes: "" });

  const handleCreate = () => {
    if (!newPayout.creatorId || !newPayout.amount) return;
    createPayout.mutate(
      { creatorId: newPayout.creatorId, amount: parseFloat(newPayout.amount), method: newPayout.method, notes: newPayout.notes || undefined },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewPayout({ creatorId: "", amount: "", method: "paypal", notes: "" });
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sacred flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-500" /> Payouts
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Create Payout
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => payouts && exportCSV(payouts.map((p: any) => ({ creator: p.creatorName, amount: p.amount, method: p.method, status: p.status, date: p.created_at })), "payouts")}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : isError ? (
        <div className="text-center py-12"><AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" /><p className="text-muted-foreground">Failed to load payouts</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Creator</th>
                <th className="text-center py-3 px-2 font-medium">Amount</th>
                <th className="text-center py-3 px-2 font-medium">Method</th>
                <th className="text-center py-3 px-2 font-medium">Notes</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-center py-3 px-2 font-medium">Date</th>
                <th className="text-center py-3 px-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(payouts || []).map((p: any) => (
                <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-3 px-2 font-medium">{p.creatorName}</td>
                  <td className="py-3 px-2 text-center font-bold">${Number(p.amount).toFixed(2)}</td>
                  <td className="py-3 px-2 text-center"><Badge variant="secondary" className="text-xs">{p.method}</Badge></td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground max-w-[150px] truncate">{p.notes || "—"}</td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant={p.status === "paid" ? "default" : "secondary"} className={cn("text-xs", p.status === "paid" && "bg-emerald-500/20 text-emerald-500 border-emerald-500/30")}>
                      {p.status === "paid" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
                  <td className="py-3 px-2 text-center">
                    {p.status === "pending" && (
                      <Button size="sm" className="text-xs gap-1" disabled={markPaid.isPending} onClick={() => markPaid.mutate(p.id)}>
                        <CreditCard className="w-3 h-3" /> Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {(!payouts || payouts.length === 0) && (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No payouts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Payout Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-500" /> Create Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Creator</Label>
              <Select value={newPayout.creatorId} onValueChange={(v) => setNewPayout(p => ({ ...p, creatorId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select creator..." /></SelectTrigger>
                <SelectContent>
                  {(creators || []).map((c: any) => (
                    <SelectItem key={c.user_id} value={c.user_id}>{c.display_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" step="0.01" min="0" value={newPayout.amount} onChange={(e) => setNewPayout(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <Label>Method</Label>
              <Select value={newPayout.method} onValueChange={(v) => setNewPayout(p => ({ ...p, method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="wise">Wise</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={newPayout.notes} onChange={(e) => setNewPayout(p => ({ ...p, notes: e.target.value }))} placeholder="Payment notes..." rows={2} />
            </div>
            <Button className="w-full gap-2" disabled={!newPayout.creatorId || !newPayout.amount || createPayout.isPending} onClick={handleCreate}>
              {createPayout.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Payout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
