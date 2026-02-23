import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationPreference } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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

  if (!user) return null;

  const handleToggle = () => {
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
            className={cn("rounded-full h-9 w-9", className)}
            aria-label={isEnabled ? "Disable notifications" : "Enable notifications"}
          >
            {isEnabled ? (
              <Bell className="w-4 h-4 fill-primary text-primary" />
            ) : (
              <Bell className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isEnabled ? "Notifications on" : "Enable notifications"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
