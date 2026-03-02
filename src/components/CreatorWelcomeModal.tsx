import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, DollarSign, Sparkles, ArrowRight, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const WELCOME_KEY = "bibue_creator_welcome_shown";

export function CreatorWelcomeModal() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    // Show only once per user
    const shown = localStorage.getItem(`${WELCOME_KEY}_${user.id}`);
    if (!shown) {
      // Delay slightly so page loads first
      const t = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, [user]);

  const handleClose = () => {
    if (user) localStorage.setItem(`${WELCOME_KEY}_${user.id}`, "true");
    setOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(v); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/20">
        {/* Hero banner */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-background p-8 text-center">
          <Sparkles className="absolute top-4 right-4 w-6 h-6 text-primary/30 animate-pulse" />
          <Sparkles className="absolute bottom-4 left-4 w-5 h-5 text-primary/20 animate-pulse delay-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-primary" />
          </div>
          
          <Badge variant="secondary" className="mb-3">
            <DollarSign className="w-3 h-3 mr-1" />
            Keep 75% of net revenue
          </Badge>
          
          <h2 className="text-2xl font-bold font-sacred mb-2">
            Welcome, Creator!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You're one of the first to join bibue.net. Upload your original manga, manhwa or manhua and start earning today. Founding creators get an extra 5% bonus.
          </p>
        </div>

        {/* Quick actions */}
        <div className="p-6 space-y-3">
          <Button asChild variant="primary" className="w-full gap-2" onClick={handleClose}>
            <Link to="/creator/dashboard">
              <Upload className="w-4 h-4" />
              Upload Your First Chapter
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full gap-2" onClick={handleClose}>
            <Link to="/for-creators">
              Learn About Creator Perks
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <button
            onClick={handleClose}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
