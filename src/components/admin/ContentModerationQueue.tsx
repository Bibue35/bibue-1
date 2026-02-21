import { useModerationQueue, useReviewContent, useChapterReports } from "@/hooks/useCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Eye, Flag } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ContentModerationQueue() {
  const { data: queue = [], isLoading } = useModerationQueue();
  const { data: reports = [], isLoading: reportsLoading } = useChapterReports();
  const reviewMutation = useReviewContent();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Tabs defaultValue="queue" className="space-y-4">
      <TabsList>
        <TabsTrigger value="queue" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Moderation Queue ({queue.length})
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Chapter Reports ({reports.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="queue">
        {queue.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">No items pending review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {queue.map((item: any) => (
              <QueueItem key={item.id} item={item} onReview={reviewMutation} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="reports">
        {reportsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending chapter reports</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report: any) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {report.chapters?.series?.title} — Ch. {report.chapters?.chapter_number}
                      </p>
                      <Badge variant="outline" className="mt-1">{report.report_type}</Badge>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mt-2">{report.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function QueueItem({ item, onReview }: { item: any; onReview: any }) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const title = item.content_type === "series"
    ? item.series?.title || "Unknown Series"
    : `${item.series?.title || "Series"} — Ch. ${item.chapters?.chapter_number || "?"}`;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{item.content_type}</Badge>
              <h4 className="font-semibold">{title}</h4>
            </div>
            {item.flagged_reason && (
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" /> {item.flagged_reason}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Submitted {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onReview.mutate({
                queueId: item.id,
                action: "approved",
                chapterId: item.chapter_id,
                seriesId: item.series_id,
              })}
              disabled={onReview.isPending}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
            </Button>

            <Dialog open={showReject} onOpenChange={setShowReject}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" /> Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject: {title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    rows={3}
                  />
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={!rejectReason.trim() || onReview.isPending}
                    onClick={() => {
                      onReview.mutate({
                        queueId: item.id,
                        action: "rejected",
                        reason: rejectReason,
                        chapterId: item.chapter_id,
                        seriesId: item.series_id,
                      });
                      setShowReject(false);
                    }}
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
