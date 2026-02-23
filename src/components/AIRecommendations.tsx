import { useState } from "react";
import { Sparkles, Bot, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AIRec {
  title: string;
  explanation: string;
  match_percentage: number;
}

export function AIRecommendations() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<AIRec[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const ratedCount = watchlist?.filter(i => i.score && Number(i.score) > 0).length || 0;
  const canGenerate = ratedCount >= 5;

  const generate = async () => {
    if (!user || !watchlist) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-recommendations", {
        body: { watchlist: watchlist.map(w => ({ title: w.title, score: w.score, status: w.status, media_type: w.media_type })) },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setRecommendations(data.recommendations || []);
      setHasGenerated(true);
    } catch (err: any) {
      toast({ title: "Failed to generate", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !canGenerate) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-bold">AI Picks for You</h2>
        </div>
        <Button
          onClick={generate}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="rounded-full gap-2"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : hasGenerated ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isLoading ? "Analyzing..." : hasGenerated ? "Refresh" : "Get AI Picks"}
        </Button>
      </div>

      {!hasGenerated && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Based on your {ratedCount} rated anime, our AI will find personalized recommendations just for you.
        </p>
      )}

      {recommendations.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, i) => (
            <div
              key={rec.title}
              className="p-4 rounded-xl bg-muted/40 border border-border/30 space-y-2 hover:bg-muted/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight">{rec.title}</h3>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full shrink-0",
                  rec.match_percentage >= 90 ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {rec.match_percentage}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
