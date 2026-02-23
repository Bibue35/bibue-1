import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReports, useUpdateReportStatus, useReportStats } from "@/hooks/useModeration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ExternalLink,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-500 border-green-500/30",
  dismissed: "bg-muted text-muted-foreground border-muted",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  resolved: <CheckCircle className="h-3 w-3" />,
  dismissed: <XCircle className="h-3 w-3" />,
};

const reportTypeLabels: Record<string, string> = {
  incorrect_info: "Incorrect Info",
  broken_link: "Broken Link",
  missing_content: "Missing Content",
  inappropriate: "Inappropriate",
  other: "Other",
};

export function ReportQueue() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const { t } = useLanguage();
  const { data: reports, isLoading } = useReports(statusFilter);
  const { data: stats } = useReportStats();
  const updateStatus = useUpdateReportStatus();

  const handleStatusChange = (reportId: string, newStatus: string) => {
    updateStatus.mutate({ reportId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.totalReports")}</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.pending")}</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {stats?.pending || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.resolved")}</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats?.resolved || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.dismissed")}</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {stats?.dismissed || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("admin.reportQueue")}
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.allReports")}</SelectItem>
              <SelectItem value="pending">{t("admin.pending")}</SelectItem>
              <SelectItem value="resolved">{t("admin.resolved")}</SelectItem>
              <SelectItem value="dismissed">{t("admin.dismissed")}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              {t("admin.loadingReports")}
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500/50 mb-4" />
              <p className="text-muted-foreground">{t("admin.noReports")}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={report.reporter?.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {report.reporter?.username || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(report.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[report.status] || ""}
                      >
                        {statusIcons[report.status]}
                        <span className="ml-1 capitalize">{report.status}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {report.content_type}
                        </Badge>
                        <Badge variant="outline">
                          {reportTypeLabels[report.report_type] || report.report_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {report.content_title}
                        </span>
                        <Link
                          to={`/${report.content_type}/${report.content_id}`}
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {report.description}
                        </p>
                      )}
                    </div>

                    {report.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusChange(report.id, "resolved")}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t("admin.resolve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(report.id, "dismissed")}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t("admin.dismiss")}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
