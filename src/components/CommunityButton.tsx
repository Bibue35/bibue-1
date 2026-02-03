import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadCount } from "@/hooks/useMessages";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CommunityButton() {
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadCount();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-20 right-4 z-40 rounded-full h-11 w-11 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-background hover:scale-105 transition-all"
            asChild
          >
            <Link to="/community">
              <Users className="w-5 h-5" />
              {user && (unreadCount ?? 0) > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                >
                  {unreadCount && unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Community</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}