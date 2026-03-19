import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationPreference } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationToggleProps {
  mediaId: number;
  mediaType: "anime" | "manga";
  title?: string;
  className?: string;
}

export function NotificationToggle({ mediaId, mediaType, title, className }: NotificationToggleProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isEnabled, toggle } = useNotificationPreference(mediaId, mediaType);
  const [animating, setAnimating] = useState(false);

  if (!user) return null;

  const handleToggle = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    toggle.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: isEnabled
            ? `Notifications off for ${title || "this title"}`
            : `Notifications on for ${title || "this title"}`,
        });
      },
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={toggle.isPending}
            className={cn("rounded-full h-9 w-9 transition-transform duration-200", animating && "scale-125", className)}
            aria-label={isEnabled ? "Disable notifications" : "Enable notifications"}
          >
            <Bell
              className={cn(
                "w-4 h-4 transition-all duration-200",
                isEnabled ? "fill-primary text-primary" : "text-muted-foreground",
                animating && "animate-[bell-ring_0.4s_ease-in-out]"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isEnabled ? "Notifications on" : "Enable notifications"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
