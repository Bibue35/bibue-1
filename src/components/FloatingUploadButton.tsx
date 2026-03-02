import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function FloatingUploadButton() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is a creator
  const { data: isCreator } = useQuery({
    queryKey: ["is-creator-check", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Only show for creators, hide on admin/dashboard/reader pages
  const hiddenPaths = ["/admin", "/creator/dashboard"];
  if (!isCreator || hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <button
      onClick={() => navigate("/creator/dashboard?tab=upload")}
      className={cn(
        "md:hidden fixed right-4 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] z-40",
        "w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30",
        "flex items-center justify-center",
        "transition-transform active:scale-90 touch-manipulation",
        "hover:shadow-xl hover:shadow-primary/40",
        "animate-float"
      )}
      aria-label="Upload new chapter"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
