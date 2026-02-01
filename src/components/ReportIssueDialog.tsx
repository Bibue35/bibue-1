import { useState } from "react";
import { Flag, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReportIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: "manga" | "anime";
  contentId: number;
  contentTitle: string;
}

const reportTypes = [
  { value: "wrong_image", label: "Wrong cover image" },
  { value: "wrong_title", label: "Incorrect title" },
  { value: "wrong_synopsis", label: "Wrong synopsis" },
  { value: "wrong_rating", label: "Incorrect rating/score" },
  { value: "other", label: "Other issue" },
] as const;

export function ReportIssueDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  contentTitle,
}: ReportIssueDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("");
  const [description, setDescription] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to report issues");
      if (!reportType) throw new Error("Please select an issue type");

      const { error } = await supabase.from("content_reports").insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        content_title: contentTitle,
        report_type: reportType,
        description: description.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You've already reported this issue");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping improve our data!",
      });
      onOpenChange(false);
      setReportType("");
      setDescription("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            Report Issue
          </DialogTitle>
          <DialogDescription>
            Report incorrect data for "{contentTitle}"
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Please sign in to report issues
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>What's wrong?</Label>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                {reportTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Additional details (optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or provide the correct information..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!reportType || reportMutation.isPending}
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
