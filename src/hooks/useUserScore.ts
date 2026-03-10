import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useUserScore(mediaId: number, mediaType: string = "manga") {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["user-score", mediaId, mediaType];

  const { data: userScore, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_scores" as any)
        .select("score")
        .eq("user_id", user!.id)
        .eq("media_id", mediaId)
        .eq("media_type", mediaType)
        .maybeSingle();
      if (error) throw error;
      return (data as any)?.score as number | null;
    },
    enabled: !!user && !!mediaId,
  });

  const scoreMutation = useMutation({
    mutationFn: async (score: number | null) => {
      if (!user) throw new Error("Sign in to rate");

      if (score === null) {
        const { error } = await supabase
          .from("user_scores" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("media_id", mediaId)
          .eq("media_type", mediaType);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_scores" as any)
          .upsert(
            {
              user_id: user.id,
              media_id: mediaId,
              media_type: mediaType,
              score,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,media_id,media_type" }
          );
        if (error) throw error;
      }
    },
    onSuccess: (_, score) => {
      queryClient.setQueryData(queryKey, score);
      toast({
        title: score === null ? "Rating removed" : `Rated ${score}/10`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    score: userScore ?? null,
    isLoading,
    rate: scoreMutation.mutate,
    isRating: scoreMutation.isPending,
  };
}
