import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useIsOwnerOrAdmin, useAdminOverview, useAdminCreators, useAdminSeries, useAdminModeration, useAdminModerationCounts, useApproveModerationItem, useRejectModerationItem, useBulkModerationAction, useAdminPayouts, useMarkPaid, useCreatePayout } from "@/hooks/useAdminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  Shield, LayoutDashboard, Users, BookOpen, AlertTriangle, BarChart3, DollarSign,
  Search, Loader2, CheckCircle, XCircle, Download, Eye, Heart, ChevronRight,
  TrendingUp, FileText, Clock, CreditCard, Headphones, MessageCircle, EyeOff,
} from "lucide-react";
import { SupportTicketsTab } from "@/components/admin/SupportTicketsTab";
import { AdminChapterComments } from "@/components/admin/AdminChapterComments";
import { StudioSubmissionsTab } from "@/components/admin/StudioSubmissionsTab";
import { BugRoadmapTab } from "@/components/admin/BugRoadmapTab";
import { Bug } from "lucide-react";

type Tab = "overview" | "creators" | "series" | "moderation" | "comments" | "analytics" | "payouts" | "support" | "studio" | "bugs";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "studio", label: "Studio Submissions", icon: FileText },
  { id: "creators", label: "Creators", icon: Users },
  { id: "series", label: "All Series", icon: BookOpen },
  { id: "moderation", label: "Moderation", icon: AlertTriangle },
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
      <SEO title="Owner Dashboard | bibue.net" description="Admin dashboard" noIndex />

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen bg-card border-r border-border/50 z-40 transition-all duration-200 flex flex-col",
        sidebarOpen ? "w-56" : "w-16"
      )}>
        <div className="p-4 border-b border-border/50 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary shrink-0" />
          {sidebarOpen && <span className="font-bold font-sacred text-sm">Admin Panel</span>}
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50">
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
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "studio" && <StudioSubmissionsTab />}
          {activeTab === "creators" && <CreatorsTab />}
          {activeTab === "series" && <SeriesTab />}
          {activeTab === "moderation" && <ModerationTab />}
          {activeTab === "comments" && <AdminChapterComments />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "payouts" && <PayoutsTab />}
          {activeTab === "support" && <SupportTicketsTab />}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab() {
  const { data: stats, isLoading } = useAdminOverview();

  const cards = [
    { label: "Total Creators", value: stats?.totalCreators || 0, icon: Users, color: "text-primary" },
    { label: "Total Series", value: stats?.totalSeries || 0, icon: BookOpen, color: "text-blue-500" },
    { label: "Total Chapters", value: stats?.totalChapters || 0, icon: FileText, color: "text-green-500" },
    { label: "Pending Reports", value: stats?.pendingReports || 0, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Pending Payouts", value: `$${(stats?.pendingPayoutAmount || 0).toFixed(2)}`, icon: Clock, color: "text-orange-500" },
    { label: "Total Paid", value: `$${(stats?.totalPaid || 0).toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-primary" />
        Dashboard Overview
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Card key={card.label} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <card.icon className={cn("w-8 h-8 opacity-50", card.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Creators Tab ───
function CreatorsTab() {
  const [search, setSearch] = useState("");
  const { data: creators, isLoading } = useAdminCreators(search || undefined);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sacred flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Creators
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Creator</th>
                <th className="text-center py-3 px-2 font-medium">Series</th>
                <th className="text-center py-3 px-2 font-medium">Earned</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-center py-3 px-2 font-medium">Joined</th>
                <th className="text-center py-3 px-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(creators || []).map((c: any) => (
                <tr key={c.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {c.display_name?.[0]?.toUpperCase() || "?"}
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
                    <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button variant="ghost" size="sm" className="text-xs">Pay Now</Button>
                  </td>
                </tr>
              ))}
              {(!creators || creators.length === 0) && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No creators found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Series Tab ───
function SeriesTab() {
  const [search, setSearch] = useState("");
  const { data: series, isLoading } = useAdminSeries(search || undefined);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sacred flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          All Series
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
              </tr>
            </thead>
            <tbody>
              {(series || []).map((s: any) => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-3 px-2 font-medium max-w-[200px] truncate">{s.title}</td>
                  <td className="py-3 px-2 text-center text-muted-foreground text-xs">{s.creatorName}</td>
                  <td className="py-3 px-2 text-center">{s.chaptersCount}</td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant="secondary" className="text-xs">{s.content_rating}</Badge>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant={s.status === "approved" ? "default" : s.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                      {s.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
              {(!series || series.length === 0) && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No series found</td></tr>
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
  const { data: queue, isLoading } = useAdminModeration(statusFilter);
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
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          Moderation Queue
        </h1>
        <div className="flex items-center gap-2">
          {/* Status filter pills */}
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
                {f.count != null && f.count > 0 && (
                  <span className="ml-1.5 text-[10px] opacity-70">({f.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="primary"
              className="gap-1 text-xs"
              disabled={bulkAction.isPending}
              onClick={() => handleBulk("approved")}
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve All
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              disabled={bulkAction.isPending}
              onClick={() => handleBulk("rejected")}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
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
                  <th className="py-3 px-3 text-left w-10">
                    <Checkbox
                      checked={selected.size === queue.length && queue.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </th>
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
                    <tr
                      key={item.id}
                      className={cn(
                        "border-b border-border/20 transition-colors",
                        isSelected ? "bg-primary/5" : "hover:bg-muted/20"
                      )}
                    >
                      <td className="py-3 px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {item.series?.cover_image_url && (
                            <img
                              src={item.series.cover_image_url}
                              alt=""
                              className="w-9 h-12 rounded object-cover shrink-0 bg-muted"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[200px]">{title}</p>
                            {seriesTitle && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{seriesTitle}</p>
                            )}
                            {item.flagged_reason && (
                              <p className="text-[10px] text-destructive mt-0.5">{item.flagged_reason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground">{item.creatorName}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="outline" className="text-[10px]">{contentType}</Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="secondary" className="text-[10px]">{item.content_type}</Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="secondary" className="text-[10px]">{item.series?.content_rating || "—"}</Badge>
                      </td>
                      <td className="py-3 px-3 text-center text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge
                          variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 justify-end">
                          {item.series?.title && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Preview"
                              onClick={() => window.open(`/originals/${item.series_id}`, "_blank")}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {item.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                className="h-7 px-2.5 text-xs gap-1"
                                disabled={approve.isPending}
                                onClick={() => approve.mutate({ itemId: item.id, chapterId: item.chapter_id })}
                              >
                                <CheckCircle className="w-3 h-3" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs gap-1"
                                disabled={reject.isPending}
                                onClick={() => reject.mutate({ itemId: item.id, reason: "Rejected by admin" })}
                              >
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
  const { data: stats } = useAdminOverview();

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Creators</span>
                <span className="font-bold">{stats?.totalCreators || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Series</span>
                <span className="font-bold">{stats?.totalSeries || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Chapters</span>
                <span className="font-bold">{stats?.totalChapters || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Detailed charts will be added when more data is available.</p>
          <p className="text-xs text-muted-foreground mt-1">Views over time, top series, top creators, and signups.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Payouts Tab ───
function PayoutsTab() {
  const { data: payouts, isLoading } = useAdminPayouts();
  const markPaid = useMarkPaid();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-sacred flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-emerald-500" />
          Payouts
        </h1>
        <Button variant="outline" size="sm" className="gap-1" onClick={() => payouts && exportCSV(payouts.map((p: any) => ({ creator: p.creatorName, amount: p.amount, method: p.method, status: p.status, date: p.created_at })), "payouts")}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Creator</th>
                <th className="text-center py-3 px-2 font-medium">Amount</th>
                <th className="text-center py-3 px-2 font-medium">Method</th>
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
                  <td className="py-3 px-2 text-center">
                    <Badge variant="secondary" className="text-xs">{p.method}</Badge>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant={p.status === "paid" ? "default" : "secondary"} className={cn("text-xs", p.status === "paid" && "bg-emerald-500/20 text-emerald-500 border-emerald-500/30")}>
                      {p.status === "paid" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                    {format(new Date(p.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {p.status === "pending" && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-xs gap-1"
                        disabled={markPaid.isPending}
                        onClick={() => markPaid.mutate(p.id)}
                      >
                        <CreditCard className="w-3 h-3" />
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {(!payouts || payouts.length === 0) && (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No payouts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
