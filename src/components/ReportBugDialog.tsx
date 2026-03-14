import { useState } from "react";
import { Bug, Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";

const SEVERITY_OPTIONS = [
  { value: "minor", label: "Minor — cosmetic or small issue" },
  { value: "major", label: "Major — feature broken or unusable" },
  { value: "critical", label: "Critical — site crash or data loss" },
];

interface ReportBugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportBugDialog({ open, onOpenChange }: ReportBugDialogProps) {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!subject.trim() || !severity || !description.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: `[BUG] ${subject.trim()}`.slice(0, 200),
      category: "bug",
      message: `Severity: ${severity}\n\n${description.trim()}`.slice(0, 5000),
      status: "open",
      is_creator_priority: false,
    });
    setSubmitting(false);

    if (error) return;

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onOpenChange(false);
      setSubject("");
      setSeverity("");
      setDescription("");
    }, 2500);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              Report a Bug
            </DialogTitle>
            <DialogDescription>
              Help us improve Bibue by reporting issues you encounter.
            </DialogDescription>
          </DialogHeader>

          {showSuccess ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 animate-bounce">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-1">Bug Reported!</h3>
              <p className="text-sm text-muted-foreground">Thanks for helping us improve.</p>
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Please sign in to report bugs</p>
              <Button variant="magenta" onClick={() => setShowAuth(true)}>Sign In</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Summary</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the bug"
                  maxLength={150}
                />
              </div>

              <div>
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue placeholder="How severe is this?" /></SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? Steps to reproduce, expected vs actual behavior..."
                  rows={4}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/5000</p>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={submitting || !subject.trim() || !severity || !description.trim()}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Bug Report
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <AuthModal open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
}
